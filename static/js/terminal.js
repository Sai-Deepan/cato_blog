(() => {
    const terminal = document.querySelector('.terminal-window');
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('terminal-output');
    const closeButton = terminal?.querySelector('.terminal-close');
    if (!terminal || !input || !output) return;
    const routes = { about: '/about/', projects: '/#home-projects', research: '/research/', articles: '/articles/', exploits: '/exploits/', blog: '/blog/', cves: '/cves/', contact: '/contact/' };
    const responses = {
        help: 'Commands: about, projects, research, articles, exploits, blog, cves, contact, whoami, clear.\nPress Escape to close.',
        whoami: 'Deepan Sai / CatoTheYounger\nSecurity research ? systems engineering ? machine learning',
        resume: 'Visit About for my background and experience: /about/'
    };
    let previousFocus;
    function closeTerminal() {
        terminal.classList.remove('active');
        terminal.setAttribute('aria-hidden', 'true');
        previousFocus?.focus();
    }
    closeButton?.addEventListener('click', closeTerminal);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && terminal.classList.contains('active')) {
            closeTerminal();
            return;
        }
        const active = document.activeElement;
        if (active?.matches('input, textarea, select') || active?.isContentEditable || event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key === '\\') {
            event.preventDefault();
            previousFocus = active;
            terminal.classList.add('active');
            terminal.setAttribute('aria-hidden', 'false');
            input.focus();
        }
    });
    function addLine(text) {
        const line = document.createElement('div');
        line.className = 'line';
        line.textContent = text;
        output.appendChild(line);
        while (output.children.length > 80) output.firstElementChild.remove();
        output.scrollTop = output.scrollHeight;
    }
    input.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || event.isComposing) return;
        event.preventDefault();
        const command = input.value.trim().toLowerCase();
        input.value = '';
        if (!command) return;
        if (command === 'clear') { output.replaceChildren(); return; }
        addLine('visitor:~$ ' + command);
        if (Object.hasOwn(routes, command)) { window.location.href = routes[command]; return; }
        addLine(Object.hasOwn(responses, command) ? responses[command] : 'Command not found. Type help for available commands.');
    });
})();
