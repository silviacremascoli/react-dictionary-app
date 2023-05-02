import React from "react";
import Meanings from "./Meanings";

export default function SearchResult(props) {
  if (props.definition) {
    return (
      <div className="SearchResult">
        <h2>{props.definition.word}</h2>
        <h3>/{props.definition.phonetic}/</h3>
        <p>
          {props.definition.meanings.map(function (meaning, index) {
            return (
              <div key={index}>
                <Meanings meanings={meaning} />
              </div>
            );
          })}
        </p>
      </div>
    );
  } else {
    return null;
  }
}
