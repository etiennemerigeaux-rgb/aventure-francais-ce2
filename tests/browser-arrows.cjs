// Parcours mobile Chromium : flèches dans Challenge + retour et reprise.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({
  viewport:{width:360,height:560},deviceScaleFactor:2,isMobile:true,
  hasTouch:true,reducedMotion:'reduce'
 });
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('dialog',d=>d.accept());
 try{
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
   localStorage.setItem('ce2_v82526_clean_profiles',JSON.stringify({
    activeId:'p-test',profiles:{'p-test':{
     name:'Essai',firstName:'Essai',tutorialDone:true,challengeUnlocked:true
    }}
   }));
   localStorage.setItem('ce2_challenge_v8254_p-test',JSON.stringify({
    practice4Done:true,tutorialDone:true,history:{},drawBags:{}
   }));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#resume-adventure').click();
  await page.evaluate(()=>window.ce2OpenChallengeWithGate());
  assert.match(await page.locator('.ch-top strong').innerText(),/Mode Challenge · V82\.5\.65/);
  assert.match(await page.locator('.ch-hint').innerText(),/Version V82\.5\.65/);
  await page.locator('[data-level="0"]').click();
  await page.locator('#ch-surprise').click();
  await page.locator('#ch-check').waitFor();
  assert.match(await page.locator('.ch-top strong').innerText(),/Mode Challenge · V82\.5\.65/);
  assert.equal(await page.locator('#challenge-root').isHidden(),false);
  const before=await page.evaluate(()=>({challenge:document.querySelector('#challenge-root').scrollTop,page:document.scrollingElement.scrollTop}));
  await page.waitForFunction(()=>{
   const b=document.querySelector('#scroll-guide-down');
   return b && !b.hidden && !b.parentElement.hidden;
  },{timeout:7000});
  await page.locator('#scroll-guide-down').evaluate(el=>el.click());
  await page.waitForFunction(()=>document.querySelector('#challenge-root').scrollTop>0);
  const after=await page.evaluate(()=>({challenge:document.querySelector('#challenge-root').scrollTop,page:document.scrollingElement.scrollTop,z:getComputedStyle(document.querySelector('#scroll-guides')).zIndex}));
  assert(after.challenge>before.challenge,'La flèche doit descendre le texte Challenge');
  assert.equal(after.page,before.page,'Ne pas déplacer la page derrière le Challenge');
  assert.equal(after.z,'10000');
  await page.locator('[data-color="0"]').click();
  await page.locator('#ch-check').click();
  await page.locator('#ch-next').click();
  assert.match(await page.locator('#challenge-root').innerText(),/Mission 2 sur 10/);
  await page.locator('#ch-quit').click();
  await page.locator('#ch-resume-story').click();
  assert.match(await page.locator('#challenge-root').innerText(),/Mission 2 sur 10/);
  await page.locator('#ch-exit').click();
  await page.locator('#challenge-root').waitFor({state:'hidden'});
  assert.match(await page.locator('#scene').innerText(),/CARTE DES CINQ ROYAUMES/);
  await page.evaluate(()=>window.ce2OpenChallengeWithGate());
  await page.locator('#ch-resume-story').click();
  assert.match(await page.locator('#challenge-root').innerText(),/Mission 2 sur 10/);
  const saved=await page.evaluate(()=>{
   const raw=localStorage.getItem('ce2_challenge_v8254_p-test');
   return JSON.parse(raw).inProgress;
  });
  assert.equal(saved.step,1);
  assert.equal(saved.id.startsWith('C1-'),true);
  assert.equal(errors.length,0,'Erreur Javascript : '+errors.join('; '));
  console.log('Chromium mobile : flèches Challenge, retour carte et reprise mission validés.');
 }finally{await browser.close()}
})().catch(err=>{console.error(err);process.exitCode=1});
