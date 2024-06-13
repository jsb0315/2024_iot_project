import React from "react";
import "./connected.css";
import Spinner from "../assets/spinner.gif";

export default function ConnectComponent({ tryConnecting, clickevent, stat }) {
  const fillStyle = tryConnecting !== stat ? { fill: '#ffba61' } : stat ? {fill: '#6cbe45'} : {fill: '#ff6161'};
  return (
    <div className="checkbox">
      <input
        type="checkbox"
        className={stat ? "a checked" : "a unchecked"}
        onClick={clickevent}
      />
      <svg viewBox="0 0 35.6 35.6">
        <circle className="background" cx="17.8" cy="17.8" r="17.8" style={fillStyle}/>
        <circle className="stroke" cx="17.8" cy="17.8" r="14.37" />
        {tryConnecting!==stat ? (
          <image className="loading" href={Spinner} alt="로딩중" width="100%" />
        ) : (
          <polyline
            className="check"
            points="11.78 18.12 15.55 22.23 25.17 12.87"
          />
        )}
      </svg>
    </div>
  );
}
