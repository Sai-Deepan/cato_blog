const {spawn} = require('node:child_process');
const path = require('node:path');
const crypto = require('node:crypto');
const {createEditorServer} = require('./editor-server.cjs');
const root = path.resolve(__dirname, '..');
(async () => {
    const generated = !process.env.EDITOR_PASSWORD;
    const password = process.env.EDITOR_PASSWORD || crypto.randomBytes(24).toString('base64url');
    const server = await createEditorServer({root,password});
    let child, stopping = false;
    function stop(code = 0) {
        if (stopping) return;
        stopping = true;
        child?.kill();
        server.close();
        server.closeAllConnections();
        process.exitCode = code;
    }
    server.on('error',error => { console.error(error.message); stop(1); });
    server.listen(1314,'127.0.0.1',() => {
        child = spawn('hugo',['server','--bind','127.0.0.1','--port','1315','--baseURL','http://localhost:1314/','--appendPort=false','--disableLiveReload','--disableFastRender','--renderToMemory'],{cwd:root,stdio:'inherit',windowsHide:true});
        child.on('error',error=>{console.error(error.message);stop(1);});
        child.on('exit',code=>stop(code || 0));
        console.log('Writing studio: http://localhost:1314/admin/');
        if (generated) console.log(`Editor password (changes each restart): ${password}`);
        console.log('Local saves only. Sign in to edit. Press Ctrl+C to stop.');
    });
    process.on('SIGINT',()=>stop());
    process.on('SIGTERM',()=>stop());
})().catch(error=>{console.error(error.message);process.exitCode=1;});
