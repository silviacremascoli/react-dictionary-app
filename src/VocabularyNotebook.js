import React from "react";
import "./VocabularyNotebook.css";

export default function VocabularyNotebook({
    words = [],
    onRemove,
    onNoteChange,
    onReviewWord,
}) {
    const [isReviewing, setIsReviewing] = React.useState(false);
    const [showAnswer, setShowAnswer] = React.useState(false);
    const [sessionWords, setSessionWords] = React.useState([]);
    const [sessionIndex, setSessionIndex] = React.useState(0);
    const [sessionStats, setSessionStats] = React.useState({ reviewed: 0, remembered: 0 });
    const cardHeadingRef = React.useRef(null);
    const sessionCompleteRef = React.useRef(null);
    const notebookHeadingRef = React.useRef(null);
    const backToNotebookRef = React.useRef(null);
    const [sessionAnnouncement, setSessionAnnouncement] = React.useState("");

    const dueWords = words.filter(
        (item) => (item.nextReviewAt || 0) <= Date.now()
    );

    const currentCard = isReviewing
        ? sessionWords[sessionIndex]
        : dueWords[0];

    const startSession = () => {
        const nextSessionWords = shuffleWords(dueWords);
        setSessionWords(nextSessionWords);
        setSessionIndex(0);
        setSessionStats({ reviewed: 0, remembered: 0 });
        setShowAnswer(false);
        setSessionAnnouncement(`Study session started. ${nextSessionWords.length} words.`);
        setIsReviewing(true);
    };

    React.useEffect(() => {
        if (!isReviewing) return;
        const focusTarget = currentCard ? cardHeadingRef : backToNotebookRef;
        focusTarget.current?.focus();
    }, [currentCard, isReviewing]);

    const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", {
        numeric: "always",
    });

    const formatTimeUntil = (timestamp) => {
        const remaining = timestamp - Date.now();

        if (remaining <= 0) return "now";

        const units = [
            ["day", 24 * 60 * 60 * 1000],
            ["hour", 60 * 60 * 1000],
            ["minute", 60 * 1000],
            ["second", 1000],
        ];

        const [unit, milliseconds] =
            units.find(([, size]) => remaining >= size) || units[units.length - 1];

        return relativeTimeFormatter.format(Math.ceil(remaining / milliseconds), unit);
    };
    const nextReviewAt = words
        .map((item) => item.nextReviewAt)
        .filter((time) => time > Date.now())
        .sort((a, b) => a - b)[0];

    const rateCard = (remembered) => {
        if (!currentCard) return;
        const nextIndex = sessionIndex + 1;

        onReviewWord(currentCard.id || currentCard.word, remembered);
        setSessionStats((stats) => ({
            reviewed: stats.reviewed + 1,
            remembered: stats.remembered + (remembered ? 1 : 0),
        }));
        setSessionIndex(nextIndex);
        setSessionAnnouncement(
        nextIndex < sessionWords.length
            ? `Card ${nextIndex + 1} of ${sessionWords.length}`
            : `Session complete. You reviewed ${sessionWords.length} words.`
        );
        setShowAnswer(false);
    };

    const shuffleWords = (words) => {
        const shuffled = [...words];

        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[randomIndex]] = [
                shuffled[randomIndex],
                shuffled[index],
            ];
        }

        return shuffled;
    };

    return (
        <section
            className="VocabularyNotebook"
            aria-labelledby="vocabulary-notebook-heading"
        >
            <h2 ref={notebookHeadingRef} tabIndex={-1} id="vocabulary-notebook-heading">Vocabulary notebook</h2>
            <button
                type="button"
                className="btn btn-outline-success StartSession"
                onClick={startSession}
                disabled={dueWords.length === 0}
            >
                Start study session (
                    {dueWords.length === 0
                        ? "no words due"
                        : dueWords.length === 1 ? "1 word due" : dueWords.length + " words due"
                    }
                )
            </button>
            <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
                {sessionAnnouncement}
            </p>

            {isReviewing ? (
                <div className="VocabularyNotebook-review">
                    <button
                        ref={backToNotebookRef}
                        type="button"
                        className="btn btn-outline-secondary btn-md mt-3 mb-3"
                        onClick={() => {
                            setIsReviewing(false);
                            setShowAnswer(false);
                            requestAnimationFrame(() => notebookHeadingRef.current?.focus());
                        }}
                    >
                        Back to notebook
                    </button>

                    {currentCard ? (
                        <>
                            <h3 ref={cardHeadingRef} tabIndex={-1}>{currentCard.word}</h3>

                            {showAnswer ? (
                                <>
                                    <p>{currentCard.definition || "No definition was saved."}</p>
                                    {currentCard.note && <p>Your note: {currentCard.note}</p>}
                                    <button type="button" className="btn btn-outline-danger btn-sm me-3" onClick={() => rateCard(false)}>Again</button>
                                    <button type="button" className="btn btn-outline-success btn-sm" onClick={() => rateCard(true)}>Got it</button>
                                </>
                            ) : (
                                <button type="button" className="btn btn-outline-success mt-2" onClick={() => setShowAnswer(true)}>
                                    Show definition
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <h3 ref={sessionCompleteRef} tabIndex={-1}>Session complete</h3>
                            <p>
                                You reviewed {sessionStats.reviewed} {sessionStats.reviewed === 1 ? "word" : "words"} and remembered{" "}
                                {sessionStats.remembered}.
                            </p>
                            {nextReviewAt && (
                                <p>Next session available: {formatTimeUntil(nextReviewAt)}</p>
                            )}
                        </>
                    )}
                </div>
            ) : words.length === 0 ? (
                <p className="VocabularyNotebook-empty mt-3">No saved words yet.</p>
            ) : (
                <ul className="VocabularyNotebook-list">
                    {words.map((item, index) => {
                        const noteId = `vocabulary-note-${index}`;

                        return (
                            <li className="VocabularyNotebook-item" key={`${item.word}-${item.partOfSpeech}-${index}`}>
                                <div className="VocabularyNotebook-word">
                                    <div className="VocabularyNotebook-wordDetails">
                                        <h3>{item.word}</h3>
                                        {item.partOfSpeech && (
                                            <span className="VocabularyNotebook-partOfSpeech">
                                                {item.partOfSpeech}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => onRemove(item.id || item.word)}
                                        aria-label={`Remove this definition of ${item.word} from your notebook`}
                                    >
                                        Delete word
                                    </button>
                                </div>

                                {item.definition && (
                                    <p className="VocabularyNotebook-definition">{item.definition}</p>
                                )}

                                <label htmlFor={noteId}>Your note:</label>
                                <textarea
                                    id={noteId}
                                    className="form-control mt-2"
                                    rows="2"
                                    value={item.note || ""}
                                    placeholder={`Add a note about "${item.word}"`}
                                    onChange={(event) => onNoteChange(item.id || item.word, event.target.value)}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}