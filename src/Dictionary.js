import React, { useState } from "react";
import "./Dictionary.css";

export default function Dictionary() {
  let [keyword, setKeyword] = useState(null);

  function Search(event) {
    event.preventDefault();
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
