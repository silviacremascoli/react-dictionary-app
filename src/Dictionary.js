import React, { useState } from "react";
import axios from "axios";
import "./Dictionary.css";
import SearchResult from "./SearchResult";

export default function Dictionary(props) {
  let [keyword, setKeyword] = useState(props.defaultWord);
  let [data, setData] = useState(null);
  let [loaded, setLoaded] = useState(false);

  function handleResponse(response) {
    setData(response.data[0]);
  }

  function search() {
    // https://dictionaryapi.dev/
    let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;
    axios.get(apiUrl).then(handleResponse);
  }

  function handleSubmit(event) {
    event.preventDefault();
    search();
  }

  function getKeyword(event) {
    setKeyword(event.target.value);
  }

  function load() {
    setLoaded(true);
    search();
  }

  if (loaded) {
    return (
      <div className="Dictionary">
        <section>
          <h2>Which word would you like to look up?</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="search"
              className="form-control"
              defaultValue={props.defaultWord}
              onChange={getKeyword}
            />
          </form>
          <div className="hint">
            Try: pumpkin, queer, deforestation or any other word! 😀{" "}
          </div>
        </section>
        <SearchResult data={data} />
      </div>
    );
  } else {
    load();
    return <p>Loading...</p>;
  }
}
