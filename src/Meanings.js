import React from "react";
import Synonyms from "./Synonyms";

export default function Meanings(props) {
  console.log(props.meanings);
  return (
    <div className="Meanings">
      <h4>{props.meanings.partOfSpeech}</h4>
      <p className="mb-1">{props.meanings.definition}</p>
      <p className="Example">
        <em>{props.meanings.example}</em>
      </p>
      <Synonyms synonyms={props.meanings.synonyms} />
    </div>
  );
}
