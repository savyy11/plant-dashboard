import React, { useState, useEffect } from "react";
import Sidebar from "../Nav/Sidebar";
import "./YearlyReport.css";
import { getPlants, updatePlant } from "../../../services/PlantService";

const YearlyReport = () => {
  const [cultivation, setCultivation] = useState("");
  const [expectedYield, setExpectedYield] = useState(""); // Expected output in KG
  const [expectedDate, setExpectedDate] = useState(""); // Expected harvest date
  const [calculatedData, setCalculatedData] = useState(null); // Store calculated data
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Fetch report data based on the cultivation name
  const fetchReport = async () => {
    if (!cultivation.trim()) return;

    setLoading(true);
    setNotFound(false);
    setCalculatedData(null);

    try {
      const allPlants = await getPlants();
      console.log("Fetched plants from DB:", allPlants);

      const match = allPlants.find((plant) => {
        const name = plant.Cultivation || plant.cultivation || "";
        return name.toLowerCase().trim() === cultivation.toLowerCase().trim();
      });

      if (match) {
        // When found, set initial values and calculate reverse planting data
        calculateReversePlanting(match);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate the reverse planting data
  const calculateReversePlanting = (plantData) => {
    const expectedHarvestDate = new Date(expectedDate);
    const plantingDate = new Date(expectedHarvestDate);
    plantingDate.setMonth(plantingDate.getMonth() - 3); // Example: Planting 3 months before harvesting

    // Example calculations based on the dataset
    const seedsPerAcre = plantData.plantsRequirementPerAcre || 1000; // Seeds per acre
    const areaRequired = expectedYield / plantData.expectedYieldPerAcre; // Calculate required area based on yield

    const firstApplyDate = new Date(plantingDate);
    firstApplyDate.setDate(firstApplyDate.getDate() + 30); // 1st application after 30 days
    const secondApplyDate = new Date(firstApplyDate);
    secondApplyDate.setDate(secondApplyDate.getDate() + 30); // 2nd application after 30 more days

    // Use the plant data for other fields
    const cultivationName = plantData.Cultivation || plantData.cultivation || "Unknown";
    const firstApplication = plantData.firstApplication || "N/A";
    const secondApplication = plantData.secondApplication || "N/A";

    // Set the calculated data
    setCalculatedData({
      cultivation: cultivationName,
      plantingDate: plantingDate.toLocaleDateString(),
      seedsRequired: seedsPerAcre * areaRequired,
      areaRequired: areaRequired,
      firstApplyDate: firstApplyDate.toLocaleDateString(),
      secondApplyDate: secondApplyDate.toLocaleDateString(),
      firstApplication,
      secondApplication,
    });
  };

  // Handle saving changes to the database
  const handleSave = async () => {
    // Assuming the logic is to save changes to the plant data (e.g., adding new planting details)
    if (!calculatedData) return;

    try {
      await updatePlant(calculatedData.id, calculatedData);
      alert("✅ Changes saved to database!");
    } catch (err) {
      alert("❌ Failed to save changes.");
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="report-container">
        <h2>📊 Yearly Report</h2>

        <div className="input-section">
          <input
            type="text"
            placeholder="Enter Cultivation Name (e.g., Tomato)"
            value={cultivation}
            onChange={(e) => setCultivation(e.target.value)}
          />
          <input
            type="number"
            placeholder="Enter Expected Output in KG"
            value={expectedYield}
            onChange={(e) => setExpectedYield(e.target.value)}
          />
          <input
            type="date"
            placeholder="Enter Expected Harvest Date"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
          <button onClick={fetchReport}>Generate Report</button>
        </div>

        {loading && <p>Loading...</p>}
        {notFound && (
          <p style={{ color: "red" }}>
            No record found for "{cultivation}"
          </p>
        )}

        {calculatedData && (
          <>
            {/* Editable Table for the required fields */}
            <table className="report-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Planting Date</td>
                  <td>{calculatedData.plantingDate}</td>
                </tr>
                <tr>
                  <td>Seeds Required</td>
                  <td>{calculatedData.seedsRequired}</td>
                </tr>
                <tr>
                  <td>Area Required (acres)</td>
                  <td>{calculatedData.areaRequired}</td>
                </tr>
                <tr>
                  <td>1st Apply Date</td>
                  <td>{calculatedData.firstApplyDate}</td>
                </tr>
                <tr>
                  <td>2nd Apply Date</td>
                  <td>{calculatedData.secondApplyDate}</td>
                </tr>
                <tr>
                  <td>First Application</td>
                  <td>{calculatedData.firstApplication}</td>
                </tr>
                <tr>
                  <td>Second Application</td>
                  <td>{calculatedData.secondApplication}</td>
                </tr>
              </tbody>
            </table>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button onClick={handleSave} className="save-button">
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default YearlyReport;
