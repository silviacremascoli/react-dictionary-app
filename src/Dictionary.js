import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "./Dictionary.css";
import SearchResult from "./SearchResult";
import VocabularyNotebook from "./VocabularyNotebook";
import Photos from "./Photos";

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const RETRY_DELAY_MS = 10 * 60 * 1000;

const readSavedWords = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("dictionary-notebook") || "[]"
    );
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const LAST_SEARCHED_WORD_STORAGE_KEY = "dictionary-last-searched-word";

const readLastSearchedWord = (fallbackWord = "") => {
  try {
    const saved = localStorage.getItem(LAST_SEARCHED_WORD_STORAGE_KEY);
    return saved && saved.trim() ? saved.trim() : fallbackWord;
  } catch {
    return fallbackWord;
  }
};

const saveLastSearchedWord = (word = "") => {
  try {
    const trimmed = (word || "").trim();
    if (trimmed) {
      localStorage.setItem(LAST_SEARCHED_WORD_STORAGE_KEY, trimmed);
    }
  } catch {}
};

const MAX_DEFINITIONS_PER_PART_OF_SPEECH = 5;
const parseDefinitionHTML = (value = "") => {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  parsed.querySelectorAll("style, script, link, .maintenance-line").forEach((element) =>
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
const normalizeDefinition = (value) => value.toLowerCase().replace(/[.,;:!?]/g, "").replace(/\s+/g, " ").trim();

const fetchWiktionarySections = async (word) => {
  const { data } = await axios.get("https://en.wiktionary.org/w/api.php", {
    params: {
      action: "parse",
      page: word,
      prop: "tocdata",
      format: "json",
      origin: "*",
    },
  });

  return data.parse?.tocdata?.sections || [];
};

const findSynonymSectionIndexes = (sections, partOfSpeech) => {
  const headingStack = [];
  const indexes = [];

  for (const section of sections) {
    headingStack.length = section.tocLevel - 1;

    const isEnglish = headingStack.some(
      (heading) => heading.line.toLowerCase() === "english"
    );
    const hasMatchingPartOfSpeech = headingStack.some(
      (heading) =>
        heading.line.toLowerCase() === partOfSpeech.toLowerCase()
    );

    if (
      section.line.toLowerCase() === "synonyms" &&
      isEnglish &&
      hasMatchingPartOfSpeech
    ) {
      indexes.push(section.index);
    }

    headingStack.push(section);
  }

  return indexes;
};

const fetchSynonymsFromSection = async (word, sectionIndex) => {
  const { data } = await axios.get("https://en.wiktionary.org/w/api.php", {
    params: {
      action: "parse",
      page: word,
      section: sectionIndex,
      prop: "text",
      format: "json",
      origin: "*",
    },
  });

  const html = data.parse?.text?.["*"] || "";
  const document = new DOMParser().parseFromString(html, "text/html");
  const links = document.querySelectorAll(
    ".mw-parser-output li a[href^='/wiki/']"
  );

  return [...new Set(
    Array.from(links)
      .filter((link) => {
        const title = decodeURIComponent(
          new URL(link.href).pathname.split("/wiki/")[1] || ""
        );
        return !title.includes(":");
      })
      .map((link) => link.textContent.trim())
      .filter(Boolean)
  )];
};

const fetchSynonymsForMeanings = async (word, meanings) => {
  try {
    const sections = await fetchWiktionarySections(word);
    return await Promise.all(
      meanings.map(async (meaning) => {
        const indexes = findSynonymSectionIndexes(sections, meaning.partOfSpeech);
        const groups = await Promise.all(
          indexes.map((index) =>
            fetchSynonymsFromSection(word, index).catch(() => [])
          )
        );
        return {
          ...meaning,
          synonyms: [...new Set(groups.flat())],
        };
      })
    );
  } catch {
    return meanings;
  }
};

export default function Dictionary(props) {
   const [initialWord] = useState(() => readLastSearchedWord(props.defaultWord));
  let [keyword, setKeyword] = useState(initialWord);
  let [data, setData] = useState(null);
  let [phonetics, setPhonetics] = useState(null);
  let [searchStatus, setSearchStatus] = useState("");
  let [error, setError] = useState(null);
  let [photos, setPhotos] = useState(null);
  const searchIdRef = useRef(0);
  const [saveAnnouncement, setSaveAnnouncement] = useState("");

  const search = (wordToSearch) => {
    const searchedWord = wordToSearch.trim();
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
          const initialMeanings = meanings.map((m) => ({ ...m, synonyms: [] }));
          setData({
            word: searchedWord,
            meanings: initialMeanings,
            source: "wiktionary",
          });
          setSearchStatus(`Definitions loaded for ${searchedWord}.`);

          fetchSynonymsForMeanings(searchedWord, initialMeanings)
            .then((enrichedMeanings) => {
              if (requestId !== searchIdRef.current) return;
              setData((current) => {
                if (!current || current.word !== searchedWord) return current;
                return {
                  ...current,
                  meanings: enrichedMeanings,
                };
              });
            })
            .catch(() => {});
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

    axios
      .get("/api/images", { params: { query: searchedWord } })
      .then((response) => {
        if (requestId === searchIdRef.current) {
          setPhotos(response.data?.photos || []);
        }
      })
      .catch((error) => console.log(error?.toJSON ? error.toJSON() : error));
  };

  useEffect(() => {
    if (initialWord) {
      search(initialWord);
    }
  }, [initialWord]);

  const handleSubmit = (event) => {
    event.preventDefault();
    saveLastSearchedWord(keyword);
    search(keyword);
  };

  const getKeyword = (event) => {
    setKeyword(event.target.value);
  };

  const [savedWords, setSavedWords] = useState(readSavedWords);

  useEffect(() => {
    localStorage.setItem("dictionary-notebook", JSON.stringify(savedWords));
  }, [savedWords]);

    const saveDefinition = ({ word, partOfSpeech, definition }) => {
    setSavedWords((current) => {
      if (
        current.some(
          (item) =>
            item.word.toLowerCase() === word.toLowerCase() &&
            item.definition === definition
        )
      ) {
        return current;
      }

      return [
        ...current,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          word,
          definition,
          partOfSpeech: partOfSpeech || "",
          note: "",
          addedAt: Date.now(),
          reviewLevel: 0,
          nextReviewAt: Date.now(),
        },
      ];
    });

    announceSavedWord(`${word} (${partOfSpeech}) saved to your vocabulary notebook.`);
  };

  const announceSavedWord = (message) => {
    setSaveAnnouncement(message);
  };

  const reviewWord = (identifier, remembered) => {
    setSavedWords((current) =>
      current.map((item) => {
        const matches = item.id ? item.id === identifier : item.word.toLowerCase() === identifier.toLowerCase();
        if (!matches) return item;

        const nextLevel = remembered
          ? Math.min((item.reviewLevel || 0) + 1, REVIEW_INTERVALS_DAYS.length)
          : 0;

        const delay = remembered
          ? REVIEW_INTERVALS_DAYS[nextLevel - 1] * DAY_IN_MS
          : RETRY_DELAY_MS;

        return {
          ...item,
          reviewLevel: nextLevel,
          nextReviewAt: Date.now() + delay,
        };
      })
    );
  };

  const removeSavedWord = (identifier) => {
    setSavedWords((current) =>
      current.filter((item) => (item.id ? item.id !== identifier : item.word.toLowerCase() !== identifier.toLowerCase()))
    );
  };

  const updateSavedNote = (identifier, note) => {
    setSavedWords((current) =>
      current.map((item) =>
        (item.id ? item.id === identifier : item.word.toLowerCase() === identifier.toLowerCase())
          ? { ...item, note }
          : item
      )
    );
  };

  return (
    <div className="Dictionary-layout">
      <div className="Dictionary-primary">
        <section>
          <h2>Which word would you like to look up?</h2>
          <form onSubmit={handleSubmit} className="Dictionary-search">
            <label className="visually-hidden" htmlFor="word-search">
              Search for an English word
            </label>
            <div className="input-group">
              <input
                id="word-search"
                type="search"
                className="form-control"
                defaultValue={initialWord}
                aria-describedby="search-hint"
                onChange={getKeyword}
              />
              <button type="submit" className="btn btn-outline-secondary">
                Search
              </button>
            </div>
          </form>
          <div className="hint" id="search-hint">
            Try: serendipity, resilient, wander or any other word! 😀
          </div>
        </section>
        <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
          {searchStatus}
        </p>
        <p
          className="visually-hidden"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {saveAnnouncement}
        </p>
        <SearchResult
          data={data}
          phonetics={phonetics}
          savedWords={savedWords}
          onSaveDefinition={saveDefinition}
        />
        {error && <p className="dictionary-error" role="alert">{error}</p>}
        {photos?.length > 0 && <Photos photos={photos} word={data?.word || keyword} />}
      </div>
      <aside className="Dictionary-sidebar" aria-label="Vocabulary notebook">
        <VocabularyNotebook
          words={savedWords}
          onRemove={removeSavedWord}
          onNoteChange={updateSavedNote}
          onReviewWord={reviewWord}
        />
      </aside>
    </div>
  );
}

export {
  extractDefinitions,
  normalizeDefinition,
  parseDefinitionHTML,
  toPlainText,
  fetchWiktionarySections,
  findSynonymSectionIndexes,
  fetchSynonymsFromSection,
  fetchSynonymsForMeanings,
  readSavedWords,
  REVIEW_INTERVALS_DAYS,
  LAST_SEARCHED_WORD_STORAGE_KEY,
  readLastSearchedWord,
  saveLastSearchedWord,
};