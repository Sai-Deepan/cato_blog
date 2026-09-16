const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(){
 const element=(props={})=>({hidden:true,events:{},addEventListener(k,cb){this.events[k]=cb},setAttribute(k,v){this[k]=v},...props});
 const search=element({value:'',focus(){this.focused=true}}),sort=element({value:'recent'}),results=element(),empty=element(),reset=element();
 const form=element({reset(){search.value='';sort.value='recent'}});
 const buttons=['','network','ai/ml'].map(topic=>element({dataset:{topic}}));
 const cards=[element({textContent:'Zeta packet inspection NETWORK',dataset:{title:'Zeta',topics:'["network"]'}}),element({textContent:'Alpha security AI/ML',dataset:{title:'Alpha',topics:'["ai/ml"]'}}),element({textContent:'Beta general',dataset:{title:'Beta',topics:'[]'}})];
 const order=[...cards];
 const group=element({querySelectorAll:()=>buttons});
 const list={querySelectorAll:()=>cards,appendChild(card){order.splice(order.indexOf(card),1);order.push(card)}};
 const selectors={'.reading-controls':form,'#reading-search':search,'#reading-sort':sort,'.reading-topics':group,'.reading-list':list,'.reading-results':results,'.reading-empty':empty,'#reading-reset':reset};
 vm.runInNewContext(fs.readFileSync('static/js/article-index.js','utf8'),{document:{querySelector:()=>({querySelector:s=>selectors[s]})}});
 return {search,sort,results,empty,reset,buttons,cards,order};
}
test('search and topics remain combined, including slash-containing tags',()=>{
 const s=setup();s.search.value=' PACKET inspection ';s.search.events.input();assert.equal(s.results.textContent,'1 of 3 entries shown');
 s.buttons[2].events.click();assert.equal(s.empty.hidden,false);assert.equal(s.results.textContent,'0 of 3 entries shown');
 s.search.value='';s.search.events.input();assert.equal(s.cards[1].hidden,false);assert.equal(s.cards[0].hidden,true);assert.equal(s.buttons[2]['aria-pressed'],'true');
});
test('sort preserves filtering and reset restores original order and focus',()=>{
 const s=setup();s.sort.value='title';s.sort.events.change();assert.deepEqual(s.order.map(c=>c.dataset.title),['Alpha','Beta','Zeta']);
 s.buttons[1].events.click();assert.equal(s.cards[0].hidden,false);assert.equal(s.cards[2].hidden,true);
 s.reset.events.click();assert(s.cards.every(c=>!c.hidden));assert.deepEqual(s.order.map(c=>c.dataset.title),['Zeta','Alpha','Beta']);assert(s.search.focused);assert.equal(s.buttons[0]['aria-pressed'],'true');
});
test('no article library is a safe no-op',()=>{vm.runInNewContext(fs.readFileSync('static/js/article-index.js','utf8'),{document:{querySelector:()=>null}})});
