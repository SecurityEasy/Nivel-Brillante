// 🎯 Premio fijo al que siempre debe caer
const fixedPremio = "1 VL103M\n+ 10 SIM Telcel";

let premios = [
  "1 GT06N\n+1 VL103M\n+ 10 SIM Telcel",
  "1 GT06N\n+ 1 ET200N\n 2 renovaciones\nanuales\n+ 5 SIM Telcel",
  "Envío Gratis\nó 2 renovaciones\nde 10 años\n+ 5 SIM Telcel",
  "1 VL103M\n+ 10 SIM Telcel",
];

premios = shuffleArray(premios);
const colors = ["#c62828", "#f78f1e", "#fce8d5", "#f78f1e"];

const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spin");
const resultado = document.getElementById("resultado");
const fuego = document.getElementById("fuego");

const token = new URLSearchParams(window.location.search).get("token");
let girado = false;

const endpoint = "https://script.google.com/macros/s/AKfycbx-6Yazj817sclXp5RjOwArnXeKjWDNBE5Hpaqu4bWPJhNriI5khrltiCeP6_HrawRw7g/exec";

// 🔒 Verifica si el token ya fue usado
fetch(`${endpoint}?check=${token}`)
  .then((res) => res.text())
  .then((res) => {
    if (res === "YA_USADO") {
      girado = true;
      spinButton.disabled = true;
      spinButton.textContent = "YA GIRASTE 🎉";
      spinButton.style.backgroundColor = "#555";
      spinButton.style.cursor = "not-allowed";
      alert("Este token ya fue utilizado. No puedes girar la ruleta más de una vez.");
    }
  });

let canvasSize = 500;

function resizeCanvas() {
  canvasSize = Math.min(window.innerWidth * 0.9, 500);
  canvas.width = canvasSize;
  canvas.height = canvasSize;
}

function shuffleArray(arr) {
  let array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function drawWheel() {
  const numPremios = premios.length;
  const arc = (2 * Math.PI) / numPremios;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = canvas.width / 2;

  for (let i = 0; i < numPremios; i++) {
    const angle = i * arc;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + arc);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = "#000";
    ctx.translate(cx, cy);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.font = `${canvasSize * 0.045}px Arial`;
    const lines = premios[i].split("\n");
    for (let j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], radius - 10, (j - 0.5) * 20);
    }
    ctx.restore();
  }
}

let angle = 0;
let isSpinning = false;

let angle = 195; // Comienza apuntando a otro premio visualmente
let isSpinning = false;

function findAgle() {
  const fixedIndex = premios.findIndex((p) => p.includes("1 VL103M + 10 SIM Telcel");
  const degreesPerPrize = 360 / premios.length;
  const pointerOffset = -degreesPerPrize; // 🔺 Donde apunta el fueguito (arriba)
  const targetAngle =
    360 - (fixedIndex * degreesPerPrize + degreesPerPrize / 2) + pointerOffset;
  const rotation = 360 * 5 + targetAngle - angle;
  return [rotation, fixedIndex];
}

function spinWheel() {
  if (!token) return alert("No tienes un token válido.");
  if (girado) return alert("Ya has girado la ruleta.");

  isSpinning = true;
  const [rotation, fixedIndex] = findAngle();
  const duration = 5000;
  const start = performance.now();

  function animate(time) {
    let progress = (time - start) / duration;
    if (progress > 1) progress = 1;
    angle = rotation * progress;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawWheel();
    ctx.restore();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      const premio = premios[fixedIndex];
      resultado.textContent = "¡Felicidades! Ganaste: " + premio;

      fetch(`${endpoint}?token=${token}&premio=${encodeURIComponent(premio)}`)
        .then((res) => res.text())
        .then((data) => {
          girado = true;
          spinButton.disabled = true;
          fuego.style.visibility = "visible";
          spinButton.textContent = "YA GIRASTE 🎉";
          spinButton.style.backgroundColor = "#555";
          spinButton.style.cursor = "not-allowed";
        });
    }
  }

  requestAnimationFrame(animate);
}

resizeCanvas();
drawWheel();
window.addEventListener("resize", () => {
  resizeCanvas();
  drawWheel();
});

spinButton.addEventListener("click", () => {
  if (!isSpinning) spinWheel();
});
