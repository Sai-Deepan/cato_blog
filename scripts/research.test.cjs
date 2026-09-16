const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
const code=fs.readFileSync('static/js/research.js','utf8');
function setup(hasEntries=true){
 const el=(props={})=>({hidden:true,events:{},addEventListener(k,cb){this.events[k]=cb},setAttribute(k,v){this[k]=v},focus(){this.focused=true},...props});
 const search=el({value:''}),sort=el({value:'recent'}),results=el(),empty=el(),reset=el();
 const buttons=['paper','patent','writeup','research','all','paper','patent','writeup','research'].map(type=>el({dataset:{researchType:type}}));
 const entries=hasEntries?[el({dataset:{type:'paper',title:'Zeta'},textContent:'Zeta Alice neural methods'}),el({dataset:{type:'patent',title:'Alpha'},textContent:'Alpha Alice identifier US-TEST'}),el({dataset:{type:'research',title:'Beta'},textContent:'Beta systems'})]:[];
 const order=[...entries];const list={querySelectorAll:()=>entries,appendChild(entry){order.splice(order.indexOf(entry),1);order.push(entry)}};
 const form=el({reset(){search.value='';sort.value='recent'}});
 const selectors={'.research-entries':list,'#research-query':hasEntries?search:null,'#research-sort':hasEntries?sort:null,'.research-search':hasEntries?form:null,'.research-results':results,'.research-empty':empty,'#research-reset':reset,'#research-lens-title':el(),'#research-lens-description':el(),'#research-empty-title':el(),'#research-empty-description':el()};
 const page={dataset:{},querySelector:s=>selectors[s],querySelectorAll:()=>buttons};
 vm.runInNewContext(code,{document:{getElementById:()=>null,querySelector:()=>page}});
 return{search,sort,results,empty,reset,buttons,entries,order,page,selectors};
}
test('atlas and library format controls stay synchronized with keyword filters',()=>{
 const s=setup();s.buttons[1].events.click();assert.equal(s.page.dataset.lens,'patent');assert.equal(s.buttons[6]['aria-pressed'],'true');assert.equal(s.results.textContent,'1 of 3 records shown');
 s.search.value='neural';s.search.events.input();assert.equal(s.empty.hidden,false);s.search.value='US-TEST';s.search.events.input();assert.equal(s.entries[1].hidden,false);
 s.reset.events.click();assert(s.entries.every(e=>!e.hidden));assert(s.search.focused);
});
test('sorting preserves selected format and reset restores date order',()=>{
 const s=setup();s.sort.value='title';s.sort.events.change();assert.deepEqual(s.order.map(e=>e.dataset.title),['Alpha','Beta','Zeta']);s.buttons[0].events.click();assert.equal(s.entries[0].hidden,false);assert.equal(s.entries[1].hidden,true);s.reset.events.click();assert.deepEqual(s.order.map(e=>e.dataset.title),['Zeta','Alpha','Beta']);
});
test('empty archive remains interactive and resets without a search form',()=>{
 const s=setup(false);s.buttons[2].events.click();assert.equal(s.page.dataset.lens,'writeup');assert.match(s.selectors['#research-empty-title'].textContent,/write-ups/);assert.equal(s.reset.hidden,false);s.reset.events.click();assert.equal(s.page.dataset.lens,'all');assert(s.buttons[4].focused);
});
test('citation copying reports success and provides manual fallback',async()=>{
 for(const available of [true,false]) {const events={};const button={addEventListener:(k,cb)=>events[k]=cb};const status={};const citation={textContent:'A precise citation'};let copied;
 vm.runInNewContext(code,{navigator:{clipboard:{writeText:async text=>{if(!available)throw Error('denied');copied=text}}},document:{getElementById:id=>({'research-copy':button,'research-copy-status':status,'research-citation-text':citation}[id]),querySelector:()=>null}});
 await events.click();assert.match(status.textContent,available ? /copied/ : /manually/);if(available)assert.equal(copied,citation.textContent);
 }
});
