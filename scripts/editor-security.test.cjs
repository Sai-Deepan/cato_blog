const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const {createEditorServer,editorAction,resolveFile} = require('./editor-server.cjs');
const password = 'test-only-long-password';
async function fixture(t) {
    const root=await fs.mkdtemp(path.join(os.tmpdir(),'editor-security-'));
    let time=Date.now();
    const server=await createEditorServer({root,password,port:1314,now:()=>time});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    t.after(async()=>{server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); await fs.rm(root,{recursive:true,force:true});});
    const request=(url,body,cookie,headers={})=>new Promise((resolve,reject)=>{
        const req=http.request({hostname:'127.0.0.1',port:server.address().port,path:url,method:body===undefined?'GET':'POST',headers:{host:'localhost:1314',origin:'http://localhost:1314','content-type':'application/json',...(cookie?{cookie}:{}),...headers}},res=>{
            let data='';res.on('data',v=>data+=v);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,data}));
        });req.on('error',reject);req.end(body);
    });
    const login=()=>request('/admin/login',new URLSearchParams({password}).toString(),null,{'content-type':'application/x-www-form-urlencoded'});
    return {root,request,login,advance:()=>time+=3600001};
}
test('authentication protects API and assets; valid session can save, expire and logout',async t=>{
    const f=await fixture(t);
    assert.equal((await f.request('/api/v1',JSON.stringify({action:'info'}))).status,401);
    assert.equal((await f.request('/admin/config.json')).status,401);
    assert.match((await f.request('/admin/')).data,/type="password"/);
    const login=await f.login(); assert.equal(login.status,303);
    const cookie=login.headers['set-cookie'][0].split(';')[0];
    assert.match(login.headers['set-cookie'][0],/HttpOnly; SameSite=Strict/);
    const write=JSON.stringify({action:'persistEntry',params:{dataFiles:[{path:'content/blog/hello.md',raw:'---\ntitle: Hello\ndraft: true\n---\nHello'}],assets:[]}});
    assert.equal((await f.request('/api/v1',write,cookie)).status,200);
    assert.match(await fs.readFile(path.join(f.root,'content/blog/hello.md'),'utf8'),/Hello/);
    assert.equal((await f.request('/api/v1',write,cookie,{origin:'http://localhost:1313'})).status,403);
    assert.equal((await f.request('/api/v1',write,cookie,{host:'evil.example'})).status,403);
    assert.equal((await f.request('/api/v1',write,cookie,{'content-type':'text/plain'})).status,415);
    assert.equal((await f.request('/admin/logout','',cookie)).status,303);
    assert.equal((await f.request('/api/v1',write,cookie)).status,401);
    const second=(await f.login()).headers['set-cookie'][0].split(';')[0];
    f.advance(); assert.equal((await f.request('/api/v1',write,second)).status,401);
});
test('login rejects incorrect passwords, cross-origin requests and throttles guessing',async t=>{
    const f=await fixture(t);
    const headers={'content-type':'application/x-www-form-urlencoded'};
    assert.equal((await f.request('/admin/login','password=x',null,{...headers,origin:'https://evil.example'})).status,403);
    for(let i=0;i<5;i++) assert.equal((await f.request('/admin/login','password=x',null,headers)).status,401);
    assert.equal((await f.login()).status,429);
});
test('paths and upload types cannot escape the permitted content',async t=>{
    const f=await fixture(t);
    for(const name of ['../outside.md','content/blog/../../hugo.toml','content/blog/CON.md','content/blog/x.md:stream','content/blog/x.md.','content/blog/x\\y.md','content/blog/_index.md','layouts/index.html','.env']) {
        await assert.rejects(resolveFile(f.root,name));
    }
    await assert.rejects(editorAction(f.root,{action:'persistMedia',params:{asset:{path:'static/images/uploads/x.svg',encoding:'base64',content:Buffer.from('<svg/>').toString('base64')}}}));
    await assert.rejects(editorAction(f.root,{action:'persistMedia',params:{asset:{path:'static/images/uploads/x.png',encoding:'base64',content:Buffer.from('<script>bad</script>').toString('base64')}}}));
    const pdf={path:'static/images/uploads/paper.pdf',encoding:'base64',content:Buffer.from('%PDF-1.7\ntest').toString('base64')};
    assert.equal((await editorAction(f.root,{action:'persistMedia',params:{asset:pdf}})).path,pdf.path);
    await assert.rejects(editorAction(f.root,{action:'deleteFiles',params:{paths:['content/blog/hello.md']}}));
    await fs.mkdir(path.join(f.root,'content'));
    await fs.mkdir(path.join(f.root,'elsewhere'));
    await fs.symlink(path.join(f.root,'elsewhere'),path.join(f.root,'content/blog'),'junction');
    await assert.rejects(resolveFile(f.root,'content/blog/hello.md'),/Symbolic links/);
});
test('batch validation rejects all writes before saving an invalid request',async t=>{
    const f=await fixture(t);
    await assert.rejects(editorAction(f.root,{action:'persistEntry',params:{dataFiles:[{path:'content/blog/valid.md',raw:'test'},{path:'hugo.toml',raw:'bad'}],assets:[]}}));
    await assert.rejects(fs.stat(path.join(f.root,'content/blog/valid.md')));
    await assert.rejects(createEditorServer({root:f.root,password:'short'}));
});
