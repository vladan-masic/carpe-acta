const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const output=fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
const base=process.env.REALM_PREVIEW_URL || 'http://127.0.0.1:4174';
const browser=await chromium.launch({...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : {}),headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1050}});
const page=await context.newPage(), errors=[];page.on('pageerror', e=>errors.push(e.message));
await page.goto(base+'/__realm-preview');await page.locator('.realm-location').first().waitFor();
const simulations=await page.evaluate(async()=>{
 const {simulateRealm}=await import('/tests/helpers/realmSimulation.ts');
 return [false,true].map(earlyResearch=>({earlyResearch,...simulateRealm(earlyResearch)}));
});
await writeFile(output+'/economy.json',JSON.stringify(simulations.map(({state,trace,...report})=>({...report,remaining:state.village.stock,issued:state.rewards.grossCoins,xp:state.xp,actions:trace.length})),null,2)+'\n');
const checks=[];
for(const locale of ['en','sr-Latn'])for(const theme of ['light','dark'])for(const width of [1440,768,390,320]){
 await page.setViewportSize({width:1440,height:1050});
 const current=await page.locator('html').getAttribute('lang');
 if(current!==locale){await page.getByRole('button',{name:/^(Language:|Jezik:)/}).click();await page.getByRole('option',{name:locale==='en'?'English':'Srpski',exact:true}).click();}
 await page.locator('.realm-theme select').selectOption(theme);await page.setViewportSize({width,height:1050});await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${locale}/${theme}/${width} overflow`);
 assert.equal(await page.locator('.realm-location').count(),10);
 assert.equal(await page.locator('.realm-scene-plan img').count(),0,'no finished structures before approved artwork');
 await page.locator('.realm-scene-heading select').selectOption('tavern');
 assert.equal(await page.locator('#realm-detail-heading').textContent(),locale==='en'?'Tavern':'Krčma');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'realm-detail-heading');
 assert.equal(await page.locator('.realm-build').isDisabled(),true);
 checks.push(`${locale}/${theme}/${width}`);
 if((locale==='en'&&theme==='light'&&width===1440)||(locale==='sr-Latn'&&theme==='dark'&&width===390)) {
  await page.locator('.realm-workspace').screenshot({style:'.app-toolbar{visibility:hidden}',path:`${output}/screenshots/initial-${width}-${locale}-${theme}.png`});
 }
}
// Replay the conservative complete simulation through actual user controls.
await page.setViewportSize({width:1440,height:1050});
await page.getByRole('button',{name:/^Jezik:/}).click();await page.getByRole('option',{name:'English',exact:true}).click();await page.locator('.realm-theme select').selectOption('light');
const copy=await page.evaluate(async()=>({c:(await import('/src/dev/realm/copy.ts')).realmCopy.en,e:(await import('/src/dev/realm/expansionCopy.ts')).expansionCopy.en}));
for(const step of simulations[0].trace){
 if(step.action==='reward'){await page.locator('.realm-simulator-controls select').selectOption(step.id);await page.getByRole('button',{name:'Complete',exact:true}).click();}
 if(step.action==='supply')await page.getByRole('button',{name:copy.c.buyResource[step.id],exact:true}).click();
 if(step.action==='build'){await page.locator('.realm-scene-heading select').selectOption(step.id);assert.equal(await page.locator('.realm-build').isEnabled(),true);await page.locator('.realm-build').click();}
 if(step.action==='research'){await page.locator('.realm-scene-heading select').selectOption('academy');await page.getByRole('button',{name:`Unlock research: ${copy.e.researchNames[step.id]}`,exact:true}).click();}
 if(step.action==='forest')await page.getByRole('button',{name:'Explore now',exact:true}).click();
 if(step.action==='destination'){await page.locator('.realm-scene-heading select').selectOption('guild');await page.getByRole('button',{name:`Visit destination: ${copy.e.destinations[step.id]}`,exact:true}).click();}
 if(step.action==='contract'){await page.locator('.realm-scene-heading select').selectOption('tavern');await page.getByRole('button',{name:`Complete contract: ${copy.e.travelers[step.id]}`,exact:true}).click();}
}
assert.equal(await page.locator('.realm-coins strong').textContent(),String(simulations[0].state.village.stock.coins));
assert.equal(await page.locator('.realm-location[data-built=true]').count(),10);
const maximumChecks=[];
for (const locale of ['en','sr-Latn']) for (const theme of ['light','dark']) {
 const current=await page.locator('html').getAttribute('lang');
 if(current!==locale){await page.getByRole('button',{name:/^(Language:|Jezik:)/}).click();await page.getByRole('option',{name:locale==='en'?'English':'Srpski',exact:true}).click();}
 await page.locator('.realm-theme select').selectOption(theme);
 for (const building of Object.keys(simulations[0].state.village.levels)) {
  await page.locator('.realm-scene-heading select').selectOption(building);
  const label=locale==='en'?'Fully upgraded — Level 5':'Potpuno unapređeno — Nivo 5';
  assert.equal(await page.locator('.realm-build').textContent(),label);
  assert.equal(await page.locator('.realm-build').isDisabled(),true);
  assert.equal(await page.locator('.realm-cost').count(),0);
  assert.equal(await page.locator('.realm-duration').count(),0);
  const contrast=await page.locator('.realm-build').evaluate(button=>{
   const luminance=color=>{
    const [r,g,b]=color.match(/[\d.]+/g).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});
    return .2126*r+.7152*g+.0722*b;
   };
   const ratio=(fg,bg)=>{const a=luminance(fg),b=luminance(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
   const css=getComputedStyle(button),hint=document.getElementById(button.getAttribute('aria-describedby'));
   return {opacity:css.opacity,button:ratio(css.color,css.backgroundColor),status:ratio(getComputedStyle(hint).color,getComputedStyle(hint.closest('aside')).backgroundColor)};
  });
  assert.equal(contrast.opacity,'1');assert.ok(contrast.button>=4.5);assert.ok(contrast.status>=4.5);
  maximumChecks.push({locale,theme,building,...contrast});
 }
 await page.locator('.realm-detail').screenshot({style:'.app-toolbar{visibility:hidden}',path:`${output}/screenshots/maximum-${locale}-${theme}.png`});
}
await page.getByRole('button',{name:/^Jezik:/}).click();await page.getByRole('option',{name:'English',exact:true}).click();await page.locator('.realm-theme select').selectOption('light');
await page.locator('.realm-scene-heading select').selectOption('marketplace');
await page.locator('.realm-workspace').screenshot({style:'.app-toolbar{visibility:hidden}',path:output+'/screenshots/expanded-1440-en-light.png'});
await page.locator('#plot-academy').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#realm-detail-heading').textContent(),'Academy');
await page.locator('.realm-activities-panel').screenshot({style:'.app-toolbar{visibility:hidden}',path:output+'/screenshots/research-completed.png'});
await page.getByRole('button',{name:'Close building details'}).click();await page.waitForFunction(()=>document.activeElement.id==='plot-academy');
// Check real touch activation and keyboard panning in a mobile browser context.
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
const touch=await mobile.newPage();await touch.goto(base+'/__realm-preview');
await touch.locator('#plot-sawmill').tap();assert.equal(await touch.locator('#realm-detail-heading').textContent(),'Sawmill');
await touch.locator('.realm-scene-scroll').focus();await touch.keyboard.press('ArrowRight');
await touch.waitForFunction(()=>document.querySelector('.realm-scene-scroll').scrollLeft>0);
await mobile.close();
assert.deepEqual(errors,[]);await writeFile(output+'/browser-checks.json',JSON.stringify({checks,maximumChecks,errors,fullPlaythroughActions:simulations[0].trace.length,keyboardSelection:true,focusReturn:true,touchSelection:true,keyboardPanning:true},null,2)+'\n');
console.log(JSON.stringify({checks:checks.length,errors,playthroughActions:simulations[0].trace.length,output}));await browser.close();
