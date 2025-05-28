import { db } from "../firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

// Reference to the 'plants' collection in Firestore
const plantsRef = collection(db, "plants");

// Function to add a new plant to Firestore
export async function addPlant(plant) {
  try {
    // Adds the plant to the Firestore collection
    const docRef = await addDoc(plantsRef, plant);
    console.log("Document written with ID: ", docRef.id); // Log document ID for debugging
    return docRef.id; // Return the document ID after successful addition
  } catch (error) {
    console.error("Error adding plant: ", error);
    throw new Error("Failed to add plant"); // Throw error if something goes wrong
  }
}

// Function to get all plants from Firestore
export async function getPlants() {
  try {
    // Fetches all documents in the 'plants' collection
    const snapshot = await getDocs(plantsRef);
    // Maps through the documents to return the data in a usable format
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching plants: ", error);
    throw new Error("Failed to fetch plants"); // Throw error if something goes wrong
  }
}

// Function to update an existing plant's data in Firestore
export async function updatePlant(id, data) {
  try {
    // Reference to the specific document by its ID
    const plantRef = doc(db, "plants", id);
    // Update the document with the new data
    await updateDoc(plantRef, data);
    console.log("Document updated with ID: ", id); // Log document ID for debugging
  } catch (error) {
    console.error("Error updating plant: ", error);
    throw new Error("Failed to update plant"); // Throw error if something goes wrong
  }
}

// Function to delete a plant from Firestore
export async function deletePlant(id) {
  try {
    // Reference to the specific document by its ID
    const plantRef = doc(db, "plants", id);
    // Delete the document
    await deleteDoc(plantRef);
    console.log("Document deleted with ID: ", id); // Log document ID for debugging
  } catch (error) {
    console.error("Error deleting plant: ", error);
    throw new Error("Failed to delete plant"); // Throw error if something goes wrong
  }
}
