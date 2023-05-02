import React, { useState } from "react";
import axios from "axios";
import "./Dictionary.css";
import SearchResult from "./SearchResult";

export default function Dictionary() {
  let [keyword, setKeyword] = useState(null);
  let [definition, setDefinition] = useState(null);

  function handleResponse(response) {
    setDefinition(response.data);
  }

  function Search(event) {
    event.preventDefault();
    // https://www.shecodes.io/learn/apis/dictionary
    const apiKey = "372b3246a78f090c2oeea103eb8344t0";
    let apiUrl = `https://api.shecodes.io/dictionary/v1/define?word=${keyword}&key=${apiKey}`;
    axios.get(apiUrl).then(handleResponse);
  }

  function getKeyword(event) {
    setKeyword(event.target.value);
  }

  return (
    <div className="Dictionary">
      <form onSubmit={Search}>
        <input
          type="search"
          className="form-control mb-4"
          placeholder="Type a word..."
          onChange={getKeyword}
        />
      </form>
      <SearchResult definition={definition} />
    </div>
  );
}
