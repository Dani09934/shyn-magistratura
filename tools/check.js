// Проверка порции перевода: все id на месте, совпадают \( \) , backticks, переводы строк кода
const fs=require('fs');
function parse(f){const p=fs.readFileSync(f,'utf8').replace(/^#.*\n/,'').split(/^@@(s\d{5})\s*$/m);const o={};for(let i=1;i<p.length;i+=2)o[p[i]]=p[i+1].replace(/^\n/,'').replace(/\n$/,'');return o;}
const nums=process.argv.slice(2);let bad=0;
for(const n of nums){const s=parse('tr/src/'+n+'.txt');if(!fs.existsSync('tr/kz/'+n+'.txt')){console.log(n,'MISSING FILE');bad++;continue}const k=parse('tr/kz/'+n+'.txt');
 const isKz=t=>(t.match(/[әғқңөұүһі]/gi)||[]).length>=5;const miss=Object.keys(s).filter(id=>!isKz(s[id])&&/[а-яё]/i.test(s[id])&&(!(id in k)||!k[id].trim()));const extra=Object.keys(k).filter(id=>!(id in s));
 const issues=[];for(const id in s){if(!(id in k))continue;const c=(t,re)=>(t.match(re)||[]).length;
  for(const re of [/\\\(/g,/\\\[/g,/\n/g]){if(c(s[id],re)!==c(k[id],re))issues.push(id+' '+re)}
  const ru=(k[id].match(/[а-яёәғқңөұүһі]{4,}/gi)||[]).filter(w=>!/[әғқңөұүһі]/i.test(w)&&/[щъё]|ться$|ются$|ешь$|ого$|его$|ыми$|ими$|ает$|яет$|ует$|ённ|енн[аоы]/i.test(w));if(ru.length>1)issues.push(id+' ru? '+ru.slice(0,4).join(','));}
 console.log(n,'src',Object.keys(s).length,'kz',Object.keys(k).length,'missing',miss.length,miss.slice(0,5).join(' '),'extra',extra.length,issues.length?'\n  '+issues.slice(0,12).join('\n  '):'');
 if(miss.length||extra.length)bad++;}
process.exit(bad?1:0);
