const http=require('http');const https=require('https');const fs=require('fs');const path=require('path');const url=require('url');
const PORT=process.env.PORT||3747;
const API_KEY=process.env.PLAYHQ_API_KEY||'';
const ORG_ID=process.env.PLAYHQ_ORG_ID||'29d0a074-dd7b-4b17-9ff6-42c45e97402c';
const TENANT=process.env.PLAYHQ_TENANT||'afl';
const BASE='https://api.playhq.com/v1';
const CTRL_FILE=process.env.CTRL_STATE_FILE||path.join(__dirname,'ctrl-state.json');
let ctrlState={round:5,gameId:'',showScoreboard:true,updatedAt:Date.now()};
function cors(res){res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');}
function readCtrl(){try{ctrlState={...ctrlState,...JSON.parse(fs.readFileSync(CTRL_FILE,'utf8'))};}catch(e){}return ctrlState;}
function writeCtrl(obj){ctrlState={...ctrlState,...obj,updatedAt:Date.now()};try{fs.mkdirSync(path.dirname(CTRL_FILE),{recursive:true});fs.writeFileSync(CTRL_FILE,JSON.stringify(ctrlState,null,2));}catch(e){}return ctrlState;}
function send(res,code,type,body){cors(res);res.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body);}
function proxy(playhqPath,res){const target=BASE+playhqPath;const req=https.request(target,{method:'GET',headers:{'x-api-key':API_KEY,'x-phq-tenant':TENANT,'Accept':'application/json'}},up=>{let body='';up.on('data',c=>body+=c);up.on('end',()=>send(res,up.statusCode,'application/json',body));});req.on('error',e=>send(res,502,'application/json',JSON.stringify({error:'Upstream error',detail:e.message})));req.end();}
function serve(file,res){const fp=path.join(__dirname,file);if(!fp.startsWith(__dirname))return send(res,403,'text/plain','Forbidden');fs.readFile(fp,(err,data)=>{if(err)return send(res,404,'text/plain','Not found');const ext=path.extname(fp);const type={'.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.css':'text/css'}[ext]||'text/plain';send(res,200,type,data);});}
http.createServer((req,res)=>{const parsed=url.parse(req.url,true);const p=parsed.pathname||'/';if(req.method==='OPTIONS'){cors(res);res.writeHead(204);return res.end();}
 if(p==='/health')return send(res,200,'application/json',JSON.stringify({status:'ok',org:ORG_ID}));
 if(p==='/ctrl'){if(req.method==='GET')return send(res,200,'application/json',JSON.stringify(readCtrl()));if(req.method==='POST'){let b='';req.on('data',c=>b+=c);req.on('end',()=>{let obj={};try{obj=JSON.parse(b||'{}')}catch(e){}send(res,200,'application/json',JSON.stringify(writeCtrl(obj)));});return;}}
 if(p.startsWith('/api/'))return proxy(p.replace(/^\/api/,'')+(parsed.search||''),res);
 if(p==='/'||p==='/broadcast'||p==='/broadcast.html'||p==='/scores'||p==='/index.html')return serve('broadcast.html',res);
 if(p==='/manifest.json')return send(res,200,'application/json',JSON.stringify({name:'SWFL Scoreboard',short_name:'SWFL',display:'standalone',start_url:'/',background_color:'#00ff00',theme_color:'#d9a520'}));
 return serve(p.replace(/^\//,''),res);
}).listen(PORT,()=>console.log('SWFL scoreboard running on '+PORT));
