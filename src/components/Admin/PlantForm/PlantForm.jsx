import { useForm } from "react-hook-form";
import { addPlant, updatePlant } from "../../../services/PlantService";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Nav/Sidebar";
import { useEffect } from "react";
import "./PlantForm.css";

const PlantForm = ({ plant }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  // Effect to update form values when plant is available (for editing)
  useEffect(() => {
    if (plant) {
      // Reset form data with the plant data once available
      reset(plant);
    }
  }, [plant, reset]);

  // Function to handle adding a new plant
  const handleAddPlant = async (data) => {
    try {
      let payload = { ...data };

      // If an image is selected, use FormData; otherwise, send JSON
      if (data.image && data.image.length > 0) {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (key === "image") {
            formData.append("image", data.image[0]); // Only add image if exists
          } else {
            formData.append(key, data[key]);
          }
        });

        await addPlant(formData); // Add a new plant
      } else {
        // Send as JSON if no image is uploaded
        await addPlant(payload); // Add a new plant
      }

      reset(); // Reset the form after successful submission
      navigate("/plants"); // Redirect to the plants list
    } catch (error) {
      console.error("Error adding plant data:", error);
    }
  };

  // Function to handle editing an existing plant
  const handleEditPlant = async (data) => {
    try {
      let payload = { ...data };

      // If an image is selected, use FormData; otherwise, send JSON
      if (data.image && data.image.length > 0) {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          if (key === "image") {
            formData.append("image", data.image[0]); // Only add image if exists
          } else {
            formData.append(key, data[key]);
          }
        });

        await updatePlant(plant.id, formData); // Update the existing plant
      } else {
        // Send as JSON if no image is uploaded
        await updatePlant(plant.id, payload); // Update the existing plant
      }

      reset(); // Reset the form after successful submission
      navigate("/plants"); // Redirect to the plants list
    } catch (error) {
      console.error("Error updating plant data:", error);
    }
  };

  const onSubmit = (data) => {
    if (plant) {
      handleEditPlant(data); // If plant exists, handle edit
    } else {
      handleAddPlant(data); // Otherwise, handle add
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="form-container">
        <h2>{plant ? "Edit Plant" : "Add Plant"}</h2>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          <input {...register("cultivation", { required: true })} placeholder="Cultivation" className="form-input" required />
          <input {...register("climaticZone", { required: true })} placeholder="Climatic Zone (Wet, Dry, Intermediate)" className="form-input" />
          <input {...register("soilCondition", { required: true })} placeholder="Soil Condition (Sand, Loam, Clay)" className="form-input" />
          <input {...register("holeSize")} placeholder="Hole Size" className="form-input" />
          <input {...register("spacing")} placeholder="Spacing" className="form-input" />
          <input {...register("nurseryPeriod")} placeholder="Nursery Period (days)" className="form-input" />
          <input {...register("plantMaterialType")} placeholder="Plant Material Type" className="form-input" />
          <input {...register("plantMaterialRequirementPerAcre")} placeholder="Plant Material Requirement Per Acre (kg)" className="form-input" />
          <input {...register("plantsRequirementPerAcre")} placeholder="Plants Requirement Per Acre" className="form-input" />
          <input {...register("harvestingPeriod")} placeholder="Harvesting Period" className="form-input" />
          <input {...register("perPlantYield")} placeholder="Per Plant Yield (kg)" className="form-input" />
          <input {...register("expectedYieldPerAcre")} placeholder="Expected Yield Per Acre Fresh (kg)" className="form-input" />
          <input {...register("ratio")} placeholder="Ratio" className="form-input" />
          <input {...register("basalFertilizer")} placeholder="Basal Fertilizer (kg)" className="form-input" />
          <input {...register("firstApplication")} placeholder="1st Application (kg)" className="form-input" />
          <input {...register("firstApplicationDate")} placeholder="1st Application Date" className="form-input" />
          <input {...register("secondApplication")} placeholder="2nd Application (kg)" className="form-input" />
          <input {...register("secondApplicationDate")} placeholder="2nd Application Date" className="form-input" />
          <input {...register("growingStage")} placeholder="Growing Stage" className="form-input" />
          <input {...register("reproductiveStage")} placeholder="Reproductive Stage" className="form-input" />
          <input {...register("diseases")} placeholder="Common Diseases" className="form-input" />
          <input {...register("pests")} placeholder="Common Pests" className="form-input" />
          
          <button type="submit" className="form-button">{plant ? "Update" : "Add"}</button>
        </form>
      </div>
    </div>
  );
};

export default PlantForm;
