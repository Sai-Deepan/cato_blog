const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const {promisify} = require('node:util');
const scrypt = promisify(crypto.scrypt);
const collections = ['blog', 'articles', 'exploits', 'research', 'cves'];
const mediaRoot = 'static/images/uploads';
const fail = (status, message) => Object.assign(new Error(message), {status});
const digest = data => crypto.createHash('sha256').update(data).digest('hex');

// Reject Windows aliases, traversal and symlinks before any file operation.
async function resolveFile(root, name, kind = 'entry', folder = false) {
    if (typeof name !== 'string' || name.includes('\\') || name.split('/').some(p => !/^[a-zA-Z0-9_-][a-zA-Z0-9_.-]*$/.test(p) || p.endsWith('.') || /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(p))) throw fail(400, 'Invalid path');
    const allowed = kind === 'media'
        ? (folder ? name === mediaRoot : /^static\/images\/uploads\/[a-zA-Z0-9_-][a-zA-Z0-9_.-]*\.(png|jpe?g|webp|gif|pdf)$/i.test(name))
        : (folder ? collections.some(c => name === `content/${c}`) : /^content\/(blog|articles|exploits|research|cves)\/[a-zA-Z0-9][a-zA-Z0-9_-]*\.md$/.test(name));
    if (!allowed) throw fail(403, 'Path is outside the editor collections');
    let current = root;
    for (const part of name.split('/')) {
        current = path.join(current, part);
        try { if ((await fs.lstat(current)).isSymbolicLink()) throw fail(403, 'Symbolic links are not allowed'); }
        catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    return current;
}

async function editorAction(root, body) {
    const p = body.params || {};
    const entry = async file => {
        const filename = await resolveFile(root, file.path);
        let data = null;
        try { data = await fs.readFile(filename, 'utf8'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
        return {data, file: {path: file.path, label: file.label, id: data === null ? null : digest(data)}};
    };
    const media = async name => {
        const data = await fs.readFile(await resolveFile(root, name, 'media'));
        return {id: digest(data), content: data.toString('base64'), encoding: 'base64', path: name, name: path.basename(name)};
    };
    const names = async (name, kind) => {
        const directory = await resolveFile(root, name, kind, true);
        try { return (await fs.readdir(directory, {withFileTypes:true})).filter(f => f.isFile()).map(f => `${name}/${f.name}`); }
        catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    };
    const prepareAsset = async asset => {
        const filename = await resolveFile(root, asset.path, 'media');
        if (asset.encoding !== 'base64' || typeof asset.content !== 'string' || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(asset.content)) throw fail(400, 'Invalid upload');
        const data = Buffer.from(asset.content, 'base64');
        if (data.length > 10 * 1024 * 1024) throw fail(413, 'Upload exceeds 10 MB');
        const ext = path.extname(filename).toLowerCase();
        const valid = ext === '.png' ? data.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex'))
            : ['.jpg','.jpeg'].includes(ext) ? data.subarray(0,3).equals(Buffer.from('ffd8ff','hex'))
            : ext === '.gif' ? /^GIF8[79]a/.test(data.subarray(0,6).toString())
            : ext === '.webp' ? data.subarray(0,4).toString() === 'RIFF' && data.subarray(8,12).toString() === 'WEBP'
            : data.subarray(0,5).toString() === '%PDF-';
        if (!valid) throw fail(400, 'Upload does not match its file extension');
        return {filename, data};
    };
    const write = async ({filename, data}) => { await fs.mkdir(path.dirname(filename), {recursive:true}); await fs.writeFile(filename, data); };
    switch (body.action) {
    case 'info': return {repo:path.basename(root), publish_modes:['simple'], type:'local_fs'};
    case 'entriesByFolder': {
        const files = await names(p.folder, 'entry');
        return Promise.all(files.filter(f => /^[a-zA-Z0-9][a-zA-Z0-9_-]*\.md$/.test(path.basename(f))).map(f => entry({path:f})));
    }
    case 'entriesByFiles': return Promise.all(p.files.map(entry));
    case 'getEntry': return entry(p);
    case 'getMedia': {
        const files = await names(p.mediaFolder, 'media');
        return Promise.all(files.filter(f => /\.(png|jpe?g|webp|gif|pdf)$/i.test(f)).map(media));
    }
    case 'getMediaFile': return media(p.path);
    case 'persistMedia': { const asset = await prepareAsset(p.asset); await write(asset); return media(p.asset.path); }
    case 'persistEntry': {
        const files = p.dataFiles || [p.entry];
        if (!Array.isArray(files) || !files.length || files.length > 20 || !Array.isArray(p.assets) || p.assets.length > 20) throw fail(400, 'Invalid entry');
        const writes = [];
        for (const file of files) {
            if (file.newPath && file.newPath !== file.path) throw fail(403, 'Renaming entries is disabled');
            if (typeof file.raw !== 'string' || Buffer.byteLength(file.raw) > 1024 * 1024) throw fail(413, 'Entry exceeds 1 MB');
            writes.push({filename:await resolveFile(root, file.path), data:file.raw});
        }
        for (const asset of p.assets) writes.push(await prepareAsset(asset));
        for (const item of writes) await write(item);
        return {message:'entry persisted'};
    }
    case 'getDeployPreview': return null;
    default: throw fail(403, 'This editor operation is disabled');
    }
}

const loginPage = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Sign in | Writing studio</title><link rel="stylesheet" href="/admin/admin.css"><main class="guide"><h1>Sign in to your writing studio</h1><p>Enter the editor password shown in the terminal where you started npm run editor.</p><form method="post" action="/admin/login"><label for="password">Password</label><p><input id="password" name="password" type="password" autocomplete="current-password" required autofocus maxlength="256"></p><button type="submit">Sign in</button></form><p>Access expires after one hour. Saves stay on this computer.</p></main></html>`;

async function createEditorServer({root, password, port = 1314, previewPort = 1315, sessionMs = 3600000, now = Date.now}) {
    if (typeof password !== 'string' || password.length < 16 || password.length > 256) throw new Error('EDITOR_PASSWORD must contain 16–256 characters.');
    const salt = crypto.randomBytes(32);
    const hash = await scrypt(password, salt, 64);
    const sessions = new Map();
    let failures = 0, resetAt = 0;
    const origin = `http://localhost:${port}`;
    const server = http.createServer(async (req, res) => {
        const send = (code, data, type = 'application/json') => { res.writeHead(code, {'Content-Type':type}); res.end(type === 'application/json' ? JSON.stringify(data) : data); };
        res.setHeader('Cache-Control','no-store');
        res.setHeader('X-Content-Type-Options','nosniff');
        res.setHeader('X-Frame-Options','DENY');
        res.setHeader('Referrer-Policy','no-referrer');
        res.setHeader('Content-Security-Policy', "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'");
        const read = async limit => {
            const chunks = []; let size = 0;
            for await (const chunk of req) { size += chunk.length; if (size > limit) throw fail(413,'Request too large'); chunks.push(chunk); }
            return Buffer.concat(chunks).toString();
        };
        try {
            if (req.headers.host !== `localhost:${port}`) throw fail(403,'Use the localhost editor address');
            if (req.headers['sec-fetch-site'] === 'cross-site') throw fail(403,'Cross-site requests are not allowed');
            if (!['GET','HEAD','POST'].includes(req.method)) throw fail(405,'Method not allowed');
            if (req.method === 'POST' && req.headers.origin !== origin) throw fail(403,'Invalid request origin');
            const url = new URL(req.url, origin);
            const cookie = (req.headers.cookie || '').split(';').map(v=>v.trim()).find(v=>v.startsWith('editor_session='))?.slice(15);
            for (const [token, expires] of sessions) if (expires <= now()) sessions.delete(token);
            const authenticated = sessions.has(cookie);
            if (url.pathname === '/admin/login' && req.method === 'POST') {
                if (now() >= resetAt) { failures = 0; resetAt = now() + 60000; }
                if (failures >= 5) { res.setHeader('Retry-After','60'); throw fail(429,'Too many attempts. Try again in one minute.'); }
                failures++;
                if (req.headers['content-type'] !== 'application/x-www-form-urlencoded') throw fail(415,'Invalid form');
                const supplied = new URLSearchParams(await read(2048)).get('password') || '';
                if (supplied.length > 256 || !crypto.timingSafeEqual(await scrypt(supplied,salt,64), hash)) throw fail(401,'Incorrect password. Go back to try again.');
                failures = 0;
                const token = crypto.randomBytes(32).toString('hex');
                if (cookie) sessions.delete(cookie);
                if (sessions.size >= 20) sessions.delete(sessions.keys().next().value);
                sessions.set(token, now() + sessionMs);
                res.setHeader('Set-Cookie',`editor_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(sessionMs/1000)}`);
                res.writeHead(303,{Location:'/admin/'}); return res.end();
            }
            if (url.pathname === '/admin/logout' && req.method === 'POST') {
                sessions.delete(cookie);
                res.setHeader('Set-Cookie','editor_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
                res.writeHead(303,{Location:'/admin/'}); return res.end();
            }
            if (url.pathname === '/admin/admin.css' && req.method === 'GET') return send(200,await fs.readFile(path.join(root,'static/admin/admin.css'),'utf8'),'text/css');
            if (!authenticated) {
                if (req.method === 'GET' && ['/admin','/admin/','/admin/login','/'].includes(url.pathname)) return send(200,loginPage,'text/html');
                throw fail(401,'Sign in at /admin/ to continue');
            }
            if (url.pathname === '/api/v1' && req.method === 'POST') {
                if (req.headers['content-type']?.split(';')[0] !== 'application/json') throw fail(415,'JSON required');
                let body;
                try { body = JSON.parse(await read(15 * 1024 * 1024)); } catch (e) { throw e.status ? e : fail(400,'Invalid JSON'); }
                return send(200,await editorAction(root,body));
            }
            if (url.pathname === '/admin/session' && req.method === 'GET') return send(200,{authenticated:true});
            if (req.method !== 'GET' && req.method !== 'HEAD') throw fail(405,'Method not allowed');
            const upstream = http.request({hostname:'127.0.0.1',port:previewPort,path:req.url,method:req.method}, response => {
                res.statusCode = response.statusCode;
                if (response.headers['content-type']) res.setHeader('Content-Type',response.headers['content-type']);
                response.pipe(res);
            });
            upstream.on('error',()=>{ if (!res.headersSent) send(503,{error:'Preview is starting. Reload shortly.'}); else res.destroy(); });
            upstream.end();
        } catch (error) { if (!res.headersSent) send(error.status || 400,{error:error.status ? error.message : 'Invalid editor request'}); else res.destroy(); }
    });
    server.requestTimeout = 15000;
    server.headersTimeout = 10000;
    return server;
}
module.exports = {createEditorServer, editorAction, resolveFile};
