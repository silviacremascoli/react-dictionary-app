import React from "react";
import "./App.css";
import Dictionary from "./Dictionary";

export default function App() {
  return (
    <div className="App">
      <div className="container">
        <h1>Dictionary App</h1>
        <main>
          <Dictionary defaultWord="star" />
        </main>
        <footer className="text-center">
          This project was coded by{" "}
          <a href="https:www.silviacremascoli.com">
            Silvia Cremascoli
          </a>
          {" "}and is open-sourced on{" "}
          <a href="https://github.com/silviacremascoli/react-dictionary-app">
            GitHub
          </a>
          {" "}<span aria-hidden="true">🚀</span>
        </footer>
      </div>
    </div>
  );
}
