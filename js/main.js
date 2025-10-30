// main.js
// Detect AR support and load appropriate module

async function supportsWebXR() {
  if (!navigator.xr) return false;

  try {
    const isSupported = await navigator.xr.isSessionSupported('immersive-ar');
    return isSupported;
  } catch (err) {
    console.warn('WebXR check failed:', err);
    return false;
  }
}

(async () => {
  const infoBox = document.getElementById('info');
  infoBox.textContent = 'Checking device capabilities...';

  const xrSupported = await supportsWebXR();

  if (xrSupported) {
    infoBox.textContent = 'Starting AR Measurement Mode...';
    import('./app.js')
      .then(() => console.log('Loaded WebXR AR mode.'))
      .catch(err => {
        console.error('Error loading AR module:', err);
        infoBox.textContent = 'Failed to load AR mode.';
      });
  } else {
    infoBox.textContent = 'WebXR not supported. Starting camera mode...';
    const video = document.getElementById('videoFeed');
    video.style.display = 'block';

    import('./opencvMeasure.js')
      .then(() => console.log('Loaded OpenCV fallback mode.'))
      .catch(err => {
        console.error('Error loading OpenCV mode:', err);
        infoBox.textContent = 'Failed to load fallback mode.';
      });
  }
})();
