const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const esbuild = require('esbuild');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const result = esbuild.buildSync({entryPoints:[path.join(root,'src/utils/rankingUtils.js')],bundle:true,platform:'node',format:'cjs',write:false});
const scope = {module:{exports:{}}};
vm.runInNewContext(result.outputFiles[0].text, scope);
const utils = scope.module.exports;

for (const [repr, file, field] of [['tfidf','pilotoTfidf.json','scoreTfidf'],['sentenceTransformers','pilotoSt.json','scoreSt'],['llmEmbeddings','pilotoLlm.json','scoreLlm']]) {
  test(`ranking ${repr}: números publicados e método ativo preservados`,()=>{
    const source = require(path.join(root,'src/data',file));
    const rows = utils.getRankingPiloto(repr);
    assert.equal(rows.length,source.candidatos.length);
    for (const row of rows) {
      const original=source.candidatos.find(c=>c.id===row.id);
      assert.equal(row.scoreFinal, original[field]);
      assert.equal(utils.getScoreAtivo(row,repr), original[field]);
      assert.equal(row.classificacaoManual,original.classificacaoManual);
      assert.equal(row.totalCurriculos,100);
      assert.equal(row.representacaoAtiva,repr);
    }
  });
}
test('origem automática e divergência não viram anotação humana',()=>{
  const row=utils.getRankingPiloto('llmEmbeddings').find(c=>String(c.id)==='21297521');
  assert.match(utils.getOrigemRotulo(row),/automático.*revisão pendente/);
  assert.equal(row.classificacaoManual,'Inadequado');
  assert.match(utils.getMensagemInversao(row),/LLM Embeddings/);
  assert.doesNotMatch(utils.getMensagemInversao(row),/TF-IDF/);
});
test('origem humana só para registros do piloto manual',()=>{
  const row=utils.getRankingPiloto().find(c=>String(c.id)==='83816738');
  assert.equal(utils.getOrigemRotulo(row),'Anotação humana (piloto)');
});
test('score ausente não usa TF-IDF nem fabrica zero para outro método',()=>{
  assert.equal(utils.getScoreAtivo({scoreTfidf:.1},'llmEmbeddings'),undefined);
});
test('marcador descreve inversão na ordenação, não predição de classe',()=>{
  const rows=utils.getRankingPiloto('llmEmbeddings');
  const relevant=rows.filter(c=>c.classificacaoManual!=='Inadequado');
  const last=Math.max(...relevant.map(c=>c.posicao));
  for(const c of rows) assert.equal(c.inversaoRanking,c.classificacaoManual==='Inadequado'&&c.posicao<last);
});
