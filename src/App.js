// src/App.js
import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [savedFiles, setSavedFiles] = useState([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    async function initCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");

        // Initialize up to 4 cameras
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
      } catch (err) {
        console.error("Could not enumerate devices:", err);
      }
    }

    initCameras();
  }, []);

  const captureImages = async () => {
    if (!category.trim()) {
      alert("Enter a category first!");
      return;
    }

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
      try {
        const paths = await window.electronAPI.saveImages({
          images,
          category,
        });
        setSavedFiles(paths);
      } catch (err) {
        console.error("Save failed:", err);
      }
    }
  };

  return (
    <div className="app">
      <h1 className="title">🎥 Multi-Camera Capture</h1>

      {/* Category input */}
      <input
        type="text"
        placeholder="Enter category (e.g. corolla1)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ padding: "8px", marginBottom: "15px", width: "250px" }}
      />

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
