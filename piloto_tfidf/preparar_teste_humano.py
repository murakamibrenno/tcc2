"""Entrega cega para o autor; nunca inclui sinais de seleção, previsões ou sugestões."""
from __future__ import annotations
import argparse, hashlib, json
from pathlib import Path
from preparar_validacao_ampliada import ordem

BASE=Path(__file__).resolve().parent
LABELS={'Adequado','Parcialmente Adequado','Inadequado'}

def preparar_casos(manifesto,repo):
    result=[]
    for r in sorted(manifesto['registros'],key=lambda r:ordem(r['id'],'apresentacao')):
        if r['papel']!='teste_humano_reservado':continue
        text=(repo/r['fonte_texto']).read_text(encoding='utf-8-sig').replace('\r\n','\n').replace('\r','\n')
        if hashlib.sha256(text.encode()).hexdigest()!=r['sha256_texto_utf8_lf']:raise ValueError('Texto alterado')
        result.append({'id':r['id'],'texto_integral':text})
    return result

def validar_respostas(payload,manifesto):
    if payload.get('sha256_manifesto')!=manifesto['sha256_registros']:raise ValueError('Manifesto incompatível')
    if payload.get('avaliador')!='autor':raise ValueError('Identificar revisão do autor')
    expected={r['id'] for r in manifesto['registros'] if r['papel']=='teste_humano_reservado'}
    rows=payload.get('respostas',[]);ids=[str(r.get('id')) for r in rows]
    if len(ids)!=len(set(ids)) or set(ids)!=expected:raise ValueError('IDs incompletos, repetidos ou extras')
    for r in rows:
        if r.get('rotulo_manual') not in LABELS:raise ValueError('Rótulo ausente/inválido: '+r['id'])
        if not r.get('justificativa','').strip():raise ValueError('Justificativa ausente: '+r['id'])
        for k in ['sql','servicos','git','programacao']:
            e=r.get('criterios',{}).get(k,{})
            if e.get('atende') not in ['sim','nao']:raise ValueError('Critério não resolvido: '+r['id'])
            if e['atende']=='sim' and not e.get('evidencia','').strip():raise ValueError('Evidência ausente: '+r['id'])
    return rows

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--saida',type=Path,required=True)
    p.add_argument('--respostas',type=Path)
    a=p.parse_args();manifest=json.loads((BASE/'data/validacao_ampliada_v1/manifesto.json').read_text(encoding='utf-8'))
    if a.respostas:
        rows=validar_respostas(json.loads(a.respostas.read_text(encoding='utf-8')),manifest)
        print('Revisão completa válida:',len(rows));return
    data={'sha256_manifesto':manifest['sha256_registros'],'vaga':(BASE/'data/vaga_referencia.txt').read_text(encoding='utf-8'), 'casos':preparar_casos(manifest,BASE.parent)}
    payload=json.dumps(data,ensure_ascii=False).replace('<','\\u003c')
    html=HTML.replace('__DATA__',payload)
    a.saida.parent.mkdir(parents=True,exist_ok=True);a.saida.write_text(html,encoding='utf-8')
    print('Formulário cego:',a.saida,'casos:',len(data['casos']))

HTML='''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisão humana do teste TCC2</title><style>
body{font:16px/1.5 system-ui,sans-serif;color:#17202a;background:#f4f5f7;margin:0}header,main{max-width:1300px;margin:auto;padding:20px}h1{font-size:25px;margin:0}button,select,input,textarea{font:inherit}button{padding:9px 14px;cursor:pointer}nav{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:12px 0}details,article,section{background:white;border:1px solid #c8ced5;padding:16px;margin:12px 0} .cols{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(320px,1fr);gap:18px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.6 system-ui;margin:0}label{display:block;margin:12px 0 4px;font-weight:600}textarea{box-sizing:border-box;width:100%;min-height:70px;padding:8px}select{max-width:100%;padding:6px}#status{font-weight:600} .nota{color:#435263;font-size:14px} @media(max-width:850px){.cols{display:block}}</style>
<header><h1>Revisão humana do teste TCC2</h1><p>Leia o currículo integral e registre sua avaliação da aderência à vaga. Nenhum caso tem rótulo sugerido ou score de modelo. Os 100 casos estão separados do desenvolvimento.</p>
<details><summary>Vaga e rubrica de revisão</summary><p id="vaga"></p><p>Quatro critérios: SQL ou banco relacional explícito; REST, web services ou integração de serviços; Git/GitHub/GitLab ou controle de versão explicitamente associado a Git; programação para aplicações (Java, Python, PHP, C#, .NET ou similar).</p><p><b>Adequado:</b> quatro critérios e evidência de desenvolvimento de aplicações. <b>Parcialmente Adequado:</b> dois ou três critérios. <b>Inadequado:</b> zero ou um critério. Categoria e excesso de experiência não reprovam. Formação explícita pode sustentar aderência parcial; não equivale a experiência profissional. Não inferir Git a partir de SVN/TFS nem SQL de uma menção genérica a dados.</p><p>Marque dúvida quando precisar conferir o PDF. Nenhuma dúvida deverá permanecer na versão final. Copie trechos nas evidências para justificar os critérios atendidos.</p></details>
<p class="nota">O progresso fica neste navegador. Exporte o JSON para guardar uma cópia e envie esse arquivo no chat quando terminar. O formulário não envia dados pela internet.</p>
<nav><button id="prev">Anterior</button><select id="jump" aria-label="Ir para caso"></select><button id="next">Próximo</button><button id="export">Exportar revisão JSON</button><label>Importar progresso <input type="file" id="import" accept=".json"></label></nav><p id="status" aria-live="polite"></p></header>
<main><h2 id="title"></h2><div class="cols"><article><pre id="text"></pre></article><section><div id="criteria"></div><label for="label">Sua classificação</label><select id="label"><option value="">Selecione após revisar</option><option>Adequado</option><option>Parcialmente Adequado</option><option>Inadequado</option></select><label for="reason">Justificativa da decisão ou dúvida</label><textarea id="reason"></textarea><p class="nota">Não use a categoria do arquivo ou a senioridade como veto. O texto integral pode conter evidências além da janela lida pelos modelos.</p></section></div></main>
<script>const DATA=__DATA__;const KEYS=['sql','servicos','git','programacao'];const NAMES=['SQL / banco relacional explícito','REST / web services / integração de serviços','Git / GitHub / GitLab','Programação para aplicações'];const STORE='tcc2-teste-'+DATA.sha256_manifesto;let answers={};let index=0;
try{answers=JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){}const $=id=>document.getElementById(id);
function persist(){try{localStorage.setItem(STORE,JSON.stringify(answers))}catch(e){$('status').textContent='Não foi possível salvar no navegador. Exporte agora.'}}
function complete(a){return a&&a.rotulo_manual&&a.justificativa&&KEYS.every(k=>a.criterios?.[k]&&['sim','nao'].includes(a.criterios[k].atende)&&(a.criterios[k].atende==='nao'||a.criterios[k].evidencia.trim()))}
function save(){const id=DATA.casos[index].id;answers[id]={id,rotulo_manual:$('label').value,justificativa:$('reason').value,criterios:Object.fromEntries(KEYS.map(k=>[k,{atende:$(k).value,evidencia:$(k+'ev').value}]))};persist();update()}
function update(){$('status').textContent=DATA.casos.filter(c=>complete(answers[c.id])).length+' de '+DATA.casos.length+' revisões completas. Progresso salvo neste navegador.'}
function show(){const c=DATA.casos[index],a=answers[c.id]||{};$('title').textContent='Caso '+(index+1)+' de '+DATA.casos.length+' — ID '+c.id;$('text').textContent=c.texto_integral;$('label').value=a.rotulo_manual||'';$('reason').value=a.justificativa||'';KEYS.forEach(k=>{$(k).value=a.criterios?.[k]?.atende||'';$(k+'ev').value=a.criterios?.[k]?.evidencia||''});$('jump').value=index;$('prev').disabled=index===0;$('next').disabled=index===DATA.casos.length-1;update()}
KEYS.forEach((k,i)=>{const label=document.createElement('label');label.htmlFor=k;label.textContent=NAMES[i];const select=document.createElement('select');select.id=k;[['','Selecione'],['sim','Atende'],['nao','Não identifiquei'],['duvida','Dúvida / conferir PDF']].forEach(([v,t])=>{const o=new Option(t,v);select.add(o)});const ev=document.createElement('textarea');ev.id=k+'ev';ev.setAttribute('aria-label','Evidência de '+NAMES[i]);ev.placeholder='Trecho literal ou observação';$('criteria').append(label,select,ev);select.onchange=save;ev.oninput=save});
DATA.casos.forEach((c,i)=>$('jump').add(new Option('Caso '+(i+1)+' — '+c.id,i)));$('jump').onchange=()=>{index=Number($('jump').value);show()};$('prev').onclick=()=>{index--;show()};$('next').onclick=()=>{index++;show()};$('label').onchange=save;$('reason').oninput=save;$('vaga').textContent=DATA.vaga;
$('export').onclick=()=>{const payload={schema:1,avaliador:'autor',sha256_manifesto:DATA.sha256_manifesto,data_exportacao:new Date().toISOString(),respostas:DATA.casos.map(c=>answers[c.id]||{id:c.id,rotulo_manual:'',justificativa:'',criterios:{}})};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='revisao_teste_humano_tcc2.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)};
$('import').onchange=async e=>{try{const p=JSON.parse(await e.target.files[0].text());if(p.sha256_manifesto!==DATA.sha256_manifesto||p.avaliador!=='autor')throw Error('Arquivo de outra seleção');const allowed=new Set(DATA.casos.map(c=>c.id));if(!Array.isArray(p.respostas)||p.respostas.some(r=>!allowed.has(r.id)))throw Error('IDs inválidos');answers=Object.fromEntries(p.respostas.map(r=>[r.id,r]));persist();show()}catch(err){alert('Não foi possível importar: '+err.message)}};show();</script></html>'''

if __name__=='__main__':main()
