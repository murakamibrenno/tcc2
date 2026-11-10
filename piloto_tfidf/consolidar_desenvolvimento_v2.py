"""Consolida anotações de desenvolvimento, excluindo dúvidas e qualquer grupo de teste."""
from __future__ import annotations
import argparse,collections,hashlib,json
from pathlib import Path
from protocolo_experimento import gravar_json_atomico

BASE=Path(__file__).resolve().parent
LABELS={'Adequado','Parcialmente Adequado','Inadequado'}

def consolidar(manifest,pilot,review,repo):
    byid={r['id']:r for r in manifest['registros']}
    expected={r['id'] for r in byid.values() if r['papel']=='desenvolvimento_novo_sem_rotulo'}
    rows=review['registros'];ids=[r['id'] for r in rows]
    if len(ids)!=len(set(ids)) or set(ids)!=expected:raise ValueError('Revisão deve conter exatamente os 201 novos casos de desenvolvimento')
    testgroups={r['grupo_documental'] for r in byid.values() if r['papel']=='teste_humano_reservado'}
    result=[]
    for r in pilot['registros']:
        if r['incluir']:
            result.append({**r,'origem':'piloto_revisado_v1','rotulo':r['rotulo_revisado'],'status':'revisado_humano_ratificado' if r['ratificado_individualmente_pelo_autor'] else 'revisado_ia_autorizado','grupo_documental':byid[r['id']]['grupo_documental']})
    for r in rows:
        source=byid[r['id']]
        if r['ratificado_individualmente_pelo_autor'] or r['anotador']!='assistente_IA':raise ValueError('Proveniência dos novos rótulos não pode ser promovida a humana')
        t=(repo/source['fonte_texto']).read_text(encoding='utf-8-sig').replace('\r\n','\n').replace('\r','\n')
        h=hashlib.sha256(t.encode()).hexdigest()
        if h!=r['sha256_texto_utf8_lf'] or h!=source['sha256_texto_utf8_lf']:raise ValueError('Texto fonte mudou')
        if r['incluir_treino']:
            if r['rotulo'] not in LABELS or r['status']=='pendente_adjudicacao':raise ValueError('Rótulo pendente ou inválido não pode entrar no treino')
            n=sum(e['atende'] for e in r['criterios'].values())
            if r['rotulo']=='Adequado' and (n!=4 or not r['criterio_completo_de_adequacao_confirmado']):raise ValueError('Adequado sem quatro critérios e aplicação')
            if r['rotulo']=='Parcialmente Adequado' and n not in [2,3]:raise ValueError('Parcial sem dois/três critérios adjudicados')
            if r['rotulo']=='Inadequado' and n>1:raise ValueError('Inadequado com dois ou mais critérios')
        elif r['rotulo'] is not None:raise ValueError('Dúvida não deve receber rótulo de treino')
        normalized=' '.join(t.split()).lower()
        for e in r['criterios'].values():
            if e['atende'] and (not e['evidencia'] or ' '.join(e['evidencia'].split()).lower() not in normalized):raise ValueError('Evidência positiva ausente ou não localizada')
        result.append({**r,'origem':'revisao_desenvolvimento_201_v1','incluir':r['incluir_treino'],'grupo_documental':source['grupo_documental']})
    if len(result)!=len({r['id'] for r in result}):raise ValueError('IDs duplicados')
    if {r['grupo_documental'] for r in result}&testgroups:raise ValueError('Vazamento de grupos do teste')
    included=[r for r in result if r['incluir']]
    return {'schema':1,'versao':'desenvolvimento_revisado_v2','status':'referencia_exploratoria_proveniencia_mista',
        'sha256_manifesto_selecao':manifest['sha256_registros'],
        'n_casos_conferidos':len(result),'n_incluidos':len(included),'n_pendentes':sum(not r['incluir'] for r in result),
        'distribuicao':dict(collections.Counter(r['rotulo'] for r in included)),
        'proveniencia_incluidos':dict(collections.Counter('ratificado_individualmente' if r['ratificado_individualmente_pelo_autor'] else 'IA_autorizada' for r in included)),
        'teste_humano_consumido':False,'nota':'Não é referência humana independente. Novos casos anotados pela IA com busca integral e conferência de contextos; dúvidas excluídas. Não alterar os 100 casos reservados em função dos resultados.',
        'registros':result}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--saida',type=Path,default=BASE/'data/desenvolvimento_revisado_v2/manifesto.json');a=p.parse_args()
    read=lambda p:json.loads(p.read_text(encoding='utf-8'))
    result=consolidar(read(BASE/'data/validacao_ampliada_v1/manifesto.json'),read(BASE/'data/revisao_piloto_v1/manifesto.json'),read(BASE/'validation/revisao_desenvolvimento_201_v1.json'),BASE.parent)
    result['sha256_registros']=hashlib.sha256(json.dumps(result['registros'],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
    gravar_json_atomico(a.saida,result)
    print(json.dumps({k:v for k,v in result.items() if k!='registros'},ensure_ascii=True))

if __name__=='__main__':main()
