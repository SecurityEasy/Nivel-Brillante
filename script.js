let premios = [
  "1 GT06N\n+1 VL103M\n+ 10 SIM Telcel",
  "1 GT06N\n+ 1 ET200N\n2 renovaciones\nanuales\n+ 5 SIM Telcel",
  "Envío Gratis\nó 2 renovaciones\nde 10 años\n+ 5 SIM Telcel",
  "1 VL103M\n+ 10 SIM Telcel", // 🎯 Premio truqueado
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
let puedeGirar = false; // ✅ Nueva bandera de control

const endpoint = "https://script.google.com/macros/s/AKfycbzXSDvrxxZ4oQZ8bFHiBl8EUFDOrKvx01YmxIkxOWmLcTmA-PPvQRWrLdggN0SZYEUr/exec";

// ✅ Validación del token antes de dejar girar
fetch(`${endpoint}?check=${token}`)
  .then(res => res.text())
  .then(res => {
    console.log("🧾 Respuesta de validación:", res);

    if (res === "YA_USADO") {
      girado = true;
      spinButton.disabled = true;
      spinButton.textContent = "YA USADO";
      alert("Este token ya fue utilizado. No puedes girar la ruleta más de una vez.");
    } else if (res === "NO_USADO") {
      console.log("✅ Token válido, puede girar.");
      puedeGirar = true;
    } else if (res === "Token no encontrado.") {
      girado = true;
      spinButton.disabled = true;
      spinButton.textContent = "NO VÁLIDO";
      alert("❌ Token no encontrado. Verifica tu enlace o si ya expiró.");
    } else {
      console.warn("⚠️ Respuesta inesperada:", res);
    }
  })
  .catch(err => {
    console.error("❌ Error al validar token:", err);
  });

let canvasSize = 500;

function resizeCanvas() {
  canvasSize = Math.min(window.innerWidth * 0.9, 500);
  canvas.width = canvasSize;
  canvas.height = canvasSize;
}

// 🔀 Mezcla visual
function shuffleArray(arr) {
  let array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 🎨 Dibujo con offset
function drawWheel(rotationOffset = 0) {
  const numPremios = premios.length;
  const arc = (2 * Math.PI) / numPremios;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = canvas.width / 2;

  for (let i = 0; i < numPremios; i++) {
    const angle = i * arc + (rotationOffset * Math.PI / 180);
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

resizeCanvas();
drawWheel();
window.addEventListener("resize", () => {
  resizeCanvas();
  drawWheel();
});

let angle = 0;
let isSpinning = false;
const fixedPremio = "1 VL103M\n+ 10 SIM Telcel"; // 👑 Truqueado

const fixedIndex = premios.findIndex(p =>
  p.replace(/\n/g, " ").trim() === fixedPremio.replace(/\n/g, " ").trim()
);

function findAngle() {
  if (fixedIndex === -1) {
    console.error("❌ Premio no encontrado");
    return [0, 0];
  }

  const sliceAngle = 360 / premios.length;
  const middleOfSlice = sliceAngle * fixedIndex + sliceAngle / 2;
  const rotation = 5 * 360 + 90 - middleOfSlice; // Fuego está en 90°
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
    drawWheel(angle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      isSpinning = false;
      const premio = premios[fixedIndex];
      resultado.textContent = "🎉 ¡Felicidades! Ganaste: " + premio;
      fuego.style.visibility = "visible";

      const premioLimpio = premio.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
      console.log("🌀 Enviando premio:", premioLimpio);
      console.log("➡️ URL:", `${endpoint}?token=${token}&premio=${encodeURIComponent(premioLimpio)}`);

      fetch(`${endpoint}?token=${token}&premio=${encodeURIComponent(premioLimpio)}`)
        .then(res => res.text())
        .then(data => {
          console.log("🎯 Respuesta del servidor:", data);
          girado = true;
          spinButton.disabled = true;
        });
    }
  }

  requestAnimationFrame(animate);
}

// ✅ Solo gira si el token ya fue validado
spinButton.addEventListener("click", () => {
  if (!isSpinning && puedeGirar) {
    spinWheel();
  } else if (!puedeGirar) {
    alert("⏳ Validando token... espera un momento por favor.");
  }
});
</script>
