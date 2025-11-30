# Contributing to SmartMeet AI Assistant

Thank you for your interest in contributing to SmartMeet! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@smartmeet.ai](mailto:conduct@smartmeet.ai).

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Chrome/Edge browser (for extension development)
- Basic knowledge of JavaScript, HTML, CSS
- Familiarity with REST APIs

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/smartmeet-ai-assistant.git
   cd smartmeet-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Load Chrome extension**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

## 🛠 How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **🐛 Bug Reports** - Help us identify and fix issues
- **✨ Feature Requests** - Suggest new functionality
- **📝 Documentation** - Improve our docs and examples
- **🔧 Code Contributions** - Fix bugs or implement features
- **🧪 Testing** - Add tests or improve test coverage
- **🎨 UI/UX Improvements** - Enhance user experience
- **🌐 Translations** - Help make SmartMeet accessible globally

### Before You Start

1. **Check existing issues** - Look for existing issues or discussions
2. **Create an issue** - If none exists, create one to discuss your idea
3. **Get feedback** - Wait for maintainer feedback before starting work
4. **Assign yourself** - Comment on the issue to get it assigned to you

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation-update
```

### 2. Make Your Changes

- Follow our [coding standards](#coding-standards)
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add Google Meet participant extraction"
git commit -m "fix: resolve Chrome extension popup issue"
git commit -m "docs: update API documentation"
```

**Commit Types:**
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 4. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots (if UI changes)
- Testing instructions

### 5. Code Review

- Address reviewer feedback
- Keep your branch up to date
- Be responsive to comments
- Make requested changes promptly

## 📏 Coding Standards

### JavaScript/Node.js

- Use ES6+ features
- Follow ESLint configuration
- Use meaningful variable names
- Add JSDoc comments for functions
- Handle errors appropriately

```javascript
/**
 * Creates a new meeting session
 * @param {string} platform - Meeting platform (zoom, teams, gmeet, cliq)
 * @param {string} meetingLink - URL of the meeting
 * @param {Array} participants - List of meeting participants
 * @returns {Promise<Object>} Created session object
 */
async function createMeetingSession(platform, meetingLink, participants) {
  try {
    // Implementation here
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}
```

### Chrome Extension

- Follow Manifest V3 guidelines
- Use modern JavaScript (async/await)
- Handle permissions properly
- Implement proper error handling

### CSS

- Use CSS custom properties (variables)
- Follow BEM methodology for class names
- Ensure responsive design
- Test across different browsers

### Deluge

- Follow Zoho Deluge best practices
- Use proper error handling
- Add comprehensive comments
- Test with Zoho Creator

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/api.test.js

# Run tests with coverage
npm run test:coverage

# Run backend API tests
node test-backend.js
```

### Writing Tests

- Write tests for new features
- Include edge cases
- Test error conditions
- Use descriptive test names

```javascript
describe('Meeting Session API', () => {
  test('should create session with valid parameters', async () => {
    const session = await createSession({
      platform: 'gmeet',
      meetingLink: 'https://meet.google.com/test',
      participants: []
    });
    
    expect(session).toHaveProperty('id');
    expect(session.platform).toBe('gmeet');
  });
  
  test('should reject invalid platform', async () => {
    await expect(createSession({
      platform: 'invalid',
      meetingLink: 'https://example.com'
    })).rejects.toThrow('Unsupported platform');
  });
});
```

### Chrome Extension Testing

- Test on multiple Chrome versions
- Verify permissions work correctly
- Test content script injection
- Validate popup functionality

## 📚 Documentation

### Code Documentation

- Add JSDoc comments to functions
- Document complex algorithms
- Explain non-obvious code
- Update README for new features

### API Documentation

- Document all endpoints
- Include request/response examples
- Specify error codes
- Add authentication details

### User Documentation

- Update user guides for new features
- Add screenshots for UI changes
- Create video tutorials if needed
- Translate important docs

## 🐛 Bug Reports

When reporting bugs, please include:

- **Environment details** (OS, browser, Node.js version)
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots or videos** if applicable
- **Console logs** or error messages
- **Minimal reproduction** case if possible

### Bug Report Template

```markdown
**Environment:**
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 96.0]
- Node.js: [e.g., 18.0.0]
- SmartMeet version: [e.g., 1.2.0]

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
A clear description of what you expected to happen.

**Actual Behavior:**
A clear description of what actually happened.

**Screenshots:**
If applicable, add screenshots to help explain your problem.

**Additional Context:**
Add any other context about the problem here.
```

## ✨ Feature Requests

When requesting features, please include:

- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives considered** - What other approaches did you consider?
- **Additional context** - Any other relevant information

## 🏷 Issue Labels

We use labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority issue
- `platform: zoom` - Zoom-specific issue
- `platform: teams` - Teams-specific issue
- `platform: gmeet` - Google Meet-specific issue
- `platform: cliq` - Cliq-specific issue

## 🎯 Development Focus Areas

We're particularly interested in contributions in these areas:

### High Priority
- **Google Meet API integration** improvements
- **Real-time transcription** enhancements
- **Chrome extension** stability and performance
- **Email delivery** reliability
- **Error handling** and logging

### Medium Priority
- **UI/UX improvements** for better user experience
- **Mobile responsiveness** for web interface
- **Performance optimizations** for large meetings
- **Accessibility** improvements
- **Internationalization** (i18n) support

### Future Enhancements
- **Mobile app** development (React Native)
- **Slack/Discord** integrations
- **Advanced analytics** and reporting
- **Enterprise features** (SSO, compliance)
- **AI improvements** for better summarization

## 🤔 Questions?

If you have questions about contributing:

- 💬 Join our [Discord community](https://discord.gg/smartmeet)
- 📧 Email us at [developers@smartmeet.ai](mailto:developers@smartmeet.ai)
- 📖 Check our [documentation](https://docs.smartmeet.ai)
- 🐛 Open an issue for technical questions

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- Our website contributors page
- Special Discord role for active contributors

Thank you for contributing to SmartMeet! 🚀