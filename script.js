const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const popup = document.getElementById("popup");
const resultText = document.getElementById("resultText");
const prizeImage = document.getElementById("prizeImage");

// Prize data
const prizes = [
  { name: "Skins", img: "images/skins.png" },
  { name: "Customization", img: "images/customization.png" },
  { name: "Gems", img: "images/gems.png" },
  { name: "Name Tags", img: "images/name_tags.png" },
  { name: "Crowns", img: "images/growns.png" }
];

const center = canvas.width / 2;
let angle = 0;
const arc = (2 * Math.PI) / prizes.length;
let loadedImages = [];
let isSpinning = false;
let spinVelocity = 0;
let spinDeceleration = 0;
let lastTimestamp = 0;

// Color scheme with more vibrant colors
const segmentColors = [
  "#2a75bb", "#ff5722", "#4caf50", "#9c27b0", "#ffeb3b"
];

// Initialize wheel
function initWheel() {
  drawWheelPlaceholder();
  preloadImages(() => {
    drawWheel();
  });
}

function drawWheelPlaceholder() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < prizes.length; i++) {
    drawSegment(i);
  }
  drawCenterCircle();
}

function drawSegment(index) {
  const startAngle = arc * index;
  const endAngle = arc * (index + 1);
  
  // Create gradient for each segment
  const gradient = ctx.createRadialGradient(
    center, center, center * 0.3,
    center, center, center * 0.9
  );
  gradient.addColorStop(0, lightenColor(segmentColors[index], 20));
  gradient.addColorStop(1, segmentColors[index]);
  
  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.moveTo(center, center);
  ctx.arc(center, center, center, startAngle, endAngle);
  ctx.lineTo(center, center);
  ctx.fill();

  // Add segment border
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Add inner segment border
  ctx.beginPath();
  ctx.arc(center, center, center * 0.9, startAngle, endAngle);
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function lightenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`;
}

function preloadImages(callback) {
  let loadedCount = 0;
  prizes.forEach((p, index) => {
    const img = new Image();
    img.src = p.img;
    img.onload = () => {
      loadedImages[index] = img;
      loadedCount++;
      if (loadedCount === prizes.length) callback();
    };
    img.onerror = () => {
      loadedImages[index] = createFallbackImage(index);
      loadedCount++;
      if (loadedCount === prizes.length) callback();
    };
  });
}

function createFallbackImage(index) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  // Create a more attractive fallback image
  ctx.fillStyle = segmentColors[index];
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = "white";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(prizes[index].name, 50, 50);
  
  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < prizes.length; i++) {
    drawSegment(i);
    
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(arc * i + arc / 2);
    
    try {
      if (loadedImages[i]) {
        // Add shadow to prize images
        ctx.shadowColor = "rgba(0,0,0,0.3)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;
        ctx.drawImage(loadedImages[i], center * 0.6 - 40, -80, 80, 80);
        ctx.shadowColor = "transparent";
      }
    } catch (e) {
      console.log("Error drawing image:", e);
    }
    ctx.restore();
  }
  drawCenterCircle();
}

function drawCenterCircle() {
  // Center circle gradient
  const gradient = ctx.createRadialGradient(
    center, center, 0,
    center, center, 50
  );
  gradient.addColorStop(0, "#ffeb3b");
  gradient.addColorStop(1, "#ff9800");
  
  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(center, center, 50, 0, Math.PI * 2);
  ctx.fill();
  
  // Add inner circle for depth
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.arc(center, center, 20, 0, Math.PI * 2);
  ctx.fill();
  
  // Add border
  ctx.strokeStyle = "white";
  ctx.lineWidth = 8;
  ctx.stroke();
  
  // Add outer glow
  ctx.beginPath();
  ctx.arc(center, center, 55, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,235,59,0.5)";
  ctx.lineWidth = 10;
  ctx.stroke();
}

// Spin functionality
spinBtn.addEventListener("click", spinWheel);

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.style.pointerEvents = "none";
  
  // Initial spin parameters
  spinVelocity = 30 + Math.random() * 20; // degrees per frame
  spinDeceleration = 0.2 + Math.random() * 0.1; // deceleration rate
  
  // Add click effect
  spinBtn.style.transform = "translate(-50%, -50%) scale(0.95)";
  setTimeout(() => {
    spinBtn.style.transform = "translate(-50%, -50%) scale(1)";
  }, 100);
  
  lastTimestamp = performance.now();
  requestAnimationFrame(animateSpin);
}

function animateSpin(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  
  // Apply deceleration
  spinVelocity *= Math.pow(0.99, deltaTime / 16);
  
  // Stop condition
  if (spinVelocity < 0.1) {
    spinVelocity = 0;
    stopWheel(angle % 360);
    return;
  }
  
  angle += spinVelocity;
  
  // Draw the wheel with the new angle
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(angle * Math.PI / 180);
  ctx.translate(-center, -center);
  drawWheel();
  ctx.restore();
  
  // Add wobble effect when slowing down
  if (spinVelocity < 5) {
    const wobble = Math.sin(angle * 0.1) * (5 - spinVelocity) * 0.5;
    canvas.style.transform = `rotate(${wobble}deg)`;
  }
  
  requestAnimationFrame(animateSpin);
}

function stopWheel(finalAngle) {
  // Reset wobble
  canvas.style.transform = "rotate(0deg)";
  
  const degrees = (360 - (finalAngle + 90) % 360) % 360;
  const segmentAngle = 360 / prizes.length;
  const prizeIndex = Math.floor(degrees / segmentAngle) % prizes.length;
  
  const wonPrize = prizes[prizeIndex];
  resultText.textContent = `You won ${wonPrize.name}!`;
  prizeImage.src = wonPrize.img;
  
  // Show popup with animation
  popup.style.display = "block";
  createConfetti();
  
  // Reset spin button after a delay
  setTimeout(() => {
    isSpinning = false;
    spinBtn.style.pointerEvents = "auto";
  }, 1000);
}

function createConfetti() {
  const confettiElements = document.querySelectorAll('.confetti');
  confettiElements.forEach((el, index) => {
    // Randomize confetti properties
    const size = Math.random() * 12 + 6;
    const delay = Math.random() * 0.5;
    const duration = Math.random() * 3 + 2;
    const color = segmentColors[Math.floor(Math.random() * segmentColors.length)];
    
    // Apply styles
    el.style.left = Math.random() * 100 + "%";
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.backgroundColor = color;
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
    el.style.animation = `confettiFall ${duration}s ease-in ${delay}s forwards`;
  });
  
  // Reset animation after completion
  setTimeout(() => {
    confettiElements.forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; // Trigger reflow
      el.style.animation = null;
    });
  }, 5000);
}

// Popup controls
window.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.style.display = "none";
  }
});

// Initialize the wheel
initWheel();