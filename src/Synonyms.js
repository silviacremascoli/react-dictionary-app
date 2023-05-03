import React from "react";
import "./Synonyms.css";

export default function Synonyms(props) {
  if (props.synonyms.length) {
    return (
      <div className="Synonyms">
        <span className="see-also">See also: </span>
        <ul>
          {props.synonyms.map(function (synonym, index) {
            return (
              <li key={index} className="align-top">
                {synonym}
              </li>
            );
          })}
        </ul>
      </div>
    );
  } else {
    return null;
  }
}
