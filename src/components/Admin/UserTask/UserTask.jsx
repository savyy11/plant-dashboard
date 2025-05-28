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
  getDocs,
} from "firebase/firestore";
import "./UserTask.css";

const UserTask = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    const fetchData = async () => {
      try {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return;

        const currentUserData = userSnap.data();
        const role = currentUserData.role;
        const currentEmail = currentUser.email;
        setUserRole(role);
        if (role === "admin" || role === "user") setIsUser(true);
        if (role === "admin") setAdminEmail(currentEmail);

        const usersSnapshot = await getDocs(collection(db, "users"));
        const allUsers = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(allUsers);

        const emailToName = {};
        allUsers.forEach((u) => {
          emailToName[u.email] = u.name;
        });
        setUserMap(emailToName);

        const taskRef = collection(db, "tasks");
        const taskQuery =
          role === "user"
            ? query(taskRef, where("userEmail", "==", currentEmail))
            : taskRef;

        const unsubscribeTasks = onSnapshot(taskQuery, (snapshot) => {
          const allTasks = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(allTasks);
        });

        // Real-time message fetch only if admin
        let unsubscribeMessages;
        if (role === "admin") {
          unsubscribeMessages = onSnapshot(collection(db, "messages"), (snapshot) => {
            const filtered = snapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((msg) => msg.toEmail === currentEmail);
            setMessages(filtered);
          });
        }

        return () => {
          unsubscribeTasks();
          if (unsubscribeMessages) unsubscribeMessages();
        };
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleAddTask = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser || !title.trim() || !description.trim()) return;

    const assignedEmail = selectedUserEmail || currentUser.email;

    await addDoc(collection(db, "tasks"), {
      title,
      description,
      status: "pending",
      userEmail: assignedEmail,
      createdAt: serverTimestamp(),
    });

    setTitle("");
    setDescription("");
    closeModal();
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openMessagePopup = () => setIsMessagePopupOpen(true);
  const closeMessagePopup = () => setIsMessagePopupOpen(false);

  return (
    <div className="task-container">
      <Sidebar />
      <h2 className="task-heading">📝 My Tasks</h2>

      {!isUser && <div className="error-message">Waiting...</div>}

      {isUser && (
        <div className="task-actions">
          <button className="open-modal-button" onClick={openModal}>
            ➕ Add New Task
          </button>
          {userRole === "admin" && (
            <button className="open-modal-button" onClick={openMessagePopup}>
              📩 View Messages
            </button>
          )}
        </div>
      )}

      {/* Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create a New Task</h3>
              <button className="close-modal" onClick={closeModal}>X</button>
            </div>
            <form className="task-form" onSubmit={handleAddTask}>
              {userRole === "admin" && (
                <div>
                  <label>Assign to:</label>
                  <select
                    value={selectedUserEmail}
                    onChange={(e) => setSelectedUserEmail(e.target.value)}
                  >
                    <option value="">Myself</option>
                    {users
                      .filter((u) => u.role === "user")
                      .map((user) => (
                        <option key={user.id} value={user.email}>
                          {user.name} ({user.email})
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

      {/* Message Popup */}
      {isMessagePopupOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📨 Messages to Admin</h3>
              <button className="close-modal" onClick={closeMessagePopup}>X</button>
            </div>
            <div className="modal-body">
              {messages.length > 0 ? (
                messages.map((msg) => (
                  <div key={msg.id} className="message-box">
                    <p><strong>From:</strong> {msg.fromName} ({msg.fromEmail})</p>
                    <p><strong>Message:</strong> {msg.message}</p>
                    <p><strong>Sent At:</strong> {msg.createdAt?.toDate().toLocaleString() || "N/A"}</p>
                  </div>
                ))
              ) : (
                <p>No messages found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="task-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div className="task-card" key={task.id}>
              <div className="task-title">{task.title}</div>
              <div className="task-description">{task.description}</div>
              <div className={`task-status ${task.status}`}>
                {task.status === "done" ? "✅ Done" : "⏳ Pending"}
              </div>
              <div className="task-user">
                👤 Assigned To: <strong>{userMap[task.userEmail] || task.userEmail}</strong>
              </div>
              <div className="task-time">
                📅 Created At: {task.createdAt?.toDate ? task.createdAt.toDate().toLocaleString() : "N/A"}
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
