// WebRTC.js — signaling for Flask-SocketIO backend
// Works with server/server.py

const socket = io(); // connects automatically to the same host/port
let localStream;
let peerConnection;
let roomName = "default-room"; // you can randomize this later

// STUN servers for NAT traversal (Google's public STUN)
const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

// Get local media (camera + mic)
export async function initWebRTC(videoElementId = "videoFeed") {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
    const localVideo = document.getElementById(videoElementId);
    localVideo.srcObject = localStream;
    localVideo.style.display = "block";
    console.log("✅ Local stream ready");
  } catch (err) {
    console.error("Error accessing camera:", err);
  }

  // Join signaling room
  socket.emit("join", roomName);
  console.log("📡 Joined signaling room:", roomName);

  // When another peer joins, create an offer
  socket.on("ready", async () => {
    console.log("Peer is ready, creating offer...");
    createPeerConnection();
    addLocalTracks();

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", {
        description: offer,
        room: roomName,
      });
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  });

  // When an offer is received
  socket.on("offer", async (description) => {
    console.log("📩 Offer received");
    createPeerConnection();
    addLocalTracks();

    try {
      await peerConnection.setRemoteDescription(description);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("answer", {
        description: answer,
        room: roomName,
      });
    } catch (err) {
      console.error("Error handling offer:", err);
    }
  });

  // When an answer is received
  socket.on("answer", async (description) => {
    console.log("📩 Answer received");
    try {
      await peerConnection.setRemoteDescription(description);
    } catch (err) {
      console.error("Error setting remote description:", err);
    }
  });

  // ICE candidates
  socket.on("candidate", async (candidate) => {
    if (peerConnection) {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  });
}

// === Helper Functions ===

function createPeerConnection() {
  if (peerConnection) return;
  peerConnection = new RTCPeerConnection(configuration);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("candidate", {
        candidate: event.candidate,
        room: roomName,
      });
    }
  };

  peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById("remoteVideo");
    if (remoteVideo) {
      remoteVideo.srcObject = event.streams[0];
      remoteVideo.style.display = "block";
    } else {
      // create one if not in DOM
      const vid = document.createElement("video");
      vid.id = "remoteVideo";
      vid.autoplay = true;
      vid.playsInline = true;
      vid.style.position = "absolute";
      vid.style.top = "0";
      vid.style.right = "0";
      vid.style.width = "30%";
      vid.style.border = "2px solid white";
      document.body.appendChild(vid);
      vid.srcObject = event.streams[0];
    }
  };
}

function addLocalTracks() {
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
}
