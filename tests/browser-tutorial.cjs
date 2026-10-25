// QA mobile de l'ensemble du tutoriel et de sa mission finale.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:360,height:640},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('dialog',d=>d.accept());
 const stage=async n=>{
  assert.match(await page.locator('.ch-over').first().innerText(),new RegExp('Tutoriel interactif '+(n+1)+' / 13'));
 };
 try{
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>{
   localStorage.setItem('ce2_v82526_clean_profiles',JSON.stringify({activeId:'p-tuto',profiles:{'p-tuto':{name:'Test',firstName:'Test',tutorialDone:true,challengeUnlocked:true}}}));
   localStorage.setItem('ce2_challenge_v8254_p-tuto',JSON.stringify({tutorialDone:false,practice4Done:false,history:{},drawBags:{}}));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#resume-adventure').click();
  await page.evaluate(()=>window.ce2OpenChallengeWithGate());
  await stage(0);
  assert.equal(await page.locator('.ch-discovery-progress').innerText(),'🎨 Surligneurs découverts : 1 / 5');
  assert.equal(await page.locator('.ch-discovered').count(),1);
  assert(await page.locator('#ch-next').isDisabled(),'Le bouton Continuer doit être bloqué avant la découverte');
  for(let color=1;color<=4;color++){
   await page.locator('[data-guide-color="'+color+'"]').click();
   assert.equal(await page.locator('.ch-discovery-progress').innerText(),'🎨 Surligneurs découverts : '+(color+1)+' / 5');
  }
  assert.equal(await page.locator('.ch-discovered').count(),5);
  assert(await page.locator('#ch-next').isEnabled(),'Le cinquième surligneur doit débloquer Continuer');
  assert.match(await page.locator('#ch-guide-hint').innerText(),/Bravo, tu connais les cinq surligneurs/);
  await page.locator('#ch-next').click();
  const exercises={
   1:{color:0,words:[3]},2:{color:1,words:[4,7]},3:{color:1,words:[3]},
   4:{color:1,words:[0]},5:{color:1,words:[1,2]},6:{color:1,words:[3]},
   7:{color:2,words:[0]},8:{color:3,words:[2]},9:{color:4,words:[2,4]},
   10:{color:4,words:[1]},11:{color:4,words:[2,4]}
  };
  for(let n=1;n<=11;n++){
   await stage(n);
   assert(await page.locator('#ch-next').isDisabled(),'Ne pas déverrouiller prématurément étape '+(n+1));
   const ex=exercises[n];
   await page.locator('[data-guide-color="'+ex.color+'"]').click();
   for(const i of ex.words)await page.locator('[data-guide-word="'+i+'"]').click();
   if(n===10)assert.equal(await page.locator('.ch-marked').count(),0,'Le mot effacé ne doit plus être colorié');
   if(n===11){
    await page.locator('[data-guide-word="4"]').click();
    await page.locator('#ch-guide-check').click();
    assert(await page.locator('#ch-next').isDisabled(),'Une réponse partielle doit rester bloquée');
    await page.locator('[data-guide-word="4"]').click();
   }
   await page.locator('#ch-guide-check').click();
   assert(await page.locator('#ch-next').isEnabled(),'La bonne réponse doit valider étape '+(n+1));
   await page.locator('#ch-next').click();
  }
  await stage(12);
  assert.match(await page.locator('#ch-next').innerText(),/Passer à la mission finale/);
  await page.locator('#ch-next').click();
  assert.match(await page.locator('.ch-over').first().innerText(),/Mission finale du tutoriel/);
  assert.deepEqual(await page.locator('.ch-text .ch-token').allTextContents(),['Le','chien','ne','joue','jamais','.']);
  await page.locator('[data-color="4"]').click();
  await page.locator('[data-token="2"]').click();
  await page.locator('[data-token="4"]').click();
  await page.locator('#ch-check').click();
  assert.match(await page.locator('.ch-over').first().innerText(),/Mission finale réussie/);
  assert.match(await page.locator('#challenge-root').innerText(),/ne.*jamais/s);
  await page.locator('#ch-levels-go').click();
  assert(await page.locator('#ch-help').isVisible());
  await page.locator('#ch-help').click();
  await stage(0);
  assert.equal(await page.locator('.ch-discovery-progress').innerText(),'🎨 Surligneurs découverts : 1 / 5');
  assert.equal(errors.length,0,'Erreurs JavaScript : '+errors.join('; '));
  console.log('Tutoriel CE2 Chromium mobile : 13 étapes, 1/5→5/5, effacement, correction et mission finale réussis.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
