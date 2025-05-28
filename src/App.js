import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Admin/Dashboard/Dashboard";
import PlantForm from "./components/Admin/PlantForm/PlantForm";
import PlantList from "./components/Admin/PlantList/PlantList";
import Report from "./components/Admin/YearlyReport/YearlyReport";
import Login from "./components/Login/Login";
import Home from "./components/User/Home/UserHome";
import Task from "./components/Admin/UserTask/UserTask";
import AddUsers from "./components/Admin/AddUsers/AddUsers";
import ViewReport from "./components/Admin/ViewReport/ViewReport";
import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-plant" element={<PlantForm />} />
        <Route path="/edit-plant/:id" element={<PlantForm />} />
        <Route path="/plants" element={<PlantList />} />
        <Route path="/report" element={<Report />} />
        <Route path="/task" element={<Task />} />
        <Route path="/add-user" element={<AddUsers />} />
        <Route path="/home" element={<Home />} />
        <Route path="/viewRepot" element={<ViewReport />} />
      </Routes>
    </Router>
  );
}
