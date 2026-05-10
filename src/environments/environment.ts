export const environment = {
  prod: false,
  // ===== Firebase Web SDK config =====
  // Replace placeholders with values from Firebase Console:
  // Project settings -> General -> Your apps -> Web app -> SDK setup and configuration.
  firebase: {
    apiKey: "AIzaSyBaLNFCI158nHCVE8RuxhWWhCIIelHr57M",
    authDomain: "wifes-recipe-book-79475.firebaseapp.com",
    projectId: "wifes-recipe-book-79475",
    storageBucket: "wifes-recipe-book-79475.firebasestorage.app",
    messagingSenderId: "521695770008",
    appId: "1:521695770008:web:ccad337036cc7159fba7ed",
    measurementId: "G-9R9C968CR9"
  },
  // Web OAuth client ID for Google sign-in (Firebase Auth popup on web/PWA).
  // For native Capacitor Android, the Android client ID lives in google-services.json.
  googleWebClientId:
    '109546617287-8v3o6quekpeituq54h5cebmg3ushfvk7.apps.googleusercontent.com',
  // Toggle to point dev build at the Firebase Emulator Suite.
  useEmulators: false,
  // ImgBB API key for image uploads (get one at https://api.imgbb.com/).
  imgbbApiKey: 'ee6490e0ed2521df5ccbd65861bd78c0',
};
