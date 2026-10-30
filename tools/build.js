// Собирает data/ нового проекта: применяет казахский перевод (tr/kz/*.txt),
// нормализует поля, убирает личные данные автора исходника.
const fs=require('fs'),path=require('path');
const SRC=process.argv[2], OUT='data';
const w=require('./load.js')(path.join(SRC,'data'));
const idx=JSON.parse(fs.readFileSync('tr/index.json','utf8'));
const byText=new Map(Object.entries(idx).map(([id,t])=>[t,id]));
const kz={};
for(const f of fs.readdirSync('tr/kz').filter(f=>f.endsWith('.txt'))){
  const parts=fs.readFileSync('tr/kz/'+f,'utf8').split(/^@@(s\d{5})\s*$/m);
  for(let i=1;i<parts.length;i+=2) kz[parts[i]]=parts[i+1].replace(/^\n/,'').replace(/\n$/,'');
}
let hit=0,miss=0;
function T(t){ if(t==null)return t; const id=byText.get(t); if(!id)return t; if(kz[id]!=null&&kz[id]!==''){hit++;return kz[id]} miss++;return t; }
const SUBJ={algo:'algo',algoritm:'algo',db:'db',database:'db',english:'english',fundamentals:'fundamentals'};
const SUBJ_KZ={algo:'Алгоритмдер',db:'Деректер қоры',english:'Ағылшын тілі',fundamentals:'Оқуға дайындық'};
fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT+'/sets',{recursive:true});
const media=new Map(); let mi=0;
function mediaPath(p){ if(!p)return p; if(!media.has(p)){const v=(p.match(/вариант-(\d+)/)||[])[1]||'x'; const ext=path.extname(p)==='.m4a'?'.mp3':path.extname(p); const nm=(p.match(/(\d+-\d+)/)||[,'a'+(++mi)])[1]; media.set(p,'media/v'+v+'-'+nm+ext);} return media.get(p); }
const files=[], stats={};
for(const k of Object.keys(w.QUIZ_DATA)){
  const d=w.QUIZ_DATA[k], subject=SUBJ[d.subject]||d.subject, key='v'+d.variant+'-'+subject;
  const qs=d.questions.map(q=>{
    const kzText=d.lang==='kz';
    const o={id:key+'-'+q.number,n:q.number,topic:T(q.topic),multi:!!q.multi,correct:q.correct||[]};
    if(q.passage)o.passage=kzText?q.passage:T(q.passage);
    o.q=kzText?q.question:T(q.question);
    if(q.questionCode)o.code=kzText?q.questionCode:T(q.questionCode);
    o.opts=(q.options||[]).map(x=>{const r={l:x.letter,t:kzText?x.text:T(x.text)}; if(x.code)r.code=kzText?x.code:T(x.code); return r;});
    o.ex=T(q.explanation||'');
    if(q.disputed){o.disputed=true;o.dnote=T(q.disputedNote||'')}
    if(q.authored)o.extra=true;
    if(q.audio)o.audio=mediaPath(q.audio);
    if(q.missing)o.missing=true;
    if(q.keyConfidence==='derived')o.derived=true;
    return o;});
  const set={key,variant:d.variant,subject,lang:d.lang==='ru'?'kz':d.lang,origLang:d.lang,source:d.source||'ai',title:'Нұсқа '+d.variant+' · '+SUBJ_KZ[subject],questions:qs};
  fs.writeFileSync(OUT+'/sets/'+key+'.js','Shyn.addSet('+JSON.stringify(set)+');\n');
  files.push(key);
}
files.push(...require('./newsets.js')(OUT));
files.sort((a,b)=>(+a.match(/\d+/)[0])-(+b.match(/\d+/)[0])||a.localeCompare(b));
fs.writeFileSync(OUT+'/index.js','Shyn.setFiles('+JSON.stringify(files)+');\n');
// карточки
const cards=(w.FLASHCARDS||[]).map(c=>({id:c.id,subject:c.subject,topic:T(c.topic),front:T(c.front),back:T(c.back)}));
fs.writeFileSync(OUT+'/flashcards.js','Shyn.cards='+JSON.stringify(cards)+';\n');
// сортировки — рекурсивный перевод строк
(function walk(o){for(const k in o){ if(typeof o[k]==='string')o[k]=T(o[k]); else if(o[k]&&typeof o[k]==='object')walk(o[k]);}})(w.SORTING_DATA);
fs.writeFileSync(OUT+'/sorting.js','Shyn.sorting='+JSON.stringify(w.SORTING_DATA)+';\n');
const syn=(w.SYNONYMS_DATA||[]).map(s=>({en:s.en,kz:T(s.ru),syn:s.synonyms}));
fs.writeFileSync(OUT+'/synonyms.js','Shyn.synonyms='+JSON.stringify(syn)+';\n');
// медиа
fs.mkdirSync('media',{recursive:true});
for(const [src,dst] of media){ if(src.endsWith('.m4a')) require('child_process').execFileSync('ffmpeg',['-y','-loglevel','error','-i',path.join(SRC,src),'-codec:a','libmp3lame','-q:a','4',dst]); else fs.copyFileSync(path.join(SRC,src),dst); }
console.log('sets',files.length,'translated',hit,'untranslated',miss,'media',media.size);
