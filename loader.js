const C=window.PORTAL_CONFIG;document.getElementById('ver').textContent=C.VERSION;
const sb=supabase.createClient(C.SUPABASE_URL,C.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,detectSessionInUrl:true}});
const e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function login(msg){document.getElementById('app').innerHTML=`<div class="card" style="max-width:420px;margin:60px auto;text-align:center">
 <h1>Sign in</h1><p class="sub">We'll email a magic link to ${e(C.ALLOWED_EMAIL)}.</p>
 <input id="em" type="email" value="${e(C.ALLOWED_EMAIL)}" style="width:100%;padding:10px;border:1px solid #d9dde6;border-radius:8px;font:inherit;margin-bottom:10px">
 <button id="go" class="btn" style="border:0;width:100%;cursor:pointer">Email me a sign-in link</button><p id="msg" class="small muted">${e(msg||'')}</p></div>`;
 document.getElementById('go').onclick=async()=>{const em=document.getElementById('em').value.trim().toLowerCase();const m=document.getElementById('msg');
  if(em!==C.ALLOWED_EMAIL){m.textContent='This portal is private.';return}
  const {error}=await sb.auth.signInWithOtp({email:em,options:{shouldCreateUser:false,emailRedirectTo:location.origin+location.pathname}});
  m.textContent=error?('Error: '+error.message):'Check your inbox for the sign-in link.'}}
const rng=(a,b,t)=>a?(a===b?`$${a/1000}k`:`$${a/1000}k–$${b/1000}k`):(t||'');
async function load(){
 const q=t=>sb.from(t).select('*').limit(5000).then(r=>{if(r.error)throw r.error;return r.data});
 let [apps,acts,comps,cons,ints,items,meta]=await Promise.all(['applications','activities','companies','contacts','interactions','action_items','app_meta'].map(q));
 window.APPS=apps.sort((a,b)=>a.id.localeCompare(b.id)).map(a=>({id:a.id,company:a.company,role:a.title,location:a.location,commute:a.commute_note,size:a.company_size_note,industry:a.industry,
  payMin:a.pay_posted_min,payMax:a.pay_posted_max,payText:a.pay_posted_text||'',estMin:a.pay_est_min,estMax:a.pay_est_max,pay:a.pay_posted_min?rng(a.pay_posted_min,a.pay_posted_max):'',est:a.pay_est_min?'est. '+rng(a.pay_est_min,a.pay_est_max):'',found:a.date_found||'',posted:a.date_posted||'',source:a.source,url:a.posting_url,
  route:a.apply_route_raw,fit:a.fit_score,fitNotes:a.fit_notes,status:a.status==='Interview'?'Applied':a.status,status2:a.status==='Interview'?'Interview':'',statusRaw:a.status_detail||a.status,
  applied:a.date_applied||'',resume:a.resume_file,letter:a.cover_letter_file,followup:a.follow_up_date||'',contact:a.contact_text,notes:a.notes_raw,track:a.track,trackInferred:a.track_inferred,
  applicants:a.applicants??null,asked:a.salary_asked?`$${a.salary_asked/1000}k`:'',medical:a.medical_paid||'',travel:a.travel||''}));
 const cmT=await sb.from('communications').select('*').limit(5000);
 window.COMMS=(!cmT.error&&cmT.data.length?cmT.data.map(c=>({id:c.id,date:c.date||'',appId:c.application_id,company:c.company,kind:c.kind,summary:c.summary,text:c.full_text||c.summary})):
  acts.filter(x=>(x.type||'').startsWith('comm-')).map(x=>({id:x.id,date:x.date||'',appId:x.application_id,company:(x.details||[])[0]||'General',kind:x.type.slice(5),summary:x.text,text:(x.details||[])[1]||x.text})));
 acts=acts.filter(x=>!(x.type||'').startsWith('comm-'));
 window.ACTIVITIES=acts.map(x=>({appId:x.application_id,seq:x.seq,date:x.date||'',dateInferred:x.date_inferred,type:x.type,text:x.text,details:x.details||[]}));
 window.COMPANIES=comps.map(c=>({id:c.id,name:c.name,match:c.match_terms||[],employees:c.employees,revenue:c.revenue,founded:c.founded,hq:c.hq,ownership:c.ownership,history:c.history,news:c.news||[],newsNote:c.news_note,competitors:c.competitors||[],competitorsNote:c.competitors_note}));
 window.CONTACTS=cons.map(c=>({id:c.id,company:c.company,name:c.name,title:c.title,relationship:c.relationship,linkedin:c.linkedin,email:c.email,phone:c.phone,bio:c.bio,sources:c.sources||[]}));
 window.INTERACTIONS=ints.map(i=>({contact:i.contact_id,date:i.date,channel:i.channel,direction:i.direction,status:i.status,summary:i.summary,next:i.next_step}));
 window.SB=sb;window.ACTION_ITEMS=items.filter(i=>i.status==='open');
 window.DATA_AS_OF=(meta.find(m=>m.key==='data_as_of')||{}).value||new Date().toISOString().slice(0,10);
 document.getElementById('nav').style.display='';const s=document.createElement('script');s.src='app.js';document.body.appendChild(s)}
document.getElementById('logout').onclick=async ev=>{ev.preventDefault();await sb.auth.signOut();location.hash='';location.reload()};
(async()=>{if(C.SUPABASE_PUBLISHABLE_KEY.startsWith('REPLACE')){document.getElementById('app').innerHTML='<div class="card"><h1>Setup needed</h1><p>Add the Supabase publishable key to config.js.</p></div>';return}
 const {data:{session}}=await sb.auth.getSession();if(!session)return login();
 try{await load()}catch(err){document.getElementById('app').innerHTML=`<div class="card"><h1>Couldn't load data</h1><p class="muted">${e(err.message)}</p></div>`}})();
