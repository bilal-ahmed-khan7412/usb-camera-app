import React, { useEffect, useRef } from "react";

function App() {
  const videoRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    async function initCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === "videoinput");

        // Take up to 4 cameras
        videoInputs.slice(0, 4).forEach(async (device, i) => {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: device.deviceId }
          });
          if (videoRefs[i].current) {
            videoRefs[i].current.srcObject = stream;
          }
        });
      } catch (err) {
        console.error("Error accessing cameras:", err);
      }
    }

    initCameras();
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
      {videoRefs.map((ref, i) => (
        <video
          key={i}
          ref={ref}
          autoPlay
          playsInline
          style={{ width: "100%", height: "auto", background: "#000" }}
        />
      ))}
    </div>
  );
}

export default App;
