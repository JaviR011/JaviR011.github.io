// ====== Responsivo: Desktop (2 columnas) y Móvil (un C a la vez) ======

// Colecciones por columna (como antes)
let left  = [...document.querySelectorAll('.col--left  .frame')];
let right = [...document.querySelectorAll('.col--right .frame')];

// Secuencia móvil (C1, C2, C3, C4, ...) -> la calculamos intercalando
function buildMobileSequence(){
  const L = left.length, R = right.length;
  const maxLen = Math.max(L, R);
  const seq = [];
  for (let i=0; i<maxLen; i++){
    if (left[i])  seq.push(left[i]);   // C1, C3, C5…
    if (right[i]) seq.push(right[i]);  // C2, C4, C6…
  }
  return seq;
}

let seqMobile = buildMobileSequence();

// Número de pares (desktop) y de frames (mobile)
let P_desktop = Math.min(left.length, right.length);
let P_mobile  = seqMobile.length;

// z-index base incremental (la capa nueva encima de la anterior)
left.forEach((el,i)  => el.style.zIndex  = i + 1);
right.forEach((el,i) => el.style.zIndex = i + 1);

// Distancias base
let vh    = window.innerHeight;
let slide = Math.min(220, Math.round(window.innerWidth * 0.18));

const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
const MOBILE_Q = window.matchMedia('(max-width: 768px)');

function clearActiveAll(){
  [...left, ...right].forEach(el => {
    el.removeAttribute('data-active');
    el.setAttribute('aria-hidden','true');
    // reset (por si vienes de otro modo)
    el.style.setProperty('--o', 0);
    el.style.setProperty('--x', '0px');
  });
}

/* ---------- Pintado Desktop (2 columnas por pares) ---------- */
function paintDesktop(){
  const y = window.scrollY || window.pageYOffset;
  let i = Math.floor(y / vh);
  i = clamp(i, 0, P_desktop - 1);
  const t = clamp((y - i * vh) / vh, 0, 1);

  // Reset transform/opacidad
  for(const el of left){  el.style.setProperty('--o', 0); el.style.setProperty('--x','0px'); }
  for(const el of right){ el.style.setProperty('--o', 0); el.style.setProperty('--x','0px'); }

  // Izquierda: actual sale, siguiente entra desde IZQ
  if (left[i]){
    left[i].style.setProperty('--o', 1 - t);
    left[i].style.setProperty('--x', `${t * 24}px`);
  }
  if (i + 1 < P_desktop && left[i+1]){
    left[i+1].style.setProperty('--o', t);
    left[i+1].style.setProperty('--x', `${(1 - t) * -slide}px`);
  }

  // Derecha: actual sale, siguiente entra desde DER
  if (right[i]){
    right[i].style.setProperty('--o', 1 - t);
    right[i].style.setProperty('--x', `${t * -24}px`);
  }
  if (i + 1 < P_desktop && right[i+1]){
    right[i+1].style.setProperty('--o', t);
    right[i+1].style.setProperty('--x', `${(1 - t) * slide}px`);
  }

  // Bordes
  if (y <= 0){
    if (left[0])  left[0].style.setProperty('--o', 1);
    if (right[0]) right[0].style.setProperty('--o', 1);
  }
  const lastStart = (P_desktop - 1) * vh;
  if (y >= lastStart){
    if (left[P_desktop - 1])  { left[P_desktop - 1].style.setProperty('--o', 1);  left[P_desktop - 1].style.setProperty('--x', '0px'); }
    if (right[P_desktop - 1]) { right[P_desktop - 1].style.setProperty('--o', 1); right[P_desktop - 1].style.setProperty('--x', '0px'); }
  }

  // Interacción: 1 activo por columna
  const activeLeft  = (t < 0.5 || !left[i+1])  ? left[i]  : left[i+1];
  const activeRight = (t < 0.5 || !right[i+1]) ? right[i] : right[i+1];

  [...left, ...right].forEach(el => { el.removeAttribute('data-active'); el.setAttribute('aria-hidden','true'); });
  if (activeLeft){  activeLeft.setAttribute('data-active','true');  activeLeft.removeAttribute('aria-hidden'); }
  if (activeRight){ activeRight.setAttribute('data-active','true'); activeRight.removeAttribute('aria-hidden'); }
}

/* ---------- Pintado Mobile (un C a la vez) ---------- */
function paintMobile(){
  const y = window.scrollY || window.pageYOffset;
  let i = Math.floor(y / vh);
  i = clamp(i, 0, P_mobile - 1);
  const t = clamp((y - i * vh) / vh, 0, 1);

  // Reset todos
  for(const el of seqMobile){ el.style.setProperty('--o', 0); el.style.setProperty('--x','0px'); }

  const current = seqMobile[i];
  const next    = seqMobile[i + 1];

  // current se desvanece, leve empuje según su origen
  if (current){
    const fromLeft = current.closest('.col--left') !== null;
    current.style.setProperty('--o', 1 - t);
    current.style.setProperty('--x', fromLeft ? `${t * 24}px` : `${t * -24}px`);
  }

  // next aparece desde el borde SEGÚN su columna de origen
  if (next){
    const fromLeft = next.closest('.col--left') !== null;
    next.style.setProperty('--o', t);
    next.style.setProperty('--x', fromLeft ? `${(1 - t) * -slide}px` : `${(1 - t) * slide}px`);
  }

  // Bordes
  if (y <= 0 && seqMobile[0]){
    seqMobile[0].style.setProperty('--o', 1);
    seqMobile[0].style.setProperty('--x', '0px');
  }
  const lastStart = (P_mobile - 1) * vh;
  if (y >= lastStart && seqMobile[P_mobile - 1]){
    seqMobile[P_mobile - 1].style.setProperty('--o', 1);
    seqMobile[P_mobile - 1].style.setProperty('--x', '0px');
  }

  // Interacción: solo 1 activo (el más “presente”)
  seqMobile.forEach(el => { el.removeAttribute('data-active'); el.setAttribute('aria-hidden','true'); });
  const active = (t < 0.5 || !next) ? current : next;
  if (active){ active.setAttribute('data-active','true'); active.removeAttribute('aria-hidden'); }
}

/* ---------- Orquestador según modo ---------- */
function paint(){
  if (MOBILE_Q.matches) paintMobile();
  else                 paintDesktop();
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
function recalc(){
  // Recolecta otra vez por si se agregaron/quitaron frames
  left  = [...document.querySelectorAll('.col--left  .frame')];
  right = [...document.querySelectorAll('.col--right .frame')];
  seqMobile = buildMobileSequence();

  P_desktop = Math.min(left.length, right.length);
  P_mobile  = seqMobile.length;

  vh    = window.innerHeight;
  slide = Math.min(220, Math.round(window.innerWidth * 0.18));

  // Limpia estados y pinta
  clearActiveAll();
  paint();
}
addEventListener('resize', recalc);
MOBILE_Q.addEventListener?.('change', recalc); // algunos navegadores

// Primer pintado
recalc();
