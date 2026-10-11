import React, { useRef, useState } from "react";
import axios from "axios";
import "./Dictionary.css";
import SearchResult from "./SearchResult";
import Photos from "./Photos";

const MAX_DEFINITIONS_PER_PART_OF_SPEECH = 5;
const parseDefinitionHTML = (value = "") => {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  parsed.querySelectorAll("style, script, link").forEach((element) =>
    element.remove()
  );
  return parsed;
};
const toPlainText = (value = "") =>
  parseDefinitionHTML(value).body.textContent.trim();
const extractDefinitions = (value = "") => {
  const body = parseDefinitionHTML(value).body;
  const lists = Array.from(body.querySelectorAll("ol, ul")).filter(
    (list) => !list.parentElement.closest("ol, ul")
  );

  if (!lists.length) {
    const text = body.textContent.trim();
    return text ? [text] : [];
  }

  const definitions = [];
  const visitList = (list) => {
    Array.from(list.children)
      .filter((child) => child.tagName === "LI")
      .forEach((item) => {
        const clone = item.cloneNode(true);
        Array.from(clone.querySelectorAll("ol, ul")).forEach((nestedList) =>
          nestedList.remove()
        );
        const text = clone.textContent.trim();
        if (text) definitions.push(text);

        Array.from(item.children)
          .filter((child) => child.matches("ol, ul"))
          .forEach(visitList);
      });
  };

  lists.forEach(visitList);
  return definitions;
};
const normalizeDefinition = (value) =>
  value.toLowerCase().replace(/[.,;:!?]/g, "").replace(/\s+/g, " ").trim();

export default function Dictionary(props) {
  let [keyword, setKeyword] = useState(props.defaultWord);
  let [data, setData] = useState(null);
  let [phonetics, setPhonetics] = useState(null);
  let [searchStatus, setSearchStatus] = useState("");
  let [error, setError] = useState(null);
  let [photos, setPhotos] = useState(null);
  let [loaded, setLoaded] = useState(false);
  const searchIdRef = useRef(0);

  const search = () => {
    const searchedWord = keyword.trim();
    if (!searchedWord) return;

    const requestId = ++searchIdRef.current;
    setData(null);
    setPhonetics(null);
    setSearchStatus(`Searching definitions for ${searchedWord}.`);
    setError(null);
    setPhotos(null);

    const apiUrl = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(searchedWord)}`;
    axios
      .get(apiUrl)
      .then((response) => {
        if (requestId !== searchIdRef.current) return;

        const meaningsByPartOfSpeech = new Map();
        (response.data.en || []).forEach((meaning) => {
          const partOfSpeech = meaning.partOfSpeech || "Other";
          const groupedMeaning = meaningsByPartOfSpeech.get(partOfSpeech) || {
            partOfSpeech,
            definitions: [],
          };

          (meaning.definitions || []).forEach((definition) => {
            const texts = extractDefinitions(definition.definition);
            const example =
              texts.length === 1 && definition.examples?.[0]
                ? toPlainText(definition.examples[0])
                : undefined;

            texts.forEach((text) => {
              if (
                text &&
                !groupedMeaning.definitions.some((item) => item.definition === text)
              ) {
                groupedMeaning.definitions.push({
                  definition: text,
                  example,
                  synonyms: [],
                });
              }
            });
          });

          meaningsByPartOfSpeech.set(partOfSpeech, groupedMeaning);
        });

        const meanings = Array.from(meaningsByPartOfSpeech.values())
          .map((meaning) => ({
            ...meaning,
            definitions: meaning.definitions
              .filter((definition, index, all) => {
                const colonIndex = definition.definition.indexOf(":");
                if (colonIndex === -1) return true;

                const repeatedClause = normalizeDefinition(
                  definition.definition.slice(colonIndex + 1)
                );
                return !all.some(
                  (other, otherIndex) =>
                    otherIndex !== index &&
                    normalizeDefinition(other.definition) === repeatedClause
                );
              })
              .slice(0, MAX_DEFINITIONS_PER_PART_OF_SPEECH),
          }))
          .filter((meaning) => meaning.definitions.length);
        if (meanings.length) {
          setData({
            word: searchedWord,
            meanings,
            source: "wiktionary",
          });
          setSearchStatus(`Definitions loaded for ${searchedWord}.`);
        } else {
          setSearchStatus("");
          setError("No English definitions were found for that word.");
        }
      })
      .catch(() => {
        if (requestId === searchIdRef.current) setSearchStatus("");
        setError("Definitions are unavailable right now. Please try again later.");
      });

    axios
      .get("/api/pronunciation", { params: { word: searchedWord } })
      .then(({ data: pronunciation }) => {
        if (requestId === searchIdRef.current) setPhonetics(pronunciation);
      })
      .catch(() => {
        if (requestId === searchIdRef.current) setPhonetics(null);
      });

    const imagesApiKey = "372b3246a78f090c2oeea103eb8344t0";
    const imagesApiUrl = `https://api.shecodes.io/images/v1/search?query=${encodeURIComponent(searchedWord)}&key=${imagesApiKey}`;
    axios
      .get(imagesApiUrl)
      .then((response) => {
        if (requestId === searchIdRef.current) setPhotos(response.data.photos);
      })
      .catch((error) => console.log(error.toJSON()));
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
            <label className="visually-hidden" htmlFor="word-search">
              Search for an English word
            </label>
            <input
              id="word-search"
              type="search"
              className="form-control"
              defaultValue={props.defaultWord}
              aria-describedby="search-hint"
              onChange={getKeyword}
            />
          </form>
          <div className="hint" id="search-hint">
            Try: pumpkin, queer, deforestation or any other word! 😀{" "}
          </div>
        </section>
        <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {searchStatus}
        </p>
        <SearchResult data={data} phonetics={phonetics} />
        {error && <p className="dictionary-error" role="alert">{error}</p>}
        {photos?.length > 0 && <Photos photos={photos} word={data?.word || keyword} />}
      </div>
    );
  }

  load();
  return <p role="status">Loading...</p>;
}