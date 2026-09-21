(() => {
    const list = document.querySelector('.profile-project-list');
    const controls = document.querySelector('.profile-project-controls');
    if (!list || !controls) return;
    const previous = controls.querySelector('.profile-project-prev');
    const next = controls.querySelector('.profile-project-next');
    const cards = [...list.querySelectorAll('.profile-project')];
    const update = () => {
        const center = list.getBoundingClientRect().top + list.clientHeight / 2;
        const activeIndex = cards.reduce((best, card, index) => {
            const rect = card.getBoundingClientRect();
            const distance = Math.abs(rect.top + rect.height / 2 - center);
            return distance < best.distance ? { index, distance } : best;
        }, { index: 0, distance: Infinity }).index;
        cards.forEach((card, index) => card.classList.toggle('is-centered', index === activeIndex));
        previous.disabled = activeIndex === 0;
        next.disabled = activeIndex === cards.length - 1;
        controls.hidden = list.scrollHeight <= list.clientHeight + 1;
    };
    const move = direction => {
        const activeIndex = cards.findIndex(card => card.classList.contains('is-centered'));
        const target = cards[activeIndex + direction];
        if (target) list.scrollTo({ top: target.offsetTop - (list.clientHeight - target.offsetHeight) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
})();
