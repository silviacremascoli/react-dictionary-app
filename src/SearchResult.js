import React from "react";
import Meanings from "./Meanings";

export default function SearchResult(props) {
  if (props.definition) {
    return (
      <div className="SearchResult text-center">
        <h2>{props.definition.word}</h2>
        <h3 className="fs-4 mb-3">/{props.definition.phonetic}/</h3>
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
