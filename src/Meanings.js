import React from "react";
import Synonyms from "./Synonyms";
import Example from "./Example";
import "./Meanings.css";

export default function Meanings({ meanings, word, savedWords = [], onSaveDefinition }) {
  const isDefinitionSaved = (defText) =>
    savedWords.some(
      (item) =>
        item.word.toLowerCase() === word?.toLowerCase() &&
        item.definition === defText
    );

  return (
    <section className="Meanings">
      <h3>{meanings.partOfSpeech}</h3>
      <Synonyms synonyms={meanings.synonyms || []} />
      {meanings.definitions.map(function (definition, index) {
        const saved = isDefinitionSaved(definition.definition);

        return (
          <div className="definition-row" key={index}>
            <div className="definition-body">
              <p className="definition-text">{definition.definition}</p>
              <Example example={definition.example} />
            </div>
            <div className="definition-action">
              <button
                type="button"
                className={`btn btn-sm ${saved ? "btn-success" : "btn-outline-success"} definition-save-btn`}
                onClick={() =>
                  onSaveDefinition({
                    word,
                    partOfSpeech: meanings.partOfSpeech,
                    definition: definition.definition,
                  })
                }
                disabled={saved}
                aria-label={
                  saved
                    ? "Definition already saved"
                    : `Save definition to notebook`
                }
              >
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}