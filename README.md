# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Merriam-Webster Pronunciation Setup

The React app requests pronunciation data from a small local Express proxy so the Merriam-Webster API key is not included in the browser bundle.

1. Get a Merriam-Webster Collegiate API key from [dictionaryapi.com](https://dictionaryapi.com/).
2. Create `.env` file and set `MW_API_KEY` to your key.
3. Run `npm run server` in one terminal.
4. Run `npm start` in a second terminal.

The `.env` file is ignored by Git. In production, deploy the Express endpoint and React app behind the same origin, and configure `MW_API_KEY` as a server environment variable.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

# React Dictionary App

A React dictionary for looking up English words, with definitions, pronunciation audio, and related images. The app was created by [Silvia Cremascoli](https://github.com/silviacremascoli/react-dictionary-app).

## Features

- Search for an English word; the app opens with `star` as its initial search.
- Browse definitions grouped by part of speech, with up to five definitions per group.
- Hear pronunciation audio and view Merriam-Webster's pronunciation respelling when available.
- View example sentences and related photos when the APIs provide them.
- Read definitions from Wiktionary, with source and license attribution displayed in the app.

## Data Sources

- [Wiktionary REST API](https://en.wiktionary.org/api/rest_v1/): English definitions and examples. Wiktionary content is available under [CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
- [Merriam-Webster Collegiate API](https://dictionaryapi.com/products/api-collegiate-dictionary): pronunciation respellings and audio. A key with access to the Collegiate reference is required.
- [SheCodes Images API](https://www.shecodes.io/learn/apis/images): related photos.

## Run Locally

Prerequisites: Node.js and npm.

1. Install dependencies:

	```bash
	npm install
	```

2. Get a Merriam-Webster Collegiate API key and copy `.env.example` to `.env`:

	```bash
	cp .env.example .env
	```

	Set `MW_API_KEY` in `.env` to your key. The `.env` file is ignored by Git; never commit your key.

3. Start the pronunciation proxy in one terminal:

	```bash
	npm run server
	```

4. Start the React app in another terminal:

	```bash
	npm start
	```

	Open [http://localhost:3000](http://localhost:3000). If that port is in use, Create React App will offer another one. The local Express proxy listens on port `5050`.

## Scripts

- `npm start`: run the React development server.
- `npm run server`: run the Express pronunciation proxy.
- `npm test`: run the Create React App test runner.
- `npm run build`: create a production build in `build/`.

For deployment, host the Express proxy and React app behind the same origin, and provide `MW_API_KEY` as a server environment variable.
