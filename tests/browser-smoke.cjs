// Test automatisé dans Chromium avec écran et interactions de type téléphone Android.
// À exécuter après avoir démarré un serveur local sur le port 4173.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce',acceptDownloads:true});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',err=>errors.push(String(err)));
 page.on('dialog',dialog=>dialog.accept());
 try{
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
  // La version doit rester visible malgré les changements automatiques de titre.
  const checkVersion=async()=>{
    const version=page.locator('header .app-version');
    assert.equal(await version.innerText(),'Version V82.5.70');
    assert(await version.isVisible(),'Numéro de version masqué');
    const rect=await version.boundingBox();
    assert(rect&&rect.x>=0&&rect.x+rect.width<=390,'Version coupée sur téléphone');
  };
  await checkVersion();
  await page.locator('#new-first').fill('Enfant Test');
  await page.locator('#make-profile').click();
  await page.locator('#guide-skip').click();
  await page.locator('#hero-ok').click();
  await checkVersion();
  await page.locator('[data-world="1"]').click();
  await page.locator('[data-answer]').first().waitFor();
  await checkVersion();
  for(let n=0;n<10;n++){
   const answer=await page.evaluate(()=>{
    const q=document.querySelector('.quest-panel .question')?.textContent;
    const found=window.CE2_DATA.worlds[1].questions.find(item=>item.q===q);
    if(!found)throw Error('Question du Théâtre introuvable : '+q);
    return found.answer;
   });
   await page.locator('[data-answer="'+answer+'"]').click();
   await page.locator('#next').click();
  }
  await page.locator('#see-rewards').waitFor();
  await checkVersion();
  assert.match(await page.locator('#scene').innerText(),/10\/10 sans aide · 30 pièces gagnées/);
  await page.locator('[data-go="parent"]').click();
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#export-profiles').click();
  const download=await downloadPromise;
  const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  assert.equal(Object.keys(backup.profiles).length,1);
  await page.locator('#import-profiles-file').setInputFiles({name:'sauvegarde.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await page.waitForFunction(()=>Object.keys(JSON.parse(localStorage.getItem('ce2_v82526_clean_profiles')).profiles).length===2);
  const dims=await page.evaluate(()=>({width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(dims.scroll<=dims.width+5,'Débordement horizontal sur écran mobile : '+JSON.stringify(dims));
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#resume-adventure').waitFor({timeout:12000});
  await checkVersion();
  assert.equal(errors.length,0,'Erreur(s) JS en navigateur : '+errors.join('; '));
  console.log('Chromium mobile : 10/10, profils export/import et rechargement hors ligne réussis.');
 }finally{
  await page.screenshot({path:'/tmp/ce2-mobile-smoke.png',fullPage:true}).catch(()=>{});
  await browser.close();
 }
})().catch(err=>{console.error(err);process.exitCode=1});
