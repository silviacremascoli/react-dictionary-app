function getAudioDirectory(audio) {
  if (!audio) return null;
  if (audio.startsWith("bix")) return "bix";
  if (audio.startsWith("gg")) return "gg";
  if (/^[0-9_]/.test(audio)) return "number";
  return audio[0].toLowerCase();
}

function getAudioUrl(audio) {
  if (!audio) return "";
  const audioDirectory = getAudioDirectory(audio);
  return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${audioDirectory}/${encodeURIComponent(audio)}.mp3`;
}

function parseMwPronunciation(data) {
  const entry = Array.isArray(data)
    ? data.find((item) => item && typeof item === "object" && item.hwi?.prs?.length)
    : null;
  const pronunciation = entry?.hwi.prs.find((item) => item.mw || item.sound?.audio);

  if (!pronunciation) return null;

  const audio = pronunciation.sound?.audio;
  return {
    text: pronunciation.mw || "",
    audio: getAudioUrl(audio),
  };
}

module.exports = {
  getAudioDirectory,
  getAudioUrl,
  parseMwPronunciation,
};
