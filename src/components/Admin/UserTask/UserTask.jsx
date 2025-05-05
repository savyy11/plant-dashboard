import React, { useEffect, useState } from "react";
import Sidebar from "../Nav/Sidebar";
import { auth, db } from "../../../firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import "./UserTask.css";

const UserTask = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUser, setIsUser] = useState(false); // To track if the logged-in user is authorized
  const [users, setUsers] = useState([]); // To store list of users for assigning tasks
  const [selectedUserEmail, setSelectedUserEmail] = useState(""); // To store the selected user email for assigning tasks
  const [isModalOpen, setIsModalOpen] = useState(false); // To track the modal visibility for adding tasks

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Check the role of the user in the Firestore users collection
    const userRef = doc(db, "users", user.uid); // Reference to the user's document in Firestore
    const fetchUserRole = async () => {
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Check if the role is "admin"
          if (userData.role === "admin") {
            setIsUser(true); // Admins can assign tasks to other users
          } else if (userData.role === "user") {
            setIsUser(true); // Normal users can only add tasks for themselves
          } else {
            setIsUser(false);
          }
        } else {
          console.log("No such user document!");
          setIsUser(false);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setIsUser(false);
      }
    };
    fetchUserRole();

    // Fetch users for task assignment (only if the user is an admin)
    if (isUser) {
      const usersRef = collection(db, "users");
      const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        const allUsers = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => user.role === "user"); // Filter users with role "user"
        setUsers(allUsers);
      });

      return () => unsubscribeUsers();
    }

    // Fetch tasks related to the logged-in user's email
    const q = query(collection(db, "tasks"), where("userEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userTasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(userTasks);
    });

    return () => unsubscribe();
  }, [isUser]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("User not logged in");

    if (!title.trim() || !description.trim()) return;

    // Ensure the user is authorized to add tasks
    if (!isUser) {
      return alert("You do not have permission to assign tasks.");
    }

    // If the user is an admin, allow them to assign tasks to others
    if (isUser && selectedUserEmail) {
      // Add task for the selected user
      await addDoc(collection(db, "tasks"), {
        title,
        description,
        status: "pending",
        userEmail: selectedUserEmail, // Assign the task to the selected user
        createdAt: serverTimestamp(),
      });
    } else {
      // Add task for the logged-in user if no user is selected
      await addDoc(collection(db, "tasks"), {
        title,
        description,
        status: "pending",
        userEmail: user.email, // Store userEmail for task association
        createdAt: serverTimestamp(),
      });
    }

    setTitle(""); // Reset input field after task is added
    setDescription(""); // Reset input field after task is added
    closeModal(); // Close modal after task is added
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="task-container">
      <Sidebar />
      <h2 className="task-heading">📝 My Tasks</h2>

      {/* Error message for unauthorized users */}
      {!isUser && (
        <div className="error-message">
          Waiting......
        </div>
      )}

      {/* Button to open task creation modal */}
      {isUser && (
        <button className="open-modal-button" onClick={openModal}>
          Add New Task
        </button>
      )}

      {/* Modal for task assignment */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create a New Task</h3>
              <button className="close-modal" onClick={closeModal}>X</button>
            </div>
            <form className="task-form" onSubmit={handleAddTask}>
              {isUser && (
                <div>
                  <label>Select User to Assign Task:</label>
                  <select
                    value={selectedUserEmail}
                    onChange={(e) => setSelectedUserEmail(e.target.value)}
                  >
                    <option value="">Select User</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.email}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <button type="submit">Add Task</button>
            </form>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div className="task-card" key={task.id}>
              <div className="task-title">{task.title}</div>
              <div className="task-description">{task.description}</div>
              <div className={`task-status ${task.status}`}>
                {task.status === "done" ? "✅ Done" : "⏳ Pending"}
              </div>
            </div>
          ))
        ) : (
          <p>No tasks available.</p>
        )}
      </div>
    </div>
  );
};

export default UserTask;
