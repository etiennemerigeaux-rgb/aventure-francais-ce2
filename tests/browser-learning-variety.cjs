// Contrôle Android petit écran : questions longues et choix accessibles.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({viewport:{width:320,height:568},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('dialog',d=>d.accept());
 try{
  await page.goto('http://127.0.0.1:4173/index.html',{waitUntil:'domcontentloaded'});
  await page.locator('#new-first').fill('Test variétés');
  await page.locator('#make-profile').click();
  await page.locator('#guide-skip').click();
  await page.locator('#hero-ok').click();
  const expected={definition:2,identification:2,application:2,correction:2,comparaison:1,raisonnement:1};
  for(const world of [2,3]){
   await page.locator('[data-world="'+world+'"]').click();
   await page.locator('[data-answer]').first().waitFor();
   const kinds=[];
   for(let n=0;n<10;n++){
    const details=await page.evaluate(w=>{
     const stem=document.querySelector('.quest-panel .question')?.textContent;
     const item=window.CE2_DATA.worlds[w].questions.find(q=>q.q===stem);
     if(!item)throw Error('Question introuvable : '+stem);
     const buttons=[...document.querySelectorAll('.answers [data-answer]')];
     if(buttons.length!==4)throw Error('Pas exactement quatre réponses');
     const viewport=document.documentElement.clientWidth;
     return {kind:item.learningType,correct:item.answer,buttons:buttons.map(b=>({left:b.getBoundingClientRect().left,right:b.getBoundingClientRect().right})),viewport};
    },world);
    kinds.push(details.kind);
    for(const b of details.buttons)assert(b.left>=-2&&b.right<=details.viewport+2,'Réponse coupée sur téléphone : '+JSON.stringify(details));
    await page.locator('[data-answer="'+details.correct+'"]').click();
    await page.locator('#next').click();
   }
   const distribution=Object.fromEntries(Object.keys(expected).map(t=>[t,kinds.filter(x=>x===t).length]));
   assert.deepEqual(distribution,expected,'Partie monotone dans le monde '+world);
   for(let i=1;i<kinds.length;i++)assert.notEqual(kinds[i],kinds[i-1]);
   await page.locator('#again').click();
  }
  assert.equal(errors.length,0,errors.join('; '));
  console.log('Chromium 320 px : vingt questions, six raisonnements par monde et toutes les réponses accessibles.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
