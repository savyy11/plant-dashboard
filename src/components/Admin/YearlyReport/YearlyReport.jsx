import React, { useState } from "react";
import Sidebar from "../Nav/Sidebar";
import "./YearlyReport.css";
import { getPlants } from "../../../services/PlantService";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const getLastDateOfMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0);

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

const YearlyReport = () => {
  const [cultivation, setCultivation] = useState("");
  const [monthlyYields, setMonthlyYields] = useState(Array(12).fill(""));
  const [year] = useState(new Date().getFullYear());
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleMonthlyYieldChange = (index, value) => {
    const updated = [...monthlyYields];
    updated[index] = value;
    setMonthlyYields(updated);
  };

  const fetchYearlyReport = async () => {
    if (!cultivation.trim() || monthlyYields.every(v => !v)) return;

    setLoading(true);
    setNotFound(false);
    setReports([]);

    try {
      const allPlants = await getPlants();
      const plant = allPlants.find((p) => {
        const name = p.Cultivation || p.cultivation || "";
        return name.toLowerCase().trim() === cultivation.toLowerCase().trim();
      });

      if (!plant) {
        setNotFound(true);
        return;
      }

      const monthlyReports = [];

      for (let i = 0; i < 12; i++) {
        const expectedYield = parseFloat(monthlyYields[i]);
        if (!expectedYield) continue;

        const harvestDate = getLastDateOfMonth(year, i);
        const result = calculateReversePlan(plant, harvestDate, expectedYield);

        monthlyReports.push({
          cultivation,
          month: monthNames[i],
          expectedYield,
          year,
          ...result,
        });
      }

      setReports(monthlyReports);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateReversePlan = (plantData, expectedHarvestDate, expectedYield) => {
    const durations = {
      reproductive: parseInt(plantData.fertilizerApplicationPerAcreReproductiveStageTimeDuration) || 0,
      growing: parseInt(plantData.fertilizerApplicationPerAcreGrowingStageTimeDuration) || 0,
      second: parseInt(plantData.fertilizerApplicationPerAcre2stApplyingTimeDuration) || 0,
      first: parseInt(plantData.fertilizerApplicationPerAcre1stApplyingTimeDuration) || 0,
      landPrep: 0,
      nursery: parseInt(plantData.nurseryPeriod) || 0,
    };

    const timeline = [];
    let currentDate = new Date(expectedHarvestDate);
    let cumulativeDays = 0;

    const addStage = (label, duration) => {
      cumulativeDays += duration;
      currentDate.setDate(currentDate.getDate() - duration);
      timeline.push({
        label,
        date: new Date(currentDate).toLocaleDateString(),
        daysFromHarvest: cumulativeDays,
      });
    };

    addStage("Reproductive Stage", durations.reproductive);
    addStage("Growing Stage", durations.growing);
    addStage("2nd Fertilizer", durations.second);
    addStage("1st Fertilizer", durations.first);
    addStage("Planting", 0);
    addStage("Land Preparation", durations.landPrep);
    addStage("Nursery", durations.nursery);

    const seedsPerAcre = plantData.plantsRequirementPerAcre || 1000;
    const yieldPerAcre = plantData.expectedYieldPerAcre || 1;
    const areaRequired = expectedYield / yieldPerAcre;

    return {
      expectedHarvestDate: expectedHarvestDate.toLocaleDateString(),
      timeline,
      totalDaysBeforeHarvest: cumulativeDays,
      seedsRequired: Math.ceil(seedsPerAcre * areaRequired),
      areaRequired: areaRequired.toFixed(2),
    };
  };

  const getStageValue = (report, stage) => {
    if (stage === "Expected Harvest Date") return report.expectedHarvestDate;
    if (stage === "Total Cycle Duration") return `${report.totalDaysBeforeHarvest} days`;
    if (stage === "Seeds Required") return report.seedsRequired;
    if (stage === "Area Required (acres)") return report.areaRequired;
    const item = report.timeline.find(t => t.label === stage);
    return item ? item.date : "-";
  };

  const downloadCSV = () => {
    if (!reports.length) return;

    let csv = "Stage," + reports.map(r => r.month).join(",") + "\n";
    stageOrder.forEach(stage => {
      const row = [stage];
      reports.forEach(r => row.push(getStageValue(r, stage)));
      csv += row.join(",") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `YearlyCultivationReport_${cultivation}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const saveToFirebase = async () => {
    try {
      const cultivationId = `${cultivation}_${Date.now()}`;
      await setDoc(doc(db, "reports", cultivationId), {
        cultivation,
        year,
        monthlyYields,
        generatedAt: new Date().toISOString(),
        reports
      });
      alert("✅ Reports saved to Firebase!");
    } catch (error) {
      console.error("❌ Error saving to Firebase:", error);
      alert("Failed to save data to Firebase.");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="report-container">
        <h2>📅 Yearly Cultivation Report</h2>

        <div className="input-section">
          <input
            type="text"
            placeholder="Enter Cultivation (e.g., Tomato)"
            value={cultivation}
            onChange={(e) => setCultivation(e.target.value)}
          />
        </div>

        <div className="monthly-inputs">
          {monthNames.map((month, i) => (
            <div key={i} className="month-input">
              <label>{month}</label>
              <input
                type="number"
                placeholder="KG"
                value={monthlyYields[i]}
                onChange={(e) => handleMonthlyYieldChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="action-buttons">
          <button onClick={fetchYearlyReport}>Generate Report</button>
          {reports.length > 0 && (
            <>
              <button onClick={downloadCSV}>📥 Download CSV</button>
              <button onClick={saveToFirebase}>💾 Save to Firebase</button>
            </>
          )}
        </div>

        {loading && <p>Generating report...</p>}
        {notFound && <p style={{ color: "red" }}>No data found for cultivation: {cultivation}</p>}

        {reports.length > 0 && (
          <div className="combined-report">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Stage</th>
                  {reports.map((r, i) => (
                    <th key={i}>{r.month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stageOrder.map((stage, i) => (
                  <tr key={i}>
                    <td>{stage}</td>
                    {reports.map((r, j) => (
                      <td key={j}>{getStageValue(r, stage)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default YearlyReport;
