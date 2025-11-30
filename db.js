// Enhanced Database Layer for SmartMeet with Google Meet Support
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

// Initialize database
const db = new Database('smartmeet.db');

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create tables
function initializeDatabase() {
  // Meetings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL CHECK (platform IN ('zoom', 'teams', 'gmeet', 'cliq')),
      meeting_link TEXT NOT NULL,
      title TEXT,
      status TEXT NOT NULL DEFAULT 'provisioning' CHECK (status IN ('provisioning', 'recording', 'processing', 'completed', 'failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      started_at DATETIME,
      completed_at DATETIME,
      summary_data TEXT,
      transcript_path TEXT,
      recording_path TEXT,
      oauth_token TEXT,
      meeting_metadata TEXT
    )
  `);

  // Participants table
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('organizer', 'participant', 'observer')),
      joined_at DATETIME,
      left_at DATETIME,
      platform_user_id TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
    )
  `);

  // Email logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_logs (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
      sent_at DATETIME,
      error_message TEXT,
      retry_count INTEGER DEFAULT 0,
      FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE CASCADE
    )
  `);

  // Chat logs table for copilot interactions
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_logs (
      id TEXT PRIMARY KEY,
      meeting_id TEXT,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      platform TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (meeting_id) REFERENCES meetings (id) ON DELETE SET NULL
    )
  `);

  // OAuth tokens table for platform integrations
  db.exec(`
    CREATE TABLE IF NOT EXISTS oauth_tokens (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at DATETIME,
      scope TEXT,
      user_email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // System settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_meetings_platform ON meetings (platform);
    CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings (status);
    CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings (created_at);
    CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants (meeting_id);
    CREATE INDEX IF NOT EXISTS idx_participants_email ON participants (email);
    CREATE INDEX IF NOT EXISTS idx_email_logs_meeting_id ON email_logs (meeting_id);
    CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs (status);
    CREATE INDEX IF NOT EXISTS idx_chat_logs_meeting_id ON chat_logs (meeting_id);
    CREATE INDEX IF NOT EXISTS idx_oauth_tokens_platform ON oauth_tokens (platform);
  `);

  console.log('Database initialized successfully');
}

// Initialize database on module load
initializeDatabase();

// Prepared statements for better performance
const statements = {
  // Meeting operations
  insertMeeting: db.prepare(`
    INSERT INTO meetings (id, platform, meeting_link, title, status, oauth_token, meeting_metadata)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  updateMeeting: db.prepare(`
    UPDATE meetings 
    SET status = ?, started_at = ?, completed_at = ?, summary_data = ?, transcript_path = ?, recording_path = ?
    WHERE id = ?
  `),
  
  getMeeting: db.prepare('SELECT * FROM meetings WHERE id = ?'),
  
  getRecentMeetings: db.prepare(`
    SELECT * FROM meetings 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `),
  
  getMeetingsByStatus: db.prepare('SELECT * FROM meetings WHERE status = ?'),
  
  getMeetingsByPlatform: db.prepare('SELECT * FROM meetings WHERE platform = ?'),
  
  // Participant operations
  insertParticipant: db.prepare(`
    INSERT INTO participants (id, meeting_id, name, email, role, joined_at, platform_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  getParticipants: db.prepare('SELECT * FROM participants WHERE meeting_id = ?'),
  
  updateParticipant: db.prepare(`
    UPDATE participants 
    SET name = ?, email = ?, role = ?, left_at = ?
    WHERE id = ?
  `),
  
  // Email log operations
  insertEmailLog: db.prepare(`
    INSERT INTO email_logs (id, meeting_id, recipient_email, status, sent_at, error_message, retry_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  updateEmailLog: db.prepare(`
    UPDATE email_logs 
    SET status = ?, sent_at = ?, error_message = ?, retry_count = ?
    WHERE id = ?
  `),
  
  getEmailLogs: db.prepare('SELECT * FROM email_logs WHERE meeting_id = ?'),
  
  getPendingEmails: db.prepare('SELECT * FROM email_logs WHERE status = "pending" OR status = "failed"'),
  
  // Chat log operations
  insertChatLog: db.prepare(`
    INSERT INTO chat_logs (id, meeting_id, prompt, response, platform)
    VALUES (?, ?, ?, ?, ?)
  `),
  
  getChatLogs: db.prepare('SELECT * FROM chat_logs WHERE meeting_id = ? ORDER BY created_at DESC'),
  
  // OAuth token operations
  insertOAuthToken: db.prepare(`
    INSERT OR REPLACE INTO oauth_tokens (id, platform, access_token, refresh_token, expires_at, scope, user_email)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  getOAuthToken: db.prepare('SELECT * FROM oauth_tokens WHERE platform = ? AND user_email = ?'),
  
  updateOAuthToken: db.prepare(`
    UPDATE oauth_tokens 
    SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  // System settings operations
  setSetting: db.prepare(`
    INSERT OR REPLACE INTO system_settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
  `),
  
  getSetting: db.prepare('SELECT value FROM system_settings WHERE key = ?'),
};

// Meeting operations
export function persistSession(session) {
  try {
    const metadata = session.meeting_metadata ? JSON.stringify(session.meeting_metadata) : null;
    
    statements.insertMeeting.run(
      session.id,
      session.platform,
      session.meetingLink,
      session.title || null,
      session.status,
      session.oauth_token || null,
      metadata
    );
    
    return session;
  } catch (error) {
    console.error('Error persisting session:', error);
    throw error;
  }
}

export function fetchSession(sessionId) {
  try {
    const meeting = statements.getMeeting.get(sessionId);
    if (!meeting) return null;
    
    // Parse JSON fields
    if (meeting.summary_data) {
      meeting.summary = JSON.parse(meeting.summary_data);
    }
    
    if (meeting.meeting_metadata) {
      meeting.metadata = JSON.parse(meeting.meeting_metadata);
    }
    
    return meeting;
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
}

export function updateSession(sessionId, updates) {
  try {
    const summaryData = updates.summary ? JSON.stringify(updates.summary) : null;
    
    statements.updateMeeting.run(
      updates.status || null,
      updates.started_at || null,
      updates.completed_at || null,
      summaryData,
      updates.transcript_path || null,
      updates.recording_path || null,
      sessionId
    );
    
    return fetchSession(sessionId);
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

export function recentSessions(limit = 10, offset = 0) {
  try {
    return statements.getRecentMeetings.all(limit, offset);
  } catch (error) {
    console.error('Error fetching recent sessions:', error);
    return [];
  }
}

export function pendingSessionsCount() {
  try {
    const pending = statements.getMeetingsByStatus.all('recording');
    const processing = statements.getMeetingsByStatus.all('processing');
    return pending.length + processing.length;
  } catch (error) {
    console.error('Error counting pending sessions:', error);
    return 0;
  }
}

// Participant operations
export function setSessionMembers(sessionId, members) {
  try {
    // First, remove existing participants
    db.prepare('DELETE FROM participants WHERE meeting_id = ?').run(sessionId);
    
    // Insert new participants
    const insertTransaction = db.transaction((participants) => {
      for (const participant of participants) {
        statements.insertParticipant.run(
          randomUUID(),
          sessionId,
          participant.name,
          participant.email,
          participant.role || 'participant',
          participant.joined_at || new Date().toISOString(),
          participant.platform_user_id || null
        );
      }
    });
    
    insertTransaction(members);
    return members;
  } catch (error) {
    console.error('Error setting session members:', error);
    throw error;
  }
}

export function membersForSession(sessionId) {
  try {
    return statements.getParticipants.all(sessionId);
  } catch (error) {
    console.error('Error fetching session members:', error);
    return [];
  }
}

export function addParticipant(sessionId, participant) {
  try {
    const participantId = randomUUID();
    statements.insertParticipant.run(
      participantId,
      sessionId,
      participant.name,
      participant.email,
      participant.role || 'participant',
      participant.joined_at || new Date().toISOString(),
      participant.platform_user_id || null
    );
    
    return { id: participantId, ...participant };
  } catch (error) {
    console.error('Error adding participant:', error);
    throw error;
  }
}

// Email operations
export function logEmailSend(meetingId, recipientEmail, status = 'pending', errorMessage = null) {
  try {
    const logId = randomUUID();
    statements.insertEmailLog.run(
      logId,
      meetingId,
      recipientEmail,
      status,
      status === 'sent' ? new Date().toISOString() : null,
      errorMessage,
      0
    );
    
    return logId;
  } catch (error) {
    console.error('Error logging email send:', error);
    throw error;
  }
}

export function updateEmailStatus(logId, status, errorMessage = null, retryCount = 0) {
  try {
    statements.updateEmailLog.run(
      status,
      status === 'sent' ? new Date().toISOString() : null,
      errorMessage,
      retryCount,
      logId
    );
  } catch (error) {
    console.error('Error updating email status:', error);
    throw error;
  }
}

export function getEmailLogsForMeeting(meetingId) {
  try {
    return statements.getEmailLogs.all(meetingId);
  } catch (error) {
    console.error('Error fetching email logs:', error);
    return [];
  }
}

// Chat operations
export function logChat(chatData) {
  try {
    statements.insertChatLog.run(
      chatData.id || randomUUID(),
      chatData.meeting_id || null,
      chatData.prompt,
      chatData.response,
      chatData.platform
    );
  } catch (error) {
    console.error('Error logging chat:', error);
    throw error;
  }
}

export function getChatHistory(meetingId, limit = 50) {
  try {
    return statements.getChatLogs.all(meetingId).slice(0, limit);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

// OAuth token operations
export function storeOAuthToken(platform, tokenData, userEmail) {
  try {
    const tokenId = randomUUID();
    statements.insertOAuthToken.run(
      tokenId,
      platform,
      tokenData.access_token,
      tokenData.refresh_token || null,
      tokenData.expires_at || null,
      tokenData.scope || null,
      userEmail
    );
    
    return tokenId;
  } catch (error) {
    console.error('Error storing OAuth token:', error);
    throw error;
  }
}

export function getOAuthToken(platform, userEmail) {
  try {
    return statements.getOAuthToken.get(platform, userEmail);
  } catch (error) {
    console.error('Error fetching OAuth token:', error);
    return null;
  }
}

export function refreshOAuthToken(tokenId, newTokenData) {
  try {
    statements.updateOAuthToken.run(
      newTokenData.access_token,
      newTokenData.refresh_token || null,
      newTokenData.expires_at || null,
      tokenId
    );
  } catch (error) {
    console.error('Error refreshing OAuth token:', error);
    throw error;
  }
}

// System settings operations
export function setSetting(key, value) {
  try {
    statements.setSetting.run(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting system setting:', error);
    throw error;
  }
}

export function getSetting(key, defaultValue = null) {
  try {
    const result = statements.getSetting.get(key);
    return result ? JSON.parse(result.value) : defaultValue;
  } catch (error) {
    console.error('Error getting system setting:', error);
    return defaultValue;
  }
}

// Analytics and reporting
export function getMeetingStats() {
  try {
    const totalMeetings = db.prepare('SELECT COUNT(*) as count FROM meetings').get().count;
    const completedMeetings = db.prepare('SELECT COUNT(*) as count FROM meetings WHERE status = "completed"').get().count;
    const activeSessions = db.prepare('SELECT COUNT(*) as count FROM meetings WHERE status IN ("recording", "processing")').get().count;
    
    const platformStats = db.prepare(`
      SELECT platform, COUNT(*) as count 
      FROM meetings 
      GROUP BY platform
    `).all();
    
    const recentActivity = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(*) as count 
      FROM meetings 
      WHERE created_at >= datetime('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all();
    
    return {
      totalMeetings,
      completedMeetings,
      activeSessions,
      completionRate: totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0,
      platformStats,
      recentActivity
    };
  } catch (error) {
    console.error('Error getting meeting stats:', error);
    return {
      totalMeetings: 0,
      completedMeetings: 0,
      activeSessions: 0,
      completionRate: 0,
      platformStats: [],
      recentActivity: []
    };
  }
}

// Database maintenance
export function cleanupOldData(daysToKeep = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const deleteOldMeetings = db.prepare(`
      DELETE FROM meetings 
      WHERE created_at < ? AND status = 'completed'
    `);
    
    const result = deleteOldMeetings.run(cutoffDate.toISOString());
    console.log(`Cleaned up ${result.changes} old meetings`);
    
    return result.changes;
  } catch (error) {
    console.error('Error cleaning up old data:', error);
    return 0;
  }
}

// Close database connection gracefully
export function closeDatabase() {
  try {
    db.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}

// Handle process termination
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);