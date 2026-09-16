(() => {
    const copy = document.getElementById('research-copy');
    if (copy) {
        copy.hidden = false;
        copy.addEventListener('click', async () => {
            const status = document.getElementById('research-copy-status');
            try {
                await navigator.clipboard.writeText(document.getElementById('research-citation-text').textContent);
                status.textContent = 'Citation copied.';
            } catch {
                status.textContent = 'Copy is unavailable in this browser. Select the citation text above and copy it manually.';
            }
        });
    }
    const page = document.querySelector('.research-page');
    if (!page) return;
    const descriptions = {
        all:['Across the collection','Papers, patents, write-ups, and ongoing research in one place.'],
        paper:['Papers','Peer-reviewed papers, preprints, and technical publications.'],
        patent:['Patents','Patent publications, with identifiers and their recorded status.'],
        writeup:['Write-ups','Detailed explanations of findings, methods, and experiments.'],
        research:['Research work','Research projects, exploratory work, and ongoing investigations.']
    };
    const buttons = Array.from(page.querySelectorAll('[data-research-type]'));
    const list = page.querySelector('.research-entries');
    const entries = Array.from(list.querySelectorAll('.research-entry'), (element,index) => ({element,index,type:element.dataset.type,title:element.dataset.title,text:element.textContent.toLocaleLowerCase()}));
    const search = page.querySelector('#research-query');
    const sort = page.querySelector('#research-sort');
    const form = page.querySelector('.research-search');
    const results = page.querySelector('.research-results');
    const empty = page.querySelector('.research-empty');
    const reset = page.querySelector('#research-reset');
    let selected = 'all';
    function update(reorder = false) {
        const terms = (search?.value || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        let count = 0;
        if (reorder) [...entries].sort(sort?.value === 'title' ? (a,b)=>a.title.localeCompare(b.title)||a.index-b.index : (a,b)=>a.index-b.index).forEach(entry=>list.appendChild(entry.element));
        entries.forEach(entry => {
            const match = (selected === 'all' || entry.type === selected) && terms.every(term=>entry.text.includes(term));
            entry.element.hidden = !match;
            if (match) count++;
        });
        page.dataset.lens = selected;
        buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.researchType === selected)));
        page.querySelector('#research-lens-title').textContent = descriptions[selected][0];
        page.querySelector('#research-lens-description').textContent = descriptions[selected][1];
        results.textContent = count + ' of ' + entries.length + ' records shown';
        empty.hidden = count !== 0;
        reset.hidden = selected === 'all' && terms.length === 0;
        page.querySelector('#research-empty-title').textContent = entries.length ? 'No matching records.' : selected === 'all' ? 'The archive is taking shape.' : 'No ' + descriptions[selected][0].toLowerCase() + ' added yet.';
        page.querySelector('#research-empty-description').textContent = entries.length ? 'Try a different format or keyword, or reset the collection.' : 'Explore another format, or take a look at the projects behind the work.';
    }
    buttons.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.researchType;update();}));
    if(form) { form.hidden=false;form.addEventListener('submit',event=>event.preventDefault()); }
    results.hidden=false;
    search?.addEventListener('input',()=>update());
    sort?.addEventListener('change',()=>update(true));
    reset.addEventListener('click',()=>{selected='all';form?.reset();update(true);if(search)search.focus();else buttons.find(button=>button.dataset.researchType==='all').focus();});
    update();
})();
