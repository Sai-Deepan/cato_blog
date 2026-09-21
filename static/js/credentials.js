(() => {
    const section = document.querySelector('[data-credentials]');
    if (!section) return;
    const cards = [...section.querySelectorAll('.credential-card')];
    const kinds = [...section.querySelectorAll('[data-kind]')].filter(el => el.tagName === 'BUTTON');
    const issuer = section.querySelector('[data-issuer]');
    const previous = section.querySelector('[data-previous]');
    const next = section.querySelector('[data-next]');
    const gallery = section.querySelector('.credentials-gallery');
    let kind = 'all';
    let index = 0;
    let visible = cards;

    function render() {
        cards.forEach(card => { card.hidden = card !== visible[index]; });
        section.querySelector('.credentials-empty').hidden = visible.length > 0;
        section.querySelector('.credentials-count').textContent = visible.length
            ? `${String(index + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')} — ${visible[index].querySelector('h3').textContent}`
            : '0 featured credentials';
        previous.disabled = next.disabled = visible.length < 2;
    }
    function filter() {
        visible = cards.filter(card => (kind === 'all' || card.dataset.kind === kind)
            && (issuer.value === 'all' || card.dataset.issuer === issuer.value));
        index = 0;
        render();
    }
    function move(step) {
        if (visible.length < 2) return;
        index = (index + step + visible.length) % visible.length;
        render();
    }
    kinds.forEach(button => button.addEventListener('click', () => {
        kind = button.dataset.kind;
        kinds.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        filter();
    }));
    issuer.addEventListener('change', filter);
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    gallery.tabIndex = 0;
    gallery.addEventListener('keydown', event => {
        if (event.target !== gallery || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        move(event.key === 'ArrowRight' ? 1 : -1);
    });
    let touchStart;
    gallery.addEventListener('touchstart', event => {
        touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
    }, { passive: true });
    gallery.addEventListener('touchend', event => {
        if (!touchStart) return;
        const dx = event.changedTouches[0].clientX - touchStart.x;
        const dy = event.changedTouches[0].clientY - touchStart.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
        touchStart = null;
    }, { passive: true });
    gallery.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
    section.classList.add('credentials-enhanced');
    section.querySelector('.credentials-tools').hidden = false;
    section.querySelector('.credentials-navigation').hidden = false;
    render();
})();
