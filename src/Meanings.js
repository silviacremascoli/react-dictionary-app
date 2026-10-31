import React from "react";
import Synonyms from "./Synonyms";
import Example from "./Example";
import "./Meanings.css";

export default function Meanings(props) {
  return (
    <section className="Meanings">
      <h3>{props.meanings.partOfSpeech}</h3>
      <Synonyms synonyms={props.meanings.synonyms || []} />
      {props.meanings.definitions.map(function (definition, index) {
        return (
          <div className="definition" key={index}>
            {definition.definition}
            <br />
            <Example example={definition.example} />
          </div>
        );
      })}
    </section>
  );
}
