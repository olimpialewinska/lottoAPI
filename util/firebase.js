const firebase = require('firebase');
// Import the functions you need from the SDKs you need
const init =require("firebase/app");
const get = require("firebase/analytics");

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJqa9d3xEkQdVexJZVUxqPJ2xFodbwDuA",
  authDomain: "lotto-api-a311c.firebaseapp.com",
  projectId: "lotto-api-a311c",
  storageBucket: "lotto-api-a311c.appspot.com",
  messagingSenderId: "951090264804",
  appId: "1:951090264804:web:af2ba9fb4226c5e238caf1",
  measurementId: "G-8CRSWBXL2G"
};
// Initialize Firebase
const app = init.initializeApp(firebaseConfig);
const analytics = get.getAnalytics(app);

firebase.initializeApp(firebaseConfig); //initialize firebase app 
module.exports = { firebase }; //export the app