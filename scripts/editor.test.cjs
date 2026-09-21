const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const config = JSON.parse(fs.readFileSync('static/admin/config.json','utf8'));
test('collections preserve Hugo metadata, default to drafts, and use uploaded media', () => {
    assert.deepEqual(config.collections.map(c=>c.name),['blog','articles','exploits','research','cves']);
    for(const collection of config.collections) {
        assert.equal(collection.filter.field,'cms_entry');
        assert.equal(collection.fields.find(f=>f.name==='draft').default,true);
        assert.equal(collection.fields.find(f=>f.name==='body').widget,'richtext');
        assert.equal(collection.delete,false);
        for(const file of fs.readdirSync(collection.folder).filter(f=>!f.startsWith('_')&&f.endsWith('.md'))) {
            assert.match(fs.readFileSync(collection.folder+'/'+file,'utf8'),/^cms_entry: true$/m);
        }
    }
    assert.equal(config.media_folder,'static/images/uploads');
    assert.equal(config.public_folder,'/images/uploads');
    assert.equal(Object.hasOwn(config,'media_library'),false,'The built-in uploader requires no top-level media_library block');
    assert.equal(typeof config.media_folder,'string');
    assert.equal(typeof config.public_folder,'string');
    assert.equal(config.backend.branch,'master');
});
async function initialize(hostname, sessionOK=true, origin='http://localhost:1314') {
    const element = () => ({appendChild(){}});
    const nodes=Object.fromEntries(['editor-message','editor-notice','editor-start'].map(id=>[id,element()]));
    let initialized; const calls=[];
    const context={location:{hostname,origin},document:{getElementById:id=>nodes[id],createElement:element},window:{CMS:{init:value=>initialized=value}},fetch:async url=>{
        calls.push(url); return {ok:sessionOK,json:async()=>url.endsWith('config.json')?structuredClone(config):{authenticated:sessionOK}};
    }};
    await vm.runInNewContext(fs.readFileSync('static/admin/init.js','utf8'),context);
    return {nodes,initialized,calls};
}
test('authenticated local editing uses only the same-origin protected API',async()=>{
    const result=await initialize('localhost');
    assert.equal(result.initialized.config.local_backend.url,'http://localhost:1314/api/v1');
    assert.match(result.nodes['editor-notice'].textContent,/LOCAL EDITOR/);
});
test('expired session cannot initialize editor',async()=>{
    const result=await initialize('localhost',false);
    assert.equal(result.initialized,undefined);
    assert.match(result.nodes['editor-message'].textContent,/expired/);
});
test('public and ordinary Hugo pages cannot initialize a write backend',async()=>{
    for(const [host,origin] of [['site.example','https://site.example'],['localhost','http://localhost:1313']]) {
        const result=await initialize(host,true,origin);
        assert.equal(result.initialized,undefined);
        assert.equal(result.calls.length,0);
    }
    assert.equal(config.local_backend,false);
});

test('all collection previews use the matching write-up styles and media assets',()=>{
    const previews={}; const styles=[];
    const CMS={registerPreviewStyle:style=>styles.push(style),registerPreviewTemplate:(name,view)=>previews[name]=view};
    const h=(tag,props,...children)=>({tag,props,children});
    vm.runInNewContext(fs.readFileSync('static/admin/preview.js','utf8'),{window:{CMS,h},CMS});
    for(const collection of config.collections) {
        const data={title:'Test',cover:'/images/uploads/test.png',image:'/images/uploads/test.png',draft:true};
        const rendered=previews[collection.name]({entry:{get:()=>({get:key=>data[key]})},getAsset:()=>({toString:()=>'/preview-upload.png'}),widgetFor:()=>h('p',{},'Body')});
        assert.match(JSON.stringify(rendered),/preview-upload.png/);
        assert.match(JSON.stringify(rendered),collection.name==='exploits'?/exploit-writeup-content/:/journal-prose/);
    }
    assert(styles.includes('/css/blog.css'));
});
