import Sidebar from "../Nav/Sidebar";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">
        <h1>Welcome to the Admin Dashboard</h1>
        <p>Manage plants efficiently!</p>
      </div>
    </div>
  );
};

export default Dashboard;
