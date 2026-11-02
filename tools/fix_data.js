// Деректерді түзету: түпнұсқа автордың жеке жауаптары туралы сөйлемдерді алып тастау,
// қайталанатын нұсқаларды түзету. Іске қосу: node tools/fix_data.js [--dry]
const fs=require('fs'),path=require('path');
const DRY=process.argv.includes('--dry');
const DIR='data/sets';
const PERSONAL=/[Пп]айдаланушы(?:ның|да)?\s+(?:тек|дұрыс|жауабы|[A-H]\b|[A-H]-|«|мәндерді|стандартты|таңда|екі|кілт|ішінара|оны)|пайдаланушы таңдаған|Пайдаланушының жауабы|[A-H] таңдауы қате болды|Сіз тек|таңдадыңыз|скриншоты сақталмаған|Сіздің жиыныңызда|белгіледіңіз|көрсеттіңіз/;
const OVERRIDE={
  'v21-english-37':{q:'How much rain does the west coast of Madagascar get per year?'},
  'v22-fundamentals-20':{exRe:[/\s*\(Ескерту: E нұсқасының нақты мәтіні скриншотқа[^)]*\)/,'']},
  'v17-english-23':{opt:{B:'the most happy'}},
  'v17-english-32':{opt:{D:'calling / to find'}},
  'v3-db-16':{opt:{D:"SELECT T.CourseId\nFROM COURSE AS T\nWHERE 1 >= (SELECT COUNT(R.CourseId)\n  FROM SECTION AS R\n  WHERE T.CourseId = R.CourseId AND R.Year = 2021);"}}
};
function cleanEx(ex){
  if(!ex) return ex;
  let s=ex.replace(/Сіздің (?:қосымша )?([A-H]) таңдауыңыз/g,'$1 нұсқасы').replace(/Сіздің ([A-H]) және ([A-H]) нұсқаларыңыз/g,'$1 және $2 нұсқалары');
  s=s.replace(/\(([A-H]), сіздің таңдауыңыз\)/g,'($1)').replace(/\(сіздің (?:артық )?([A-H](?:, [A-H])*) таңдауыңыз(?: қате| — қате)?\)/g,'($1)')
     .replace(/\(сіздің (?:артық )?([A-H]) таңдауыңыз — /g,'($1 — ').replace(/сіздің (?:артық )?([A-H]) таңдауыңыз/g,'$1 нұсқасы').replace(/\(сіздің артық ([A-H](?:, [A-H])*)\)/g,'($1)').replace(/сіздің ([A-H]) нұсқаңызды/g,'$1 нұсқасын');
  s=s.replace(/\s*\((?:[^()]*пайдаланушы таңдаған[^()]*)\)/g,'');
  s=s.replace(/,\s*сондықтан пайдаланушының жауабы қате\./g,'.');
  s=s.replace(/,\s*сондықтан пайдаланушы оны [^.]*?қате\./g,'.');
  const parts=s.split(/((?<=[.!?])\s+(?=[А-ЯӘҒҚҢӨҰҮҺІA-Z(«0-9]))/);
  let out='';
  for(let i=0;i<parts.length;i+=2){ if(PERSONAL.test(parts[i])) continue; out+=(out?(parts[i-1]||' '):'')+parts[i]; }
  return out.trim();
}
let changed=0,log=[];
for(const f of fs.readdirSync(DIR)){
  const p=path.join(DIR,f), src=fs.readFileSync(p,'utf8');
  const m=src.match(/^Shyn\.addSet\(([\s\S]*)\);\s*$/); if(!m) continue;
  const set=JSON.parse(m[1]); let dirty=false;
  for(const q of set.questions){
    const ex2=cleanEx(q.ex); if(ex2!==q.ex){log.push(q.id+'\n  - '+q.ex.slice(-180)+'\n  + '+ex2.slice(-180)); q.ex=ex2; dirty=true;}
    if(q.dnote){const d2=cleanEx(q.dnote); if(d2!==q.dnote){q.dnote=d2;dirty=true;}}
    const o=OVERRIDE[q.id];
    if(o&&o.q&&q.q!==o.q){q.q=o.q;dirty=true;log.push(q.id+' q fixed');}
    if(o&&o.exRe){const e2=q.ex.replace(o.exRe[0],o.exRe[1]); if(e2!==q.ex){q.ex=e2;dirty=true;log.push(q.id+' ex note removed');}}
    if(o&&o.opt) for(const l in o.opt){const op=q.opts.find(x=>x.l===l); const key=op.code!==undefined&&op.code!==null&&op.code!==''?'code':'t'; if(op[key]!==o.opt[l]){op[key]=o.opt[l];dirty=true;log.push(q.id+' opt '+l+' -> '+o.opt[l].slice(0,40));}}
  }
  if(dirty){changed++; if(!DRY) fs.writeFileSync(p,'Shyn.addSet('+JSON.stringify(set)+');\n');}
}
console.log(log.join('\n')); console.log('files changed',changed,'entries',log.length);
