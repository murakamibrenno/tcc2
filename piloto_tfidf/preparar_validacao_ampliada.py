"""Congela seleção por grupos antes dos modelos; não atribui rótulos novos."""
from __future__ import annotations
import argparse, collections, hashlib, json, re
from pathlib import Path
from protocolo_experimento import gravar_json_atomico

BASE = Path(__file__).resolve().parent
SEED = 'tcc2-20261110-v1'
PADROES = [r'\b(?:sql|mysql|postgresql|oracle|pl/sql|t-sql)\b',
           r'\b(?:restful|rest|web\s*services?|microservices?|apis?)\b',
           r'\b(?:git|github|gitlab|version\s+control)\b',
           r'\b(?:java|python|php|javascript|spring|drupal)\b|c#|\.net']
EXCLUIDOS = {'26746496', '37473139', '28398216'}

def digest(t):
    return hashlib.sha256(t.encode('utf-8')).hexdigest()

def ordem(cid, sal='selecao'):
    return digest(SEED + ':' + sal + ':' + cid)

def detectar_grupos(rows):
    """Jaccard de conjuntos de palavras >= .90; agrupamento conservador, sem excluir."""
    import numpy as np
    from sklearn.feature_extraction.text import CountVectorizer
    ids = [r['id'] for r in rows]
    parent = {x:x for x in ids}
    def root(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    def union(a,b):
        a,b=root(a),root(b);parent[max(a,b)]=min(a,b)
    for a,b in [('16186411','26746496'),('16850314','37473139'),('19147603','28398216')]:
        union(a,b)
    mat = CountVectorizer(binary=True, token_pattern=r'(?u)\b[\w+#]+\b', dtype=np.int32).fit_transform([r['texto'] for r in rows])
    sizes = np.asarray(mat.sum(axis=1)).ravel()
    overlaps = (mat @ mat.T).toarray()
    pairs=[]
    for i in range(len(rows)):
        denom = sizes[i]+sizes[i+1:]-overlaps[i,i+1:]
        similarities = np.divide(overlaps[i,i+1:],denom,out=np.zeros(len(denom)),where=denom>0)
        for offset in np.flatnonzero(similarities>=.90):
            j=i+1+int(offset)
            union(ids[i],ids[j]);pairs.append({'a':ids[i],'b':ids[j],'jaccard_palavras':float(similarities[offset])})
    return {x:'grupo_'+root(x) for x in ids},pairs

def selecionar(candidatos, n_teste=100, n_dev=201):
    """Reserva metade de cada estrato >=2, completa teste e desenvolvimento com os demais."""
    buckets=collections.defaultdict(list)
    for r in candidatos:buckets[r['sinais_lexicais']].append(r)
    selected=[]
    for k in [4,3,2]:
        pool=sorted(buckets[k],key=lambda r:ordem(r['id']))
        selected.extend(pool[:(len(pool)+1)//2])
    if len(selected)>n_teste:
        raise ValueError('Estratos excedem teste predefinido; rever protocolo antes de executar modelos')
    used={r['id'] for r in selected}
    remaining=sorted([r for r in candidatos if r['id'] not in used],key=lambda r:ordem(r['id'],'complemento'))
    selected.extend(remaining[:n_teste-len(selected)])
    test={r['id'] for r in selected}
    high=sorted([r for r in candidatos if r['id'] not in test],key=lambda r:(-r['sinais_lexicais'],ordem(r['id'],'dev')))
    if len(high)<n_dev:raise ValueError('Universo insuficiente')
    return test,{r['id'] for r in high[:n_dev]}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--textos',type=Path,required=True)
    p.add_argument('--inventario',type=Path,required=True)
    p.add_argument('--saida',type=Path,default=BASE/'data/validacao_ampliada_v1')
    a=p.parse_args()
    if (a.saida/'manifesto.json').exists():raise SystemExit('Seleção já congelada. Não sobrescrever.')
    rows=[json.loads(x) for x in a.textos.read_text(encoding='utf-8').splitlines()]
    assert len(rows)==2484 and len({r['id'] for r in rows})==2484
    inv=json.loads(a.inventario.read_text(encoding='utf-8'))
    metadata={r['id']:r for r in inv['registros']}
    groups,pairs=detectar_grupos(rows)
    pilot=json.loads((BASE/'data/revisao_piloto_v1/manifesto.json').read_text(encoding='utf-8'))
    history=json.loads((BASE/'validation/revisao_adjudicada.json').read_text(encoding='utf-8'))
    seen={str(r['id']) for r in history['decisoes_aprovadas']+history['decisoes_ia_autorizadas']}
    seen_groups={groups[x] for x in seen}
    old={r['id'] for r in pilot['registros'] if r['incluir']}
    records=[]
    for r in rows:
        cid=r['id']; cat=metadata[cid]['categoria_origem']
        path=Path('curriculos_processados/extracted_text_en')/cat/(cid+'.txt')
        text=(BASE.parent/path).read_text(encoding='utf-8-sig').replace('\r\n','\n').replace('\r','\n')
        records.append({'id':cid,'grupo_documental':groups[cid], 'categoria_origem':cat,
            'fonte_texto':path.as_posix(),'sha256_texto_utf8_lf':digest(text),
            'caracteres':len(text),'texto_utilizavel':bool(r['texto'].strip()),
            'representante_principal':cid not in EXCLUIDOS and bool(r['texto'].strip()),
            'sinais_lexicais':sum(bool(re.search(p,r['texto'],re.I)) for p in PADROES),
            'papel':'desenvolvimento_piloto' if cid in old else 'fora_subconjunto'})
    # Um representante por grupo para novos casos; todo grupo já conhecido fica fora do teste.
    candidates={}
    for r in sorted(records,key=lambda r:r['id']):
        if r['representante_principal'] and r['grupo_documental'] not in seen_groups:
            candidates.setdefault(r['grupo_documental'],r)
    test,dev=selecionar(list(candidates.values()))
    for r in records:
        if r['id'] in test:r['papel']='teste_humano_reservado'
        if r['id'] in dev:r['papel']='desenvolvimento_novo_sem_rotulo'
    testgroups={r['grupo_documental'] for r in records if r['id'] in test}
    devgroups={r['grupo_documental'] for r in records if r['id'] in dev|old}
    assert not testgroups & devgroups
    report={'schema':1,'versao':'validacao_ampliada_v1','data':'2026-11-10', 'semente':SEED,
        'status':'selecao_congelada_antes_dos_modelos_rotulos_novos_pendentes',
        'protocolo_amostragem':'Metade por hash dos estratos lexicais 4, 3 e 2; completar 100 testes por hash nos restantes. Desenvolvimento: 201 restantes priorizando sinais, desempate por hash. Sinais não são rótulos. Seleção enriquecida; métricas não estimam a população.',
        'deteccao_semelhantes':'Jaccard de conjuntos de palavras >=0.90 em todas as duplas e três pares conhecidos; componentes conexos indivisíveis. Não garante detectar todas as versões.',
        'fonte_anotacao':'Texto extraído integral conferido contra PDFs. Sem categoria/senioridade como veto.',
        'janela_modelos':{'caracteres':8000,'tokens_bge':512,'tokens_qwen':512},
        'n_por_papel':dict(collections.Counter(r['papel'] for r in records)),
        'n_grupos':len(set(groups.values())), 'pares_semelhantes':pairs,
        'teste':{'responsavel':'autor','rotulos_sugeridos':False,'scores_visiveis':False,'estado':'aguarda_revisao_humana'},
        'registros':records}
    report['sha256_registros']=digest(json.dumps(records,sort_keys=True,ensure_ascii=False,separators=(',',':')))
    gravar_json_atomico(a.saida/'manifesto.json',report)
    print(json.dumps({k:v for k,v in report.items() if k not in ['registros','pares_semelhantes']},ensure_ascii=True))
    print('PARES',json.dumps(pairs))

if __name__=='__main__':main()
