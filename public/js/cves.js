(() => {
    const copy = document.getElementById('advisory-copy');
    if (copy) { copy.hidden=false; copy.addEventListener('click',async()=>{const status=document.getElementById('advisory-copy-status');try{await navigator.clipboard.writeText(document.getElementById('advisory-identifier').textContent);status.textContent='CVE ID copied.';}catch{status.textContent='Select the CVE ID above and copy it manually.';}}); }
    const page=document.querySelector('.advisory-page');const form=page?.querySelector('.advisory-filters');if(!form)return;
    const search=page.querySelector('#advisory-search'),severity=page.querySelector('#advisory-severity'),status=page.querySelector('#advisory-status'),results=page.querySelector('.advisory-results'),empty=page.querySelector('.advisory-empty');
    const entries=Array.from(page.querySelectorAll('.advisory-record'),element=>({element,text:element.textContent.toLocaleLowerCase(),severity:element.dataset.severity,status:element.dataset.status}));
    function filter(){const terms=search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);let count=0;entries.forEach(entry=>{const visible=(!severity.value||entry.severity===severity.value)&&(!status.value||entry.status===status.value)&&terms.every(term=>entry.text.includes(term));entry.element.hidden=!visible;if(visible)count++;});results.textContent=count+' of '+entries.length+' records shown';empty.hidden=count!==0;}
    form.hidden=results.hidden=false;form.addEventListener('submit',e=>e.preventDefault());search.addEventListener('input',filter);severity.addEventListener('change',filter);status.addEventListener('change',filter);page.querySelector('#advisory-reset').addEventListener('click',()=>{form.reset();filter();search.focus();});filter();
})();
