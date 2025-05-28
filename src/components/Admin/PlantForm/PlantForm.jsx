import { useForm } from "react-hook-form";
import { addPlant, updatePlant } from "../../../services/PlantService";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Nav/Sidebar";
import { useEffect } from "react";
import "./PlantForm.css";

const PlantForm = ({ plant }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (plant) {
      reset(plant);
    }
  }, [plant, reset]);

  const handleAddPlant = async (data) => {
    try {
      await addPlant(data);
      reset();
      navigate("/plants");
    } catch (error) {
      console.error("Error adding plant data:", error);
    }
  };

  const handleEditPlant = async (data) => {
    try {
      await updatePlant(plant.id, data);
      reset();
      navigate("/plants");
    } catch (error) {
      console.error("Error updating plant data:", error);
    }
  };

  const onSubmit = (data) => {
    if (plant) {
      handleEditPlant(data);
    } else {
      handleAddPlant(data);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="form-container">
        <h2>{plant ? "Edit Plant" : "Add Plant"}</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register("no")} placeholder="No" className="form-input" required />
          <input {...register("cultivation")} placeholder="Cultivation" className="form-input" required />
          
          <select {...register("climaticZone")} className="form-input">
            <option value="">Select Climatic Zone</option>
            <option value="Wet">Wet</option>
            <option value="Dry">Dry</option>
            <option value="Intermediate">Intermediate</option>
          </select>
          <select {...register("soilCondition")} className="form-input">
            <option value="">Select Soil Condition</option>
            <option value="Sand">Sand</option>
            <option value="Loam">Loam</option>
            <option value="Clay">Clay</option>
          </select>
          <input {...register("holeSize")} placeholder="Hole Size" className="form-input" />
          <input {...register("spacing")} placeholder="Spacing" className="form-input" />
          <input {...register("nurseryPeriod")} placeholder="Nursery Period (days)" className="form-input" />
          <input {...register("plantMaterialType")} placeholder="Plant Material Type" className="form-input" />
          <input {...register("plantMaterialRequirementPerAcre")} placeholder="Plant Material Requirement Per Acre (kg)" className="form-input" />
          <input {...register("plantsRequirementPerAcre")} placeholder="Plants Requirement Per Acre" className="form-input" />
          <input {...register("harvestingPeriod")} placeholder="Harvesting Period (Days)" className="form-input" />
          <input {...register("perPlantYield")} placeholder="Per Plant Yield (kg)" className="form-input" />
          <input {...register("expectedYieldPerAcreFresh")} placeholder="Expected Yield Per Acre Fresh (kg)" className="form-input" />
          <input {...register("expectedYieldPerAcreDry")} placeholder="Expected Yield Per Acre Dry (kg)" className="form-input" />
          <input {...register("ratio")} placeholder="Ratio" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreBarselKGTimeDuration")} placeholder="Fertilizer Application Per Acre Barsel (kg) Time Duration" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreBarselKGRatioOfFertilzer")} placeholder="Fertilizer Application Per Acre Barsel (kg) Ratio Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreBarselKGAmountOfFertilzer")} placeholder="Fertilizer Application Per Acre Barsel (kg) Amount Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcre1stApplyingTimeDuration")} placeholder="Fertilizer Application Per Acre 1st Applying Time Duration" className="form-input" />
          <input {...register("fertilizerApplicationPerAcre1stApplyingRatioOfFertilzer")} placeholder="Fertilizer Application Per Acre 1st Applying Ratio Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcre1stApplyingAmountOfFertilzer")} placeholder="Fertilizer Application Per Acre 1st Applying Amount Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcre2stApplyingTimeDuration")} placeholder="Fertilizer Application Per Acre 2st Applying Time Duration" className="form-input" />
          <input {...register("fertilizerApplicationPerAcre2stApplyingRatioOfFertilzer")} placeholder="Fertilizer Application Per Acre 2st Applying Ratio Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcre2stApplyingAmountOfFertilzer")} placeholder="Fertilizer Application Per Acre 2st Applying Amount Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreGrowingStageTimeDuration")} placeholder="Fertilizer Application Per Acre Growing Stage Time Duration" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreGrowingStageRatioOfFertilzer")} placeholder="Fertilizer Application Per Acre Growing Stage Ratio Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreGrowingStageAmountOfFertilzer")} placeholder="Fertilizer Application Per Acre Growing Stage Amount Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreReproductiveStageTimeDuration")} placeholder="Fertilizer Application Per Acre Reproductive Stage Time Duration" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreReproductiveStageRatioOfFertilzer")} placeholder="Fertilizer Application Per Acre Reproductive Stage Ratio Of Fertilzer" className="form-input" />
          <input {...register("fertilizerApplicationPerAcreReproductiveStageAmountOfFertilzer")} placeholder="Fertilizer Application Per Acre Reproductive Stage Amount Of Fertilzer" className="form-input" />
          <input {...register("diseases")} placeholder="Diseases" className="form-input" />
          <input {...register("pests")} placeholder="Pests" className="form-input" />
          
          <button type="submit" className="form-button">{plant ? "Update" : "Add"}</button>
        </form>
      </div>
    </div>
  );
};

export default PlantForm;
