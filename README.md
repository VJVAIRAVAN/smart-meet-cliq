# SmartMeet AI Assistant - Deluge Version

A comprehensive meeting assistant system converted to Zoho Deluge scripting language. This system captures, transcribes, and summarizes meetings from multiple platforms including Zoom, Microsoft Teams, Google Meet, and Zoho Cliq.

## Features

### Multi-Platform Support
- **Zoom**: Meeting SDK integration with cloud recording access
- **Microsoft Teams**: Graph API integration with adaptive cards
- **Google Meet**: Calendar API integration with Gmail delivery
- **Zoho Cliq**: Native Zoho integration with bot commands

### Core Functionality
- Automated meeting detection and capture
- Real-time transcription and AI-powered summarization
- Participant management and email distribution
- Chrome extension for seamless browser integration
- Comprehensive audit logging and security features

## File Structure

```
deluge-smartmeet/
├── smartmeet-main.deluge              # Core SmartMeet functionality
├── smartmeet-web-interface.deluge     # Web dashboard and UI generation
├── smartmeet-google-meet.deluge       # Google Meet specific integration
├── smartmeet-chrome-extension.deluge  # Chrome extension backend
└── README.md                          # This documentation
```

## Installation & Setup

### 1. Zoho Creator Setup

1. Create a new Zoho Creator application
2. Import the Deluge scripts into your application
3. Set up the required database tables (automatically created by initialization)

### 2. Database Tables

The system automatically creates these tables:

- **SmartMeet_Meetings**: Core meeting session data
- **SmartMeet_Participants**: Meeting participant information  
- **SmartMeet_Email_Logs**: Email delivery tracking

### 3. API Configuration

Configure OAuth credentials for each platform:

```deluge
// Example configuration in Zoho Creator
zoom_config = Map();
zoom_config.put("client_id", "your_zoom_client_id");
zoom_config.put("client_secret", "your_zoom_client_secret");

teams_config = Map();
teams_config.put("client_id", "your_teams_client_id");
teams_config.put("client_secret", "your_teams_client_secret");

gmeet_config = Map();
gmeet_config.put("client_id", "your_google_client_id");
gmeet_config.put("client_secret", "your_google_client_secret");
```

## Usage Examples

### Initialize SmartMeet System

```deluge
// Initialize the SmartMeet system
smartmeet_initialize();
```

### Create a Meeting Session

```deluge
// Create a new meeting session
session_result = smartmeet_create_session(
    "gmeet",  // platform
    "https://meet.google.com/abc-defg-hij",  // meeting_link
    {"user@example.com"},  // emails
    {
        {"name": "John Doe", "email": "john@example.com", "role": "organizer"},
        {"name": "Jane Smith", "email": "jane@example.com", "role": "participant"}
    }  // members
);

session_id = session_result.get("id");
```

### Start Meeting Recording

```deluge
// Start recording the meeting
start_result = smartmeet_start_session(session_id);
```

### Complete Meeting and Generate Summary

```deluge
// Complete the meeting and generate summary
complete_result = smartmeet_complete_session(
    session_id,
    {
        "highlights": {"Key decision made", "Action items assigned"},
        "actions": {
            {"owner": "John", "action": "Review proposal", "due": "2025-12-01"}
        }
    }
);
```

### Handle Chrome Extension Requests

```deluge
// Handle extension API request
extension_result = smartmeet_extension_handler(
    "detect_meeting",
    {
        "url": "https://meet.google.com/abc-defg-hij",
        "title": "Team Standup Meeting"
    }
);
```

### Generate Web Dashboard

```deluge
// Generate HTML dashboard
dashboard_html = smartmeet_generate_dashboard_html();
```

## API Reference

### Core Functions

#### `smartmeet_initialize()`
Initializes the SmartMeet system and creates necessary database tables.

#### `smartmeet_create_session(platform, meeting_link, emails, members)`
Creates a new meeting session.

**Parameters:**
- `platform`: Meeting platform (zoom, teams, gmeet, cliq)
- `meeting_link`: URL of the meeting
- `emails`: List of email addresses for notifications
- `members`: List of participant objects

**Returns:** Session object with ID and metadata

#### `smartmeet_start_session(session_id)`
Starts recording for a meeting session.

#### `smartmeet_complete_session(session_id, summary_override)`
Completes a meeting session and generates summary.

### Google Meet Integration

#### `smartmeet_gmeet_create_session(meeting_url, access_token)`
Creates a Google Meet session with OAuth authentication.

#### `smartmeet_gmeet_get_participants(meeting_id, access_token)`
Extracts participants from Google Meet session.

#### `smartmeet_gmeet_start_recording(meeting_id, access_token)`
Starts recording for Google Meet (requires Google Workspace).

### Chrome Extension Integration

#### `smartmeet_extension_handler(action, request_data)`
Main handler for Chrome extension requests.

**Supported Actions:**
- `detect_meeting`: Detect meeting platform from URL
- `start_capture`: Start meeting capture
- `stop_capture`: Stop meeting capture
- `get_status`: Get system status
- `chat_message`: Handle copilot chat
- `get_recent_meetings`: Get recent meeting list

### Web Interface

#### `smartmeet_generate_dashboard_html()`
Generates complete HTML dashboard with CSS and JavaScript.

#### `smartmeet_generate_meeting_details(meeting_id)`
Generates detailed meeting view page.

## Platform-Specific Features

### Google Meet Integration
- Calendar API integration for meeting metadata
- Participant extraction from Calendar events
- OAuth 2.0 authentication flow
- Drive integration for recordings
- Gmail integration for summary delivery

### Chrome Extension Support
- Platform-specific UI injection
- Real-time meeting detection
- Cross-platform consistency
- Browser-based controls and status

### Email System
- HTML email templates
- Delivery tracking and retry logic
- Participant preference handling
- Multi-platform summary formatting

## Security Features

- OAuth 2.0 authentication for all platforms
- Encrypted storage of sensitive data
- Audit logging for all operations
- Consent tracking and management
- Data retention policy enforcement

## Error Handling

The system includes comprehensive error handling:

```deluge
try {
    result = smartmeet_create_session(platform, url, emails, members);
    if(result.containsKey("error")) {
        // Handle specific error
        info "Session creation failed: " + result.get("error");
    }
} catch (e) {
    // Handle system error
    info "System error: " + e.toString();
}
```

## Monitoring and Metrics

### System Status
```deluge
status = smartmeet_get_extension_status();
// Returns: online status, connected platforms, pending sessions
```

### Meeting Analytics
```deluge
sessions = smartmeet_get_sessions(1, 10);  // page, limit
// Returns: paginated list of meeting sessions
```

## Customization

### Custom Email Templates
Modify the `smartmeet_build_email_template()` function to customize email formatting.

### Platform-Specific Responses
Update response banks in `smartmeet_copilot_chat()` for custom AI responses.

### UI Customization
Modify CSS in `smartmeet_get_dashboard_css()` to match your branding.

## Troubleshooting

### Common Issues

1. **OAuth Authentication Failures**
   - Verify client credentials are correct
   - Check OAuth scopes and permissions
   - Ensure redirect URIs match configuration

2. **Meeting Detection Issues**
   - Verify URL patterns in detection logic
   - Check platform-specific URL formats
   - Ensure content scripts are properly injected

3. **Email Delivery Problems**
   - Verify SMTP configuration
   - Check email template formatting
   - Review delivery logs in SmartMeet_Email_Logs table

### Debug Mode
Enable detailed logging by adding debug statements:

```deluge
info "Debug: Session creation - Platform: " + platform + ", URL: " + meeting_url;
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Zoho Creator documentation for Deluge syntax
3. Verify platform API documentation for OAuth requirements

## License

This Deluge conversion maintains the same functionality as the original Node.js SmartMeet system while leveraging Zoho's native capabilities for database management, email delivery, and web interface generation.