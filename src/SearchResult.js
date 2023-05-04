import React from "react";
import Meanings from "./Meanings";
import Phonetics from "./Phonetics";
import "./SearchResult.css";

export default function SearchResult(props) {
  if (props.data) {
    return (
      <div className="SearchResult text-center">
        <section>
          <h2>{props.data.word}</h2>
          <Phonetics phonetics={props.data.phonetics[0]} />
        </section>
        {props.data.meanings.map(function (meaning, index) {
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
