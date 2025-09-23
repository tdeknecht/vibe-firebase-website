# Vibe Firebase Website

A simple, modern web application that demonstrates Firebase authentication with Google sign-in. The app features a clean, responsive interface with a gradient background and smooth animations.

## Features

- Google Authentication via Firebase Auth
- Responsive design with modern CSS
- Real-time authentication state management
- Clean, minimal user interface
- Firebase configuration validation

## Tech Stack

- Vanilla HTML/CSS/JavaScript (ES6 modules)
- Firebase SDK (Authentication)
- Google OAuth integration
- Modular architecture for scalability

## Local Development

### Prerequisites
- Node.js (for package management and local server)
- Modern web browser

### Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start local server:**
   ```bash
   npx http-server public -p 3000
   ```

3. **Access the application:**
   - Standard: `http://localhost:3000`
   - WSL users: Use `npx http-server . -p 3000 -a 0.0.0.0` and access via WSL IP address

### WSL Users
If running in WSL, you may need to:
1. Find your WSL IP: `hostname -I`
2. Start server with: `npx http-server public -p 3000 -a 0.0.0.0`
3. Access via: `http://<WSL_IP>:3000`

## Firebase Configuration

The app is pre-configured with Firebase project settings in `src/js/modules/firebase.js`. The configuration includes:
- Authentication with Google provider
- Development environment detection
- Automatic config validation

## Project Structure

```
├── public/
│   └── index.html              # Main HTML file
├── src/
│   ├── js/
│   │   ├── modules/
│   │   │   ├── auth.js         # Authentication module
│   │   │   ├── firebase.js     # Firebase configuration
│   │   │   └── ui.js          # UI utilities module
│   │   └── main.js            # Application entry point
│   └── css/                   # Stylesheets (for future use)
│       └── components/        # Component-specific styles
├── package.json               # Dependencies
└── README.md                  # Project documentation
```

## Architecture

The application uses a **modular architecture** designed for incremental feature development:

- **`src/js/modules/auth.js`** - Authentication logic and Firebase Auth integration
- **`src/js/modules/ui.js`** - DOM manipulation and UI state management
- **`src/js/modules/firebase.js`** - Firebase configuration and validation
- **`src/js/main.js`** - Application orchestrator that initializes all modules

This structure allows easy addition of new features by creating additional modules (e.g., `database.js`, `storage.js`) without modifying existing code.

## Authentication Flow

1. User clicks "Sign in with Google"
2. Firebase initiates OAuth flow
3. Upon success, user information is displayed
4. Authentication state persists across sessions