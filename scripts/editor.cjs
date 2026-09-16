const {spawn} = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const children = [];
let stopping = false;
function stop(code = 0) { if(stopping) return; stopping = true; for (const child of children) child.kill(); process.exitCode = code; }
function launch(command, args, env = {}) {
    const child = spawn(command, args, {cwd:root, stdio:'inherit', windowsHide:true, env:{...process.env,...env}});
    children.push(child);
    child.on('error', error => { console.error(error.message); stop(1); });
    child.on('exit', code => { if(!stopping) stop(code || 0); });
}
launch(process.execPath, [require.resolve('decap-server')], {BIND_HOST:'127.0.0.1',PORT:'8081',MODE:'fs'});
launch('hugo', ['server','--bind','127.0.0.1','--port','1314','--baseURL','http://localhost:1314/','--buildDrafts','--disableFastRender','--renderToMemory']);
console.log('Writing studio: http://localhost:1314/admin/');
console.log('Local saves only. Press Ctrl+C to stop both servers.');
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
