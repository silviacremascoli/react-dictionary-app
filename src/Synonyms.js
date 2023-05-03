import React from "react";
import "./Synonyms.css";

export default function Synonyms(props) {
  if (props.synonyms) {
    return (
      <div className="Synonyms">
        {props.synonyms.map(function (synonym, index) {
          return (
            <div className="d-flex inline-block justify-content-center">
              <span className="see-also">See also: </span>
              <ul key="index">
                <li className="align-top">{synonym}</li>
              </ul>
            </div>
          );
        })}
      </div>
    );
  } else {
    return null;
  }
}
