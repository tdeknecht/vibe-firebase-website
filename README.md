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

2. **Build and start development server:**
   ```bash
   npm run dev
   ```
   This will build the project and start the server at `http://localhost:3000`

3. **Alternative - Manual build and serve:**
   ```bash
   npm run build
   npx http-server public -p 3000
   ```

### Available Scripts

- `npm run dev` - Build project and start development server
- `npm run build` - Build project (copies JS files to public directory)
- `npm run clean` - Remove built files from public directory

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
│   ├── index.html              # Main HTML file
│   └── js/                     # Built JavaScript files (generated)
│       ├── modules/
│       │   ├── auth.js         # Authentication module (copied)
│       │   ├── firebase.js     # Firebase configuration (copied)
│       │   └── ui.js          # UI utilities module (copied)
│       └── main.js            # Application entry point (copied)
├── src/
│   ├── js/
│   │   ├── modules/
│   │   │   ├── auth.js         # Authentication module (source)
│   │   │   ├── firebase.js     # Firebase configuration (source)
│   │   │   └── ui.js          # UI utilities module (source)
│   │   └── main.js            # Application entry point (source)
│   └── css/                   # Stylesheets (for future use)
│       └── components/        # Component-specific styles
├── package.json               # Dependencies and build scripts
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