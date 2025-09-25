import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [savedFiles, setSavedFiles] = useState([]);

  useEffect(() => {
    async function initCameras() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === "videoinput");

      videoInputs.slice(0, 4).forEach(async (device, i) => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: device.deviceId } },
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

  const captureImages = () => {
    const images = videoRefs
      .map((ref) => {
        const video = ref.current;
        if (!video) return null;

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL("image/png");
      })
      .filter(Boolean);

    if (window.electronAPI) {
      window.electronAPI.saveImages(images).then((paths) => {
        setSavedFiles(paths); // show actual saved paths
      });
    }
  };

  return (
    <div className="app">
      <h1 className="title">🎥 USB Camera Capture</h1>

      <div className="camera-grid">
        {videoRefs.map((ref, i) => (
          <div key={i} className="camera-box">
            <video ref={ref} autoPlay playsInline />
            <p>Camera {i + 1}</p>
          </div>
        ))}
      </div>

      <button className="capture-btn" onClick={captureImages}>
        📸 Capture All Cameras
      </button>

      {savedFiles.length > 0 && (
        <div className="saved-files">
          <h2>✅ Saved Files:</h2>
          <ul>
            {savedFiles.map((file, i) => (
              <li key={i}>{file}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
