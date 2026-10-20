/* V62: single-screen presentation of existing CE2 engine; no change to saved-data keys. */
(function(){'use strict';
const root=document.getElementById('app');if(!root)return;
let active='accueil',scheduled=false;
function isHome(){try{return mode==='home'}catch(e){return false}}
function nav(){let el=document.querySelector('.wow-tabs');if(el)return el;el=document.createElement('nav');el.className='wow-tabs';el.setAttribute('aria-label','Navigation du jeu');const tabs=[['accueil','⌂','Accueil'],['mondes','✦','Mondes'],['heros','♛','Héros'],['bonus','★','Bonus']];tabs.forEach(([id,symbol,label])=>{const b=document.createElement('button');b.type='button';b.className='wow-tab';b.dataset.tab=id;b.innerHTML='<span aria-hidden="true">'+symbol+'</span>'+label;b.onclick=()=>select(id);el.append(b)});root.parentNode.insertBefore(el,root);return el}
function screen(id){let e=document.createElement('section');e.className='wow-screen wow-'+id;e.dataset.screen=id;return e}
function select(id){active=id;document.querySelectorAll('.wow-screen').forEach(e=>e.hidden=e.dataset.screen!==id);document.querySelectorAll('.wow-tab').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.tab===id)));window.scrollTo({top:0,behavior:'instant'})}
function build(){if(!isHome()){const n=document.querySelector('.wow-tabs');if(n)n.hidden=true;return}const n=nav();n.hidden=false;
 root.querySelectorAll(':scope > .wow-screen').forEach(e=>e.remove());
 const stage=root.querySelector(':scope > .royal-stage');const map=root.querySelector('.map-panel');if(!stage||!map)return;
 const panels=[...root.children].filter(e=>e.classList.contains('panel')&&e!==map);
 const welcome=screen('accueil');welcome.append(stage);const explore=document.createElement('button');explore.className='royal-cta';explore.textContent='✦ Explorer les cinq mondes';explore.style.margin='0 0 15px';explore.onclick=()=>select('mondes');welcome.append(explore);root.append(welcome);
 const worlds=screen('mondes');const title=document.createElement('div');title.className='wow-hero-intro';title.innerHTML='<h2>La carte du royaume</h2><p>Cinq aventures extraordinaires t’attendent !</p>';worlds.append(title,map);root.append(worlds);
 const heroes=screen('heros');heroes.innerHTML='<div class="wow-hero-intro"><h2>Choisis ton compagnon</h2><p>Douze héros, douze personnalités !</p></div>';
 const hp=document.createElement('div');hp.className='wow-hero-panel';const avatarbar=root.querySelector('.avatarbar');if(avatarbar){const gallery=document.createElement('div');gallery.className='wow-hero-grid';avatarbar.querySelectorAll('.avatar').forEach(b=>gallery.append(b.cloneNode(true)));gallery.querySelectorAll('button').forEach(b=>{const old=b.getAttribute('onclick');b.removeAttribute('onclick');const m=old&&old.match(/setAvatar\((\d+)\)/);if(m)b.onclick=()=>{setAvatar(Number(m[1]));active='heros'}});hp.append(gallery)}heroes.append(hp);root.append(heroes);
 const bonus=screen('bonus');bonus.innerHTML='<div class="wow-hero-intro"><h2>Mes trésors et défis</h2><p>Collectionne des récompenses et continue tes progrès.</p></div>';panels.forEach(p=>bonus.append(p));root.append(bonus);
 // Keep native home functions accessible while presenting a scene at a time.
 stage.querySelector('.royal-cta')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();select('mondes')},true);
 select(active);
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;try{build()}catch(e){console.error('V62 navigation',e)}})}
// Observe only the app root being replaced by the existing game's el() function.
const mo=new MutationObserver(()=>{if(!isHome())return;const stage=root.querySelector(':scope > .royal-stage');if(stage&&!root.querySelector(':scope > .wow-screen'))schedule()});mo.observe(root,{childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('pageshow',()=>{if(isHome())schedule()});
})();