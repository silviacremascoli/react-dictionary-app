import React from "react";
import ReactAudioPlayer from "react-audio-player";
import "./Phonetics.css";

export default function Phonetics(props) {
  if (props.phonetics.audio) {
    return (
      <div className="Phonetics">
        <h4>{props.phonetics.text}</h4>
        <ReactAudioPlayer src={props.phonetics.audio} controls />
      </div>
    );
  } else {
    return (
      <div className="Phonetics">
        <h4>{props.phonetics.text}</h4>
      </div>
    );
  }
}
