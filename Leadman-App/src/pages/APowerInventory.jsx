import { Link } from "react-router-dom";
import { useState } from "react";

function APowerInventory() {
  const [formData, setFormData] = useState({
    finishedProductSerialNum: "",
    casingSerialNum: "",
    aSerialNum: "",
    bSerialNum: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const recordData = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:8000/apower/add/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail);
      }
    } catch (error) {
      console.error("Fetch failed: ", error);
      alert(
        `Something went wrong: \n ${error.message}` ||
          "An unknown error has occurred."
      );
    }
    setFormData({
      finishedProductSerialNum: "",
      casingSerialNum: "",
      aSerialNum: "",
      bSerialNum: "",
    });
  };

  return (
    <>
      <h1>aPower Inventory</h1>
      <div className="container">
        <form onSubmit={recordData}>
          <input
            type="text"
            name="finishedProductSerialNum"
            value={formData.finishedProductSerialNum}
            minLength={24}
            maxLength={24}
            placeholder="Unit Serial Number"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="casingSerialNum"
            value={formData.casingSerialNum}
            placeholder="Casing Serial Number"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="aSerialNum"
            value={formData.aSerialNum}
            placeholder="Module A Serial Number"
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="bSerialNum"
            value={formData.bSerialNum}
            placeholder="Module B Serial Number"
            onChange={handleChange}
            required
          />
          <button type="submit">Submit</button>
        </form>
      </div>
      <Link to={"/"}>
        <button>Go Back Home</button>
      </Link>
    </>
  );
}

export default APowerInventory;
