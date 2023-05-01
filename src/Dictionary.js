import React, { useState } from "react";
import axios from "axios";
import "./Dictionary.css";

export default function Dictionary() {
  let [keyword, setKeyword] = useState(null);

  function handleResponse(response) {
    console.log(response.data);
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
        <div className="row">
          <div className="col-9">
            <input
              type="search"
              className="form-control w-100"
              placeholder="Type a word..."
              onChange={getKeyword}
            />
          </div>
          <div className="col">
            <input type="submit" className="btn btn-light" value="🔍" />
          </div>
        </div>
      </form>
    </div>
  );
}
