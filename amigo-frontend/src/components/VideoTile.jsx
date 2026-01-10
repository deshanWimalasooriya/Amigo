import React, { useEffect, useRef } from "react";

const VideoTile = ({ peer, name }) => {
  const ref = useRef();

  useEffect(() => {
    // Listen for the stream event from this specific peer
    peer.on("stream", stream => {
      if(ref.current) ref.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <div className="video-tile remote-tile">
      <div className="video-feed-sim">
        <video playsInline autoPlay ref={ref} className="video-element" />
        <span className="participant-label">{name || "User"}</span>
      </div>
    </div>
  );
};

export default VideoTile;