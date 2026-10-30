import re,json,sys
src=open(sys.argv[1]).read()
blocks=re.split(r'^## ',src,flags=re.M)[1:]
out=[]
for b in blocks:
    head,*lines=b.split('\n')
    if head.startswith('skip') or 'Q:' not in b: continue
    tag=head.split()[0]
    lang='ru' if ' RU' in head else 'kz'
    multi='multi' in head.split('(')[-1] or ' multi' in head
    q=[];code=[];opts=[];ans=None;mode=None
    for l in lines:
        if l.startswith('Q:'): mode='q'; q.append(l[2:].strip()); continue
        if l.startswith('CODE:'): mode='c'; continue
        if l.startswith('ANS:'): ans=l[4:].strip(); mode=None; continue
        if re.match(r'^[A-H]\) ',l): mode='o'
        if mode=='q': q.append(l)
        elif mode=='c': code.append(l)
        elif mode=='o': opts.append(l)
    if ans is None: continue
    ot=' '.join(opts)
    parts=re.split(r'(?:^|\s)([A-H])\) ',ot)
    o=[]
    for i in range(1,len(parts),2): o.append({'l':parts[i],'t':parts[i+1].strip()})
    letters=re.findall(r'\b([A-H])\b',ans.split('(')[0])
    out.append({'tag':tag,'lang':lang,'multi':len(letters)>1 or multi and False,'q':'\n'.join(x for x in q).strip(),'code':'\n'.join(code).strip() or None,'opts':o,'correct':letters,'note':ans})
json.dump(out,open(sys.argv[2],'w'),ensure_ascii=False,indent=1)
print(len(out))
for x in out:
    if len(x['opts'])<4 or not x['correct']: print('CHECK',x['tag'],len(x['opts']),x['correct'])
