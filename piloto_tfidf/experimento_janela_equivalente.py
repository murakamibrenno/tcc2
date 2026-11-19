"""Análise complementar pós-avaliação: mesmo prefixo textual em TF-IDF, BGE e Qwen.

Não modifica a referência, os parâmetros ou os resultados originais. Use uma saída nova.
Etapas retomáveis: preparar, representar --metodo ..., avaliar, resumir.
"""
from __future__ import annotations
import argparse, collections, csv, hashlib, importlib.metadata, json, os, platform, time
from pathlib import Path
import numpy as np
from protocolo_experimento import gravar_json_atomico, BGE_QUERY_PREFIX

BASE = Path(__file__).resolve().parent
CLASSES = ['Inadequado', 'Parcialmente Adequado', 'Adequado']
PINS = {
    'bge': ('BAAI/bge-large-en-v1.5', 'd4aa6901d3a41ba39fb536a557fa166f842b0e09'),
    'qwen': ('Qwen/Qwen2.5-0.5B', '060db6499f32faf8b98477b0a26969ef7d8b9987'),
}
def read(path): return json.loads(Path(path).read_text(encoding='utf-8'))
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def textsha(text): return hashlib.sha256(text.encode('utf-8')).hexdigest()
def model_path(method):
    name, revision = PINS[method]
    path = BASE.parent/'.huggingface/hub'/('models--'+name.replace('/', '--'))/'snapshots'/revision
    return str(path) if path.exists() else name

def prefixo_comum(text, tokenizers, limit=512):
    """Usa offsets de caracteres e verifica novamente, sem presumir monotonicidade BPE.

    O corte inicial é o menor fim acessível nas duas tokenizações. Se retokenizar o
    prefixo ultrapassar o limite, recua por caracteres até ambas caberem. Não busca
    melhorar o corte por rótulos. O resultado é um prefixo seguro, não necessariamente
    o maior prefixo matematicamente possível sob tokenizações não monotônicas.
    """
    if not text.strip() or limit < 1 or not tokenizers: raise ValueError('Entrada ou limite inválido')
    ends=[]
    for tok in tokenizers.values():
        encoded=tok(text, add_special_tokens=True, truncation=True, max_length=limit, return_offsets_mapping=True)
        ends.append(max((end for start,end in encoded['offset_mapping']), default=0))
    end=min(len(text), *ends)
    while end:
        prefix=text[:end].rstrip()
        counts={name:len(tok(prefix, add_special_tokens=True, truncation=False)['input_ids']) for name,tok in tokenizers.items()}
        if prefix and max(counts.values())<=limit:return prefix, counts
        end-=1
    raise ValueError('Não foi possível obter prefixo não vazio')

def fontes_originais():
    files=list((BASE/'output/coorte97_v1').glob('*'))
    files += [BASE/'data/desenvolvimento_revisado_v2/manifesto.json', BASE/'data/coorte_97_v1/manifesto.json', BASE/'data/validacao_ampliada_v1/manifesto.json', BASE/'data/vaga_referencia.txt', BASE.parent/'aplicacao_mockup/src/data/experimentoAtual.json']
    return {str(p.relative_to(BASE.parent)).replace('\\','/'):sha(p) for p in files if p.is_file()}

def conferir_fontes(out):
    protocol=read(out/'protocolo_pre_execucao.json')
    if fontes_originais()!=protocol['hashes_originais']:raise ValueError('Alguma fonte original foi alterada')
    if sha(Path(__file__))!=protocol['sha256_script']:raise ValueError('Script mudou depois do protocolo')
    return protocol

def preparar(out):
    from transformers import AutoTokenizer
    from executar_escala_v1 import carregar
    from avaliar_coorte_97 import conferir_particoes
    if out.exists() and any(out.iterdir()):raise ValueError('Use uma saída nova; não sobrescrever execução anterior')
    train,test=conferir_particoes(read(BASE/'data/desenvolvimento_revisado_v2/manifesto.json'),read(BASE/'data/coorte_97_v1/manifesto.json'))
    # O protocolo é escrito antes de tokenização, vetorização ou consulta de métricas novas.
    protocol={'schema':1,'data':'2026-11-19','natureza':'Análise complementar exploratória pós-avaliação; os mesmos 97 já foram examinados, não é teste independente novo.',
        'hipotese':'Investigar quanto o acesso desigual ao conteúdo acompanha as diferenças entre as três implementações.',
        'regra_corte':'Primeiros até 8.000 caracteres; menor fim de offset entre duas tokenizações truncadas a 512; recuar por caracteres se a retokenização exceder 512; remover apenas espaços finais. Um único texto compartilhado pelos três métodos.',
        'limite_tokens':512,'mesmos_ids':2483,'n_treino':len(train),'n_avaliacao':len(test),
        'modelos':{k:{'modelo':v[0],'revision':v[1]} for k,v in PINS.items()},
        'consulta':'Mesmo texto de vaga. Prefixo de instrução BGE original preservado; a consulta inteira deve caber, sem truncamento.',
        'parametros':'Mesmos 18 ajustes: LR max_iter=2000; SVC linear probability=True; XGB 50 árvores profundidade3 taxa0.1 n_jobs6; seed42; original e sample_weight n/(3*n_classe), somente treino. Sem busca de hiperparâmetros.',
        'avaliacao':'F1 macro primário; precisão/recall por classe; matrizes e predições por ID. AP, NDCG, P@5 e P@10 restritos aos mesmos 97; empates por ID. Não transformar não julgados em negativos.',
        'top5_completo':'Não transferir P@5 humano do ranking antigo para o novo. Só calcular se todos os cinco IDs estiverem entre os 12 julgados; caso contrário, informar cobertura e P@5 nulo.',
        'custos':'TF-IDF mediana de 3 ajustes CPU; densos 1 passagem GPU após aquecimento; consulta+escores mediana de 10 após descartar primeira. Sem carga/download, ordenação ou exportação. Descrição local, não benchmark normalizado nem teste causal.',
        'limites':'A referência assistida original, quatro Adequados, uma vaga e a ausência de referência humana independente permanecem. Conteúdo equivalente não iguala pré-treinamento, tokenizer, pooling ou dispositivo. A condição encurta o TF-IDF e pode encurtar também os densos; não é leitura integral nem demonstra causa isolada.',
        'hashes_originais':fontes_originais(),'sha256_script':sha(Path(__file__)),
        'versoes':{k:importlib.metadata.version(k) for k in ['numpy','scikit-learn','xgboost','torch','transformers','sentence-transformers']},'plataforma':platform.platform()}
    gravar_json_atomico(out/'protocolo_pre_execucao.json',protocol)
    tokenizers={k:AutoTokenizer.from_pretrained(model_path(k),revision=v[1],local_files_only=True,use_fast=True) for k,v in PINS.items()}
    manifest,records,texts=carregar(BASE/'data/validacao_ampliada_v1/manifesto.json')
    common=[];rows=[]
    for r,text in zip(records,texts):
        prefix,counts=prefixo_comum(text,tokenizers)
        common.append(prefix);rows.append({'id':r['id'],'sha256_texto_original':r['sha256_texto_utf8_lf'],'sha256_prefixo':textsha(prefix),'caracteres_entrada_original':len(text),'caracteres_prefixo':len(prefix),'tokens_com_especiais':counts,'prefixo_reduzido':len(prefix)<len(text)})
    query=(BASE/'data/vaga_referencia.txt').read_text(encoding='utf8').strip()[:8000]
    query_counts={k:len(tok((BGE_QUERY_PREFIX if k=='bge' else '')+query,add_special_tokens=True)['input_ids']) for k,tok in tokenizers.items()}
    if max(query_counts.values())>512:raise ValueError('Consulta não cabe inteira; protocolo não autoriza corte da vaga')
    gravar_json_atomico(out/'cache/textos_comuns.json',{'ids':[r['id'] for r in records],'textos':common,'consulta':query})
    gravar_json_atomico(out/'manifesto_prefixos.json',{'n':len(rows),'registros':rows,'tokens_consulta':query_counts,'sha256_textos_cache':sha(out/'cache/textos_comuns.json'),'estatisticas':{'caracteres_prefixo':{k:float(f([r['caracteres_prefixo'] for r in rows])) for k,f in [('min',np.min),('mediana',np.median),('max',np.max)]},'n_reduzidos':sum(r['prefixo_reduzido'] for r in rows)}})
    print('PREPARADO',len(rows),'prefixos; consulta',query_counts,flush=True)

def representar(out,method):
    import torch
    from executar_escala_v1 import Medicao
    protocol=conferir_fontes(out)
    target=out/(method+'_medicao.json')
    if target.exists():raise ValueError('Método já concluído; não sobrescrever')
    manifest=read(out/'manifesto_prefixos.json');cache=read(out/'cache/textos_comuns.json')
    if sha(out/'cache/textos_comuns.json')!=manifest['sha256_textos_cache']:raise ValueError('Prefixos alterados')
    texts=cache['textos'];query=cache['consulta'];torch.manual_seed(42);torch.set_num_threads(6)
    report={'metodo':method,'n':len(texts),'sha256_prefixos':sha(out/'manifesto_prefixos.json'),'ids_ordem':cache['ids'],'custo_exclui':'tokenização/corte compartilhado, carga/download, ordenação e exportação'}
    device='cpu'
    if method=='tfidf':
        from sklearn.feature_extraction.text import TfidfVectorizer
        from scipy.sparse import save_npz
        measures=[]
        for _ in range(3):
            with Medicao() as m:
                vectorizer=TfidfVectorizer(ngram_range=(1,2),lowercase=True,min_df=1,max_df=1.)
                vectors=vectorizer.fit_transform(texts)
            measures.append(m.result())
        report['vetorizacao_repeticoes']=measures
        report['vetorizacao_segundos']=float(np.median([x['segundos'] for x in measures]))
        def score():return (vectors@vectorizer.transform([query]).T).toarray().ravel()
        save_npz(out/'cache/tfidf.npz',vectors);vectorpath=out/'cache/tfidf.npz'
    else:
        device='cuda' if torch.cuda.is_available() else 'cpu'
        start=time.perf_counter()
        if method=='bge':
            from sentence_transformers import SentenceTransformer
            model=SentenceTransformer(model_path(method),device=device,local_files_only=True)
            model.max_seq_length=512
            if model.default_prompt_name is not None:raise ValueError('Prompt padrão inesperado')
            for i in range(0,len(texts),64):
                observed=model.tokenize(texts[i:i+64])['attention_mask'].sum(1).tolist()
                expected=[r['tokens_com_especiais']['bge'] for r in manifest['registros'][i:i+64]]
                if observed!=expected:raise ValueError('Tokenização BGE não reproduziu o prefixo conferido')
            def encode(ts):return model.encode(ts,batch_size=4,normalize_embeddings=True,show_progress_bar=False,convert_to_numpy=True)
            qtext=BGE_QUERY_PREFIX+query
        else:
            from transformers import AutoModel,AutoTokenizer
            tokenizer=AutoTokenizer.from_pretrained(model_path(method),local_files_only=True)
            if tokenizer.pad_token is None:tokenizer.pad_token=tokenizer.eos_token
            model=AutoModel.from_pretrained(model_path(method),local_files_only=True,dtype=torch.float32).to(device).eval()
            def encode(ts):
                blocks=[]
                with torch.inference_mode():
                    for i in range(0,len(ts),4):
                        batch=tokenizer(ts[i:i+4],padding=True,truncation=False,return_tensors='pt').to(device)
                        if batch['input_ids'].shape[1]>512:raise ValueError('Conteúdo ultrapassou janela')
                        h=model(**batch).last_hidden_state;mask=batch['attention_mask'].unsqueeze(-1).float()
                        z=(h*mask).sum(1)/mask.sum(1).clamp(min=1)
                        blocks.append(torch.nn.functional.normalize(z,p=2,dim=1).cpu().numpy().astype(np.float32))
                return np.vstack(blocks)
            qtext=query
        if device=='cuda':torch.cuda.synchronize()
        report['carregamento_s']=time.perf_counter()-start
        encode([texts[0]])
        if device=='cuda':torch.cuda.synchronize();torch.cuda.reset_peak_memory_stats()
        with Medicao() as m:
            vectors=encode(texts)
            if device=='cuda':torch.cuda.synchronize()
        report['vetorizacao_repeticoes']=[m.result()];report['vetorizacao_segundos']=m.seconds
        if device=='cuda':report['pico_gpu_alocado_bytes']=torch.cuda.max_memory_allocated()
        def score():
            values=(vectors@encode([qtext])[0]).ravel()
            if device=='cuda':torch.cuda.synchronize()
            return values
        vectorpath=out/('cache/'+method+'.npy');np.save(vectorpath,vectors)
    times=[]
    for _ in range(11):
        start=time.perf_counter();scores=score();times.append(time.perf_counter()-start)
    if not np.isfinite(scores).all():raise ValueError('Escores não finitos')
    report.update(device=device,dimensoes=list(vectors.shape),sha256_vetores=sha(vectorpath),consulta_escores_mediana_s=float(np.median(times[1:])),consulta_repeticoes_s=times[1:])
    order=np.lexsort((np.asarray(cache['ids']),-scores))
    with (out/('ranking_'+method+'.csv')).open('w',encoding='utf8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=['posicao','id','score']);writer.writeheader()
        for pos,i in enumerate(order,1):writer.writerow({'posicao':pos,'id':cache['ids'][i],'score':float(scores[i])})
    gravar_json_atomico(target,report)
    print('REPRESENTADO',method,report['dimensoes'],round(report['vetorizacao_segundos'],3),'s',flush=True)

def avaliar(out):
    from avaliar_coorte_97 import conferir_particoes,metricas_ranking
    from sklearn.linear_model import LogisticRegression
    from sklearn.svm import SVC
    from xgboost import XGBClassifier
    from sklearn.pipeline import make_pipeline
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.utils.class_weight import compute_sample_weight
    from sklearn.metrics import accuracy_score,classification_report,confusion_matrix,f1_score
    conferir_fontes(out)
    if (out/'classificacao.json').exists():raise ValueError('Avaliação já concluída')
    train,test=conferir_particoes(read(BASE/'data/desenvolvimento_revisado_v2/manifesto.json'),read(BASE/'data/coorte_97_v1/manifesto.json'))
    cache=read(out/'cache/textos_comuns.json');indices={cid:i for i,cid in enumerate(cache['ids'])}
    tr=[indices[r['id']] for r in train];te=[indices[r['id']] for r in test]
    yt=np.array([CLASSES.index(r['rotulo']) for r in train]);yv=np.array([CLASSES.index(r['rotulo_referencia']) for r in test])
    results=[];rankings=[]
    factories={'lr':lambda:LogisticRegression(max_iter=2000,random_state=42),'svm':lambda:SVC(kernel='linear',probability=True,random_state=42),'xgb':lambda:XGBClassifier(n_estimators=50,max_depth=3,learning_rate=.1,random_state=42,eval_metric='mlogloss',n_jobs=6)}
    for method in ['tfidf','bge','qwen']:
        meta=read(out/(method+'_medicao.json'))
        if meta['ids_ordem']!=cache['ids']:raise ValueError('Ordem de vetores inválida')
        if method=='tfidf':xt=[cache['textos'][i] for i in tr];xv=[cache['textos'][i] for i in te]
        else:
            path=out/('cache/'+method+'.npy')
            if sha(path)!=meta['sha256_vetores']:raise ValueError('Cache vetorial alterado')
            vectors=np.load(path,allow_pickle=False);xt=vectors[tr];xv=vectors[te]
        for condition in ['original','pesos_balanceados']:
            for name,factory in factories.items():
                model=factory()
                if method=='tfidf':model=make_pipeline(TfidfVectorizer(ngram_range=(1,2),min_df=1,max_df=1.,lowercase=True),model)
                params={}
                if condition=='pesos_balanceados':params[(model.steps[-1][0]+'__sample_weight') if method=='tfidf' else 'sample_weight']=compute_sample_weight('balanced',yt)
                start=time.perf_counter();model.fit(xt,yt,**params);fit=time.perf_counter()-start
                start=time.perf_counter();pred=model.predict(xv);infer=time.perf_counter()-start
                row={'condicao':condition,'representacao':method,'classificador':name,'accuracy_concordancia':accuracy_score(yv,pred),'f1_macro':f1_score(yv,pred,labels=[0,1,2],average='macro',zero_division=0),'por_classe':classification_report(yv,pred,labels=[0,1,2],target_names=CLASSES,zero_division=0,output_dict=True),'matriz_confusao':confusion_matrix(yv,pred,labels=[0,1,2]).tolist(),'fit_s':fit,'inferencia_s':infer}
                results.append(row)
                gravar_json_atomico(out/('predicoes_'+condition+'_'+method+'_'+name+'.json'),[{'id':r['id'],'referencia_original':CLASSES[int(y)],'predito':CLASSES[int(z)]} for r,y,z in zip(test,yv,pred)])
                print('AVALIADO',method,condition,name,'F1',round(row['f1_macro'],4),'RecallA',row['por_classe']['Adequado']['recall'],flush=True)
        with (out/('ranking_'+method+'.csv')).open(encoding='utf8',newline='') as f:raw=list(csv.DictReader(f))
        scores={r['id']:float(r['score']) for r in raw}
        metric,order=metricas_ranking([r['id'] for r in test],[scores[r['id']] for r in test],yv)
        rankings.append({'representacao':method,**metric,'ids_ordem97':[test[int(i)]['id'] for i in order]})
    gravar_json_atomico(out/'classificacao.json',{'n_treino':len(train),'n_avaliacao':len(test),'resultados':results})
    gravar_json_atomico(out/'ranking97.json',{'n':97,'representacoes':rankings})

def resumir(out):
    protocol=conferir_fontes(out);new=read(out/'classificacao.json');old=read(BASE/'output/coorte97_v1/classificacao_coorte97.json')
    key=lambda r:(r['condicao'],r['representacao'],r['classificador'])
    before={key(r):r for r in old['resultados']};comparison=[]
    for r in new['resultados']:
        prev=before[key(r)]
        comparison.append({k:r[k] for k in ['condicao','representacao','classificador']}|{'f1_original':prev['f1_macro'],'f1_equivalente':r['f1_macro'],'delta_f1':r['f1_macro']-prev['f1_macro'],'recall_A_original':prev['por_classe']['Adequado']['recall'],'recall_A_equivalente':r['por_classe']['Adequado']['recall']})
    oldrank={r['representacao']:r for r in read(BASE/'output/coorte97_v1/ranking_coorte97.json')['representacoes']}
    ranks=[]
    human=read(BASE/'validation/conferencia_top5_autor_v1.json');labels={r['id']:r['rotulo_final'] for r in human['casos']}
    for r in read(out/'ranking97.json')['representacoes']:
        method=r['representacao'];prev=oldrank[method]
        with (out/('ranking_'+method+'.csv')).open(encoding='utf8',newline='') as f:top=list(csv.DictReader(f))[:5]
        topids=[x['id'] for x in top];covered=sum(cid in labels for cid in topids)
        ranks.append({'representacao':method,'original':{k:prev[k] for k in ['AP_adequado','NDCG_graduado','P@5','P@10']},'equivalente':{k:r[k] for k in ['AP_adequado','NDCG_graduado','P@5','P@10']},'top5_completo':{'ids':topids,'n_com_revisao_posterior_disponivel':covered,'P@5':sum(labels.get(cid)=='Adequado' for cid in topids)/5 if covered==5 else None,'nota':'P@5 nulo quando falta julgamento de algum documento; não julgados não são negativos. Referências dos 12 incluem revisão do autor e adjudicação assistida.'}})
    summary={'protocolo':protocol,'prefixos':read(out/'manifesto_prefixos.json')['estatisticas'],'classificacao_comparada':comparison,'ranking_comparado':ranks,'custos':[{'metodo':m,**{k:read(out/(m+'_medicao.json'))[k] for k in ['device','dimensoes','vetorizacao_segundos','consulta_escores_mediana_s']}} for m in ['tfidf','bge','qwen']],'fontes_originais_preservadas':True}
    gravar_json_atomico(out/'comparacao_original_equivalente.json',summary)
    print(json.dumps({k:v for k,v in summary.items() if k!='protocolo'},ensure_ascii=True),flush=True)

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--etapa',choices=['preparar','representar','avaliar','resumir'],required=True);p.add_argument('--saida',type=Path,required=True);p.add_argument('--metodo',choices=['tfidf','bge','qwen']);a=p.parse_args()
    if a.etapa=='representar':
        if a.metodo is None:p.error('--metodo obrigatório')
        representar(a.saida,a.metodo)
    else:globals()[a.etapa](a.saida)
if __name__=='__main__':main()
