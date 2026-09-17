(() => {
    const page = document.querySelector('.reading-index');
    const form = page?.querySelector('.reading-controls');
    if (!form) return;
    const search = page.querySelector('#reading-search');
    const sort = page.querySelector('#reading-sort');
    const group = page.querySelector('.reading-topics');
    const buttons = Array.from(group.querySelectorAll('button'));
    const list = page.querySelector('.reading-list');
    const results = page.querySelector('.reading-results');
    const empty = page.querySelector('.reading-empty');
    const entries = Array.from(list.querySelectorAll('.reading-card'), (element, index) => ({ element, index, title:element.dataset.title, text:element.textContent.toLocaleLowerCase(), topics:JSON.parse(element.dataset.topics) }));
    let topic = '';
    function update(reorder = false) {
        const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        let count = 0;
        if (reorder) {
            const ordered = [...entries].sort(sort.value === 'title' ? (a,b) => a.title.localeCompare(b.title) || a.index-b.index : (a,b) => a.index-b.index);
            ordered.forEach(entry => list.appendChild(entry.element));
        }
        entries.forEach(entry => {
            const visible = (!topic || entry.topics.includes(topic)) && terms.every(term => entry.text.includes(term));
            entry.element.hidden = !visible;
            if (visible) count++;
        });
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.topic === topic)));
        results.textContent = count + ' of ' + entries.length + ' entries shown';
        empty.hidden = count !== 0;
    }
    form.hidden = group.hidden = results.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', () => update());
    sort.addEventListener('change', () => update(true));
    buttons.forEach(button => button.addEventListener('click', () => { topic = button.dataset.topic; update(); }));
    page.querySelector('#reading-reset').addEventListener('click', () => { form.reset(); topic = ''; update(true); search.focus(); });
    update();
})();
