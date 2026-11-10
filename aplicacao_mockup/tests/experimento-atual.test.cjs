const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'../src/data/experimentoAtual.json'),'utf8'));
test('universos, referências e predições publicados permanecem separados',async()=>{
 const {rankingAtual,filtrarDocumentos}=await import('../src/utils/experimentoAtual.js');
 assert.equal(data.curriculos.length,2483);
 const judged=data.curriculos.filter(r=>r.coorte97);
 assert.equal(judged.length,97);
 assert.equal(judged.filter(r=>r.rotulo==='Adequado').length,4);
 assert.ok(data.curriculos.some(r=>r.rotulo===null));
 assert.equal(data.classificacao.resultados.length,18);
 const cohort=JSON.parse(fs.readFileSync(path.join(__dirname,'../../piloto_tfidf/data/coorte_97_v1/manifesto.json'),'utf8'));
 assert.deepEqual(judged.map(r=>r.id).sort(),cohort.registros.map(r=>r.id).sort());
 const published=JSON.parse(fs.readFileSync(path.join(__dirname,'../../piloto_tfidf/output/coorte97_v1/classificacao_coorte97.json'),'utf8'));
 assert.deepEqual(data.classificacao,published);
 for(const method of ['tfidf','bge','qwen']){
  const rows=rankingAtual(data,method);assert.equal(rows.length,97);
  assert.equal(rankingAtual(data,method,'colecao2483').length,2483);
  for(let i=1;i<rows.length;i++)assert.ok(rows[i-1].scores[method]>=rows[i].scores[method]);
  const filtered=filtrarDocumentos(rows,'','Adequado');assert.equal(filtered.length,4);
  assert.ok(filtered.every(r=>r.posicao_exibicao===rows.findIndex(x=>x.id===r.id)+1));
 }
 for(const r of data.classificacao.resultados){assert.equal(r.matriz_confusao.flat().reduce((a,b)=>a+b,0),97);assert.equal(r.por_classe.Adequado.support,4);}
 for(const r of data.interpretabilidade.tfidf.casos){
  assert.ok(Math.abs(r.soma_contribuicoes+r.intercepto-r.margem)<1e-9);
  assert.ok(Math.abs(r.contribuicoes_mais_fortes.reduce((s,x)=>s+x.valor,0)+r.soma_demais_contribuicoes-r.soma_contribuicoes)<1e-9);
 }
 let masks=0;
 for(const method of ['bge','qwen'])for(const r of data.interpretabilidade.densos[method].casos){
  assert.ok(r.n_tokens_visiveis<=512);assert.ok(r.fim_char_visivel<=r.n_chars_entrada);
  for(const b of r.blocos){masks++;assert.ok(b.inicio_char<b.fim_char);assert.ok(b.fim_char<=r.fim_char_visivel);assert.ok(Number.isFinite(b.delta_margem_adequado));}
 }
 assert.equal(masks,80);
});
test('todas as páginas atuais renderizam em servidor sem navegador',async()=>{
 const {createServer}=await import('vite');
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 try{
  const pages=await server.ssrLoadModule('/src/pages/ExperimentoAtual.jsx');
  const React=require('react');const {renderToString}=require('react-dom/server');const {MemoryRouter}=require('react-router-dom');
  for(const name of ['DashboardAtual','VagaAtual','DocumentosAtuais','ComparativoAtual','ResultadosAtuais','InterpretabilidadeAtual','MetodologiaAtual']){
   const html=renderToString(React.createElement(MemoryRouter,{initialEntries:['/dashboard']},React.createElement(pages[name])));
   assert.ok(html.includes('<h1'),name);assert.ok(html.length>1000,name);
  }
 }finally{await server.close();}
});
