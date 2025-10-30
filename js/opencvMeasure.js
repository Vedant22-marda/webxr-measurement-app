// opencvMeasure.js
// Simple OpenCV.js fallback: shows camera and allows 2-point tap measurement

const video = document.getElementById('videoFeed');
const infoBox = document.getElementById('info');

let clickPoints = [];
let overlayCanvas, ctx;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    video.srcObject = stream;
    await video.play();

    createOverlay();
    infoBox.textContent = 'Tap two points on the screen to measure distance.';
  } catch (err) {
    console.error('Camera access failed:', err);
    infoBox.textContent = 'Camera access denied or unavailable.';
  }
}

function createOverlay() {
  overlayCanvas = document.createElement('canvas');
  overlayCanvas.id = 'overlay';
  overlayCanvas.width = window.innerWidth;
  overlayCanvas.height = window.innerHeight;
  document.body.appendChild(overlayCanvas);

  ctx = overlayCanvas.getContext('2d');
  overlayCanvas.addEventListener('click', onCanvasClick);
}

function onCanvasClick(event) {
  const x = event.clientX;
  const y = event.clientY;
  clickPoints.push({ x, y });

  drawDot(x, y);

  if (clickPoints.length === 2) {
    drawLineAndMeasure();
  } else if (clickPoints.length > 2) {
    // Reset if tapped again
    clickPoints = [];
    clearCanvas();
    infoBox.textContent = 'Tap two points on the screen to measure distance.';
  }
}

function drawDot(x, y) {
  ctx.fillStyle = 'lime';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, 2 * Math.PI);
  ctx.fill();
}

function drawLineAndMeasure() {
  const [p1, p2] = clickPoints;

  ctx.strokeStyle = 'red';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  const pixelDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const approxDist = (pixelDist / 400).toFixed(2); // Rough scaling for demo

  infoBox.textContent = `Approx distance: ${approxDist} m (tap again to reset)`;
}

function clearCanvas() {
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
}

window.addEventListener('resize', () => {
  if (overlayCanvas) {
    overlayCanvas.width = window.innerWidth;
    overlayCanvas.height = window.innerHeight;
  }
});

initCamera();
