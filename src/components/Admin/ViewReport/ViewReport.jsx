import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import Sidebar from "../Nav/Sidebar";
import "./ViewReport.css";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const stageOrder = [
  "Expected Harvest Date",
  "Reproductive Stage",
  "Growing Stage",
  "2nd Fertilizer",
  "1st Fertilizer",
  "Planting",
  "Land Preparation",
  "Nursery",
  "Total Cycle Duration",
  "Seeds Required",
  "Area Required (acres)"
];

const ViewReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteCultivation, setDeleteCultivation] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "reports"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStageValue = (monthReport, stage) => {
    if (!monthReport) return "-";
    if (stage === "Expected Harvest Date") return monthReport.expectedHarvestDate;
    if (stage === "Total Cycle Duration")
      return `${monthReport.totalDaysBeforeHarvest || monthReport.totalDays || "-"} days`;
    if (stage === "Seeds Required") return monthReport.seedsRequired;
    if (stage === "Area Required (acres)") return monthReport.areaRequired;
    const match = monthReport.timeline?.find((t) => t.label === stage);
    return match?.date || "-";
  };

  const handleDeleteByCultivation = async () => {
    if (!deleteCultivation.trim()) return alert("Please enter a cultivation name.");

    const confirmed = window.confirm(
      `Are you sure you want to delete all reports for "${deleteCultivation}"?`
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const snapshot = await getDocs(collection(db, "reports"));
      const matched = snapshot.docs.filter(doc => doc.data().cultivation === deleteCultivation);

      if (matched.length === 0) {
        alert("No matching reports found.");
        return;
      }

      await Promise.all(matched.map(docRef => deleteDoc(doc(db, "reports", docRef.id))));

      alert(`${matched.length} report(s) deleted for "${deleteCultivation}".`);
      setDeleteCultivation("");
      fetchReports(); // Refresh
    } catch (err) {
      console.error("Error deleting reports:", err);
      alert("An error occurred while deleting reports.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="view-report-container">
        <h2>📊 Cultivation Reports Summary</h2>

        <div className="delete-section">
          <input
            type="text"
            placeholder="Enter cultivation name to delete"
            value={deleteCultivation}
            onChange={(e) => setDeleteCultivation(e.target.value)}
          />
          <button onClick={handleDeleteByCultivation} disabled={deleting}>
            {deleting ? "Deleting..." : "🗑️ Delete by Cultivation"}
          </button>
        </div>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p>No reports available.</p>
        ) : (
          <div className="report-table-wrapper">
            {reports.map((report) => (
              <div key={report.id} style={{ marginBottom: "2rem" }}>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>Stage</th>
                      <th>Cultivation</th>
                      {monthNames.map((month) => (
                        <th key={month}>{month}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stageOrder.map((stage) => (
                      <tr key={stage}>
                        <td>{stage}</td>
                        <td>{report.cultivation || "-"}</td>
                        {monthNames.map((month) => {
                          const monthReport = report.reports?.find((r) => r.month === month);
                          return (
                            <td key={`${stage}-${month}`}>
                              {getStageValue(monthReport, stage)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReport;
