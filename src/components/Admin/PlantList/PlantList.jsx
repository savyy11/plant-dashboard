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
              <th>No</th>
              <th>Cultivation</th>
              <th>Climatic Zone</th>
              <th>Soil Condition</th>
              <th>HoleSize</th>
              <th>Spacing</th>
              <th>Nursery Period (Days)</th>
              <th>Plant Material Type</th>
              <th>Plant Material Requirement Per Acre</th>
              <th>PlantsRequirementPerAcre</th>
              <th>Harvesting Period (Days)</th>
              <th>Per Plant Yield (KG)</th>
              <th>Expected Yield Per Acre Fresh (KG)</th>
              <th>Expected Yield Per Acre Dry (KG)</th>
              <th>Ratio</th>
              <th>Fertilizer Application Per Acre Barsel (KG) Time Duration</th>
              <th>Fertilizer Application Per Acre Barsel (KG) Ratio Of Fertilzer</th>
              <th>Fertilizer Application Per Acre Barsel (KG) Amount Of Fertilzer</th>
              <th>Fertilizer Application Per Acre 1st Applying Time Duration</th>
              <th>Fertilizer Application Per Acre 1st Applying Ratio Of Fertilzer</th>
              <th>Fertilizer Application Per Acre 1st Applying Amount Of Fertilzer</th>
              <th>Fertilizer Application Per Acre 2st Applying Time Duration</th>
              <th>Fertilizer Application Per Acre 2st Applying Ratio Of Fertilzer</th>
              <th>Fertilizer Application Per Acre 2st Applying Amount Of Fertilzer</th>
              <th>Folire Application Per Acre Growing Stage Time Duration</th>
              <th>Folire Application Per Acre Growing Stage Ratio Of Fertilzer</th>
              <th>Folire Application Per Acre Growing Stage Amount Of Fertilzer</th>
              <th>Folire Application Per Acre Reproductive Stage Time Duration</th>
              <th>Folire Application Per Acre Reproductive Stage Ratio Of Fertilzer</th>
              <th>Folire Application Per Acre Reproductive Stage Amount Of Fertilzer</th>
              <th>Diseases</th>
              <th>Pests</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr key={plant.id}>
                <td>{plant.no}</td>
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
                <td>{plant.expectedYieldPerAcreFresh}</td>
                <td>{plant.expectedYieldPerAcreDry}</td>
                <td>{plant.ratio}</td>
                <td>{plant.fertilizerApplicationPerAcreBarselTimeDuration}</td>
                <td>{plant.fertilizerApplicationPerAcreBarselRatioOfFertilzer}</td>
                <tb>{plant.fertilizerApplicationPerAcreBarselAmountOfFertilzer}</tb>
                <td>{plant.fertilizerApplicationPerAcre1stApplyingTimeDuration}</td>
                <td>{plant.fertilizerApplicationPerAcre1stApplyingRatioOfFertilzer}</td>
                <tb>{plant.fertilizerApplicationPerAcre1stApplyingAmountOfFertilzer}</tb>
                <td>{plant.fertilizerApplicationPerAcre2stApplyingTimeDuration}</td>
                <td>{plant.fertilizerApplicationPerAcre2stApplyingRatioOfFertilzer}</td>
                <tb>{plant.fertilizerApplicationPerAcre2stApplyingAmountOfFertilzer}</tb>
                <td>{plant.fertilizerApplicationPerAcreGrowingStageTimeDuration}</td>
                <td>{plant.fertilizerApplicationPerAcreGrowingStageRatioOfFertilzer}</td>
                <tb>{plant.fertilizerApplicationPerAcreGrowingStageAmountOfFertilzer}</tb>
                <td>{plant.fertilizerApplicationPerAcreReproductiveStageTimeDuration}</td>
                <td>{plant.fertilizerApplicationPerAcreReproductiveStageRatioOfFertilzer}</td>
                <tb>{plant.fertilizerApplicationPerAcreReproductiveStageAmountOfFertilzer}</tb>
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
















