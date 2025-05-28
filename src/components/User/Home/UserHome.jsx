import React, { useState, useEffect } from "react";
import { db, auth } from "../../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Profile from '../../assets/profilreicon.png';
import Logo from '../../assets/logo link.jpg';
import "./UserHome.css";

const UserHome = () => {
  const [user, setUser] = useState({ name: "", email: "", avatar: "" });
  const [tasks, setTasks] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        fetchUserData(firebaseUser.email);
        fetchUserTasks(firebaseUser.email);
        fetchAdmins();
        fetchUpcomingStages();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (email) => {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      setUser({ name: data.name, email: data.email, avatar: data.avatar || "" });
    }
  };

  const fetchUserTasks = async (email) => {
    const q = query(collection(db, "tasks"), where("userEmail", "==", email));
    const querySnapshot = await getDocs(q);
    const tasksList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setTasks(tasksList);
  };

  const fetchAdmins = async () => {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const querySnapshot = await getDocs(q);
    const adminsList = querySnapshot.docs.map(doc => doc.data());
    setAdmins(adminsList);
  };

const fetchUpcomingStages = async () => {
  const snapshot = await getDocs(collection(db, "reports"));
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today for accurate comparison
  const upcoming = [];

  // Function to parse "DD/MM/YYYY" into Date object
  const parseDate = (str) => {
    const [day, month, year] = str.split("/");
    return new Date(`${year}-${month}-${day}`); // "YYYY-MM-DD" format
  };

  snapshot.forEach((doc) => {
    const report = doc.data();
    const reportMonth = report.reports || [];

    reportMonth.forEach((entry) => {
      if (!entry.timeline) return;

      entry.timeline.forEach((stage) => {
        if (
          ["Reproductive Stage", "Growing Stage", "1st Fertilizer", "2nd Fertilizer", "Planting"]
            .includes(stage.label)
        ) {
          try {
            const stageDate = parseDate(stage.date);
            stageDate.setHours(0, 0, 0, 0);

            const diff = Math.floor((stageDate - today) / (1000 * 60 * 60 * 24));

            if (diff >= 0 && diff <= 7) {
              upcoming.push({
                label: stage.label,
                date: stageDate.toLocaleDateString(),
                time: stageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                diff,
                cultivation: report.cultivation || "Unknown",
              });
            }
          } catch (err) {
            console.warn("⚠️ Invalid date format in report:", stage.date);
          }
        }
      });
    });
  });

  setNotifications(upcoming);
};

  const sendMessage = async () => {
    if (!selectedAdmin || !message.trim()) return;

    try {
      await addDoc(collection(db, "messages"), {
        fromEmail: user.email,
        fromName: user.name,
        toEmail: selectedAdmin,
        message,
        createdAt: serverTimestamp(),
      });

      setSelectedAdmin("");
      setMessage("");
      setIsMessageModalOpen(false);
      alert("✅ Message sent to admin successfully.");
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("❌ Failed to send message. Please try again.");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { status: newStatus });
    setTasks((prev) =>
      prev.map(task =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="userhome-container">
      <img src={Logo} alt="Logo" className="login-logo" />
      <h2 className="userhome-title">👤 {user.name ? `Hi, ${user.name}` : "User Dashboard"}</h2>

      <div className="user-profile" onClick={() => setIsModalOpen(true)}>
        <div className="profile-icon">
          <img className="user-avatar" src={Profile} alt="Profile" />
        </div>
      </div>

      <button className="message-admin-btn" onClick={() => setIsMessageModalOpen(true)}>
        📩 Message Admin
      </button>

      {/* Notification Popup */}
      {notifications.length > 0 && (
        <div className="notification-popup">
          <h4>🔔 Upcoming Cultivation Stages</h4>
          <ul>
            {notifications.map((note, idx) => (
              <li key={idx} className="notification-item">
                <strong>{note.label}</strong> for <em>{note.cultivation}</em><br />
                📅 <b>{note.date}</b> at <b>{note.time}</b> <br />
                ⏳ <b>{note.diff} day(s)</b> remaining
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Task List */}
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
                readOnly
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
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>X</button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div><strong>Name:</strong> <div className="user-info">{user.name}</div></div>
                <div><strong>Email:</strong> <div className="user-info">{user.email}</div></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {isMessageModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Send Message to Admin</h3>
              <button className="close-modal" onClick={() => setIsMessageModalOpen(false)}>X</button>
            </div>
            <div className="modal-body">
              <select
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
              >
                <option value="">Select Admin</option>
                {admins.map((admin) => (
                  <option key={admin.email} value={admin.email}>
                    {admin.name} ({admin.email})
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              ></textarea>
            </div>
            <div className="modal-footer">
              <button className="logout-btn" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
