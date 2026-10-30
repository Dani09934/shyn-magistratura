// Загружает исходные data/*.js из kt_test в объект
const fs=require('fs'),vm=require('vm'),path=require('path');
module.exports=function(dir){
  const ctx={window:{}};ctx.window.window=ctx.window;vm.createContext(ctx);
  for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort()){
    let src=fs.readFileSync(path.join(dir,f),'utf8');
    vm.runInContext('(function(window){'+src+'\n}).call(window,window)',ctx,{filename:f});
  }
  return ctx.window;
};
