import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { db, auth } from "../../../firebase"; // Assuming db and auth are exported from your Firebase configuration
import { collection, query, where, getDocs, doc } from "firebase/firestore"; // Import Firestore methods
import { onAuthStateChanged, signOut } from "firebase/auth"; // For tracking the logged-in user and signing out
import Logo from '../../assets/logo link.jpg'; // Adjust the path as necessary
import Profile from '../../assets/profilreicon.png';
import "./Sidebar.css";

const Sidebar = () => {
  // State for user and modal visibility
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "", // Default empty
  });

  const [isModalOpen, setIsModalOpen] = useState(false); // State to toggle modal visibility

  const navigate = useNavigate(); // Initialize useNavigate for redirecting

  // Fetch user data based on email
  const fetchUserData = async (userEmail) => {
    try {
      const q = query(collection(db, "users"), where("email", "==", userEmail)); // Fetch user data using email
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const data = querySnapshot.docs[0].data();
        setUser({
          name: data.name || "John Doe",
          email: data.email || "johndoe@example.com",
          avatar: data.avatar || "", // Default avatar if none
        });
      } else {
        console.log("No user found with this email!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Fetch tasks for the user
  const fetchUserTasks = async (userEmail) => {
    try {
      const q = query(collection(db, "tasks"), where("userEmail", "==", userEmail)); // Fetch tasks for the user
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const tasksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Tasks:", tasksList); // You can set tasks state here if needed
      } else {
        console.log("No tasks found for this user!");
      }
    } catch (error) {
      console.error("Error fetching tasks data:", error);
    }
  };

  // Fetch the current logged-in user's data once the component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Logged in user:", user);
        fetchUserData(user.email); // Fetch user data based on email
        fetchUserTasks(user.email); // Fetch tasks based on user's email
      } else {
        console.log("No user is logged in.");
      }
    });

    return () => unsubscribe(); // Cleanup the subscription when component unmounts
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Log out the user
      console.log("User logged out successfully.");
      setIsModalOpen(false); // Close the modal
      navigate('/login'); // Navigate to the login page after logout
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Function to toggle the profile modal visibility
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="sidebar">
      <img src={Logo} alt="Logo" className="side-logo" />
      <h2>Admin Panel</h2>
      <nav>
        <Link to="/dashboard">🏠 Dashboard</Link>
        <Link to="/plants">🌱 View Plants</Link>
        <Link to="/report">📋 View Report</Link>
        <Link to="/task">📝 View Task</Link>
        <Link to="/add-user">➕👤 Add User</Link>
      </nav>

      {/* Admin Profile Section */}
      <div className="admin-profile" onClick={openModal}>
      <div className="profile-icon">
          <img
            className="user-avatar"
            src={Profile} alt="Profile" // Show default avatar if none
          />
        </div>
        <div className="profile-details">
          <p>{user.name || "Admin"}</p>
        </div>
      </div>

      {/* Profile Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Profile Details</h3>
              <button className="close-modal" onClick={closeModal}>X</button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div>
                  <strong>Name:</strong>{" "}
                  <div className="user-info">{user.name}</div>
                </div>
                <div>
                  <strong>Email:</strong>{" "}
                  <div className="user-info">{user.email}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
