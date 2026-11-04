import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import Dictionary, {
  normalizeDefinition,
  extractDefinitions,
  findSynonymSectionIndexes,
  readSavedWords,
  readLastSearchedWord,
  saveLastSearchedWord,
  LAST_SEARCHED_WORD_STORAGE_KEY,
} from "./Dictionary";

jest.mock("axios");

describe("Dictionary helper functions", () => {
  it("reads and saves the last searched word from localStorage safely", () => {
    localStorage.clear();
    expect(readLastSearchedWord("star")).toBe("star");

    saveLastSearchedWord("resilient");
    expect(localStorage.getItem(LAST_SEARCHED_WORD_STORAGE_KEY)).toBe("resilient");
    expect(readLastSearchedWord("star")).toBe("resilient");

    localStorage.setItem(LAST_SEARCHED_WORD_STORAGE_KEY, "   ");
    expect(readLastSearchedWord("star")).toBe("star");
  });

  it("normalizes definitions by stripping punctuation and lowercase", () => {
    expect(normalizeDefinition("A celestial body.")).toBe("a celestial body");
    expect(normalizeDefinition("  Hello, World!  ")).toBe("hello world");
  });

  it("extracts definitions from simple html", () => {
    const html = "<ol><li>First definition</li><li>Second definition</li></ol>";
    expect(extractDefinitions(html)).toEqual([
      "First definition",
      "Second definition",
    ]);
  });

  it("finds English synonym section indexes matching part of speech", () => {
    const sections = [
      { tocLevel: 1, line: "English", index: "1" },
      { tocLevel: 2, line: "Noun", index: "2" },
      { tocLevel: 3, line: "Synonyms", index: "3" },
      { tocLevel: 2, line: "Verb", index: "4" },
      { tocLevel: 3, line: "Synonyms", index: "5" },
      { tocLevel: 1, line: "French", index: "6" },
      { tocLevel: 2, line: "Noun", index: "7" },
      { tocLevel: 3, line: "Synonyms", index: "8" },
    ];

    expect(findSynonymSectionIndexes(sections, "Noun")).toEqual(["3"]);
    expect(findSynonymSectionIndexes(sections, "Verb")).toEqual(["5"]);
    expect(findSynonymSectionIndexes(sections, "Adjective")).toEqual([]);
  });

  it("reads saved words safely from localStorage", () => {
    localStorage.clear();
    expect(readSavedWords()).toEqual([]);

    localStorage.setItem(
      "dictionary-notebook",
      JSON.stringify([{ word: "star" }])
    );
    expect(readSavedWords()).toEqual([{ word: "star" }]);

    localStorage.setItem("dictionary-notebook", "invalid-json");
    expect(readSavedWords()).toEqual([]);
  });
});

describe("Dictionary component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("renders search form and default elements", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("wiktionary.org/api/rest_v1/page/definition")) {
        return Promise.resolve({
          data: {
            en: [
              {
                partOfSpeech: "Noun",
                definitions: [{ definition: "A bright celestial object" }],
              },
            ],
          },
        });
      }
      if (url.includes("/api/pronunciation")) {
        return Promise.resolve({
          data: { text: "'stär", audio: "https://example.com/star.mp3" },
        });
      }
      if (url.includes("/api/images")) {
        return Promise.resolve({
          data: { photos: [] },
        });
      }
      if (url.includes("action=parse")) {
        return Promise.resolve({
          data: { parse: { tocdata: { sections: [] } } },
        });
      }
      return Promise.reject(new Error("not found"));
    });

    render(<Dictionary defaultWord="star" />);

    expect(
      screen.getByText("Which word would you like to look up?")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /search/i })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "star" })).toBeInTheDocument();
    });

    expect(
      screen.getByText("A bright celestial object")
    ).toBeInTheDocument();
  });

  it("saves a definition to notebook when clicking Save", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("wiktionary.org/api/rest_v1/page/definition")) {
        return Promise.resolve({
          data: {
            en: [
              {
                partOfSpeech: "Noun",
                definitions: [{ definition: "A bright star" }],
              },
            ],
          },
        });
      }
      if (url.includes("/api/pronunciation")) return Promise.resolve({ data: null });
      if (url.includes("/api/images")) return Promise.resolve({ data: { photos: [] } });
      if (url.includes("action=parse")) {
        return Promise.resolve({ data: { parse: { tocdata: { sections: [] } } } });
      }
      return Promise.reject(new Error("not found"));
    });

    render(<Dictionary defaultWord="star" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "star" })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText("Saved")).toBeInTheDocument();
    });

    // Check localStorage
    const saved = JSON.parse(localStorage.getItem("dictionary-notebook") || "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0].word).toBe("star");
    expect(saved[0].partOfSpeech).toBe("Noun");
    expect(saved[0].definition).toBe("A bright star");
  });

  it("restores and searches the remembered word from localStorage on mount", async () => {
    localStorage.setItem(LAST_SEARCHED_WORD_STORAGE_KEY, "resilient");

    axios.get.mockImplementation((url) => {
      if (url.includes("wiktionary.org/api/rest_v1/page/definition")) {
        return Promise.resolve({
          data: {
            en: [
              {
                partOfSpeech: "Adjective",
                definitions: [{ definition: "Able to withstand adversity" }],
              },
            ],
          },
        });
      }
      if (url.includes("/api/pronunciation")) return Promise.resolve({ data: null });
      if (url.includes("/api/images")) return Promise.resolve({ data: { photos: [] } });
      if (url.includes("action=parse")) {
        return Promise.resolve({ data: { parse: { tocdata: { sections: [] } } } });
      }
      return Promise.reject(new Error("not found"));
    });

    render(<Dictionary defaultWord="star" />);

    const input = screen.getByRole("searchbox");
    expect(input).toHaveValue("resilient");

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "resilient" })).toBeInTheDocument();
    });
  });

  it("allows saving multiple distinct definitions for the same word", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("wiktionary.org/api/rest_v1/page/definition")) {
        return Promise.resolve({
          data: {
            en: [
              {
                partOfSpeech: "Noun",
                definitions: [
                  { definition: "First meaning of word" },
                  { definition: "Second meaning of word" },
                ],
              },
            ],
          },
        });
      }
      if (url.includes("/api/pronunciation")) return Promise.resolve({ data: null });
      if (url.includes("/api/images")) return Promise.resolve({ data: { photos: [] } });
      if (url.includes("action=parse")) {
        return Promise.resolve({ data: { parse: { tocdata: { sections: [] } } } });
      }
      return Promise.reject(new Error("not found"));
    });

    render(<Dictionary defaultWord="world" />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "world" })).toBeInTheDocument();
    });

    const saveButtons = screen.getAllByRole("button", { name: /save/i });
    fireEvent.click(saveButtons[0]);
    fireEvent.click(saveButtons[1]);

    const saved = JSON.parse(localStorage.getItem("dictionary-notebook") || "[]");
    expect(saved).toHaveLength(2);
    expect(saved[0].definition).toBe("First meaning of word");
    expect(saved[1].definition).toBe("Second meaning of word");
  });

  it("deleting one saved definition preserves other saved definitions of the same word", async () => {
    localStorage.setItem(
      "dictionary-notebook",
      JSON.stringify([
        { id: "1", word: "world", definition: "Meaning one", partOfSpeech: "Noun" },
        { id: "2", word: "world", definition: "Meaning two", partOfSpeech: "Noun" },
      ])
    );

    axios.get.mockImplementation(() => Promise.reject(new Error("not found")));

    render(<Dictionary defaultWord="world" />);

    const deleteButtons = screen.getAllByRole("button", { name: /remove/i });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);

    const saved = JSON.parse(localStorage.getItem("dictionary-notebook") || "[]");
    expect(saved).toHaveLength(1);
    expect(saved[0].definition).toBe("Meaning two");
  });

  it("persists searched word in localStorage upon form submission", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes("wiktionary.org/api/rest_v1/page/definition")) {
        return Promise.resolve({
          data: {
            en: [
              {
                partOfSpeech: "Noun",
                definitions: [{ definition: "A bright celestial object" }],
              },
            ],
          },
        });
      }
      if (url.includes("/api/pronunciation")) return Promise.resolve({ data: null });
      if (url.includes("/api/images")) return Promise.resolve({ data: { photos: [] } });
      if (url.includes("action=parse")) {
        return Promise.resolve({ data: { parse: { tocdata: { sections: [] } } } });
      }
      return Promise.reject(new Error("not found"));
    });

    render(<Dictionary defaultWord="star" />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "serendipity" } });
    fireEvent.submit(screen.getByRole("button", { name: /search/i }));

    expect(localStorage.getItem(LAST_SEARCHED_WORD_STORAGE_KEY)).toBe("serendipity");
  });
});
