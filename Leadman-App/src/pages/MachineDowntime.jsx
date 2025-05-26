import { Link } from "react-router-dom";

function MachineDowntime() {
  return (
    <>
      <h1>Machine Downtime Logger</h1>
      <form>
        <input type="date" />
        <br />
        <input type="time" />
        <br />
        <input type="text" />
        <br />
        <button>Submit</button>
      </form>
      <div>
        <Link to={"/"}>
          <button>Go back Home</button>
        </Link>
      </div>
    </>
  );
}

export default MachineDowntime;
