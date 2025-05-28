import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Logo from '../assets/logo link.jpg'; 

const Login = () => {
  const navigate = useNavigate();
  const db = getFirestore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      // 1. Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;
  
      // 2. Fetch the user's document from Firestore
      const usersSnapshot = await getDocs(collection(db, "users"));
      let matchedUser = null;
  
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email === loggedInUser.email) {
          matchedUser = data;
        }
      });
  
      if (!matchedUser) {
        setError("User not found in Firestore.");
        return;
      }
  
      // 3. Redirect based on role
      if (matchedUser.role === "admin") {
        navigate("/dashboard");
      } else if (matchedUser.role === "user") {
        navigate("/home");
      } else {
        setError("Unknown role.");
      }
    } catch (err) {
      setError("Authentication failed: " + err.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <img src={Logo} alt="Logo" className="login-logo" />
        <h2 className="login-title">Welcome Back</h2>
        {error && <p className="login-error">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">Log In</button>
      </form>
    </div>
  );
};

export default Login;
