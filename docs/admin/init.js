(async () => {
    const message = document.getElementById('editor-message');
    const notice = document.getElementById('editor-notice');
    const local = ['localhost', '127.0.0.1'].includes(location.hostname);
    try {
        if (!local) {
            notice.textContent = 'Publishing is available only in the private local editor.';
            message.textContent = 'The website does not accept writeup uploads. Run npm run editor on the project computer to sign in and edit.';
            return;
        }
        if (location.origin !== 'http://localhost:1314') {
            notice.textContent = 'Sign-in required';
            message.textContent = 'Run npm run editor, then open http://localhost:1314/admin/ and sign in with the password from your terminal.';
            const link = document.createElement('a');
            link.href = 'http://localhost:1314/admin/';
            link.textContent = 'Open secure writing studio';
            message.appendChild(document.createElement('br'));
            message.appendChild(link);
            return;
        }
        const session = await fetch('/admin/session', {cache:'no-store'});
        if (!session.ok || !(await session.json()).authenticated) throw new Error('Your session expired. Reload to sign in.');
        const response = await fetch('/admin/config.json', {cache:'no-store'});
        if (!response.ok) throw new Error('Editor configuration could not be loaded.');
        const config = await response.json();
        config.backend = {name:'git-gateway'};
        config.local_backend = {url:location.origin + '/api/v1'};
        config.site_url = location.origin;
        if (!window.CMS) throw new Error('The editor library could not load. Reload to try again.');
        notice.textContent = 'LOCAL EDITOR - Saves change files on this computer. They do not publish the live website.';
        const logout = document.createElement('form');
        logout.method = 'post'; logout.action = '/admin/logout';
        const button = document.createElement('button');
        button.type = 'submit'; button.textContent = 'Sign out';
        logout.appendChild(button); notice.appendChild(logout);
        window.CMS.init({config});
        document.getElementById('editor-start').hidden = true;
    } catch (error) {
        notice.textContent = 'The writing studio could not connect.';
        message.textContent = error.message;
    }
})();
