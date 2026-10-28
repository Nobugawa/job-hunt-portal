const A=window.APPS,TODAY=window.DATA_AS_OF,$=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const route=r=>{r=r.toLowerCase();if(!r)return'Unknown';if(r.includes('easy apply'))return'LinkedIn Easy Apply';if(r.includes('email'))return'Email';if(r.includes('linkedin'))return'LinkedIn → company site';if(r.includes('agency'))return'Agency';return'Company site / ATS'};
A.forEach(a=>{a.routeN=route(a.route);if(/interview|replied|call scheduled/i.test(a.notes)&&a.status==='Applied')a.status2='Interview'});
const stCls=s=>'s-'+(s||'').split(' ')[0];const chip=s=>`<span class="chip ${stCls(s)}">${esc(s)}</span>`;
const tchip=a=>`<span class="chip t-${a.track}" title="${a.trackInferred?'Inferred from role/pay':'From notes'}">Track ${a.track}${a.trackInferred?'*':''}</span>`;
const TR={A:'Director, $150k+',B:'Founder-led manager, ~$110k+',C:'Supply chain software'};
const fmtD=d=>d?new Date(d+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—';
const addD=(d,n)=>{const x=new Date(d+'T12:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const fu=a=>a.followup||(a.status==='Applied'&&a.applied?addD(a.applied,7):'');
/* v1.2.1: single pay helper used by list AND detail so they cannot disagree */
const payTxt=(mn,mx)=>mn?(mn===mx||!mx?`$${Math.round(mn/1000)}k`:`$${Math.round(mn/1000)}k–$${Math.round(mx/1000)}k`):'';
const payPosted=a=>payTxt(a.payMin,a.payMax)||(a.payText&&!/not posted/i.test(a.payText)?a.payText:'');
const payEst=a=>payTxt(a.estMin,a.estMax)?'est. '+payTxt(a.estMin,a.estMax):'';
const pay=a=>payPosted(a)?esc(payPosted(a)):payEst(a)?`<span class="muted">${esc(payEst(a))}</span>`:'—';
function dash(){const ap=A.filter(a=>a.status==='Applied'),wk=addD(TODAY,-7);
 const k=[['Total applied',ap.length,'#2f5bea'],['Applied this week',ap.filter(a=>a.applied>wk).length,'#7a5cff'],['Interviews / replies',A.filter(a=>a.status2).length,'#12b76a'],['Rejections',A.filter(a=>a.status==='Rejected').length,'#f04438'],['Packages ready',A.filter(a=>a.status==='Package ready').length,'#f79009'],['Skipped',A.filter(a=>a.status==='Skipped').length,'#98a2b3']];
 const order=[['Found','#98a2b3'],['Package ready','#f79009'],['Applied','#2f5bea'],['Rejected','#f04438'],['Skipped','#c0c5d0']],mx=Math.max(...order.map(o=>A.filter(a=>a.status===o[0]).length));
 const bars=(arr)=>arr.map(([l,n,c])=>`<div class="bar"><span class="lb">${l}</span><div class="tr"><div class="fi" style="width:${Math.max(4,n/mx*100)}%;background:${c}">${n}</div></div></div>`).join('');
 const tr=['A','B','C'].map(t=>{const x=A.filter(a=>a.track===t);return`<div class="bar"><span class="lb">${tchip({track:t})}</span><div class="tr"><div class="fi" style="width:${Math.max(4,x.length/A.length*100)}%;background:${{A:'#7a5cff',B:'#14a38b',C:'#e07b1a'}[t]}">${x.length}</div></div><span class="small muted" style="width:90px">${x.filter(a=>a.status==='Applied').length} applied</span></div><div class="small muted" style="margin:-4px 0 6px 130px">${TR[t]}</div>`}).join('');
 const due=ap.map(a=>({a,d:fu(a)})).sort((x,y)=>x.d<y.d?-1:1).slice(0,7);
 const pr=A.filter(a=>a.status==='Package ready');
 $('#app').innerHTML=`<h1>Good evening, Philos</h1><p class="sub">${ap.length} applications out · ${pr.length} packages ready to send</p>
 <div class="kpis">${k.map(([l,n,c])=>`<div class="card kpi" style="--c:${c}"><div class="n">${n}</div><div class="l">${l}</div></div>`).join('')}</div>
 <div class="grid2"><div class="card"><h2>Pipeline by status</h2>${bars(order.map(([l,c])=>[l,A.filter(a=>a.status===l).length,c]))}</div>
 <div class="card"><h2>⚡ Action needed</h2><ul class="list">
 ${(window.ACTION_ITEMS||[]).map(i=>`<li><b>${esc(i.title)}</b><div class="small muted">${esc(i.detail||'')}${i.due_date?' · due '+fmtD(i.due_date):''}</div></li>`).join('')}
 ${pr.length?`<li><b>${pr.length} packages ready, not yet submitted</b><div class="small muted">${pr.slice(0,4).map(a=>esc(a.company)).join(', ')}${pr.length>4?'…':''}</div></li>`:''}</ul></div></div>
 <div class="grid2"><div class="card"><h2>Applications by track</h2>${tr}<div class="small muted">* track inferred from role & pay (no track column in tracker yet)</div></div>
 <div class="card"><h2>📅 Follow-ups due</h2><ul class="list">${due.map(({a,d})=>`<li><a href="#/app/${a.id}"><b>${esc(a.company)}</b></a>, ${esc(a.role)}<div class="small ${d<=TODAY?'':'muted'}" style="${d<=TODAY?'color:#b42318':''}">${d<=TODAY?'Overdue · ':''}${fmtD(d)}${a.followup?'':' (auto: applied + 7d)'}</div></li>`).join('')}</ul></div></div>`}
let F={q:'',st:'',tr:'',rt:'',from:'',to:'',sort:'applied',dir:-1};
function list(){const opts=(arr,v)=>arr.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('');
 $('#app').innerHTML=`<h1>Applications</h1><p class="sub">${A.length} roles tracked</p><div class="card"><div class="filters">
 <input type="search" id="q" placeholder="Search company, role, notes…" value="${esc(F.q)}">
 <select id="st"><option value="">All statuses</option>${opts([...new Set(A.map(a=>a.status))],F.st)}</select>
 <select id="tr"><option value="">All tracks</option>${['A','B','C'].map(t=>`<option value="${t}" ${F.tr===t?'selected':''}>Track ${t}</option>`).join('')}</select>
 <select id="rt"><option value="">All routes</option>${opts([...new Set(A.map(a=>a.routeN))],F.rt)}</select>
 <input type="date" id="from" value="${F.from}" title="Applied from"><input type="date" id="to" value="${F.to}" title="Applied to"></div>
 <table><thead><tr>${[['company','Company / role'],['status','Status'],['track','Track'],['found','Found'],['applied','Applied'],['pay','Pay range'],['asked','Salary asked'],['medical','Medical'],['routeN','Route']].map(([k,l])=>`<th data-k="${k}">${l}${F.sort===k?(F.dir>0?' ▲':' ▼'):''}</th>`).join('')}</tr></thead><tbody id="tb"></tbody></table><div id="cnt" class="small muted" style="margin-top:10px"></div></div>`;
 ['q','st','tr','rt','from','to'].forEach(id=>$('#'+id).oninput=e=>{F[id]=e.target.value;rows()});
 document.querySelectorAll('th').forEach(th=>th.onclick=()=>{const k=th.dataset.k;F.dir=F.sort===k?-F.dir:1;F.sort=k;list()});rows()}
function rows(){const q=F.q.toLowerCase();let r=A.filter(a=>(!q||[a.company,a.role,a.notes,a.location,a.id].join(' ').toLowerCase().includes(q))&&(!F.st||a.status===F.st)&&(!F.tr||a.track===F.tr)&&(!F.rt||a.routeN===F.rt)&&(!F.from||a.applied>=F.from)&&(!F.to||(a.applied&&a.applied<=F.to)));
 r.sort((x,y)=>String(x[F.sort]||'').localeCompare(String(y[F.sort]||''))*F.dir);
 $('#tb').innerHTML=r.map(a=>`<tr class="r" data-id="${a.id}"><td class="k"><div class="co">${esc(a.company)}</div><div>${esc(a.role)}</div><div class="small muted">${esc(a.location)}</div><div class="mob small">${chip(a.status)} ${tchip(a)} · found ${fmtD(a.found)}${a.applied?' · applied '+fmtD(a.applied):''}</div></td><td>${chip(a.status)}</td><td>${tchip(a)}</td><td class="small">${fmtD(a.found)}</td><td>${fmtD(a.applied)}</td><td class="small">${pay(a)}</td><td>${a.asked?esc(a.asked):'<span class="muted">—</span>'}</td><td class="small" title="${esc(a.medical||'')}">${medS(a.medical)}</td><td class="small">${esc(a.routeN)}</td></tr>`).join('');
 $('#cnt').textContent=`Showing ${r.length} of ${A.length}`;document.querySelectorAll('tr.r').forEach(t=>t.onclick=()=>location.hash='#/app/'+t.dataset.id)}
function detail(id){const a=A.find(x=>x.id===id);if(!a)return dash();const fn=p=>p?esc(p.split('/').pop()):'—';
 const conf=/confirm/i.test(a.notes),rep=a.status2||a.status==='Rejected';
 $('#app').innerHTML=`<a class="back" href="#/list">← All applications</a><div class="card" style="margin-bottom:16px"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><div class="small muted">${a.id} · ${esc(a.industry)}</div><h1>${esc(a.company)}</h1><div style="font-size:16px">${esc(a.role)}</div><div class="muted">${esc(a.location)}</div><div style="margin-top:8px">${chip(a.statusRaw)} ${tchip(a)} <span class="chip s-Found">Fit ${esc(a.fit)}/5</span></div></div>
 <div>${a.url?`<a class="btn" href="${esc(a.url)}" target="_blank" rel="noopener">Open posting ↗</a>`:''}</div></div></div>
 <div class="dgrid"><div><div class="card" style="margin-bottom:16px"><h2>Fit notes</h2><p style="margin:0">${esc(a.fitNotes)||'—'}</p></div><div class="card" style="margin-bottom:16px"><h2>Notes</h2><p style="margin:0;white-space:pre-wrap">${esc(a.notes)||'—'}</p></div>
 <div class="card"><h2>Details</h2><dl class="kv"><dt>Pay (posted)</dt><dd>${esc(payPosted(a))||'—'}${a.payText&&payPosted(a)!==a.payText?`<div class="small muted">${esc(a.payText)}</div>`:''}</dd><dt>Pay (estimate)</dt><dd>${esc(payEst(a))||'—'}</dd><dt>Salary asked</dt><dd>${esc(a.asked)||'<span class="muted">not recorded</span>'}</dd><dt>Apply route</dt><dd>${esc(a.route)||'—'}</dd><dt>Source</dt><dd>${esc(a.source)}</dd><dt>Commute</dt><dd>${esc(a.commute)}</dd><dt>Company</dt><dd>${esc(a.size)}</dd></dl></div></div>
 <div><div class="card" style="margin-bottom:16px"><h2>Timeline</h2><div class="tl">
 <div style="--d:#98a2b3"><b>Found</b><div class="small muted">${fmtD(a.found)} · posted ${fmtD(a.posted)}</div></div>
 <div style="--d:${a.applied?'#2f5bea':'#d0d5dd'}"><b>Applied</b><div class="small muted">${a.applied?fmtD(a.applied):'Not yet'}</div></div>
 <div style="--d:${conf?'#2f5bea':'#d0d5dd'}"><b>Confirmation</b><div class="small muted">${conf?'Received':'—'}</div></div>
 <div style="--d:${rep?(a.status==='Rejected'?'#f04438':'#12b76a'):'#d0d5dd'}"><b>Reply</b><div class="small muted">${a.status==='Rejected'?'Rejected':a.status2?'Replied':'Waiting'}</div></div>
 <div style="--d:#d0d5dd"><b>Follow-up</b><div class="small muted">${fu(a)?fmtD(fu(a)):'—'}</div></div></div></div>
 <div class="card"><h2>Files & contact</h2><dl class="kv"><dt>Resume</dt><dd class="small">📄 ${fn(a.resume)}</dd><dt>Cover letter</dt><dd class="small">📄 ${fn(a.letter)}</dd><dt>Contact</dt><dd>${esc(a.contact)||'—'}</dd><dt>Follow-up</dt><dd>${fu(a)?fmtD(fu(a)):'—'}</dd></dl></div></div></div>`}
function nav(){const h=location.hash.slice(1)||'/';document.querySelectorAll('nav a').forEach(x=>x.classList.toggle('on',(h.startsWith('/list')||h.startsWith('/app'))?x.dataset.v==='list':x.dataset.v==='dash'));
 if(h.startsWith('/app/'))detail(h.slice(5));else if(h.startsWith('/list'))list();else dash();scrollTo(0,0)}
$('#asof').textContent=fmtD(TODAY)+', '+TODAY.slice(0,4);addEventListener('hashchange',nav);nav();
/* ===== v0.2.0 detail enhancements ===== */
const ICON={package:['📦','Package built'],submitted:['🚀','Submitted'],confirmation:['✅','Confirmation'],email:['✉️','Email'],followup:['🔔','Follow-up'],note:['📝','Note']};
const CH={Email:'✉️',LinkedIn:'in',InMail:'in',Phone:'📞'};
const host=u=>{try{return new URL(u).hostname.replace('www.','')}catch(e){return u}};
const src=u=>u?`<a class="src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`:'';
function companyFor(a){const L=window.COMPANIES||[];const c=(a.companyId&&L.find(c=>c.id===a.companyId))||L.find(c=>c.match.some(m=>a.company.includes(m)));return c&&c.status!=='pending'?c:null}/* v1.3.1: match by company_id first */
function fact(label,f){const v=f&&f.value;return`<dt>${label}</dt><dd>${v?`${esc(v)}${f.estimate?' <span class="est">est.</span>':''}${f.note?`<div class="small muted">${esc(f.note)}</div>`:''}<div>${src(f.source)}</div>`:'<span class="muted">—</span>'}</dd>`}
function companyPanel(a){const c=companyFor(a);
 if(!c)return`<div class="card"><h2>🏢 Company profile</h2><div class="empty"><b>Research pending</b><div class="small muted">Employees, revenue, founded, HQ, ownership, history, recent news and competitors for ${esc(a.company)} haven't been researched yet.</div></div><dl class="kv ghost">${['Employees','Revenue','Founded','HQ','Ownership'].map(l=>`<dt>${l}</dt><dd>—</dd>`).join('')}</dl></div>`;
 return`<div class="card"><h2>🏢 Company profile <span class="small muted">· ${esc(c.name)}</span></h2><dl class="kv">${fact('Employees',c.employees)}${fact('Revenue / sales',c.revenue)}${fact('Founded',c.founded)}${fact('HQ',c.hq)}${fact('Ownership',c.ownership)}</dl>
 <h3>History</h3><p>${esc(c.history)}</p><h3>Recent news</h3>${c.news.length?`<ul class="news">${c.news.map(n=>`<li><span class="small muted">${esc(n.date)}</span> <a href="${esc(n.url)}" target="_blank" rel="noopener">${esc(n.title)}</a> ${src(n.url)}</li>`).join('')}</ul>`:`<p class="small muted">${esc(c.newsNote||'None found')}</p>`}
 <h3>Likely competitors</h3><div>${c.competitors.map(x=>`<span class="chip s-Found">${esc(x)}</span>`).join(' ')||''}<div class="small muted">${esc(c.competitorsNote||'')}</div></div></div>`}
/* v1.4.2: real "Find people" / "Find profile" links (were placeholder spans). Plain <a target=_blank> so popup blockers don't interfere. */
const coName=a=>{let n=String(a.company||'');n=n.split(/\s+\(|\s+-\s+|\s+\|\s+|,?\s+(?:LLC|Inc\.?)(?:\s|$)/)[0].replace(/[®™]/g,'').replace(/,?\s*(LLC|Inc\.?|Ltd\.?|Co\.)\s*$/i,'').replace(/,\s*$/,'').trim();return n};
const isAgency=a=>/agency|recruit|staffing|search group|client:|confidential|jobot/i.test(a.company+' '+(a.size||''));
const roleFn=r=>{r=String(r||'').toLowerCase();return /customer success|account manag|implementation|professional services|client success/.test(r)?'"customer success" OR implementation OR "professional services"':/sourc/.test(r)?'sourcing':/procure|purchas/.test(r)?'procurement':/logistic|warehouse|distribution|import|fulfil/.test(r)?'logistics':/supply chain|planning|inventory|demand/.test(r)?'"supply chain"':/product develop|production|merchandis/.test(r)?'production':/customer success|account|implementation|professional services|client success/.test(r)?'"customer success" OR implementation':/quality|compliance/.test(r)?'quality':'operations'};
const liS=k=>'https://www.linkedin.com/search/results/people/?keywords='+encodeURIComponent(k)+'&origin=GLOBAL_SEARCH_HEADER';
const gS=k=>'https://www.google.com/search?q='+encodeURIComponent(k);
const fpA=(u,t,tip)=>`<a class="fp" href="${esc(u)}" target="_blank" rel="noopener" title="${esc(tip||'')}">${t}</a>`;
function findProfile(c,a){const co=c.company||coName(a);return`<span class="small muted">No LinkedIn yet:</span> ${fpA(liS(`"${c.name}" ${co}`),'🔍 LinkedIn','Search LinkedIn for this person')} ${fpA(gS(`site:linkedin.com/in "${c.name}" "${co}"`),'🔍 Google','Google their LinkedIn profile')}`}
function findPeople(a,empty){const co=coName(a),fn=roleFn(a.role);
 if(!co||/^confidential$/i.test(co))return`<div class="fpw"><span class="small muted">Company is confidential, so there's no one to search for. Ask the recruiter who the hiring manager is.</span></div>`;
 const ag=isAgency(a),q=`"${co}"`;
 const links=ag?[[liS(`${q} (recruiter OR "talent acquisition" OR partner)`),'Recruiters','Recruiters at the agency'],[liS(q),'Everyone',`Everyone on LinkedIn at ${co}`],[gS(`site:linkedin.com/in ${q} recruiter`),'Google','Google LinkedIn profiles']]
  :[[liS(`${q} ${fn} (VP OR director OR head OR manager)`),'Hiring manager',`${fn} leaders at ${co}`],[liS(`${q} (CEO OR founder OR president OR owner OR COO)`),'CEO / founder','Top leadership'],[liS(`${q} (recruiter OR "talent acquisition" OR HR OR "people operations")`),'Recruiter / HR','Recruiting & HR'],[liS(q),'Everyone',`Everyone on LinkedIn at ${co}`],[gS(`site:linkedin.com/in ${q} (${fn} OR CEO OR founder OR "hiring manager")`),'Google','Google LinkedIn profiles (works without LinkedIn sign-in)']];
 return`<div class="fpw"><div class="small" style="margin-bottom:4px"><b>🔍 ${empty?'Find people':'Find more people'}</b> <span class="muted">at ${esc(co)}${ag?' (recruiter)':''} · opens LinkedIn / Google in a new tab</span></div>${links.map(([u,t,tip])=>fpA(u,t,tip)).join(' ')}</div>`}
function peoplePanel(a){const cs=(window.CONTACTS||[]).filter(c=>(a.companyId&&c.companyId)?a.companyId===c.companyId:(a.company.includes(c.company)||c.company.includes(a.company.split(' (')[0])));
 const body=cs.length?cs.map(c=>{const log=(window.INTERACTIONS||[]).filter(i=>i.contact===c.id).sort((x,y)=>y.date.localeCompare(x.date));const last=log.find(i=>i.status==='sent');
 return`<div class="person"><div class="ph"><div class="av">${esc(c.name.split(' ').map(w=>w[0]).slice(0,2).join(''))}</div><div><b>${esc(c.name)}</b><div class="small">${esc(c.title)}</div><span class="chip rel">${esc(c.relationship)}</span></div></div>
 <div class="small pl">${c.linkedin?`<a href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a> `:findProfile(c,a)}${c.email?` · <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`:''}${c.phone?` · ${esc(c.phone)}`:''}</div>
 ${c.bio?`<p class="small">${esc(c.bio)}</p><div class="small muted">Sources: ${c.sources.map(src).join(', ')}</div>`:`<p class="small muted">No bio yet. Nothing researched for this contact.</p>`}
 <div class="small" style="margin-top:6px"><b>Last contacted:</b> ${last?fmtD(last.date):'<span class="muted">never</span>'}</div>
 <table class="crm"><thead><tr><th>Date</th><th>Channel</th><th>Dir.</th><th>Summary</th><th>Next step</th></tr></thead><tbody>${log.length?log.map(i=>`<tr><td>${fmtD(i.date)}</td><td>${CH[i.channel]||''} ${esc(i.channel)}</td><td>${i.direction==='Outbound'?'→ Out':'← In'}</td><td>${i.status==='drafted'?'<span class="chip s-Package">drafted, not sent</span> ':''}${esc(i.summary)}</td><td>${esc(i.next)}</td></tr>`).join(''):'<tr><td colspan="5" class="muted">No interactions yet</td></tr>'}</tbody></table></div>`}).join('')
 :`<div class="empty"><b>No people yet</b><div class="small muted">Hiring manager / recruiter not identified. </div>${findPeople(a,1)}</div>`;
 return`<div class="card"><h2>👥 Key people${cs.length?` <span class="small muted">· ${cs.length}</span>`:''}</h2>${body}${cs.length?findPeople(a,0):''}</div>`}
function activityPanel(a){const acts=(window.ACTIVITIES||[]).filter(x=>x.appId===a.id).sort((x,y)=>x.date.localeCompare(y.date)||x.seq-y.seq);
 return`<div class="card"><h2>🗂 Activity</h2>${acts.length?`<div class="act">${acts.map(x=>`<div class="ai"><div class="ic">${ICON[x.type][0]}</div><div><div class="small muted">${fmtD(x.date)}${x.dateInferred?' (approx.)':''} · ${ICON[x.type][1]}</div><div>${esc(x.text)}</div>${x.details.length?`<details><summary>details</summary>${x.details.map(d=>`<code>${esc(d)}</code>`).join('')}</details>`:''}</div></div>`).join('')}</div>`:'<p class="muted">No activity</p>'}</div>`}
const _detail=detail;
detail=function(id){_detail(id);const a=A.find(x=>x.id===id);if(!a)return;
 const cards=[...document.querySelectorAll('.dgrid > div:first-child > .card')];const notes=cards.find(c=>c.querySelector('h2')?.textContent==='Notes');if(notes)notes.outerHTML=activityPanel(a);
 document.querySelector('.dgrid').insertAdjacentHTML('afterend',`<div class="dgrid2">${companyPanel(a)}${peoplePanel(a)}</div>`)};
nav();
/* ===== v1.1.0: dates/applicants, signed doc links, user notes ===== */
/* ===== v1.2.0: medical_paid + travel on detail ===== */
async function openDoc(path,el){const w=window.open('','_blank');const{data,error}=await window.SB.storage.from('docs').createSignedUrl(path,300);
 if(error||!data){if(w)w.close();el.insertAdjacentHTML('afterend',` <span class="small" style="color:#b42318">Couldn't open file (${esc(error?error.message:'unknown')})</span>`);return}
 if(w)w.location=data.signedUrl;else location.href=data.signedUrl}
function notesCard(){return`<div class="card" id="unotes" style="margin-bottom:16px"><h2>📝 My notes</h2>
 <textarea id="unb" rows="3" placeholder="Add a note…" style="width:100%;box-sizing:border-box;padding:8px;border:1px solid #d9dde6;border-radius:8px;font:inherit"></textarea>
 <div style="margin:6px 0 10px"><button id="una" class="btn" style="border:0;cursor:pointer">Add note</button> <span id="unm" class="small muted"></span></div><div id="unl" class="small muted">Loading…</div></div>`}
async function loadNotes(a){const l=$('#unl');if(!l)return;const{data,error}=await window.SB.from('user_notes').select('*').eq('application_id',a.id).order('created_at',{ascending:false});
 if(error){l.innerHTML='Notes aren\'t set up yet (database table missing).';$('#una').disabled=true;return}
 l.className='';l.innerHTML=data.length?data.map(n=>`<div style="border-top:1px solid #eef0f4;padding:8px 0"><div class="small muted">${new Date(n.created_at).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})}</div><div style="white-space:pre-wrap">${esc(n.body)}</div></div>`).join(''):'<span class="muted small">No notes yet.</span>'}
const _detail11=detail;
detail=function(id){_detail11(id);const a=A.find(x=>x.id===id);if(!a)return;
 const kv=document.querySelector('.dgrid .card dl.kv');
 if(kv)kv.insertAdjacentHTML('afterbegin',`<dt>Found</dt><dd>${a.found?fmtD(a.found)+', '+a.found.slice(0,4):'—'}</dd><dt>Posted</dt><dd>${a.posted?fmtD(a.posted)+', '+a.posted.slice(0,4):'—'}</dd><dt>Applicants</dt><dd>${a.applicants!=null?esc(a.applicants):'—'}</dd><dt>Medical (employer-paid)</dt><dd>${a.medical?esc(a.medical):'—'}</dd><dt>Travel</dt><dd>${a.travel?esc(a.travel):'—'}</dd>`);
 const docs=[...document.querySelectorAll('dd.small')].filter(d=>d.textContent.startsWith('📄'));
 [a.resume,a.letter].forEach((p,i)=>{const d=docs[i];if(!d)return;if(p&&p.endsWith('.pdf')){d.innerHTML=`<a href="#" class="doclink">📄 ${esc(p.split('/').pop())}</a>`;d.querySelector('a').onclick=ev=>{ev.preventDefault();openDoc(p,ev.target)}}else d.innerHTML='<span class="muted">—</span>'});
 const col=document.querySelector('.dgrid > div:first-child');if(col){col.insertAdjacentHTML('afterbegin',notesCard());
  $('#una').onclick=async()=>{const b=$('#unb').value.trim();if(!b)return;$('#una').disabled=true;$('#unm').textContent='Saving…';
   const{error}=await window.SB.from('user_notes').insert({application_id:a.id,company_id:null,body:b});$('#una').disabled=false;
   if(error){$('#unm').textContent='Error: '+error.message;return}$('#unb').value='';$('#unm').textContent='Saved';loadNotes(a)};loadNotes(a)}};
nav();

/* v1.2.2 compact medical */
function medS(m){if(!m)return '<span class="muted">—</span>';const t=String(m).toLowerCase();if(/^\s*not stated|^n\/s|^unknown/.test(t))return '<span class="muted">—</span>';const up=/up to\s*100/.test(t);if(up)return 'Up to 100%';if(/fully (company|employer)[- ]paid medical|100%[^.]{0,20}(medical|health)|medical[^.]{0,20}\(100%\)/.test(t))return '100%';const p=(t.match(/(\d{1,3})\s*%[^.]{0,25}(medical|health)/)||[])[1];if(p)return p+'%';return '% n/s';}
/* ===== v1.3.0: Communications log ===== */
const KIND={decision:['🧭','Decision'],update:['📣','Update'],draft:['✍️','Draft'],reply:['📨','Reply'],rule:['📏','Rule'],answer:['📝','App answers']};
const CF={q:'',co:'',k:''};
function cmItem(c,showCo){const k=KIND[c.kind]||['•',c.kind];const a=c.appId&&A.find(x=>x.id===c.appId);
 return`<div class="ai"><div class="ic">${k[0]}</div><div style="flex:1;min-width:0"><div class="small muted">${fmtD(c.date)} · ${k[1]}${showCo?` · ${a?`<a href="#/app/${a.id}">${esc(c.company)}</a>`:esc(c.company)}`:''}</div><div><b>${esc(c.summary)}</b></div>
 ${c.text&&c.text!==c.summary?`<div style="white-space:pre-wrap;margin-top:4px;${c.kind==='draft'?'background:#f6f7fb;border:1px solid #e5e8ef;border-radius:8px;padding:8px;font-family:ui-monospace,monospace;font-size:13px':''}">${esc(c.text)}</div>`:''}
 ${c.kind==='draft'?`<button class="btn cmcp" data-id="${esc(c.id)}" style="border:0;cursor:pointer;margin-top:6px;padding:4px 10px;font-size:12px">Copy</button>`:''}</div></div>`}
const cmSort=l=>l.slice().sort((x,y)=>(y.date||'').localeCompare(x.date||'')||x.id.localeCompare(y.id));
document.addEventListener('click',e=>{const b=e.target.closest('.cmcp');if(!b)return;const c=(window.COMMS||[]).find(x=>x.id===b.dataset.id);
 navigator.clipboard.writeText(c.text).then(()=>{b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy',1500)})});
function comms(){const C=window.COMMS||[];const cos=[...new Set(C.map(c=>c.company))].sort();const o=(arr,v,lab)=>`<option value="">${lab}</option>`+arr.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('');
 $('#app').innerHTML=`<div class="card"><h1>Communications</h1><p class="sub muted">Key findings, decisions, application answers, replies, drafts and rules from the Job Hunter chat.</p>
 <div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0"><input id="cq" placeholder="Search…" value="${esc(CF.q)}" style="flex:1;min-width:200px;padding:8px;border:1px solid #d9dde6;border-radius:8px">
 <select id="cco">${o(cos,CF.co,'All companies')}</select><select id="ck"><option value="">All kinds</option>${Object.entries(KIND).map(([k,v])=>`<option value="${k}" ${k===CF.k?'selected':''}>${v[1]}</option>`).join('')}</select></div><div id="cl" class="act"></div><div id="cc" class="small muted"></div></div>`;
 const draw=()=>{const q=CF.q.toLowerCase();const r=cmSort(C.filter(c=>(!q||[c.company,c.summary,c.text,c.appId].join(' ').toLowerCase().includes(q))&&(!CF.co||c.company===CF.co)&&(!CF.k||c.kind===CF.k)));
  $('#cl').innerHTML=r.map(c=>cmItem(c,1)).join('')||'<p class="muted">No matches</p>';$('#cc').textContent=`${r.length} of ${C.length} entries`};
 $('#cq').oninput=e=>{CF.q=e.target.value;draw()};$('#cco').onchange=e=>{CF.co=e.target.value;draw()};$('#ck').onchange=e=>{CF.k=e.target.value;draw()};draw()}
const _dash13=dash;dash=function(){if(location.hash.startsWith('#/comms')){document.querySelectorAll('nav a').forEach(x=>x.classList.toggle('on',x.dataset.v==='comms'));return comms()}return _dash13()};
const _detail13=detail;detail=function(id){_detail13(id);const a=A.find(x=>x.id===id);if(!a)return;const l=cmSort((window.COMMS||[]).filter(c=>c.appId===a.id));
 const g=document.querySelector('.dgrid2')||document.querySelector('.dgrid');g&&g.insertAdjacentHTML('afterend',`<div class="card" style="margin-top:16px"><h2>💬 Communications</h2>${l.length?`<div class="act">${l.map(c=>cmItem(c,0)).join('')}</div>`:'<p class="muted">No communications logged</p>'}</div>`)};
nav();

/* ===== v1.4.0: Found date in header + Best / Worst / What the job really is ===== */
const insList=t=>{const l=String(t||'').split('\n').map(x=>x.trim()).filter(Boolean);return l.length?`<ul class="ins">${l.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="muted small">Not written yet</p>'};
function insightsCard(a){return`<div class="card insights" style="margin-bottom:16px"><h2>🧭 My take on this job</h2>
 <div class="insg"><div class="ib good"><h3>👍 Best aspects</h3>${insList(a.best)}</div><div class="ib bad"><h3>👎 Worst aspects</h3>${insList(a.worst)}</div></div>
 <div class="ib real"><h3>🗣 What the job really is</h3>${a.real?`<p>${esc(a.real)}</p>`:'<p class="muted small">Not written yet</p>'}</div>
 <div class="small muted">Opinion, based on the posting and your background.</div></div>`}
const _detail14=detail;detail=function(id){_detail14(id);const a=A.find(x=>x.id===id);if(!a)return;
 const hd=document.querySelector('#app > .card .small.muted');if(hd&&!hd.querySelector('.fd'))hd.insertAdjacentHTML('beforeend',` · <span class="fd">Found ${a.found?fmtD(a.found)+', '+a.found.slice(0,4):'—'}</span>`);
 const col=document.querySelector('.dgrid');if(col)col.insertAdjacentHTML('beforebegin',insightsCard(a))};
nav();

/* ===== v1.5.2: Applications list checkboxes + JH-ID + portal_actions queue ===== */
const SEL_KEY='jhp_checked_ids';
const loadSel=()=>{try{return new Set(JSON.parse(localStorage.getItem(SEL_KEY)||'[]'))}catch(e){return new Set()}};
const saveSel=s=>{try{localStorage.setItem(SEL_KEY,JSON.stringify([...s]))}catch(e){}};
let SEL=loadSel();
F.checkedOnly=F.checkedOnly||false;
const todayISO=()=>new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'}); /* YYYY-MM-DD in ET */
function selCnt(){const n=SEL.size;const el=$('#selCnt');if(el)el.textContent=n?`${n} selected`:'0 selected';
 document.querySelectorAll('#actApply,#actPass,#actPackage,#actHold').forEach(b=>{if(b)b.disabled=!n});
 const msg=$('#actMsg');if(msg&&!msg.dataset.sticky)msg.textContent=''}
function setActMsg(t,ok){const m=$('#actMsg');if(!m)return;m.dataset.sticky='1';m.style.color=ok?'#067647':'#b42318';m.textContent=t;
 setTimeout(()=>{m.dataset.sticky='';if(m.textContent===t)m.textContent=''},5000)}
async function queueActions(action){const ids=[...SEL];if(!ids.length)return;
 let note=null;
 if(action==='pass'){const d=todayISO();const r=prompt('Pass reason (optional):',`user pass ${d}`);if(r===null)return;note=(r.trim()||`user pass ${d}`)}
 if(action==='hold'){const r=prompt('Hold note / until date (optional):','');if(r===null)return;note=r.trim()||null}
 const labels={apply:'Apply',pass:'Pass',package:'Package',hold:'Hold'};
 const btns=['#actApply','#actPass','#actPackage','#actHold'].map(s=>$(s)).filter(Boolean);
 btns.forEach(b=>b.disabled=true);
 const row={action,application_ids:ids,note,status:'pending'};
 try{const{data:{session}}=await window.SB.auth.getSession();if(session?.user?.email)row.created_by=session.user.email}catch(e){}
 const{error}=await window.SB.from('portal_actions').insert(row);
 if(error){setActMsg('Could not queue: '+error.message+(/relation|schema cache|does not exist/i.test(error.message)?' (run alter_portal_actions.sql in Supabase)':''),0);selCnt();return}
 setActMsg(`Queued ${ids.length} role${ids.length===1?'':'s'} for ${labels[action]}`,1);
 SEL=new Set();saveSel(SEL);rows()}
const _list152=list,_rows152=rows;
list=function(){const opts=(arr,v)=>arr.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('');
 $('#app').innerHTML=`<h1>Applications</h1><p class="sub">${A.length} roles tracked</p><div class="card"><div class="filters">
 <input type="search" id="q" placeholder="Search company, role, notes, JH-ID…" value="${esc(F.q)}">
 <select id="st"><option value="">All statuses</option>${opts([...new Set(A.map(a=>a.status))],F.st)}</select>
 <select id="tr"><option value="">All tracks</option>${['A','B','C'].map(t=>`<option value="${t}" ${F.tr===t?'selected':''}>Track ${t}</option>`).join('')}</select>
 <select id="rt"><option value="">All routes</option>${opts([...new Set(A.map(a=>a.routeN))],F.rt)}</select>
 <input type="date" id="from" value="${F.from}" title="Applied from"><input type="date" id="to" value="${F.to}" title="Applied to">
 <label class="chkf" title="Show only rows you have checked"><input type="checkbox" id="checkedOnly" ${F.checkedOnly?'checked':''}> Checked only</label></div>
 <div class="bulkbar"><div class="bulkt">
  <button type="button" class="btn ghost" id="selAll">Select all (visible)</button>
  <button type="button" class="btn ghost" id="selClear">Clear</button>
  <button type="button" class="btn ghost" id="selInv">Invert</button>
  <span id="selCnt" class="small muted">0 selected</span></div>
 <div class="bulkacts">
  <button type="button" class="btn" id="actApply" disabled>Apply</button>
  <button type="button" class="btn warn" id="actPass" disabled>Pass</button>
  <button type="button" class="btn" id="actPackage" disabled>Package</button>
  <button type="button" class="btn ghost" id="actHold" disabled>Hold</button></div></div>
 <div id="actMsg" class="small" style="min-height:1.2em;margin:4px 0 8px"></div>
 <table><thead><tr>
 <th class="cb" title="Select"></th>
 ${[['id','ID'],['company','Company / role'],['status','Status'],['track','Track'],['found','Found'],['applied','Applied'],['pay','Pay range'],['asked','Salary asked'],['medical','Medical'],['routeN','Route']].map(([k,l])=>`<th data-k="${k}">${l}${F.sort===k?(F.dir>0?' ▲':' ▼'):''}</th>`).join('')}
 </tr></thead><tbody id="tb"></tbody></table><div id="cnt" class="small muted" style="margin-top:10px"></div></div>`;
 ['q','st','tr','rt','from','to'].forEach(id=>$('#'+id).oninput=e=>{F[id]=e.target.value;rows()});
 $('#checkedOnly').onchange=e=>{F.checkedOnly=e.target.checked;rows()};
 document.querySelectorAll('th[data-k]').forEach(th=>th.onclick=()=>{const k=th.dataset.k;F.dir=F.sort===k?-F.dir:1;F.sort=k;list()});
 $('#selAll').onclick=()=>{const vis=window._LIST_VIS||[];vis.forEach(a=>SEL.add(a.id));saveSel(SEL);rows()};
 $('#selClear').onclick=()=>{SEL=new Set();saveSel(SEL);rows()};
 $('#selInv').onclick=()=>{const vis=window._LIST_VIS||[];vis.forEach(a=>{if(SEL.has(a.id))SEL.delete(a.id);else SEL.add(a.id)});saveSel(SEL);rows()};
 $('#actApply').onclick=()=>queueActions('apply');
 $('#actPass').onclick=()=>queueActions('pass');
 $('#actPackage').onclick=()=>queueActions('package');
 $('#actHold').onclick=()=>queueActions('hold');
 rows()};
rows=function(){const q=F.q.toLowerCase();let r=A.filter(a=>(!q||[a.company,a.role,a.notes,a.location,a.id].join(' ').toLowerCase().includes(q))&&(!F.st||a.status===F.st)&&(!F.tr||a.track===F.tr)&&(!F.rt||a.routeN===F.rt)&&(!F.from||a.applied>=F.from)&&(!F.to||(a.applied&&a.applied<=F.to))&&(!F.checkedOnly||SEL.has(a.id)));
 r.sort((x,y)=>String(x[F.sort]||'').localeCompare(String(y[F.sort]||''),undefined,{numeric:true})*F.dir);
 window._LIST_VIS=r;
 $('#tb').innerHTML=r.map(a=>`<tr class="r${SEL.has(a.id)?' on':''}" data-id="${a.id}">
 <td class="cb"><input type="checkbox" class="rowcb" data-id="${esc(a.id)}" ${SEL.has(a.id)?'checked':''} aria-label="Select ${esc(a.id)}"></td>
 <td class="idcol"><code>${esc(a.id)}</code></td>
 <td class="k"><div class="co">${esc(a.company)}</div><div>${esc(a.role)}</div><div class="small muted">${esc(a.location)}</div><div class="mob small"><code>${esc(a.id)}</code> · ${chip(a.status)} ${tchip(a)} · found ${fmtD(a.found)}${a.applied?' · applied '+fmtD(a.applied):''}</div></td>
 <td>${chip(a.status)}</td><td>${tchip(a)}</td><td class="small">${fmtD(a.found)}</td><td>${fmtD(a.applied)}</td><td class="small">${pay(a)}</td><td>${a.asked?esc(a.asked):'<span class="muted">—</span>'}</td><td class="small" title="${esc(a.medical||'')}">${medS(a.medical)}</td><td class="small">${esc(a.routeN)}</td></tr>`).join('');
 $('#cnt').textContent=`Showing ${r.length} of ${A.length}`+(SEL.size?` · ${SEL.size} checked (all filters)`:'');
 document.querySelectorAll('tr.r').forEach(t=>{
  t.onclick=e=>{if(e.target.closest('.rowcb')||e.target.closest('td.cb'))return;location.hash='#/app/'+t.dataset.id};
 });
 document.querySelectorAll('.rowcb').forEach(cb=>{
  cb.onclick=e=>e.stopPropagation();
  cb.onchange=e=>{e.stopPropagation();const id=cb.dataset.id;if(cb.checked)SEL.add(id);else SEL.delete(id);saveSel(SEL);
   const tr=cb.closest('tr');if(tr)tr.classList.toggle('on',cb.checked);selCnt();
   if(F.checkedOnly&&!cb.checked)rows()};
 });
 selCnt()};
if((location.hash.slice(1)||'/').startsWith('/list'))list();

/* ===== v1.5.3: Detail carousel prev/next (list order) ===== */
const F_KEY='jhp_list_filters';
(function restoreF(){try{const s=JSON.parse(sessionStorage.getItem(F_KEY)||'null');if(s&&typeof s==='object'){
  ['q','st','tr','rt','from','to','sort'].forEach(k=>{if(s[k]!=null)F[k]=s[k]});
  if(s.dir===1||s.dir===-1)F.dir=s.dir;
  if(typeof s.checkedOnly==='boolean')F.checkedOnly=s.checkedOnly;
}}catch(e){}})();
const saveF=()=>{try{sessionStorage.setItem(F_KEY,JSON.stringify({q:F.q,st:F.st,tr:F.tr,rt:F.rt,from:F.from,to:F.to,sort:F.sort,dir:F.dir,checkedOnly:!!F.checkedOnly}))}catch(e){}};
function filteredApps(){const q=(F.q||'').toLowerCase();let r=A.filter(a=>(!q||[a.company,a.role,a.notes,a.location,a.id].join(' ').toLowerCase().includes(q))&&(!F.st||a.status===F.st)&&(!F.tr||a.track===F.tr)&&(!F.rt||a.routeN===F.rt)&&(!F.from||a.applied>=F.from)&&(!F.to||(a.applied&&a.applied<=F.to))&&(!F.checkedOnly||SEL.has(a.id)));
 r.sort((x,y)=>String(x[F.sort]||'').localeCompare(String(y[F.sort]||''),undefined,{numeric:true})*(F.dir||1));return r}
rows=function(){saveF();const r=filteredApps();window._LIST_VIS=r;
 $('#tb').innerHTML=r.map(a=>`<tr class="r${SEL.has(a.id)?' on':''}" data-id="${a.id}">
 <td class="cb"><input type="checkbox" class="rowcb" data-id="${esc(a.id)}" ${SEL.has(a.id)?'checked':''} aria-label="Select ${esc(a.id)}"></td>
 <td class="idcol"><code>${esc(a.id)}</code></td>
 <td class="k"><div class="co">${esc(a.company)}</div><div>${esc(a.role)}</div><div class="small muted">${esc(a.location)}</div><div class="mob small"><code>${esc(a.id)}</code> · ${chip(a.status)} ${tchip(a)} · found ${fmtD(a.found)}${a.applied?' · applied '+fmtD(a.applied):''}</div></td>
 <td>${chip(a.status)}</td><td>${tchip(a)}</td><td class="small">${fmtD(a.found)}</td><td>${fmtD(a.applied)}</td><td class="small">${pay(a)}</td><td>${a.asked?esc(a.asked):'<span class="muted">—</span>'}</td><td class="small" title="${esc(a.medical||'')}">${medS(a.medical)}</td><td class="small">${esc(a.routeN)}</td></tr>`).join('');
 $('#cnt').textContent=`Showing ${r.length} of ${A.length}`+(SEL.size?` · ${SEL.size} checked (all filters)`:'');
 document.querySelectorAll('tr.r').forEach(t=>{
  t.onclick=e=>{if(e.target.closest('.rowcb')||e.target.closest('td.cb'))return;location.hash='#/app/'+t.dataset.id};
 });
 document.querySelectorAll('.rowcb').forEach(cb=>{
  cb.onclick=e=>e.stopPropagation();
  cb.onchange=e=>{e.stopPropagation();const id=cb.dataset.id;if(cb.checked)SEL.add(id);else SEL.delete(id);saveSel(SEL);
   const tr=cb.closest('tr');if(tr)tr.classList.toggle('on',cb.checked);selCnt();
   if(F.checkedOnly&&!cb.checked)rows()};
 });
 selCnt()};
function carouselBar(id){const ids=filteredApps().map(a=>a.id);const i=ids.indexOf(id);const n=ids.length;
 const prev=i>0?ids[i-1]:null;const next=i>=0&&i<n-1?ids[i+1]:null;
 const pos=i>=0?`<code>${esc(id)}</code> · ${i+1} of ${n}`:`<code>${esc(id)}</code> · <span class="muted">not in current list</span>`;
 return`<div class="carbar" role="navigation" aria-label="Application navigation">
  <a class="back" href="#/list">← All applications</a>
  <span class="carpos">${pos}</span>
  <div class="carnav">
   <button type="button" class="btn ghost carn" id="carPrev" ${prev?'':'disabled'} data-id="${prev||''}" title="Previous (←)" aria-label="Previous application">‹ Prev</button>
   <button type="button" class="btn ghost carn" id="carNext" ${next?'':'disabled'} data-id="${next||''}" title="Next (→)" aria-label="Next application">Next ›</button>
  </div></div>`}
const _detail153=detail;
detail=function(id){_detail153(id);const a=A.find(x=>x.id===id);if(!a)return;
 const back=document.querySelector('#app > a.back');
 if(back)back.outerHTML=carouselBar(id);
 else{const root=$('#app');if(root)root.insertAdjacentHTML('afterbegin',carouselBar(id))}
 const go=btn=>{const nid=btn&&btn.dataset.id;if(nid)location.hash='#/app/'+nid};
 const p=$('#carPrev'),n=$('#carNext');
 if(p)p.onclick=e=>{e.preventDefault();if(!p.disabled)go(p)};
 if(n)n.onclick=e=>{e.preventDefault();if(!n.disabled)go(n)}};
if(!window._carKeys){window._carKeys=1;addEventListener('keydown',e=>{
 if(e.defaultPrevented||(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'))return;
 const t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;
 const h=location.hash.slice(1)||'/';if(!h.startsWith('/app/'))return;
 const btn=e.key==='ArrowLeft'?$('#carPrev'):$('#carNext');
 if(btn&&!btn.disabled&&btn.dataset.id){e.preventDefault();location.hash='#/app/'+btn.dataset.id}
})}
if((location.hash.slice(1)||'/').startsWith('/app/'))nav();
