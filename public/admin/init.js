(async () => {
    const message = document.getElementById('editor-message');
    const notice = document.getElementById('editor-notice');
    const local = ['localhost', '127.0.0.1'].includes(location.hostname);
    try {
        const responses = await Promise.all([fetch('/admin/config.json', {cache:'no-store'}), fetch('/admin/publishing.json', {cache:'no-store'})]);
        if (responses.some(response => !response.ok)) throw new Error('Editor configuration could not be loaded.');
        const [config, publishing] = await Promise.all(responses.map(response => response.json()));
        if (!local && !publishing.enabled) {
            notice.textContent = 'Live publishing is not connected yet.';
            message.textContent = 'The writing studio is installed. The site owner needs to connect GitHub sign-in and automatic deployment. You can already edit locally with npm run editor.';
            return;
        }
        if (!window.CMS) throw new Error('The editor library could not load. Check your internet connection and reload.');
        if (local) {
            const response = await fetch('http://127.0.0.1:8081/api/v1', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'info'})});
            if (!response.ok) throw new Error('Start npm run editor from the project folder, then reload this page.');
            config.backend = {name:'git-gateway'};
            notice.textContent = 'LOCAL EDITOR - Saves change files on this computer. They do not publish the live website. Drafts are visible in the local preview.';
        } else {
            config.local_backend = false;
            config.site_url = location.origin;
            notice.textContent = 'Save with Keep as draft enabled to keep a post off the public website. Publishing requires the website rebuild to finish.';
        }
        window.CMS.init({config});
        document.getElementById('editor-start').hidden = true;
    } catch (error) {
        notice.textContent = 'The writing studio could not connect.';
        message.textContent = local ? error.message + ' Make sure npm run editor is running.' : error.message;
    }
})();
