import React, { useState, useEffect } from "react";
import Sidebar from "../Nav/Sidebar";
import { db, auth } from "../../../firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import "./AddUsers.css";

const AddUsers = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });

  const [users, setUsers] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(list);
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { name, email, role, password } = userData;
    if (!name || !email || !role || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await setDoc(doc(db, "users", newUser.uid), {
        uid: newUser.uid,
        name,
        email,
        role,
        active: true,
        createdAt: serverTimestamp(),
      });

      setSuccess("✅ User added successfully!");
      setUserData({ name: "", email: "", role: "user", password: "" });
      fetchUsers();
      setShowModal(false); // close modal
    } catch (err) {
      setError("Error: " + err.message);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    await updateDoc(doc(db, "users", id), {
      active: !currentStatus,
    });
    fetchUsers();
  };

  const handleDeleteUser = async (id) => {
    await deleteDoc(doc(db, "users", id));
    fetchUsers();
  };

  return (
    <div className="adduser-container">
      <Sidebar />
      <div className="adduser-header">
        <h2 className="adduser-title">👥 Users</h2>
        <button className="primary-btn" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>

      {success && <p className="success-msg">{success}</p>}
      {error && <p className="error-msg">{error}</p>}

      {/* User Cards Grid */}
      <div className="user-cards">
        {users.map((u) => (
          <div key={u.id} className="user-card">
            <div className="user-info">
              <h4>{u.name}</h4>
              <p><strong>Email:</strong> {u.email}</p>
              <p><strong>Role:</strong> {u.role}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`status-badge ${u.active ? "active" : "inactive"}`}>
                  {u.active ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
            <div className="user-actions">
              <button onClick={() => handleToggleActive(u.id, u.active)} className="toggle-btn">
                {u.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => handleDeleteUser(u.id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New User</h2>
            <form className="modal-form" onSubmit={handleAddUser}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={userData.name}
                onChange={handleChange}
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={userData.email}
                onChange={handleChange}
              />
              <select name="role" value={userData.role} onChange={handleChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={userData.password}
                onChange={handleChange}
              />
              <div className="modal-actions">
                <button type="submit" className="primary-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
              {error && <p className="error-msg">{error}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddUsers;
