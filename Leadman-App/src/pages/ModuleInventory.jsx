import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ModuleInventory.css";

function ModuleInventory() {
  const [formData, setFormData] = useState({
    sn: "",
    moduleType: "A",
  });

  const [aCount, setACount] = useState(0);
  const [bCount, setBCount] = useState(0);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws");

    socket.onmessage = (event) => {
      const units_today = JSON.parse(event.data);
      let aCount = 0;
      let bCount = 0;
      for (let i = 0; i < units_today.length; i++) {
        let curr_unit = units_today[i];
        if (curr_unit["Module Type"] === "A") {
          aCount += 1;
        } else {
          bCount += 1;
        }
      }
      setACount(aCount);
      setBCount(bCount);
    };
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
                  <p>Module A</p>
                  <div>{aCount} units</div>
                </button>
                <button
                  type="button"
                  name="moduleType"
                  className={formData.moduleType === "B" ? "selected" : ""}
                  onClick={() => handleSelect("B")}
                >
                  <p>Module B</p>
                  <div>{bCount} units</div>
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
