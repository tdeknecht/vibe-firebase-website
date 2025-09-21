# Vibe Firebase Website

A simple, modern web application that demonstrates Firebase authentication with Google sign-in. The app features a clean, responsive interface with a gradient background and smooth animations.

## Features

- Google Authentication via Firebase Auth
- Responsive design with modern CSS
- Real-time authentication state management
- Clean, minimal user interface
- Firebase configuration validation

## Tech Stack

- Vanilla HTML/CSS/JavaScript
- Firebase SDK (Authentication)
- Google OAuth integration

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
   npx http-server . -p 3000
   ```

3. **Access the application:**
   - Standard: `http://localhost:3000`
   - WSL users: Use `npx http-server . -p 3000 -a 0.0.0.0` and access via WSL IP address

### WSL Users
If running in WSL, you may need to:
1. Find your WSL IP: `hostname -I`
2. Start server with: `npx http-server . -p 3000 -a 0.0.0.0`
3. Access via: `http://<WSL_IP>:3000`

## Firebase Configuration

The app is pre-configured with Firebase project settings in `firebase-config.js`. The configuration includes:
- Authentication with Google provider
- Development environment detection
- Automatic config validation

## Project Structure

```
├── index.html          # Main application file
├── firebase-config.js   # Firebase configuration and utilities
├── package.json        # Dependencies
└── README.md           # Project documentation
```

## Authentication Flow

1. User clicks "Sign in with Google"
2. Firebase initiates OAuth flow
3. Upon success, user information is displayed
4. Authentication state persists across sessions