(() => {
    if (!window.CMS) return;
    const h = window.h;
    ['/css/style.css','/css/blog.css','/css/exploits.css','/css/research.css','/css/cves.css'].forEach(path => CMS.registerPreviewStyle(path));
    CMS.registerPreviewStyle('body{margin:0!important} .journal-post,.exploit-writeup{padding:32px;max-width:900px} img{max-width:100%;height:auto}', {raw:true});
    function preview(collection) {
        return function WriteupPreview(props) {
            const data = props.entry.get('data');
            const exploit = collection === 'exploits';
            const authorData = data.get('authors');
            const authors = Array.isArray(authorData) ? authorData : authorData?.toArray?.() || [];
            const title = data.get('title') || 'Untitled write-up';
            const cover = data.get(collection === 'articles' ? 'image' : 'cover');
            const image = cover ? h('img', {className:'journal-post-cover',src:props.getAsset(cover).toString(),alt:data.get('cover_alt') || ''}) : null;
            const labels = exploit ? [data.get('platform'),data.get('cve'),data.get('disclosure')].filter(Boolean) : [];
            return h('article',{className:exploit ? 'exploits-page exploit-writeup' : 'journal-page journal-post'},
                h('header',{className:exploit ? 'exploit-writeup-header' : 'journal-post-header'},
                    h('p',{className:exploit ? 'exploit-kicker' : 'journal-kicker'},data.get('cve_id') || data.get('publication_type') || data.get('research_type') || data.get('category') || collection),
                    h('h1',{},title),
                    h('p',{className:exploit ? 'exploit-writeup-description' : 'journal-post-description'},data.get('description') || data.get('subtitle') || ''),
                    h('div',{className:'journal-post-meta'},collection === 'research' ? authors.join(', ') : 'Deepan Sai', data.get('draft') ? ' / Draft' : ''),
                    exploit ? h('div',{className:'exploit-tags'},...labels.map(label=>h('span',{key:label},label))) : null),
                image,
                collection === 'cves' ? h('div',{className:'advisory-fact-sheet'},...['product','affected_versions','fixed_versions','severity','cvss_score','cve_status','remediation_status'].filter(key=>data.get(key)!==undefined && data.get(key)!=='').map(key=>h('div',{key},h('p',{},key.replace(/_/g,' ')),h('p',{},String(data.get(key)))))) : null,
                collection === 'cves' && data.get('impact') ? h('section',{className:'advisory-note'},h('h2',{},'Impact'),h('p',{},data.get('impact'))) : null,
                collection === 'cves' && data.get('mitigation') ? h('section',{className:'advisory-note'},h('h2',{},'Remediation and mitigation'),h('p',{},data.get('mitigation'))) : null,
                collection === 'research' && data.get('abstract') ? h('section',{className:'research-document-abstract'},h('h2',{},'Abstract'),h('p',{},data.get('abstract'))) : null,
                h('div',{className:exploit ? 'exploit-writeup-content' : 'journal-prose'},props.widgetFor('body')));
        };
    }
    ['blog','articles','exploits','research','cves'].forEach(collection=>CMS.registerPreviewTemplate(collection,preview(collection)));
})();
