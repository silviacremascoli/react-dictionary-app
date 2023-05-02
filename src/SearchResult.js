import React from "react";
import Meanings from "./Meanings";
import Phonetics from "./Phonetics";

export default function SearchResult(props) {
  if (props.definition) {
    return (
      <div className="SearchResult text-center">
        <h2>{props.definition.word}</h2>
        {props.definition.phonetics.map(function (phonetics, index) {
          return (
            <div key={index}>
              <Phonetics phonetics={phonetics} />
            </div>
          );
        })}
        {props.definition.meanings.map(function (meaning, index) {
          return (
            <div key={index}>
              <Meanings meanings={meaning} />
            </div>
          );
        })}
      </div>
    );
  } else {
    return null;
  }
}
