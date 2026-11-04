# React Dictionary App

A responsive React dictionary and vocabulary notebook for looking up English words, exploring definitions, audio pronunciations, synonyms, related imagery, and reviewing saved words through spaced-repetition study sessions.

Created by [Silvia Cremascoli](https://www.silviacremascoli.com).

## Features

- **Dictionary Search:** Search English words with immediate definition display and curated suggestions.
- **Wiktionary Definitions & Examples:** Definitions grouped by part of speech, with nested examples and source/license attribution.
- **Synonyms:** Best-effort synonym extraction from Wiktionary sections, presented cleanly with inline dividers.
- **Pronunciation Audio & Respelling:** Audio pronunciation and Merriam-Webster respellings served through a secure backend proxy.
- **Curated Photos:** Responsive image gallery related to the searched term via SheCodes Images API.
- **Personal Vocabulary Notebook:** Save specific definitions alongside their part of speech and personal notes directly to local storage, supporting multiple saved definitions per word.
- **Spaced-Repetition Study Sessions:** Interactive flashcard study mode with randomized card queues, answer reveal, self-rating ("Got it" / "Again"), session progress tracking, and scheduled review intervals.
- **Desktop Two-Column Layout:** Sticky sidebar notebook alongside primary search results on larger viewports, cleanly collapsing into a stacked mobile layout.
- **Accessible Design:** Visible keyboard focus styles, accessible form landmarks, screen-reader live region announcements for search results and study sessions, and contextual aria-label attributes on per-definition save/delete buttons.

## Data Sources & Backend Architecture

- [Wiktionary REST API & Action API](https://en.wiktionary.org/): English definitions, examples, and synonyms. Licensed under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
- [Merriam-Webster Collegiate API](https://dictionaryapi.com/products/api-collegiate-dictionary): Pronunciation respellings and audio recordings.
- [SheCodes Images API](https://www.shecodes.io/learn/apis/images): Curated context imagery.

### Secure Proxy Architecture

To keep API keys protected from browser inspection:
- **Local Development:** A lightweight Express server ([server.js](server.js)) proxies pronunciation (`/api/pronunciation`) and image (`/api/images`) lookups on port `5050`, reading secrets securely from `.env`.
- **Production (Netlify):** Serverless functions ([netlify/functions/pronunciation.js](netlify/functions/pronunciation.js) and [netlify/functions/images.js](netlify/functions/images.js)) handle requests via redirects configured in [netlify.toml](netlify.toml).
- Shared Merriam-Webster parsing logic is centralized in [src/lib/pronunciation.js](src/lib/pronunciation.js) to keep local and production behavior consistent.

## Run Locally

### Prerequisites
- Node.js (v16+ recommended) and npm.

### Setup

1. Clone repository and install dependencies:

   ```bash
   git clone https://github.com/silviacremascoli/react-dictionary-app.git
   cd react-dictionary-app
   npm install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

   Add your credentials in `.env`:
   - `MW_API_KEY`: Merriam-Webster Collegiate Dictionary API key (from [dictionaryapi.com](https://dictionaryapi.com/)).
   - `SHE_CODES_IMAGES_API_KEY`: SheCodes Images API key.

   *(Note: `.env` is ignored by Git; never commit API keys to source control).*

3. Start the API proxy server in one terminal:

   ```bash
   npm run server
   ```

4. Start the React frontend in another terminal:

   ```bash
   npm start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser. The React dev server automatically proxies `/api/*` calls to the Express server running on port `5050`.

## Available Scripts

- `npm start`: Runs the React app in development mode on port 3000.
- `npm run server`: Runs the backend Express proxy on port 5050.
- `npm run build`: Builds the production bundle to the `build/` folder.

## Deployment

In production (e.g., Netlify):
- The build command is `npm run build` with publish directory `build`.
- Configure `MW_API_KEY` and `SHE_CODES_IMAGES_API_KEY` in your hosting platform's environment variables dashboard.
- Rewrites in [netlify.toml](netlify.toml) route `/api/pronunciation` and `/api/images` to their respective serverless functions.

