import { Link } from "react-router-dom";
import { useState } from "react";
import "./ModuleInventory.css";

function ModuleInventory() {
  const [formData, setFormData] = useState({
    sn: "",
    moduleType: "A",
  });

  const handleSelect = (value) => {
    setFormData((prev) => ({ ...prev, moduleType: value }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const recordData = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
      const response = await fetch("http://127.0.0.1:8000/module/add/", {
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
        `Somethign went wrong: \n ${error.message}` ||
          "An unknown error has occurred."
      );
    }

    setFormData({
      sn: "",
      moduleType: formData.moduleType,
    });
  };

  return (
    <>
      <h1 id="module-header">Module Inventory</h1>
      <div className="container">
        <div id="form-container">
          <form onSubmit={recordData}>
            <div id="inputs">
              <div id="radio-container">
                <button
                  type="button"
                  name="moduleType"
                  className={formData.moduleType === "A" ? "selected" : ""}
                  onClick={() => handleSelect("A")}
                >
                  Module A
                </button>
                <button
                  type="button"
                  name="moduleType"
                  className={formData.moduleType === "B" ? "selected" : ""}
                  onClick={() => handleSelect("B")}
                >
                  Module B
                </button>
              </div>
              <div id="text-container">
                <input
                  type="text"
                  name="sn"
                  id="sn"
                  minLength={24}
                  maxLength={24}
                  value={formData.sn}
                  placeholder="Serial Number"
                  onChange={handleChange}
                  required
                />
                <button type="submit">Submit</button>
              </div>
            </div>
          </form>
        </div>
        <div className="home-button">
          <Link to={"/"}>
            <button>Go Back Home</button>
          </Link>
        </div>
      </div>
    </>
  );
}

export default ModuleInventory;
