const logBox = document.getElementById("log");
const textarea = document.getElementById("code");
const scoreDisplay = document.getElementById("score");

let anomalyScore = 0;
let lastTyped = Date.now();

// Log events
function log(event) {
  const time = new Date().toLocaleTimeString();
  logBox.innerHTML += `[${time}] ${event}<br>`;
  logBox.scrollTop = logBox.scrollHeight;
}

function addScore(pts, reason) {
  anomalyScore += pts;
  scoreDisplay.textContent = `Anomaly Score: ${anomalyScore}`;
  log(`⚠️ ${reason} (+${pts})`);

  if (anomalyScore >= 50) {
    log("🚨 HIGH RISK: Session flagged for review");
    scoreDisplay.style.color = "red";
  }
}

// Detect tab switch
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    addScore(10, "Tab switch detected");
  } else {
    log("✅ Returned to tab");
  }
});

// Detect copy/paste
document.addEventListener("paste", (e) => {
  const pasted = (e.clipboardData || window.clipboardData).getData('text');
  if (pasted.length > 100) {
    addScore(15, `Large paste detected (${pasted.length} chars)`);
  } else {
    addScore(5, "Paste detected");
  }
});

// Typing delay
setInterval(() => {
  const now = Date.now();
  if (now - lastTyped > 20000) {
    addScore(10, "20s of no typing");
    lastTyped = now;
  }
}, 5000);

textarea.addEventListener("keydown", () => {
  lastTyped = Date.now();
});

// Face detection
const video = document.getElementById("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("https://justadudewhohacks.github.io/face-api.js/models")
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => {
      log("❌ Webcam access denied");
      addScore(20, "No webcam access");
    });
}

// Periodic face detection
setInterval(async () => {
  if (!video || video.paused || video.ended) return;

  const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
  if (detections.length === 0) {
    addScore(10, "No face detected");
  } else {
    log(`👤 Face detected (${detections.length})`);
  }
}, 7000);
