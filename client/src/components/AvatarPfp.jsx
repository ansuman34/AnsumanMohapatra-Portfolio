import React from "react";

export default function AvatarPfp({ className = "" }) {
  return (
    <div className={`pfp-wrap ${className}`}>
      <img
        className="pfp"
        src="/Ansuman_pfp.jpg"
        alt="Ansuman Mohapatra"
        loading="eager"
        decoding="async"
      />
      <span className="pfp-frame" aria-hidden="true" />
    </div>
  );
}

