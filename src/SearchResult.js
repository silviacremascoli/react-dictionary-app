import React from "react";
import Meanings from "./Meanings";
import Phonetics from "./Phonetics";
import "./SearchResult.css";

export default function SearchResult(props) {
  if (props.data) {
    const phonetics = props.phonetics || props.data.phonetics?.[0];
    return (
      <div className="SearchResult text-center">
        <section>
          <h2>{props.data.word}</h2>
          {phonetics && <Phonetics phonetics={phonetics} />}
        </section>
        {props.data.meanings.map(function (meaning, index) {
          return (
            <div key={index}>
              <Meanings meanings={meaning} />
            </div>
          );
        })}
        {props.data.source === "wiktionary" && (
          <p className="definition-source">
            Definitions from{" "}
            <a
              href={`https://en.wiktionary.org/wiki/${encodeURIComponent(props.data.word)}`}
              target="_blank"
              rel="noreferrer"
              aria-label={`${props.data.word} on Wiktionary (opens in a new tab)`}
            >
              Wiktionary
            </a>{" "}
            under{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer"
              aria-label="Creative Commons Attribution-ShareAlike license (opens in a new tab)"
            >
              CC BY-SA
            </a>.
          </p>
        )}
      </div>
    );
  } else {
    return null;
  }
}
