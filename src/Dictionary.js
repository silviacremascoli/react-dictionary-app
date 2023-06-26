import React, { useState } from "react";
import axios from "axios";
import "./Dictionary.css";
import SearchResult from "./SearchResult";
import Photos from "./Photos";

export default function Dictionary(props) {
  // statement that handles the word to be searched, initially set on the props' value from App.js
  let [keyword, setKeyword] = useState(props.defaultWord);
  // statement that handles the response from the dictionary API, initially set on null
  let [data, setData] = useState(null);
  // statement that handles the response from the Photos API, initially set on null
  let [photos, setPhotos] = useState(null);
  // statement that handles whether the component has a return value, initially set on false
  let [loaded, setLoaded] = useState(false);

  // function that uses the changed keyword statement to make API calls and generate a response
  const search = () => {
    // https://dictionaryapi.dev/
    let apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;
    axios
      .get(apiUrl)
      .then((response) => {
        setData(response.data[0]);
      })
      .catch((error) => console.log(error.toJSON()));
    // https://www.shecodes.io/learn/apis/images
    let imagesApiKey = "372b3246a78f090c2oeea103eb8344t0";
    let imagesApiUrl = `https://api.shecodes.io/images/v1/search?query=${keyword}&key=${imagesApiKey}`;
    axios
      .get(imagesApiUrl)
      .then((response) => {
        setPhotos(response.data.photos);
      })
      .catch((error) => console.log(error.toJSON()));
  };

  // function that handles the submit event and calls the search function
  const handleSubmit = (event) => {
    event.preventDefault();
    search();
  };

  // function that changes the keyword statement to the value submitted in the search box
  const getKeyword = (event) => {
    setKeyword(event.target.value);
  };

  // function that is called on page load and calls the search function, while changing the loaded statement to true
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
