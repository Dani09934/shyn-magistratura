// Архивтен (сынақ тестілеу фотолары) алынған жаңа сұрақтар: 28 және 29-нұсқалар
const fs=require('fs');
module.exports=function(OUT){
  const K=JSON.parse(fs.readFileSync('tr/new/keep.json','utf8'));
  const E=JSON.parse(fs.readFileSync('tr/new/enrich.json','utf8'));
  const SPLIT_CODE=new Set(['DB2','DB13','DB15','DB16']);
  const MULTI=new Set(['DB14','DB12','DB-fk']);
  const by={algo:[],db:[]};
  for(const p of K){
    const e=E[p.tag]; if(!e) throw new Error('no enrich '+p.tag);
    let q=e.q||p.q, code=p.code||null;
    if(SPLIT_CODE.has(p.tag)&&!e.q){const i=q.indexOf('\n'); code=q.slice(i+1).trim(); q=q.slice(0,i).trim();}
    const opts=p.opts.map(o=>({l:o.l,t:(e.opts&&e.opts[o.l])||o.t}));
    const item={topic:e.topic,multi:MULTI.has(p.tag)||p.correct.length>1,correct:p.correct,q,opts,ex:e.ex,derived:true};
    if(code)item.code=code;
    by[p.tag.startsWith('DB')?'db':'algo'].push(item);
  }
  const files=[];
  for(const subj of ['algo','db']){
    const L=by[subj], h=Math.ceil(L.length/2);
    [[28,L.slice(0,h)],[29,L.slice(h)]].forEach(([v,qs])=>{
      const key='v'+v+'-'+subj;
      const set={key,variant:v,subject:subj,lang:'kz',origLang:'kz',source:'tc',
        title:'Нұсқа '+v+' · '+(subj==='algo'?'Алгоритмдер':'Деректер қоры'),
        questions:qs.map((x,i)=>Object.assign({id:key+'-'+(i+1),n:i+1},x))};
      fs.writeFileSync(OUT+'/sets/'+key+'.js','Shyn.addSet('+JSON.stringify(set)+');\n');
      files.push(key);
    });
  }
  return files;
};
