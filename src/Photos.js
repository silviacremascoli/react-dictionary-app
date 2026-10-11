import React from "react";
import "./Photos.css";

export default function Photos(props) {
  if (props.photos) {
    return (
      <section className="Photos">
        <div className="row">
          {props.photos.map(function (photo, index) {
            const description =
              typeof photo.alt === "string" && photo.alt.trim()
                ? photo.alt.trim()
                : `Photo related to ${props.word || "this word"}`;
            return (
              <div className="col-md-4" key={index}>
                <a
                  href={photo.src.original}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`View photo: ${description} (opens in a new tab)`}
                >
                  <img
                    src={photo.src.landscape}
                    alt={description}
                    className="img-fluid"
                  />
                </a>
              </div>
            );
          })}
        </div>
      </section>
    );
  } else {
    return null;
  }
}
