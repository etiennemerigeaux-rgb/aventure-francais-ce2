// Contrôle complet sur téléphone : initiation, 20 missions, surligneurs multicolores, reprise.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('dialog',d=>d.accept());
 try{
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
   localStorage.setItem('ce2_v82526_clean_profiles',JSON.stringify({activeId:'p-pilot',profiles:{'p-pilot':{name:'Test',firstName:'Test',tutorialDone:true,challengeUnlocked:true}}}));
   localStorage.setItem('ce2_challenge_v8254_p-pilot',JSON.stringify({
    tutorialDone:true,practice4Done:true,history:{'C1-01':{best:18}},drawBags:{}
   }));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#resume-adventure').click();
  await page.evaluate(()=>window.ce2OpenChallengeWithGate());
  assert.equal(await page.locator('[data-level="1"]').isEnabled(),true);
  const data=await page.evaluate(()=>window.CE2_CHALLENGE_PILOT.stories);
  async function enter(level){
   await page.locator('[data-level="'+level+'"]').click();
   assert(await page.locator('#ch-pilot-story').isVisible(),'Bouton du pilote introuvable pour '+level);
   await page.locator('#ch-pilot-story').click();
   for(let i=0;i<3;i++){
    assert.match(await page.locator('.ch-over').first().innerText(),new RegExp('Initiation.+ '+(i+1)+' / 3'));
    assert.match(await page.locator('#challenge-root').innerText(),/Cette initiation n’est pas notée/);
    if(i===1){
     assert(await page.locator('#ch-pilot-next').isDisabled(),'La démonstration est obligatoire avant de commencer');
     const demo=level===1?[[1,1],[8,0]]:[[1,4],[3,4],[2,3]];
     for(const [word,color] of demo){
      await page.locator('[data-pilot-demo-color="'+color+'"]').click();
      await page.locator('[data-pilot-demo-word="'+word+'"]').click();
     }
     assert(await page.locator('#ch-pilot-next').isEnabled(),'Les bonnes couleurs doivent valider la démonstration');
    }
    await page.locator('#ch-pilot-next').click();
   }
  }
  async function run(level){
   const missions=data[level===1?'C2-01':'C3-01'];
   for(let i=0;i<10;i++){
    const m=missions[i];
    assert.match(await page.locator('.ch-task').first().innerText(),/Étape 1 sur 2/);
    if(i===0&&level===1){
     await page.locator('#ch-pilot-check').click();
     assert.match(await page.locator('#ch-feedback').innerText(),/Ce n’est pas encore ça/);
    }
    for(const [word,color] of m.evidence){
     await page.locator('[data-pilot-color="'+color+'"]').click();
     await page.locator('[data-pilot-word="'+word+'"]').click();
    }
    assert.equal(await page.locator('.ch-pilot-excerpt .ch-marked').count(),m.evidence.length,'Les couleurs doivent rester toutes visibles');
    await page.locator('#ch-pilot-check').click();
    assert.match(await page.locator('.ch-task').first().innerText(),/Étape 2 sur 2/);
    assert.equal(await page.locator('.ch-pilot-proof .ch-marked').count(),m.evidence.length,'Preuves disparues de la question');
    const answer=(i===1&&level===1)?(m.correct+1)%4:m.correct;
    await page.locator('[data-pilot-choice="'+answer+'"]').click();
    await page.locator('#ch-check').click();
    if(i===1&&level===1){
     assert(await page.locator('#ch-retry').isVisible(),'L’erreur doit permettre un nouvel essai sans points');
     await page.locator('#ch-retry').click();
     await page.locator('[data-pilot-choice="'+m.correct+'"]').click();
     await page.locator('#ch-check').click();
    }
    assert(await page.locator('#ch-next').isVisible(),'Le bouton suivant manque : '+m.id);
    await page.locator('#ch-next').click();
    if(i===1&&level===1){
     await page.locator('#ch-quit').click();
     assert(await page.locator('#ch-resume-story').isVisible(),'La reprise de la partie doit exister');
     await page.locator('#ch-resume-story').click();
     assert.match(await page.locator('.ch-task').first().innerText(),/Étape 1 sur 2/);
    }
   }
   const score=level===1?18:20;
   assert.equal((await page.locator('.ch-score').innerText()).trim(),score+'/20');
   await page.locator('#ch-levels-return').click();
  }
  await enter(1);
  await run(1);
  assert.equal(await page.locator('[data-level="2"]').isEnabled(),true);
  await enter(2);
  await run(2);
  await page.locator('[data-level="1"]').click();
  await page.locator('#ch-pilot-intro').click();
  assert.match(await page.locator('.ch-over').first().innerText(),/Initiation Expert/);
  await page.locator('#ch-pilot-back').click();
  const overflow=await page.evaluate(()=>({w:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(overflow.scroll<=overflow.w+4,'Débordement horizontal : '+JSON.stringify(overflow));
  assert.equal(errors.length,0,'Erreurs JS : '+errors.join(' ; '));
  console.log('Chromium mobile : 20 missions pilotes, initiations, deux surligneurs, aide, correction, reprise, scores et progression validés.');
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
