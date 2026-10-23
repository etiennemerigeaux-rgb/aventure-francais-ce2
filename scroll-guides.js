/* V82.5.37 : aides de défilement, sans modifier le jeu. */
(()=>{'use strict';
  const panel=document.createElement('div');panel.id='scroll-guides';panel.setAttribute('aria-label','Défilement de la page');
  panel.innerHTML='<button type="button" id="scroll-guide-up" aria-label="Remonter dans la page" title="Monter">'+'<svg class="enchanted-arrow" viewBox="0 0 50 62" aria-hidden="true" focusable="false"><defs><linearGradient id="enchanted-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c9"/><stop offset=".43" stop-color="#e5b85d"/><stop offset="1" stop-color="#8260b9"/></linearGradient></defs><path class="arrow-head" d="M25 4 L46 40 L31 34 L25 55 L19 34 L4 40 Z" fill="url(#enchanted-metal)" stroke="#f9dc88" stroke-width="1.7" stroke-linejoin="round"/><path d="M25 9 L25 45" stroke="#fff8d7" stroke-width="2" opacity=".85"/><path d="M40 6 L42 11 L47 13 L42 15 L40 20 L38 15 L33 13 L38 11 Z" fill="#c4f5ff"/></svg>'+'</button><button type="button" id="scroll-guide-down" aria-label="Descendre dans la page" title="Descendre">'+'<svg class="enchanted-arrow" viewBox="0 0 50 62" aria-hidden="true" focusable="false"><defs><linearGradient id="enchanted-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6c9"/><stop offset=".43" stop-color="#e5b85d"/><stop offset="1" stop-color="#8260b9"/></linearGradient></defs><path class="arrow-head" d="M25 4 L46 40 L31 34 L25 55 L19 34 L4 40 Z" fill="url(#enchanted-metal)" stroke="#f9dc88" stroke-width="1.7" stroke-linejoin="round"/><path d="M25 9 L25 45" stroke="#fff8d7" stroke-width="2" opacity=".85"/><path d="M40 6 L42 11 L47 13 L42 15 L40 20 L38 15 L33 13 L38 11 Z" fill="#c4f5ff"/></svg>'+'</button>';
  document.body.appendChild(panel);
  const up=panel.querySelector('#scroll-guide-up'),down=panel.querySelector('#scroll-guide-down');
  let target=null,scheduled=false;
  const scrollable=el=>el && el.scrollHeight>el.clientHeight+12 && ['auto','scroll','overlay'].includes(getComputedStyle(el).overflowY);
  function choose(){
    const active=document.activeElement;
    if(active){let e=active;while(e&&e!==document.body){if(scrollable(e)&&!e.closest('#scroll-guides'))return e;e=e.parentElement;}}
    const scene=document.getElementById('scene');
    if(scrollable(scene))return scene;
    const candidates=scene?[scene,...scene.querySelectorAll('*')]:[];
    for(const el of candidates){if(scrollable(el) && el.getBoundingClientRect().height>90)return el;}
    return document.scrollingElement||document.documentElement;
  }
  function refresh(){scheduled=false;target=choose();const max=Math.max(0,target.scrollHeight-target.clientHeight);const pos=target.scrollTop;
    const canUp=max>14&&pos>8,canDown=max>14&&pos<max-8;
    up.hidden=!canUp;down.hidden=!canDown;panel.hidden=!(canUp||canDown);
  }
  function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(refresh);}}
  function step(dir){target=choose();target.scrollBy({top:dir*Math.max(220,Math.round(target.clientHeight*.72)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});schedule();}
  up.addEventListener('click',()=>step(-1));down.addEventListener('click',()=>step(1));
  window.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('click',schedule,{passive:true});
  const scene=document.getElementById('scene');
  if(scene)new MutationObserver(schedule).observe(scene,{childList:true,subtree:true});
  setInterval(schedule,1200);schedule();
})();