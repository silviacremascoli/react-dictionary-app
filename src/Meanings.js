import React from "react";

export default function Meanings(props) {
  console.log(props.meanings);
  return (
    <div className="Meanings">
      <h4>{props.meanings.partOfSpeech}</h4>
      <p>{props.meanings.definition}</p>
      <p>
        <em>Example: {props.meanings.example}</em>
      </p>
    </div>
  );
}
