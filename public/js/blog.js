(() => {
    const page = document.querySelector('.journal-page');
    const form = page?.querySelector('.journal-filters');
    if (!form) return;
    const search = page.querySelector('#journal-search');
    const category = page.querySelector('#journal-category');
    const results = page.querySelector('.journal-results');
    const empty = page.querySelector('.journal-empty');
    const entries = Array.from(page.querySelectorAll('.journal-card'), element => ({ element, text: element.textContent.toLocaleLowerCase(), category: element.dataset.category }));
    function filter() {
        const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        let count = 0;
        entries.forEach(entry => {
            const visible = (!category.value || entry.category === category.value) && terms.every(term => entry.text.includes(term));
            entry.element.hidden = !visible;
            if (visible) count++;
        });
        results.textContent = count + ' of ' + entries.length + ' entries shown';
        empty.hidden = count !== 0;
    }
    form.hidden = false;
    results.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    search.addEventListener('input', filter);
    category.addEventListener('change', filter);
    page.querySelector('#journal-reset').addEventListener('click', () => { form.reset(); filter(); search.focus(); });
    filter();
})();
