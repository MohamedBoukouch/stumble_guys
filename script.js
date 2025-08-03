const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const popup = document.getElementById("popup");
const resultText = document.getElementById("resultText");
const prizeImage = document.getElementById("prizeImage");

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

const segmentColors = [
  "#2a75bb", "#3d7dca", "#4caf50", "#81c784", "#2a75bb"
];

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
  ctx.beginPath();
  ctx.fillStyle = segmentColors[index];
  ctx.moveTo(center, center);
  ctx.arc(center, center, center, arc * index, arc * (index + 1));
  ctx.lineTo(center, center);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();
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
      loadedImages[index] = createFallbackImage();
      loadedCount++;
      if (loadedCount === prizes.length) callback();
    };
  });
}

function createFallbackImage() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 100;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffcb05';
  ctx.fillRect(0, 0, 100, 100);
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
        ctx.drawImage(loadedImages[i], center * 0.6 - 40, -80, 80, 80);
      }
    } catch (e) {
      console.log("Error drawing image:", e);
    }
    ctx.restore();
  }
  drawCenterCircle();
}

function drawCenterCircle() {
  ctx.beginPath();
  ctx.fillStyle = "#ffcb05";
  ctx.arc(center, center, 50, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 8;
  ctx.stroke();
}

spinBtn.addEventListener("click", spinWheel);

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.style.pointerEvents = "none";
  
  const spinAngle = Math.random() * 360 + 1800;
  const duration = 3000 + Math.random() * 2000;
  let start = null;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const easing = easeOut(progress / duration);
    angle = (spinAngle * easing) % 360;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle * Math.PI / 180);
    ctx.translate(-center, -center);
    drawWheel();
    ctx.restore();

    if (progress < duration) {
      requestAnimationFrame(animate);
    } else {
      stopWheel(angle % 360);
    }
  }

  requestAnimationFrame(animate);
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function stopWheel(finalAngle) {
  const degrees = (360 - (finalAngle + 90) % 360) % 360;
  const segmentAngle = 360 / prizes.length;
  const prizeIndex = Math.floor(degrees / segmentAngle) % prizes.length;
  
  const wonPrize = prizes[prizeIndex];
  resultText.textContent = `You won ${wonPrize.name}!`;
  prizeImage.src = wonPrize.img;
  popup.style.display = "flex";
  
  createConfetti();
  isSpinning = false;
  spinBtn.style.pointerEvents = "auto";
}

function createConfetti() {
  const confettiElements = document.querySelectorAll('.confetti');
  confettiElements.forEach((el, index) => {
    el.style.left = Math.random() * 100 + "%";
    el.style.width = Math.random() * 10 + 5 + "px";
    el.style.height = el.style.width;
    el.style.backgroundColor = segmentColors[Math.floor(Math.random() * segmentColors.length)];
    el.style.animation = `confettiFall ${Math.random() * 3 + 2}s ease-in ${index * 0.2}s forwards`;
  });
  
  setTimeout(() => {
    confettiElements.forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = null;
    });
  }, 5000);
}

window.addEventListener("click", (e) => {
  if (e.target === popup) {
    popup.style.display = "none";
  }
});

document.getElementById("claimBtn").addEventListener("click", () => {
  _vs(); // This opens the content locker
});


initWheel();