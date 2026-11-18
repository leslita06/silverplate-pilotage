(function(){
'use strict';
var D=null,S={per:'12',type:'all',cli:'all',ev:'all'},charts={},showAll=false;
var MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
var JOURS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
var TYPES=['Lancement','Salon','Soirée','Corporate'];
var TN={Lancement:'Lancements de produit',Salon:'Salons et stands',Soirée:'Soirées et galas',Corporate:'Événements d’entreprise'};
var TS={Lancement:'Lancement',Salon:'Salon',Soirée:'Soirée',Corporate:'Entreprise'};
var TI={Lancement:'rocket',Salon:'store',Soirée:'wine',Corporate:'building-2'};
var TC={Lancement:'#4C63D2',Salon:'#0D9488',Soirée:'#C2410C',Corporate:'#262C51'};
var TT={Lancement:'#EEF1FF',Salon:'#F0FDFA',Soirée:'#FFF7ED',Corporate:'#E9EDF4'};
var NETS=[['Instagram','instagram','#C026D3','#FDF4FF'],['Facebook','facebook','#1D4ED8','#EFF6FF'],['LinkedIn','linkedin','#0A66C2','#EFF6FF'],['TikTok','music-2','#141830','#F1F3F8']];
var NAVY='#262C51';
function $(i){return document.getElementById(i)}
function ic(n,st){return '<i class="ic" style="-webkit-mask-image:url(assets/icons/'+n+'.svg);mask-image:url(assets/icons/'+n+'.svg)'+(st?';'+st:'')+'"></i>'}
function hydrate(){Array.prototype.forEach.call(document.querySelectorAll('[data-ic]'),function(e){var u='url(assets/icons/'+e.dataset.ic+'.svg)';e.style.webkitMaskImage=u;e.style.maskImage=u})}
function nf(x,d){return (+x).toLocaleString('fr-FR',{minimumFractionDigits:d||0,maximumFractionDigits:d||0}).replace(/\u202f/g,'\u00a0')}
function pct(x,d){return nf(x*100,d===undefined?0:d)+'\u00a0%'}
function mf(x){var a=Math.abs(x);if(a>=1e9)return nf(x/1e9,2)+'\u00a0Md';if(a>=1e6)return nf(x/1e6,a>=1e8?0:1)+'\u00a0M';if(a>=1e3)return nf(x/1e3,0)+'\u00a0k';return nf(x)}
function fc(x){return mf(x)+'\u00a0FCFA'}
function big(s){var m=String(s).match(/^(.*?)\u00a0(.*)$/);return m?m[1]+'<small>'+m[2]+'</small>':s}
function compact(x){if(x>=1e6)return nf(x/1e6,1)+'\u00a0M';if(x>=1e4)return nf(x/1e3,1)+'\u00a0k';return nf(x)}
function dot(s){s=String(s).replace(/\s+$/,'');return /[.!?…]$/.test(s)?s:s+'.'}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')}
function sum(a,f){var s=0;for(var i=0;i<a.length;i++)s+=f(a[i]);return s}
function div(a,b){return b?a/b:0}
function dt(iso){return new Date(iso+'T12:00:00')}
function dfr(iso,y){var d=dt(iso);return d.getDate()+(d.getDate()===1?'er':'')+' '+MOIS[d.getMonth()]+(y?' '+d.getFullYear():'')}
function days(a,b){return Math.round((dt(b)-dt(a))/864e5)}
function mlab(m,y){var p=m.split('-');return MOIS[+p[1]-1]+(y?' '+p[0].slice(2):'')}
function dl(c,p){if(!p||!isFinite(p))return '';var d=(c-p)/Math.abs(p)*100,cl=d>=0?'up':'down';return '<span class="chip '+cl+'">'+(d>=0?'↑ +':'↓ \u2212')+nf(Math.abs(d),0)+'\u00a0%</span>'}
function dpt(c,p){if(!isFinite(c)||!isFinite(p))return '';var d=(c-p)*100,cl=d>=0?'up':'down';if(Math.abs(d)<.5)return '<span class="chip up">stable</span>';return '<span class="chip '+cl+'">'+(d>=0?'↑ +':'↓ \u2212')+nf(Math.abs(d),0)+'\u00a0pt</span>'}
function ttag(t){return '<span class="ttag" style="background:'+TT[t]+';color:'+TC[t]+'">'+ic(TI[t])+TS[t]+'</span>'}
function range(){
  var M=D.mois,n=M.length,a,b=n-1,lab;
  if(S.per==='ytd'){a=M.indexOf('2026-01');lab='depuis janvier 2026'}
  else{a=n-(+S.per);lab='sur les '+S.per+' derniers mois'}
  return {a:a,b:b,pa:a-12,pb:b-12,lab:lab,ms:M.slice(a,b+1),m0:M[a],m1:M[b],p0:M[a-12],p1:M[b-12]};
}
function inM(iso,m0,m1){var m=iso.slice(0,7);return m>=m0&&m<=m1}
function f(x){return (S.type==='all'||x.t===S.type)&&(S.cli==='all'||x.c===S.cli)&&(S.ev==='all'||x.k===S.ev)}
// un événement choisi : on le montre en entier, sans période ni comparaison
function inP(iso,m0,m1,prev){return S.ev!=='all'?!prev:inM(iso,m0,m1)}
function evs(m0,m1,prev){var L=D.events.filter(function(e){return f(e)&&inP(e.d,m0,m1,prev)});
  if(S.ev!=='all'&&!prev)D.encours.forEach(function(e){if(e.k===S.ev)L.push({k:e.k,d:e.d,n:e.n,c:e.c,t:e.t,ca:e.ca,m:e.m,ins:0,pre:0,vues:0,prevu:1})});return L}
function devs(m0,m1,prev){return D.devis.filter(function(e){return f(e)&&inP(e.d,m0,m1,prev)})}
function evRec(k){var r=null;D.events.concat(D.encours).forEach(function(e){if(e.k===k)r=e});return r}
function fx(x){return nf(x)+'\u00a0FCFA'}
var OPEN=['Envoyé','Relancé','En négociation'];
function scope(){var s=[];if(S.ev!=='all'){var r=evRec(S.ev);return r?r.n:''}if(S.type!=='all')s.push(TN[S.type].toLowerCase());if(S.cli!=='all')s.push(S.cli);return s.length?s.join(', '):''}

function render(){
  var R=range(),E=evs(R.m0,R.m1),P=evs(R.p0,R.p1,1);if(S.ev!=='all')R.lab='pour cet événement';
  var ca=sum(E,function(e){return e.ca}),mg=sum(E,function(e){return e.m}),pca=sum(P,function(e){return e.ca}),pmg=sum(P,function(e){return e.m});
  var DV=devs(R.m0,R.m1),PDV=devs(R.p0,R.p1,1);
  function tr(L){var g=L.filter(function(x){return x.st==='Gagné'}).length,p=L.filter(function(x){return x.st==='Perdu'}).length;return {g:g,p:p,r:div(g,g+p)}}
  var T=tr(DV),PT=tr(PDV);
  var OP=D.devis.filter(function(x){return f(x)&&OPEN.indexOf(x.st)>=0});
  var opm=sum(OP,function(x){return x.mt});
  var FA=D.factures.filter(f);
  var enc=sum(FA.filter(function(x){return x.denc&&inP(x.denc,R.m0,R.m1)}),function(x){return x.enc});
  var penc=sum(FA.filter(function(x){return x.denc&&inP(x.denc,R.p0,R.p1,1)}),function(x){return x.enc});
  var OPF=FA.filter(function(x){return x.mt>x.enc}),reste=sum(OPF,function(x){return x.mt-x.enc});
  var LATE=OPF.filter(function(x){return x.ech<D.arrete}),retard=sum(LATE,function(x){return x.mt-x.enc});
  var cmp='vs même période l’an dernier';
  // phrase
  var sc=scope(),ph;
  if(S.ev!=='all')ph=evPhrase(FA,OP);
  else if(!E.length){ph='Aucun événement réalisé '+R.lab+(sc?' pour '+esc(sc):'')+'. Les devis et les encaissements restent affichés plus bas.'}
  else{
    var byT={};TYPES.forEach(function(t){byT[t]=sum(E.filter(function(e){return e.t===t}),function(e){return e.ca})});
    var top=TYPES.slice().sort(function(a,b){return byT[b]-byT[a]})[0];
    ph=(sc?'Pour '+esc(sc)+', l':'L')+'’agence a réalisé <b>'+E.length+' événement'+(E.length>1?'s':'')+'</b> '+R.lab+', pour <b>'+fc(ca)+'</b> de chiffre d’affaires hors taxes'+(pca?' ('+(ca>=pca?'+':'\u2212')+nf(Math.abs(div(ca-pca,pca))*100,0)+'\u00a0% sur un an)':'')+' et une marge brute de <b>'+fc(mg)+'</b>, soit '+pct(div(mg,ca))+'.';
    if(S.type==='all') ph+=' Les '+TN[top].toLowerCase()+' pèsent '+pct(div(byT[top],ca))+' du chiffre d’affaires.';
    ph+=' '+(OP.length?'<b>'+OP.length+' devis</b> attendent une réponse pour '+fc(opm)+'.':'Aucun devis en attente.');
    if(retard) ph+=' '+fc(retard)+' de factures sont en retard de paiement.';
  }
  $('phrase').innerHTML=ph;
  var pv=E.length&&E.every(function(e){return e.prevu});
  var K=[
    {i:'banknote',l:'Chiffre d’affaires HT'+(pv?' prévu':''),v:big(fc(ca)),d:S.ev!=='all'?(E.length?dfr(E[0].d,true):''):dl(ca,pca)+' '+cmp},
    {i:'trending-up',l:'Marge brute HT'+(pv?' prévue':''),v:big(fc(mg)),d:'<b>'+pct(div(mg,ca))+'</b> du chiffre d’affaires '+(S.ev==='all'?dpt(div(mg,ca),div(pmg,pca)):'')},
    {i:'file-text',l:'Devis en cours',v:big(fc(opm)),d:OP.length+' devis en attente de réponse'},
    {i:'badge-percent',l:'Taux de transformation',v:T.g+T.p?pct(T.r):'—',d:T.g+' gagnés sur '+(T.g+T.p)+' tranchés '+(PT.g+PT.p?dpt(T.r,PT.r):'')},
    {i:'wallet',l:'Encaissé TTC',v:big(fc(enc)),d:(S.ev==='all'?dl(enc,penc)+' ':'')+'reste à encaisser '+fc(reste)}];
  if(S.ev!=='all')K[3]={i:'clock',l:'En retard de paiement',v:big(fc(retard)),d:retard?LATE.length+' facture'+(LATE.length>1?'s':'')+' échue'+(LATE.length>1?'s':''):'aucune facture échue'};
  $('kpis').innerHTML=K.map(function(x){return '<div class="kpi"><div class="h"><span class="bx">'+ic(x.i)+'</span><p class="l">'+x.l+'</p></div><p class="v">'+x.v+'</p><p class="d">'+x.d+'</p></div>'}).join('');
  // alertes
  var A=[];
  if(LATE.length){var old=LATE.slice().sort(function(a,b){return a.ech<b.ech?-1:1})[0];
    A.push(['bad','clock','<b>'+fc(retard)+' en retard de paiement</b> sur '+LATE.length+' facture'+(LATE.length>1?'s':'')+'.<span>La plus ancienne : '+esc(old.n)+' ('+esc(old.c)+'), échue depuis '+days(old.ech,D.arrete)+' jours.</span>'])}
  var soon=OP.filter(function(x){return x.sig&&days(D.arrete,x.sig)<=10}).sort(function(a,b){return a.sig<b.sig?-1:1});
  if(soon.length)A.push(['warn','hourglass','<b>'+soon.length+' devis à relancer</b> : réponse attendue sous 10 jours.<span>'+dot(soon.map(function(x){return esc(x.c)+', '+dfr(x.sig)}).join(' ; '))+'</span>']);
  var low=E.filter(function(e){return div(e.m,e.ca)<.2}).sort(function(a,b){return div(a.m,a.ca)-div(b.m,b.ca)});
  if(low.length)A.push(['warn','triangle-alert','<b>'+low.length+' événement'+(low.length>1?'s':'')+' sous 20\u00a0% de marge</b>.<span>Le plus faible : '+esc(low[0].n)+' ('+esc(low[0].c)+'), '+pct(div(low[0].m,low[0].ca))+'.</span>']);
  if(A.length<3&&T.g+T.p)A.push(['ok','circle-check','<b>'+pct(T.r)+' des devis tranchés sont gagnés</b> '+R.lab+'.<span>'+T.g+' gagnés, '+T.p+' perdus.</span>']);
  $('alerts').innerHTML=A.slice(0,3).map(function(a){return '<div class="al '+a[0]+'"><span class="bx">'+ic(a[1])+'</span><p>'+a[2]+'</p></div>'}).join('');
  renderCA(R,E,ca);renderDevis(R,DV,T,PT,OP,opm);renderEnc(R,FA,enc,penc,OPF,reste,LATE,retard);renderAud(R,E);renderNova();renderLundi();
}

function evPhrase(FA,OP){
  var r=evRec(S.ev);if(!r)return '';
  var fac=sum(FA,function(x){return x.mt}),enc=sum(FA,function(x){return x.enc}),late=sum(FA.filter(function(x){return x.mt>x.enc&&x.ech<D.arrete}),function(x){return x.mt-x.enc});
  var j=days(D.arrete,r.d),ph='<b>'+esc(r.n)+'</b> ('+esc(r.c)+'), ';
  if(r.k===D.nova.k){var N=D.nova;
    return ph+'le '+JOURS[dt(N.d).getDay()]+' '+dfr(N.d,true)+', dans '+j+' jours. Devis '+N.ref+' en négociation : <b>'+fx(N.mt)+' HT</b>, soit <b>'+fx(N.ttc)+' TTC</b>. Formule de base '+fx(N.base)+' HT, dans l’enveloppe de '+fx(N.enveloppe)+' ; options '+fx(N.options)+' HT. Acompte de '+fx(N.echeancier[0][3])+' TTC à la signature, attendue le '+dfr(N.echeancier[0][2],true)+'.'}
  if(r.statut){
    var L=D.lundi,ins=sum(L.entrees.filter(function(x){return x[6]===r.k}),function(x){return x[3]}),out=sum(L.prestataires.filter(function(x){return x[4]===r.k}),function(x){return x[2]});
    ph+=(j<0?'en cours depuis le ':'le ')+dfr(r.d,true)+(j===1?', demain':'')+' ('+r.statut.toLowerCase()+'). Chiffre d’affaires prévu <b>'+fx(r.ca)+' HT</b>, marge brute prévue '+fx(r.m)+', soit '+pct(div(r.m,r.ca))+'.';
    ph+=' Facturé à ce jour '+fx(fac)+' TTC, encaissé '+fx(enc)+'.';
    if(ins)ph+=' Encaissement attendu sous 4 semaines : '+fx(ins)+'.';
    if(out)ph+=' Prestataires à payer sous 4 semaines : <b>'+fx(out)+'</b>.';
    return ph}
  ph+='réalisé le '+dfr(r.d,true)+' : <b>'+fx(r.ca)+'</b> de chiffre d’affaires hors taxes et '+fx(r.m)+' de marge brute, soit '+pct(div(r.m,r.ca))+'. Facturé '+fx(fac)+' TTC, encaissé '+fx(enc)+'.';
  if(fac>enc)ph+=' Reste à encaisser <b>'+fx(fac-enc)+'</b>'+(late?', dont '+fx(late)+' en retard':'')+'.';else ph+=' Tout est encaissé.';
  return ph}

function renderCA(R,E,ca){
  var lab=R.ms.map(function(m){return mlab(m,true)});
  var cm=R.ms.map(function(m){return sum(E.filter(function(e){return e.d.slice(0,7)===m}),function(e){return e.ca})});
  var mm=R.ms.map(function(m){return sum(E.filter(function(e){return e.d.slice(0,7)===m}),function(e){return e.m})});
  var rate=cm.map(function(c,i){return c?Math.round(mm[i]/c*1000)/10:null});
  chart('c-mois',{type:'bar',data:{labels:lab,datasets:[
    {type:'line',label:'Taux de marge',data:rate,yAxisID:'y2',borderColor:'#C2410C',backgroundColor:'#C2410C',pointRadius:3,borderWidth:2,spanGaps:true,tension:.3},
    {label:'Chiffre d’affaires HT',data:cm,backgroundColor:NAVY,borderRadius:6,maxBarThickness:34}]},
    options:opt({y:{ticks:{callback:function(v){return mf(v)}},grid:{color:'#EFF2F7'},border:{display:false}},y2:{position:'right',min:0,max:40,ticks:{callback:function(v){return v+' %'}},grid:{display:false},border:{display:false}}},
      function(c){return c.dataset.yAxisID==='y2'?' Taux de marge : '+nf(c.raw,1)+' %':' '+c.dataset.label+' : '+fc(c.raw)})});
  // types
  var tot=ca||1;
  $('types').innerHTML=TYPES.map(function(t){var L=E.filter(function(e){return e.t===t}),c=sum(L,function(e){return e.ca}),m=sum(L,function(e){return e.m});
    return '<div class="ty'+(S.type===t?' sel':'')+'" data-t="'+t+'" role="button" tabindex="0"><span class="tb" style="background:'+TT[t]+';color:'+TC[t]+'">'+ic(TI[t])+'</span><p class="n">'+TN[t]+'</p><p class="v">'+fc(c)+'</p><p class="s">'+L.length+' événement'+(L.length>1?'s':'')+'</p><p class="m">marge '+(c?pct(m/c):'—')+'</p><div class="bar"><span style="width:'+(c/tot*100)+'%;background:'+TC[t]+'"></span></div></div>'}).join('');
  Array.prototype.forEach.call(document.querySelectorAll('.ty'),function(el){el.onclick=function(){S.type=S.type===el.dataset.t?'all':el.dataset.t;$('f-type').value=S.type;if(S.ev!=='all')setEv('all');else render()}});
  // clients
  var C={};E.forEach(function(e){C[e.c]=C[e.c]||{ca:0,m:0,n:0};C[e.c].ca+=e.ca;C[e.c].m+=e.m;C[e.c].n++});
  var CL=Object.keys(C).sort(function(a,b){return C[b].ca-C[a].ca}).slice(0,8),mx=CL.length?C[CL[0]].ca:1;
  $('clients').innerHTML=CL.length?CL.map(function(k,i){return '<div class="cl" data-c="'+esc(k)+'"><span class="rk">'+(i+1)+'</span><p class="n">'+esc(k)+'</p><p class="v">'+fc(C[k].ca)+'<small>marge '+pct(C[k].m/C[k].ca)+'</small></p><div class="bar"><span style="width:'+(C[k].ca/mx*100)+'%"></span></div></div>'}).join(''):'<p class="empty">Aucun événement sur la période.</p>';
  Array.prototype.forEach.call(document.querySelectorAll('.cl'),function(el){el.onclick=function(){S.cli=S.cli===el.dataset.c?'all':el.dataset.c;$('f-cli').value=S.cli;if(S.ev!=='all')setEv('all');else render()}});
  // table
  var L=E.slice().sort(function(a,b){return a.d<b.d?1:-1}),V=showAll?L:L.slice(0,8);
  $('nev').textContent=L.length?L.length+' événement'+(L.length>1?'s':'')+' '+R.lab:'';
  var h='<thead><tr><th>Événement</th><th>Type</th><th>Date</th><th>Chiffre d’affaires HT</th><th>Marge brute</th><th>Taux</th><th>Présents</th></tr></thead><tbody>';
  h+=V.map(function(e){var r=div(e.m,e.ca);return '<tr><td class="t">'+esc(e.n)+'<small>'+esc(e.c)+'</small></td><td>'+ttag(e.t)+'</td><td>'+dfr(e.d,true)+(e.prevu?'<br><span class="st blue"><i></i>prévu</span>':'')+'</td><td><b>'+fc(e.ca)+'</b></td><td>'+fc(e.m)+'</td><td class="'+(r<.2?'down':'')+'">'+pct(r)+'</td><td>'+(e.prevu?'—':nf(e.pre))+'</td></tr>'}).join('');
  if(L.length){var c=sum(L,function(e){return e.ca}),m=sum(L,function(e){return e.m});h+='<tr class="tot"><td>Total</td><td></td><td></td><td>'+fc(c)+'</td><td>'+fc(m)+'</td><td>'+pct(div(m,c))+'</td><td>'+nf(sum(L,function(e){return e.pre}))+'</td></tr>'}
  else h+='<tr><td class="empty" colspan="7">Aucun événement sur la période.</td></tr>';
  $('t-ev').innerHTML=h+'</tbody>';
  var b=$('more-ev');if(b)b.remove();
  if(L.length>8){b=document.createElement('button');b.id='more-ev';b.className='more';b.textContent=showAll?'Afficher moins':'Afficher les '+L.length+' événements';b.onclick=function(){showAll=!showAll;render()};$('t-ev').parentNode.after(b)}
}

function renderDevis(R,DV,T,PT,OP,opm){
  var won=sum(DV.filter(function(x){return x.st==='Gagné'}),function(x){return x.mt});
  $('dev-minis').innerHTML=[
    ['file-text',big(fc(opm)),'Montant des devis en attente'],
    ['hourglass',OP.length,'Devis en attente de réponse'],
    ['badge-percent',T.g+T.p?pct(T.r):'—','Taux de transformation '+R.lab+' '+(PT.g+PT.p?dpt(T.r,PT.r):'')],
    ['handshake',big(fc(won)),'Montant des devis gagnés '+R.lab]
  ].map(mini).join('');
  $('transfo').innerHTML=TYPES.filter(function(t){return S.type==='all'||t===S.type}).map(function(t){
    var L=DV.filter(function(x){return x.t===t}),g=L.filter(function(x){return x.st==='Gagné'}).length,p=L.filter(function(x){return x.st==='Perdu'}).length,r=div(g,g+p);
    return '<div class="tf"><div class="r1"><span class="n"><span class="ttag" style="background:'+TT[t]+';color:'+TC[t]+';padding:6px">'+ic(TI[t])+'</span>'+TN[t]+'</span><span class="p">'+(g+p?pct(r):'—')+'</span></div><div class="bar"><span style="width:'+(r*100)+'%;background:'+TC[t]+'"></span></div><p class="s">'+g+' gagné'+(g>1?'s':'')+', '+p+' perdu'+(p>1?'s':'')+'</p></div>'}).join('');
  var L=OP.slice().sort(function(a,b){return (a.sig||'')<(b.sig||'')?-1:1});
  var cls={'Envoyé':'blue','Relancé':'warn','En négociation':'ok'};
  $('t-dev').innerHTML='<thead><tr><th>Devis</th><th>Montant HT</th><th>Statut</th><th>Réponse attendue</th></tr></thead><tbody>'+(L.length?L.map(function(x){var j=days(D.arrete,x.sig);
    return '<tr'+(x.ref===D.nova.ref?' class="hl"':'')+'><td class="t">'+esc(x.n)+'<small>'+esc(x.c)+' · '+x.ref+'</small></td><td><b>'+(x.ref===D.nova.ref?fx(x.mt)+'</b><br><span class="mute" style="font-size:12px">'+fx(D.nova.ttc)+' TTC</span>':fc(x.mt)+'</b>')+'</td><td><span class="st '+cls[x.st]+'"><i></i>'+x.st+'</span></td><td>'+dfr(x.sig)+'<br><span class="'+(j<=7?'down':'mute')+'" style="font-size:12px">dans '+j+' jours</span></td></tr>'}).join(''):'<tr><td class="empty" colspan="4">Aucun devis en attente.</td></tr>')+'</tbody>';
}
function mini(x){return '<div class="mi"><span class="mic">'+ic(x[0])+'</span><p class="v">'+x[1]+'</p><p class="l">'+x[2]+'</p></div>'}

function renderEnc(R,FA,enc,penc,OPF,reste,LATE,retard){
  var fact=sum(FA.filter(function(x){return inM(x.d,R.m0,R.m1)}),function(x){return x.mt});
  $('enc-minis').innerHTML=[
    ['wallet',big(fc(enc)),'Encaissé '+R.lab+' '+dl(enc,penc)],
    ['receipt',big(fc(fact)),'Facturé '+R.lab],
    ['clock',big(fc(reste)),'Reste à encaisser, '+OPF.length+' facture'+(OPF.length>1?'s':'')],
    ['triangle-alert',big(fc(retard)),'Dont en retard de paiement']
  ].map(mini).join('');
  var lab=R.ms.map(function(m){return mlab(m,true)});
  var e=R.ms.map(function(m){return sum(FA.filter(function(x){return x.denc&&x.denc.slice(0,7)===m}),function(x){return x.enc})});
  var fa=R.ms.map(function(m){return sum(FA.filter(function(x){return x.d.slice(0,7)===m}),function(x){return x.mt})});
  chart('c-enc',{type:'bar',data:{labels:lab,datasets:[{label:'Facturé',data:fa,backgroundColor:'#C9D0E3',borderRadius:5,maxBarThickness:22},{label:'Encaissé',data:e,backgroundColor:'#0D9488',borderRadius:5,maxBarThickness:22}]},
    options:opt({y:{ticks:{callback:function(v){return mf(v)}},grid:{color:'#EFF2F7'},border:{display:false}}},function(c){return ' '+c.dataset.label+' : '+fc(c.raw)},true)});
  var B=[['Pas encore échu',0,'#C9D0E3'],['1 à 30 jours de retard',0,'#F59E0B'],['31 à 60 jours',0,'#EA580C'],['Plus de 60 jours',0,'#B91C1C']];
  OPF.forEach(function(x){var j=days(x.ech,D.arrete),r=x.mt-x.enc;B[j<=0?0:j<=30?1:j<=60?2:3][1]+=r});
  $('aging').innerHTML=B.map(function(b){return b[1]?'<span style="width:'+(b[1]/(reste||1)*100)+'%;background:'+b[2]+'"></span>':''}).join('');
  var lg=$('aglg');if(!lg){lg=document.createElement('div');lg.id='aglg';lg.className='aglg';$('aging').after(lg)}
  lg.innerHTML=B.map(function(b){return '<span><i style="background:'+b[2]+'"></i>'+b[0]+' : <b>'+fc(b[1])+'</b></span>'}).join('');
  var L=OPF.slice().sort(function(a,b){return a.ech<b.ech?-1:1});
  $('t-enc').innerHTML='<thead><tr><th>Facture</th><th>Reste dû TTC</th><th>Échéance</th></tr></thead><tbody>'+(L.length?L.map(function(x){var j=days(x.ech,D.arrete);
    return '<tr><td class="t">'+esc(x.n)+'<small>'+esc(x.c)+' · '+x.nat.toLowerCase()+' · '+x.ref+'</small></td><td><b>'+fc(x.mt-x.enc)+'</b></td><td>'+dfr(x.ech,true)+'<br>'+(j>0?'<span class="st bad"><i></i>'+j+' j de retard</span>':'<span class="st"><i></i>dans '+(-j)+' j</span>')+'</td></tr>'}).join(''):'<tr><td class="empty" colspan="3">Tout est encaissé.</td></tr>')+'</tbody>';
}

function renderAud(R,E){
  var M=D.mois,b=R.b,a=R.a;
  $('nets').innerHTML=NETS.map(function(n){var s=D.reseaux[n[0]],v=s[b],v0=s[Math.max(a-1,0)];
    return '<div class="net"><div class="hd"><span class="nb" style="background:'+n[3]+';color:'+n[2]+'">'+ic(n[1])+'</span>'+n[0]+'</div><p class="v">'+nf(v)+'</p><p class="d"><span class="up">+'+nf(v-v0)+'</span> '+R.lab+'</p></div>'}).join('')+
    (function(){var v=sum(D.vues_mois.slice(a,b+1),function(x){return x}),p=sum(D.vues_mois.slice(R.pa,R.pb+1),function(x){return x});
      return '<div class="net"><div class="hd"><span class="nb" style="background:#E9EDF4;color:'+NAVY+'">'+ic('play')+'</span>Vues des vidéos</div><p class="v">'+compact(v)+'</p><p class="d">'+dl(v,p)+' sur un an</p></div>'})();
  var NS=E.filter(function(e){return e.t!=='Salon'}),SA=E.filter(function(e){return e.t==='Salon'});
  var ins=sum(NS,function(e){return e.ins}),pre=sum(NS,function(e){return e.pre});
  $('aud-scope').textContent=(scope()?scope()+', ':'')+R.lab;
  $('aud-minis').innerHTML=[
    ['user-check',nf(ins),'Inscrits aux événements sur invitation'],
    ['user-round-check',nf(pre),'Présents, soit '+(ins?pct(pre/ins):'—')+' des inscrits'],
    ['store',nf(sum(SA,function(e){return e.pre})),'Visiteurs accueillis sur les stands'],
    ['video',compact(sum(E,function(e){return e.vues})),'Vues des vidéos des événements']
  ].map(mini).join('');
  chart('c-vues',{type:'line',data:{labels:R.ms.map(function(m){return mlab(m,true)}),datasets:[{label:'Vues',data:D.vues_mois.slice(a,b+1),borderColor:NAVY,backgroundColor:'rgba(38,44,81,.08)',fill:true,tension:.25,pointRadius:3,borderWidth:2}]},
    options:opt({y:{ticks:{callback:function(v){return compact(v)}},grid:{color:'#EFF2F7'},border:{display:false},beginAtZero:true}},function(c){return ' '+nf(c.raw)+' vues'})});
  var L=NS.slice().sort(function(x,y){return x.d<y.d?1:-1}).slice(0,8);
  var lab=L.map(function(e){var n=e.n.replace('Accueil de délégation · ','').replace(' Regional Launch','');return n.length>30?n.slice(0,28)+'…':n});
  chart('c-pres',{type:'bar',data:{labels:lab,datasets:[{label:'Inscrits',data:L.map(function(e){return e.ins}),backgroundColor:'#C9D0E3',borderRadius:4,barPercentage:.8,categoryPercentage:.7},{label:'Présents',data:L.map(function(e){return e.pre}),backgroundColor:NAVY,borderRadius:4,barPercentage:.8,categoryPercentage:.7}]},
    options:Object.assign(opt({x:{grid:{color:'#EFF2F7'},border:{display:false}},y:{grid:{display:false},border:{display:false},ticks:{font:{size:11.5}}}},function(c){return ' '+c.dataset.label+' : '+nf(c.raw)},true),{indexAxis:'y'})});
}

function renderNova(){
  var N=D.nova,j=days(D.arrete,N.d),d=dt(N.d),E=N.echeancier;
  $('nova').innerHTML='<div class="nova-hero"><span class="bx">'+ic('rocket')+'</span><div><p class="t">'+N.n+'</p><p class="s">'+N.c+' · '+JOURS[d.getDay()]+' '+dfr(N.d,true)+' · '+N.lieu+' · '+N.invites+' invités</p></div><div class="k"><p class="big">J\u2212'+j+'</p><p class="bl">avant la soirée</p></div></div>'+
  '<div class="nsteps">'+[
    ['file-text','Devis '+N.ref+', en négociation',fx(N.ttc)+'<small> TTC</small>','<span class="ln"><span>Prix HT</span><b>'+nf(N.mt)+'</b></span>'+'<span class="ln"><span>TVA 18\u00a0%</span><b>'+nf(N.tva)+'</b></span>'+'<span class="ln"><span>dont formule de base HT</span><b>'+nf(N.base)+'</b></span>'+'<span class="ln"><span>dont options HT</span><b>'+nf(N.options)+'</b></span>'+'<span class="nt">Formule de base dans l’enveloppe de '+nf(N.enveloppe)+' FCFA.</span>'],
    ['wallet','Paiements du client',fx(N.ttc)+'<small> TTC</small>',E.map(function(x){return '<span class="ln"><span>'+x[0]+', '+dfr(x[2],true)+'</span><b>'+nf(x[3])+'</b></span>'}).join('')+'<span class="nt">'+pct(E[0][1])+' à la signature, '+pct(E[1][1])+' avant, '+pct(E[2][1])+' après.</span>'],
    ['user-check','Inscrits','0<small>/ '+N.invites+'</small>','Le compteur suit la page d’inscription dès l’envoi des invitations.'],
    ['play','Vues des vidéos','—','Teaser, puis film de la soirée : vues suivies réseau par réseau dès leur publication.']
  ].map(function(x){return '<div class="nst"><div class="hd"><span class="bx">'+ic(x[0])+'</span>'+x[1]+'</div><p class="v">'+x[2]+'</p><p class="s">'+x[3]+'</p></div>'}).join('')+'</div>'+
  '<p class="wkn">Marge agence prévue '+fx(N.marge)+' HT. Point bas de trésorerie de l’événement : '+fx(N.point_bas)+', sans avance à financer : l’acompte du client couvre les acomptes aux prestataires.</p>';
}

function renderEncours(){
  var L=D.lundi;
  $('encours').innerHTML=D.encours.map(function(e){var j=days(D.arrete,e.d);
    var ins=sum(L.entrees.filter(function(x){return x[6]===e.k}),function(x){return x[3]}),out=sum(L.prestataires.filter(function(x){return x[4]===e.k}),function(x){return x[2]});
    var q=j<0?'en cours':j===0?'aujourd’hui':j===1?'demain':'dans '+j+' jours';
    var ln=[];if(out)ln.push('<span class="down">\u2212'+fx(out)+'</span> prestataires');if(ins)ln.push('<span class="up">+'+fx(ins)+'</span> attendus');
    if(!ln.length)ln.push(e.k===D.nova.k?'acompte de '+fx(D.nova.echeancier[0][3])+' à la signature':'aucun mouvement sous 4 semaines');
    return '<button type="button" class="eci'+(S.ev===e.k?' sel':'')+'" data-k="'+esc(e.k)+'"><span class="ttag" style="background:'+TT[e.t]+';color:'+TC[e.t]+'">'+ic(TI[e.t])+TS[e.t]+'</span><span class="en">'+esc(e.n)+'</span><span class="ed">'+dfr(e.d,true)+' · '+q+' · '+esc(e.statut.toLowerCase())+'</span><span class="ev">'+fx(e.ca)+' HT</span><span class="es">'+ln.join(' · ')+' <span class="mute">sous 4 semaines</span></span></button>'}).join('');
  Array.prototype.forEach.call(document.querySelectorAll('.eci'),function(el){el.onclick=function(){setEv(S.ev===el.dataset.k?'all':el.dataset.k)}});
}

function renderLundi(){
  var L=D.lundi,w0=L.semaine[0],w1=L.semaine[1],ar=D.arrete,mob=window.innerWidth<=640;
  var tr=L.treso.banque+L.treso.caisse;
  var IN=L.entrees.filter(function(x){return x[4]===0}),OUT=L.prestataires.filter(function(x){return x[3]===0});
  var FX=L.fixes,FXW=FX.filter(function(x){return !x[4]&&x[5]===0});
  var tin=sum(IN,function(x){return x[3]}),tout=sum(OUT,function(x){return x[2]}),tfw=sum(FXW,function(x){return x[2]});
  var W=[0,1,2,3].map(function(i){var s=new Date(dt(w0).getTime()+i*7*864e5);return {s:s.toISOString().slice(0,10),e:new Date(s.getTime()+6*864e5).toISOString().slice(0,10),inn:0,out:0}});
  L.entrees.forEach(function(x){W[x[4]].inn+=x[3]});
  L.prestataires.forEach(function(x){W[x[3]].out+=x[2]});
  FX.forEach(function(x){if(!x[4]&&x[5]!==null)W[x[5]].out+=x[2]});
  L.fixes_suivants.forEach(function(x){W[x[4]].out+=x[2]});
  var bal=tr;W.forEach(function(w){bal+=w.inn-w.out;w.bal=bal});
  var sel=S.ev!=='all'?evRec(S.ev):null;
  $('lun-hint').textContent='Semaine du lundi '+dfr(w0)+' au dimanche '+dfr(w1)+' · toute l’agence'+(sel?', lignes de « '+sel.n+' » surlignées':'');
  function big2(x){return nf(x)+'<small>FCFA</small>'}
  $('lun-minis').innerHTML=[
    ['landmark',big2(tr),'Trésorerie ce lundi<br><span class="mute">banque '+nf(L.treso.banque)+' · caisse '+nf(L.treso.caisse)+'</span>'],
    ['arrow-down-left',big2(tin),'À encaisser cette semaine<br><span class="mute">'+IN.length+' règlement'+(IN.length>1?'s':'')+' client annoncé'+(IN.length>1?'s':'')+'</span>'],
    ['arrow-up-right',big2(tout+tfw),'À payer cette semaine<br><span class="mute">prestataires '+nf(tout)+' · charges fixes '+nf(tfw)+'</span>'],
    ['piggy-bank',big2(W[0].bal),'Solde prévu dimanche '+dfr(w1)+'<br><span class="mute">trésorerie + encaissements − paiements</span>']
  ].map(mini).join('');
  function hl(k){return sel&&k===sel.k?' hl':''}
  function row(dd,l,s,m,cls,k){return '<div class="li'+hl(k)+'"><span class="dd">'+dd+'</span><p class="t">'+esc(l)+(s?'<small>'+esc(s)+'</small>':'')+'</p><b class="'+cls+'">'+nf(m)+'</b></div>'}
  function jd(iso){var d=dt(iso);return JOURS[d.getDay()].slice(0,3)+'. '+d.getDate()}
  $('lun-in').innerHTML=IN.map(function(x){return row(jd(x[0]),x[1],x[2]+' · '+x[5],x[3],'up',x[6])}).join('')+'<div class="li tot"><span class="dd"></span><p class="t">Total à encaisser</p><b class="up">'+nf(tin)+'</b></div>';
  $('lun-out').innerHTML=OUT.map(function(x){return row(jd(x[0]),x[1],'',x[2],'',x[4])}).join('')+FXW.map(function(x){return row(jd(x[3]),x[1],x[0],x[2],'',null)}).join('')+'<div class="li tot"><span class="dd"></span><p class="t">Total à payer</p><b>'+nf(tout+tfw)+'</b></div>';
  var LT=D.factures.filter(function(x){return x.mt>x.enc&&x.ech<ar}).sort(function(a,b){return a.ech<b.ech?-1:1});
  $('lun-rel').innerHTML=LT.map(function(x){var j=days(x.ech,ar),ann=L.entrees.filter(function(e){return e[6]===x.k&&e[4]===0})[0];
    return row(j+'\u00a0j',x.n+', '+x.nat.toLowerCase(),x.c+' · '+x.ref+(ann?' · règlement annoncé le '+dfr(ann[0]):' · aucune date annoncée'),x.mt-x.enc,'down',x.k)}).join('')+'<div class="li tot"><span class="dd"></span><p class="t">Total en retard</p><b class="down">'+nf(sum(LT,function(x){return x.mt-x.enc}))+'</b></div>';
  // charges fixes
  var md=dt(w0),mois=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'][md.getMonth()];
  var tot=sum(FX,function(x){return x[2]}),paid=sum(FX.filter(function(x){return x[4]}),function(x){return x[2]});
  $('lun-fx-cap').innerHTML='Charges fixes de '+mois+' : <b>'+fx(tot)+'</b>, dont '+fx(tot-paid)+' restant à payer';
  var CI={'Loyer':'house','Salaires':'users-round','Impôts et taxes':'landmark','Abonnements':'wifi'};
  $('lun-cat').innerHTML=['Loyer','Salaires','Impôts et taxes','Abonnements'].map(function(c){var Lc=FX.filter(function(x){return x[0]===c}),s=sum(Lc,function(x){return x[2]}),r=sum(Lc.filter(function(x){return !x[4]}),function(x){return x[2]});
    return '<div class="fc"><span class="mic">'+ic(CI[c])+'</span><p class="n">'+c+'</p><p class="v">'+nf(s)+'</p><p class="r'+(r?'':' ok')+'">'+(r?'reste '+nf(r):'payé')+'</p></div>'}).join('');
  var FS=FX.slice().sort(function(a,b){return a[4]===b[4]?(a[3]<b[3]?-1:1):(a[4]?1:-1)});
  $('t-fx').innerHTML='<thead><tr><th>Charge</th><th>Montant</th><th>Échéance</th></tr></thead><tbody>'+FS.map(function(x){var j=days(ar,x[3]);
    var st=x[4]?'<span class="st ok"><i></i>payé</span>':(j<0?'<span class="st bad"><i></i>en retard</span>':j<=3?'<span class="st bad"><i></i>dans '+j+' j</span>':'<span class="st warn"><i></i>dans '+j+' j</span>');
    return '<tr'+(x[4]?' class="paid"':'')+'><td class="t">'+esc(x[1])+'<small>'+x[0]+'</small></td><td><b>'+nf(x[2])+'</b></td><td>'+dfr(x[3])+'<br>'+st+'</td></tr>'}).join('')+'</tbody>';
  // 4 semaines
  var lab=W.map(function(w,i){return mob?(i?'Sem. '+(i+1):'Cette sem.'):dfr(w.s)+' – '+dfr(w.e)});
  chart('c-lun',{type:'bar',data:{labels:lab,datasets:[
    {type:'line',label:'Trésorerie en fin de semaine',data:W.map(function(w){return w.bal}),yAxisID:'y2',borderColor:NAVY,backgroundColor:NAVY,pointRadius:4,borderWidth:2.5,tension:.25},
    {label:'Entrées',data:W.map(function(w){return w.inn}),backgroundColor:'#0D9488',borderRadius:5,maxBarThickness:34},
    {label:'Sorties',data:W.map(function(w){return w.out}),backgroundColor:'#F59E0B',borderRadius:5,maxBarThickness:34}]},
    options:opt({y:{beginAtZero:true,ticks:{callback:function(v){return mf(v)}},grid:{color:'#EFF2F7'},border:{display:false}},y2:{display:!mob,position:'right',beginAtZero:true,ticks:{callback:function(v){return mf(v)}},grid:{display:false},border:{display:false}}},function(c){return ' '+c.dataset.label+' : '+fx(c.raw)},true)});
  $('lun-wk').innerHTML=W.map(function(w,i){return '<div><p class="l">'+(i?'Semaine '+(i+1):'Cette semaine')+' · fin '+dfr(w.e)+'</p><p class="v">'+fx(w.bal)+'</p><p class="s">'+(w.inn?'<span class="up">+'+mf(w.inn)+'</span>':'<span class="mute">aucune entrée</span>')+' · <span class="down">\u2212'+mf(w.out)+'</span></p></div>'}).join('');
  var nin=LT.filter(function(x){return !L.entrees.some(function(e){return e[6]===x.k})});
  var nn=$('lun-wkn');if(nn)nn.remove();
  if(nin.length)$('lun-wk').insertAdjacentHTML('afterend','<p class="wkn" id="lun-wkn">Par prudence, '+fx(sum(nin,function(x){return x.mt-x.enc}))+' de factures en retard ne sont pas comptés dans les entrées tant qu’aucune date de règlement n’est annoncée.</p>');
  renderEncours();
}
function setEv(k){S.ev=k;if(k!=='all'){S.type='all';S.cli='all';$('f-type').value='all';$('f-cli').value='all'}$('f-ev').value=k;showAll=false;
  $('f-per').disabled=k!=='all';document.body.classList.toggle('evmode',k!=='all');render()}
function opt(scales,lab,legend){
  return {responsive:true,maintainAspectRatio:false,animation:{duration:350},interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:legend!==false,position:'bottom',labels:{boxWidth:10,boxHeight:10,usePointStyle:true,pointStyle:'rectRounded',font:{family:'Roboto',size:12},color:'#4A5068'}},
      tooltip:{backgroundColor:'#141830',titleFont:{family:'Roboto',weight:'600'},bodyFont:{family:'Roboto'},padding:10,cornerRadius:8,callbacks:{label:lab}}},
    scales:Object.assign({x:{grid:{display:false},border:{display:false},ticks:{font:{family:'Roboto',size:11.5},color:'#6B7189',maxRotation:0,autoSkip:true}}},scales)};
}
function chart(id,cfg){if(charts[id])charts[id].destroy();charts[id]=new Chart($(id),cfg)}

function init(){
  Chart.defaults.font.family='Roboto';Chart.defaults.color='#6B7189';
  var d=dt(D.arrete);$('arrete').textContent='Situation au '+JOURS[d.getDay()]+' '+dfr(D.arrete,true);
  var ft=$('f-type');TYPES.forEach(function(t){var o=document.createElement('option');o.value=t;o.textContent=TN[t];ft.appendChild(o)});
  var cl={};D.events.concat(D.devis,D.encours).forEach(function(e){if(e.d>='2025-12-01')cl[e.c]=1});
  var fcl=$('f-cli');Object.keys(cl).sort(function(a,b){return a.localeCompare(b,'fr')}).forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;fcl.appendChild(o)});
  var fe=$('f-ev');function og(lab,L){var g=document.createElement('optgroup');g.label=lab;L.forEach(function(e){var o=document.createElement('option');o.value=e.k;o.textContent=e.n+' · '+dfr(e.d,true);g.appendChild(o)});fe.appendChild(g)}
  og('En cours et à venir',D.encours);
  og('Réalisés depuis décembre 2025',D.events.filter(function(e){return e.d>='2025-12-01'}).slice().sort(function(a,b){return a.d<b.d?1:-1}));
  fe.onchange=function(){setEv(this.value)};
  $('f-per').onchange=function(){S.per=this.value;render()};
  ft.onchange=function(){S.type=this.value;if(S.ev!=='all')setEv('all');else render()};
  fcl.onchange=function(){S.cli=this.value;if(S.ev!=='all')setEv('all');else render()};
  $('raz').onclick=function(){S={per:'12',type:'all',cli:'all',ev:'all'};$('f-per').value='12';ft.value='all';fcl.value='all';setEv('all')};
  var tabs=document.querySelectorAll('.tabs a');
  if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){Array.prototype.forEach.call(tabs,function(t){var on=t.getAttribute('href')==='#'+x.target.id;t.classList.toggle('on',on);if(on){var w=t.parentNode;w.scrollTo({left:t.offsetLeft-16,behavior:'smooth'})}})}})},{rootMargin:'-40% 0px -55% 0px'});
    ['s-lun','s-ca','s-dev','s-enc','s-aud','s-nova'].forEach(function(i){io.observe($(i))})}
  hydrate();render();
}
fetch('data/donnees.json?v=20261118b').then(function(r){return r.json()}).then(function(j){D=j;init()});
})();
