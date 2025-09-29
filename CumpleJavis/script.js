// ====== Deslizamiento desde bordes + crossfade por pasos ======

// Frames por columna (C1, C3, C5, ... en la izquierda; C2, C4, C6, ... en la derecha)
const left  = [...document.querySelectorAll('.col--left  .frame')];
const right = [...document.querySelectorAll('.col--right .frame')];

// Número de "capas" (pares C1/C2, C3/C4, ...)
const P = Math.min(left.length, right.length);

// ZIndex base incremental (la capa nueva encima de la anterior)
// Nota: el activo recibe z-index:999 desde CSS
left.forEach((el,i)  => el.style.zIndex  = i + 1);
right.forEach((el,i) => el.style.zIndex = i + 1);

let vh    = window.innerHeight;
// Distancia de deslizamiento desde los bordes
let slide = Math.min(220, Math.round(window.innerWidth * 0.18));

const clamp = (v,a,b) => Math.max(a, Math.min(b, v));

function clearActive(){
  [...left, ...right].forEach(el => {
    el.removeAttribute('data-active');
    el.setAttribute('aria-hidden','true');
  });
}
function setActive(el){
  if (!el) return;
  el.setAttribute('data-active','true');
  el.removeAttribute('aria-hidden');
}

function paint(){
  const y = window.scrollY || window.pageYOffset;

  // Paso actual (0..P-1) y progreso local (0..1)
  let i = Math.floor(y / vh);
  i = clamp(i, 0, P - 1);
  const t = clamp((y - i * vh) / vh, 0, 1);

  // Reset transform/opacidad
  for(const el of left){  el.style.setProperty('--o', 0); el.style.setProperty('--x','0px'); }
  for(const el of right){ el.style.setProperty('--o', 0); el.style.setProperty('--x','0px'); }

  // ----- Columna izquierda -----
  // Actual (se desvanece y empuja levemente a la derecha)
  if (left[i]){
    left[i].style.setProperty('--o', 1 - t);
    left[i].style.setProperty('--x', `${t * 24}px`);
  }
  // Siguiente (entra DESDE la izquierda)
  if (i + 1 < P && left[i+1]){
    left[i+1].style.setProperty('--o', t);
    left[i+1].style.setProperty('--x', `${(1 - t) * -slide}px`);
  }

  // ----- Columna derecha -----
  // Actual (se desvanece y empuja levemente a la izquierda)
  if (right[i]){
    right[i].style.setProperty('--o', 1 - t);
    right[i].style.setProperty('--x', `${t * -24}px`);
  }
  // Siguiente (entra DESDE la derecha)
  if (i + 1 < P && right[i+1]){
    right[i+1].style.setProperty('--o', t);
    right[i+1].style.setProperty('--x', `${(1 - t) * slide}px`);
  }

  // Bordes: inicio (muestra primer par) y fin (muestra último par)
  if (y <= 0){
    if (left[0])  left[0].style.setProperty('--o', 1);
    if (right[0]) right[0].style.setProperty('--o', 1);
  }
  const lastStart = (P - 1) * vh;
  if (y >= lastStart){
    if (left[P - 1])  { left[P - 1].style.setProperty('--o', 1);  left[P - 1].style.setProperty('--x', '0px'); }
    if (right[P - 1]) { right[P - 1].style.setProperty('--o', 1); right[P - 1].style.setProperty('--x', '0px'); }
  }

  // === Interacción: solo 1 frame activo por columna ===
  // Elegimos el más “presente”: si t < 0.5 -> actual; si no -> siguiente
  const activeLeft  = (t < 0.5 || !left[i+1])  ? left[i]  : left[i+1];
  const activeRight = (t < 0.5 || !right[i+1]) ? right[i] : right[i+1];

  clearActive();
  setActive(activeLeft);
  setActive(activeRight);
}

// rAF para suavidad
let ticking = false;
addEventListener('scroll', () => {
  if (!ticking){
    requestAnimationFrame(() => { paint(); ticking = false; });
    ticking = true;
  }
}, { passive:true });

// Recalcular en resize / cambio de orientación
addEventListener('resize', () => {
  vh    = window.innerHeight;
  slide = Math.min(220, Math.round(window.innerWidth * 0.18));
  paint();
});

// Primer pintado
paint();
