import React, { useState, useEffect } from "react";
import { db, auth } from "../../../firebase"; // Assuming db and auth are exported from your Firebase configuration
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"; // Import the required Firestore methods
import { onAuthStateChanged, signOut } from "firebase/auth"; // For tracking the logged-in user and signing out
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router
import Profile from '../../assets/profilreicon.png';
import Logo from '../../assets/logo link.jpg'; 
import "./UserHome.css";

const UserHome = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    avatar: "", // Default empty
  });

  const [tasks, setTasks] = useState([]); // Now tasks are fetched from Firestore
  const [isModalOpen, setIsModalOpen] = useState(false); // State to toggle modal visibility

  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch user data from Firebase Firestore based on the logged-in user's email
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

  // Fetch tasks data from Firestore based on the logged-in user's email
  const fetchUserTasks = async (userEmail) => {
    try {
      const q = query(collection(db, "tasks"), where("userEmail", "==", userEmail)); // Fetch tasks for the user
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const tasksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksList); // Set tasks in the state
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

  // Function to toggle task status between 'pending' and 'done' and update in Firestore
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "done" ? "pending" : "done"; // Toggle the status

    // Update the task status in Firestore
    const taskRef = doc(db, "tasks", id); // Reference to the specific task document
    await updateDoc(taskRef, {
      status: newStatus, // Update status to new status
    });

    // Update the task status locally
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              status: newStatus,
            }
          : task
      )
    );
  };

  const handleDescriptionChange = (id, value) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, description: value } : task
      )
    );
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function to handle logout and redirect to login page
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

  return (
    <div className="userhome-container">
      <img src={Logo} alt="Logo" className="login-logo" />
      <h2 className="userhome-title">👤 {user.name ? `Hi, ${user.name}` : "User Dashboard"}</h2> {/* Dynamically show user's name in the title */}

      {/* User Profile Section - Top right corner */}
      <div className="user-profile" onClick={openModal}>
        <div className="profile-icon">
          <img
            className="user-avatar"
            src={Profile} alt="Profile" // Show default avatar if none
          />
        </div>
      </div>

      {/* Task List Section */}
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${task.status === "done" ? "done" : "pending"}`}
            >
              <div className="task-main" onClick={() => toggleStatus(task.id, task.status)}>
                <span className="task-title">{task.title}</span>
                <span className={`task-status ${task.status}`}>
                  {task.status === "done" ? "✅ Done" : "⏳ Pending"}
                </span>
              </div>
              <textarea
                className="task-description-input"
                placeholder="Write a description..."
                value={task.description}
                onChange={(e) =>
                  handleDescriptionChange(task.id, e.target.value)
                }
              />
            </div>
          ))
        ) : (
          <p>No tasks available for this user.</p>
        )}
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

export default UserHome;
