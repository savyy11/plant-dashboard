import React, { useEffect, useState } from "react";
import { getPlants, deletePlant } from "../../../services/PlantService";
import { Link } from "react-router-dom";
import Sidebar from "../Nav/Sidebar";
import "./PlantList.css";

const PlantList = () => {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    getPlants().then(setPlants);
  }, []);

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="list-container">
        <div className="header">
          <h2>Plant List</h2>
          <Link to="/add-plant" className="add-button">➕ Add Plant</Link>
        </div>

        <table className="plant-table">
          <thead>
            <tr>
              <th>Cultivation</th>
              <th>ClimaticZone</th>
              <th>SoilCondition</th>
              <th>HoleSize</th>
              <th>Spacing</th>
              <th>NurseryPeriod</th>
              <th>PlantMaterialType</th>
              <th>PlantMaterialRequirementPerAcre</th>
              <th>PlantsRequirementPerAcre</th>
              <th>HarvestingPeriod</th>
              <th>PerPlantYield</th>
              <th>ExpectedYieldPerAcre</th>
              <th>Ratio</th>
              <th>BasalFertilizer</th>
              <th>FirstApplication</th>
              <th>FirstApplicationDate(Days)</th>
              <th>SecondApplication</th>
              <th>SecondApplicationDate(Days)</th>
              <th>GrowingStage</th>
              <th>ReproductiveStage</th>
              <th>Diseases</th>
              <th>Pests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr key={plant.id}>
                <td>{plant.cultivation}</td>
                <td>{plant.climaticZone}</td>
                <td>{plant.soilCondition}</td>
                <td>{plant.holeSize}</td>
                <td>{plant.spacing}</td>
                <td>{plant.nurseryPeriod}</td>
                <td>{plant.plantMaterialType}</td>
                <td>{plant.plantMaterialRequirementPerAcre}</td>
                <td>{plant.plantsRequirementPerAcre}</td>
                <td>{plant.harvestingPeriod}</td>
                <td>{plant.perPlantYield}</td>
                <td>{plant.expectedYieldPerAcre}</td>
                <td>{plant.ratio}</td>
                <td>{plant.basalFertilizer}</td>
                <td>{plant.firstApplication}</td>
                <td>{plant.firstApplicationDate}</td>
                <td>{plant.secondApplication}</td>
                <td>{plant.secondApplicationDate}</td>
                <td>{plant.growingStage}</td>
                <td>{plant.reproductiveStage}</td>
                <td>{plant.diseases}</td>
                <td>{plant.pests}</td>
                
                <td>
                  <Link to={`/edit-plant/${plant.id}`} className="edit-link">Edit</Link>
                  <button onClick={() => deletePlant(plant.id)} className="delete-button">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default PlantList;
















