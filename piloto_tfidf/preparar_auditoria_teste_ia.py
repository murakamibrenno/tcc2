"""Valida a referência da IA e apresenta cinco casos; não registra concordância humana."""
from __future__ import annotations
import argparse,collections,hashlib,html,json
from pathlib import Path
from protocolo_experimento import gravar_json_atomico

BASE=Path(__file__).resolve().parent
LABELS={'Adequado','Parcialmente Adequado','Inadequado'}
RELATED={'11981094','28078163','31677347'}
COMPONENT={'11981094','28078163','31677347','28762662','64468610'}

def validar(review,selection,development,repo):
    records=review['registros'];ids=[r['id'] for r in records]
    originals={r['id']:r for r in selection['registros']}
    expected={r['id'] for r in originals.values() if r['papel']=='teste_humano_reservado'}
    if len(ids)!=len(set(ids)) or set(ids)!=expected:raise ValueError('Coorte de 100 casos alterada')
    if review['n_auditados_pelo_autor']!=0:raise ValueError('Este snapshot contém somente propostas da IA; auditoria humana ainda não ocorreu')
    raw=json.dumps(records,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()
    if hashlib.sha256(raw).hexdigest()!=review['sha256_registros']:raise ValueError('Revisão mudou depois do congelamento')
    for r in records:
        if r['anotador']!='assistente_IA' or r['ratificado_individualmente_pelo_autor']:raise ValueError('Anotação da IA não pode virar revisão humana')
        if r['rotulo_ia'] not in LABELS:raise ValueError('Classe inválida')
        source=originals[r['id']]
        t=(repo/source['fonte_texto']).read_text(encoding='utf-8-sig').replace('\r\n','\n').replace('\r','\n')
        digest=hashlib.sha256(t.encode()).hexdigest()
        if digest!=r['sha256_texto_utf8_lf'] or digest!=source['sha256_texto_utf8_lf']:raise ValueError('Fonte textual alterada')
        normalized=' '.join(t.split()).lower()
        if set(r['criterios'])!={'sql','servicos','git','programacao'}:raise ValueError('Rubrica incompleta')
        for e in r['criterios'].values():
            if e['atende'] and (not e['evidencia'] or ' '.join(e['evidencia'].split()).lower() not in normalized):raise ValueError('Evidência positiva não localizada')
        n=sum(e['atende'] for e in r['criterios'].values())
        predicted_rule='Adequado' if n==4 else ('Parcialmente Adequado' if n>=2 else 'Inadequado')
        if predicted_rule!=r['rotulo_ia']:raise ValueError('Rótulo incompatível com a rubrica')
        if n==4 and not r['criterio_completo_de_adequacao_confirmado']:raise ValueError('Falta evidência de desenvolvimento para Adequado')
        if r['elegivel_avaliacao_principal']!=(r['id'] not in RELATED):raise ValueError('Exclusão documental inconsistente')
    def grupo(cid):return 'grupo_historico_nexio_28762662' if cid in COMPONENT else originals[cid]['grupo_documental']
    devgroups={grupo(r['id']) for r in development['registros'] if r['incluir']}
    eligible=[r for r in records if r['elegivel_avaliacao_principal']]
    if devgroups & {grupo(r['id']) for r in eligible}:raise ValueError('Grupo de desenvolvimento encontrado na avaliação principal')
    audit_ids=review['auditoria_planejada']['ids']
    if len(audit_ids)!=5 or len(set(audit_ids))!=5 or set(audit_ids)-{r['id'] for r in eligible}:raise ValueError('Auditoria precisa de cinco casos elegíveis distintos')
    return eligible

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--saida',type=Path,required=True);a=p.parse_args()
    load=lambda p:json.loads(p.read_text(encoding='utf-8'))
    review=load(BASE/'validation/revisao_teste_ia_100_v1.json');selection=load(BASE/'data/validacao_ampliada_v1/manifesto.json');dev=load(BASE/'data/desenvolvimento_revisado_v2/manifesto.json')
    eligible=validar(review,selection,dev,BASE.parent)
    byid={r['id']:r for r in review['registros']}
    cases=[byid[cid] for cid in review['auditoria_planejada']['ids']]
    a.saida.mkdir(parents=True,exist_ok=True)
    gravar_json_atomico(a.saida/'amostra_5_casos.json',{'schema':1,'status':'aguarda_conferencia_do_autor','n_confirmacoes_humanas':0,'sugestoes_ia_visiveis':True,'independente':False,'sha256_revisao_ia':review['sha256_registros'],'registros':cases})
    intro=('Confira estes cinco casos e responda no chat se concorda com cada classificação ou quais evidências precisam de correção. As propostas são da IA e ainda não foram aprovadas por você. A seleção é pequena e intencional, cobre classes e dificuldades da rubrica, e não estima a qualidade dos 100 casos. Sua conferência será registrada como auditoria humana assistida, sem equivaler a julgamento independente.')
    parts=['<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Conferência de cinco currículos do TCC2</title>',
    '<style>body{font:16px/1.55 system-ui,sans-serif;max-width:1000px;margin:32px auto;padding:0 20px;color:#18232d}h1{font-size:27px}h2{font-size:21px}article{border-top:1px solid #bcc5ce;padding:18px 0}blockquote{margin:10px 0 10px 18px;padding-left:12px;border-left:3px solid #bcc5ce}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.6 system-ui}summary{cursor:pointer;font-weight:600}li{margin:7px 0}.nota{color:#485662}a{color:#175a9c}</style>',
    '<h1>Conferência de cinco currículos do TCC2</h1><p>'+html.escape(intro)+'</p>',
    '<p><b>Rubrica mantida:</b> Adequado exige SQL, serviços/API, Git e programação, com desenvolvimento de aplicações. Parcialmente Adequado corresponde a dois ou três requisitos; Inadequado, a zero ou um. A categoria da pasta e o excesso de experiência não reprovam. Cite uma evidência se discordar.</p>']
    md=['# Conferência de cinco currículos do TCC2','',intro,'']
    titles={'23464505':'Java Intern','10624813':'Engineering Operations Director','62994611':'Software Developer','47603843':'Head Chef e estudante de computação','18297650':'Recrutamento técnico'}
    labels={'sql':'SQL','servicos':'Serviços/API','git':'Git','programacao':'Programação'}
    for i,r in enumerate(cases,1):
        t=(BASE.parent/r['fonte_texto']).read_text(encoding='utf-8-sig')
        (a.saida/(r['id']+'.txt')).write_text(t,encoding='utf-8')
        title=f"Caso {i} — {r['id']} — {titles[r['id']]}"
        parts += ['<article><h2>'+html.escape(title)+'</h2><p><b>Proposta da IA: '+html.escape(r['rotulo_ia'])+'</b></p><ul>']
        md += ['## '+title,'','Proposta da IA: **'+r['rotulo_ia']+'**.','']
        for k,e in r['criterios'].items():
            text=labels[k]+': '+('evidenciado' if e['atende'] else 'não confirmado')
            parts.append('<li>'+text+('</li>' if not e['atende'] else '<blockquote>'+html.escape(e['evidencia'])+'</blockquote></li>'))
            md.append('- '+text+(' — “'+e['evidencia']+'”' if e['atende'] else ''))
        parts += ['</ul><p>'+html.escape(r['justificativa'])+'</p>']
        if r['id']=='18297650':
            excerpt=' '.join(t.split());match='Performed extensive recruiting for Senior Software/Database Developers';start=excerpt.find(match);assert start>=0;excerpt=excerpt[start:start+280]
            parts.append('<blockquote>'+html.escape(excerpt)+'</blockquote>')
            md+=['','Contexto: “'+excerpt+'”']
        parts += ['<details><summary>Ler currículo integral</summary><pre>'+html.escape(t)+'</pre></details><p class="nota">Sua resposta pode ser: concordo / discordo / preciso conferir. Se discordar, indique a classe e o trecho que sustenta sua decisão.</p></article>']
        md+=['',r['justificativa'],'','Texto integral: ['+r['id']+'.txt]('+r['id']+'.txt)','']
    parts.append('</html>')
    (a.saida/'Conferencia_5_casos_TCC2.html').write_text('\n'.join(parts),encoding='utf-8')
    (a.saida/'Conferencia_5_casos_TCC2.md').write_text('\n'.join(md),encoding='utf-8')
    print('Referência IA validada:',len(review['registros']),'casos;',len(eligible),'elegíveis. Auditoria humana: 0 de 5 confirmados.')

if __name__=='__main__':main()
