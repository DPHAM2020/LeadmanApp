import { Link } from "react-router-dom";

function FQCChecklist() {
  return (
    <>
      <h1>FQC Checklist</h1>
      <form action="">
        <input type="checkbox" id="" value={""} />
        <label htmlFor="">Machine is good</label>
        <br />
        <input type="checkbox" id="" value={""} />
        <label htmlFor="">Has blue sticker :)</label>
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

export default FQCChecklist;
