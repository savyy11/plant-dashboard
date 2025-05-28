import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebase"; // Ensure this exports db
import Sidebar from "../Nav/Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
  const [username, setUsername] = useState("Admin");

  // Fetch user's name from Firestore
  const fetchUserName = async (email) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setUsername(userData.name || "Admin");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        fetchUserName(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <h1>👋Hi , {username}</h1>
        <p>Manage plants efficiently!</p>
      </div>
    </div>
  );
};

export default Dashboard;
