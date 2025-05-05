// Import the necessary Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore"; // Firestore functions
import { getStorage } from "firebase/storage"; // Firebase Storage functions
import { getAuth } from "firebase/auth"; // Firebase Authentication functions

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDfg9zamVy0J9RNiSqf5rPEh6ZFRiSiBeI",
  authDomain: "agriguardproject.firebaseapp.com",
  projectId: "agriguardproject",
  storageBucket: "agriguardproject.firebasestorage.app",
  messagingSenderId: "54735119557",
  appId: "1:54735119557:web:58533b8926a054cd8a3cac",
  measurementId: "G-18H899DV5G"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore database, Firebase Storage, and Firebase Authentication
const db = getFirestore(app); // Firestore database reference
const storage = getStorage(app); // Firebase Storage reference
const auth = getAuth(app); // Firebase Authentication reference

// Example function to get a document from Firestore
const getUserData = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId); // Reference to the user document
    const docSnap = await getDoc(userDocRef); // Fetch the document
    if (docSnap.exists()) {
      return docSnap.data(); // Return the document data
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user data:", error);
  }
};

// Example function to add a document to Firestore
const addTask = async (taskData) => {
  try {
    const docRef = await addDoc(collection(db, "tasks"), taskData); // Add a new document to "tasks" collection
    console.log("Document written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding document: ", error);
  }
};

// Example function to set a document in Firestore (for updating or creating a document)
const setUserData = async (userId, userData) => {
  try {
    const userDocRef = doc(db, "users", userId); // Reference to the user document
    await setDoc(userDocRef, userData); // Set the user data
    console.log("Document successfully written!");
  } catch (error) {
    console.error("Error setting document: ", error);
  }
};

// Export the initialized Firebase services and example functions
export { db, storage, auth, doc, getDoc, addDoc, setDoc, getUserData, addTask, setUserData };
