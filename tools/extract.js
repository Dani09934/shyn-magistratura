// Извлекает из исходников все строки, которые нужно перевести на казахский,
// дедуплицирует и режет на порции tr/src/NN.txt в формате "@@id\nтекст".
const fs=require('fs'),path=require('path');
const SRC=process.argv[2];
const w=require('./load.js')(SRC);
const CYR=/[а-яА-ЯёЁ]/;
const map=new Map(); const order=[];
function add(t,group){ if(t==null||!CYR.test(t))return; if(!map.has(t)){map.set(t,{id:null,group});order.push(t);} }
// 1) темы — отдельной порцией
const topics=new Set();
for(const k in w.QUIZ_DATA)for(const q of w.QUIZ_DATA[k].questions) if(q.topic) topics.add(q.topic);
(w.FLASHCARDS||[]).forEach(c=>topics.add(c.topic));
[...topics].sort().forEach(t=>add(t,'topics'));
// 2) наборы вопросов в порядке вариантов
const keys=Object.keys(w.QUIZ_DATA).sort((a,b)=>{const va=+a.match(/^v(\d+)/)[1],vb=+b.match(/^v(\d+)/)[1];return va-vb||a.localeCompare(b)});
for(const k of keys){const d=w.QUIZ_DATA[k];
  for(const q of d.questions){
    const kzText = d.lang==='kz';
    if(!kzText){ add(q.passage,k); add(q.question,k); add(q.questionCode,k); (q.options||[]).forEach(o=>{add(o.text,k);add(o.code,k)}); }
    add(q.explanation,k); add(q.disputedNote,k);
  }}
// 3) карточки, сортировки, синонимы
(w.FLASHCARDS||[]).forEach(c=>{add(c.front,'flashcards');add(c.back,'flashcards')});
(function walk(o){ if(typeof o==='string')add(o,'sorting'); else if(o&&typeof o==='object') for(const k in o) walk(o[k]); })(w.SORTING_DATA);
(w.SYNONYMS_DATA||[]).forEach(s=>add(s.ru,'synonyms'));
// порции
let n=0; order.forEach(t=>{map.get(t).id='s'+String(++n).padStart(5,'0')});
fs.mkdirSync('tr/src',{recursive:true});fs.mkdirSync('tr/kz',{recursive:true});
let chunks=[],cur=[],len=0,curGroup=null;
for(const t of order){const g=map.get(t).group;
  if(cur.length&&(len+t.length>14000||(g==='topics')!==(curGroup==='topics'))){chunks.push(cur);cur=[];len=0}
  cur.push(t);len+=t.length;curGroup=g;}
if(cur.length)chunks.push(cur);
chunks.forEach((c,i)=>{const meta=[...new Set(c.map(t=>map.get(t).group))].join(',');
  fs.writeFileSync('tr/src/'+String(i+1).padStart(2,'0')+'.txt','# '+meta+'\n'+c.map(t=>'@@'+map.get(t).id+'\n'+t).join('\n')+'\n')});
fs.writeFileSync('tr/index.json',JSON.stringify(Object.fromEntries(order.map(t=>[map.get(t).id,t]))));
console.log('strings',order.length,'chars',order.reduce((a,t)=>a+t.length,0),'chunks',chunks.length);
chunks.forEach((c,i)=>console.log(i+1,c.length,c.reduce((a,t)=>a+t.length,0),[...new Set(c.map(t=>map.get(t).group))].join(',')));
