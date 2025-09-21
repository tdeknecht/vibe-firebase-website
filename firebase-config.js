// Firebase Configuration
// These values are safe to be public as they're client-side configuration
// Firebase security is handled by Firestore security rules and Auth settings

export const firebaseConfig = {
    apiKey: "AIzaSyCNOoLH8SbEWGfsXkTgeUDMJJtuGMEqSx0",
    authDomain: "base-website-dee90.firebaseapp.com",
    projectId: "base-website-dee90",
    storageBucket: "base-website-dee90.firebasestorage.app",
    messagingSenderId: "171006137222",
    appId: "1:171006137222:web:bee933e579d0429d0d5207",
    measurementId: "G-XZG55JGEKV"
};

// Development environment check
export const isDevelopment = window.location.hostname === 'localhost' ||
                            window.location.hostname === '127.0.0.1' ||
                            window.location.hostname === '';

// Validation function to check if config is properly set
export function validateFirebaseConfig() {
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = requiredFields.filter(field => !firebaseConfig[field]);

    if (missingFields.length > 0) {
        throw new Error(`Firebase configuration incomplete. Missing values for: ${missingFields.join(', ')}`);
    }

    return true;
}

// Instructions for setup (will be logged in development)
if (isDevelopment) {
    console.log(`
🔥 Firebase Setup Instructions:
1. Go to https://console.firebase.google.com
2. Select or create your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click "Add app" or select existing web app
6. Copy the config values and update firebase-config.js
7. Enable Authentication > Sign-in method > Google in Firebase Console
8. Add your domain to authorized domains in Firebase Auth settings
    `);
}