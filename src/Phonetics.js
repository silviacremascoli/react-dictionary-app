import React from "react";
import ReactAudioPlayer from "react-audio-player";

export default function Phonetics(props) {
  console.log(props.phonetics);
  if (props.phonetics.audio) {
    return (
      <div className="Phonetics">
        <div className="PhoneticsText">
          <h4>{props.phonetics.text}</h4>
        </div>
        <div className="PhoneticsAudio">
          <ReactAudioPlayer src={props.phonetics.audio} controls />
        </div>
      </div>
    );
  } else {
    return (
      <div className="Phonetics">
        <div className="PhoneticsText">
          <h4>{props.phonetics.text}</h4>
        </div>
      </div>
    );
  }
}
