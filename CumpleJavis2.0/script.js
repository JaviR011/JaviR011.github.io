const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const root=document.documentElement;
const nav=document.querySelector('.mini-nav');
const glow=document.getElementById('cursorGlow');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

function progress(el){const r=el.getBoundingClientRect();return clamp((-r.top)/(el.offsetHeight-innerHeight));}
function paint(){
  nav.classList.toggle('scrolled',scrollY>30);
  if(!reduce){
    const hero=document.querySelector('[data-scene="hero"]');
    const hp=progress(hero);
    root.style.setProperty('--moon-scale',(.25+hp*1.35).toFixed(3));
    root.style.setProperty('--moon-opacity',(.18+hp*.62).toFixed(3));
    root.style.setProperty('--title-scale',(1+hp*.18).toFixed(3));
    root.style.setProperty('--title-opacity',String(clamp(1-hp*1.45)));
    root.style.setProperty('--hero-small',String(clamp(1-hp*2)));
    root.style.setProperty('--pumpkin-scale',(.45+hp*.9).toFixed(3));
    root.style.setProperty('--pumpkin-opacity',String(clamp((hp-.12)*2.2)));
    root.style.setProperty('--age-opacity',String(clamp((hp-.48)*2.8)));
    root.style.setProperty('--age-y',`${(1-clamp((hp-.48)*2.8))*50}px`);
    root.style.setProperty('--ghost-x',`${-120+hp*250}px`);
    root.style.setProperty('--ghost-y',`${hp*90}px`);
    root.style.setProperty('--cue-opacity',String(clamp(1-hp*5)));

    const contest=document.querySelector('[data-scene="contest"]');
    const cp=progress(contest);
    root.style.setProperty('--outline-x',`${cp*-18}vw`);
    root.style.setProperty('--contest-y',`${(1-clamp(cp*2.2))*60}px`);
    root.style.setProperty('--contest-opacity',String(clamp(cp*2.2)));
    root.style.setProperty('--pumpkins-y',`${250-cp*330}px`);

    const date=document.querySelector('[data-scene="date"]');
    const dp=progress(date);
    root.style.setProperty('--date-scale',(.7+clamp(dp*1.5)*.3).toFixed(3));
    root.style.setProperty('--date-opacity',String(.2+clamp(dp*1.7)*.8));
  }
}
let ticking=false;addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(()=>{paint();ticking=false});ticking=true}},{passive:true});paint();

if(glow)addEventListener('pointermove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.observe').forEach(el=>observer.observe(el));

// Fecha tentativa: 17 de octubre de 2026. Cambia la hora aquí cuando esté confirmada.
const partyDate=new Date('2026-10-17T18:00:00-06:00');
const $=id=>document.getElementById(id);
function countdown(){
  let diff=Math.max(0,partyDate-Date.now());
  const d=Math.floor(diff/86400000); diff%=86400000;
  const h=Math.floor(diff/3600000); diff%=3600000;
  const m=Math.floor(diff/60000); const s=Math.floor((diff%60000)/1000);
  $('days').textContent=String(d).padStart(2,'0');$('hours').textContent=String(h).padStart(2,'0');$('mins').textContent=String(m).padStart(2,'0');$('secs').textContent=String(s).padStart(2,'0');
}
countdown();setInterval(countdown,1000);
