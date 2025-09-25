import React, { useEffect, useRef } from "react";

function App() {
  const videoRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    async function initCameras() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === "videoinput");

      videoInputs.slice(0, 4).forEach(async (device, i) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: device.deviceId } }
          });
          if (videoRefs[i].current) {
            videoRefs[i].current.srcObject = stream;
          }
        } catch (err) {
          console.error(`Camera ${i + 1} failed:`, err);
        }
      });
    }

    initCameras();
  }, []);

  // 📸 Capture images
  const captureImages = () => {
    const images = videoRefs.map(ref => {
      const video = ref.current;
      if (!video) return null;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/png"); // base64
    }).filter(Boolean);

    // Send to Electron main process
    if (window.electronAPI) {
      window.electronAPI.saveImages(images);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
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
      <button
        onClick={captureImages}
        style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px" }}
      >
        📸 Capture All Cameras
      </button>
    </div>
  );
}

export default App;
