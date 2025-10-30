import { initWebRTC } from "./webrtc.js";
import { startMeasurement } from "./opencvMeasure.js";

const info = document.getElementById("info");
const video = document.getElementById("videoFeed");
const startBtn = document.getElementById("startBtn");

// Ask for camera permission only after user gesture
startBtn.addEventListener("click", async () => {
  startBtn.style.display = "none";
  info.textContent = "Requesting camera access...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment" // use rear camera on phones
      },
      audio: false
    });

    video.srcObject = stream;
    video.style.display = "block";
    info.textContent = "Camera started. Tap on the screen to measure.";

    // Initialize WebRTC and measurement tools
    initWebRTC(stream);
    startMeasurement(video);
  } catch (err) {
    console.error("Camera access denied:", err);
    info.textContent = "Camera access denied. Please allow camera permission.";
    startBtn.style.display = "block";
  }
});
