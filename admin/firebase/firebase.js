const firebase = require('firebase')
require('firebase/auth')
require('firebase/database')

const firebaseConfig = {
  apiKey: "AIzaSyASYtPIVl0pyGc84_2cJPirPfevzy_8geM",
  authDomain: "fyp-argupedia.firebaseapp.com",
  databaseURL: "https://fyp-argupedia.firebaseio.com",
  projectId: "fyp-argupedia",
  storageBucket: "fyp-argupedia.appspot.com",
  messagingSenderId: "1019762488259",
  appId: "1:1019762488259:web:462130e1799b05ca2a8376"
};
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);

module.exports = {
    firebase
}