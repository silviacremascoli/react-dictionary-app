import React, { useState } from "react";
import axios from "axios";
import "./Dictionary.css";
import SearchResult from "./SearchResult";
import Photos from "./Photos";

export default function Dictionary(props) {
  let [keyword, setKeyword] = useState(props.defaultWord);
  let [data, setData] = useState(null);
  let [photos, setPhotos] = useState(null);
  let [loaded, setLoaded] = useState(false);

  const search = () => {
    // https://dictionaryapi.dev/
    let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;
    axios.get(apiUrl).then((response) => {
      setData(response.data[0]);
    });
    // https://www.shecodes.io/learn/apis/images
    let imagesApiKey = "372b3246a78f090c2oeea103eb8344t0";
    let imagesApiUrl = `https://api.shecodes.io/images/v1/search?query=${keyword}&key=${imagesApiKey}`;
    axios.get(imagesApiUrl).then((response) => {
      setPhotos(response.data.photos);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    search();
  };

  const getKeyword = (event) => {
    setKeyword(event.target.value);
  };

  const load = () => {
    setLoaded(true);
    search();
  };

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
        {photos?.length > 0 && <Photos photos={photos} />}
      </div>
    );
  } else {
    load();
    return <p>Loading...</p>;
  }
}
