import { Link } from "react-router-dom";
import "./LoggingCard.css";

function LoggingCard(props) {
  return (
    <div>
      <Link to={props.link}>
        <button className="button">{props.cardTitle}</button>
      </Link>
    </div>
  );
}

export default LoggingCard;
