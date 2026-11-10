"""Avaliação exploratória de configurações fixadas no desenvolvimento; nunca ajusta ao teste."""
from __future__ import annotations
import argparse,collections,csv,hashlib,importlib.metadata,json,platform,time
from pathlib import Path
import numpy as np
from consolidar_coorte_97 import digest
from protocolo_experimento import gravar_json_atomico

BASE=Path(__file__).resolve().parent
CLASSES=['Inadequado','Parcialmente Adequado','Adequado']

def conferir_particoes(dev,cohort):
    if digest(dev['registros'])!=dev['sha256_registros'] or digest(cohort['registros'])!=cohort['sha256_registros']:raise ValueError('Referência modificada depois do congelamento')
    train=[r for r in dev['registros'] if r['incluir']];test=cohort['registros']
    if {r['id'] for r in train}&{r['id'] for r in test}:raise ValueError('ID de teste no treino')
    def grupo(r):return 'grupo_historico_nexio_28762662' if r['id']=='28762662' else r['grupo_documental']
    if {grupo(r) for r in train}&{grupo(r) for r in test}:raise ValueError('Histórico compartilhado atravessa partições')
    if any(r['referencia_humana_independente'] for r in test):raise ValueError('A referência não é humana independente')
    if sum(r['conferencia_autor']=='ratificacao_assistida' for r in test)!=5:raise ValueError('Apenas cinco ratificações assistidas foram autorizadas')
    return train,test

def metricas_ranking(ids,scores,relevancias):
    """Ordenação por score decrescente e ID crescente; AP binária, NDCG graduada."""
    if len(ids)!=len(set(ids)) or not (len(ids)==len(scores)==len(relevancias)):raise ValueError('Ranking com IDs repetidos ou comprimentos incompatíveis')
    scores=np.asarray(scores,dtype=float);rel=np.asarray(relevancias,dtype=int)
    if not np.isfinite(scores).all() or not np.isin(rel,[0,1,2]).all():raise ValueError('Scores ou relevâncias inválidos')
    order=np.lexsort((np.asarray(ids),-scores));ranked=rel[order];binary=(ranked==2).astype(int);npos=int(binary.sum())
    ap=float(np.sum(np.cumsum(binary)/np.arange(1,len(ids)+1)*binary)/npos) if npos else None
    discount=1/np.log2(np.arange(len(ids))+2);ideal=np.sort(rel)[::-1]
    denom=float(np.sum((2**ideal-1)*discount));ndcg=float(np.sum((2**ranked-1)*discount)/denom) if denom else None
    result={'n_julgados':len(ids),'n_adequados_relevancia_binaria':npos,'AP_adequado':ap,'NDCG_graduado':ndcg}
    for k in [5,10]:
        effective=min(k,len(ids));result['P@'+str(k)]=float(binary[:effective].sum()/effective) if effective else None
    return result,order

def main():
    from executar_escala_v1 import carregar
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--escala',type=Path,required=True);p.add_argument('--saida',type=Path,required=True);a=p.parse_args()
    if (a.saida/'protocolo_pre_execucao.json').exists():raise ValueError('Execução já iniciada; use nova saída, sem sobrescrever histórico')
    read=lambda p:json.loads(p.read_text(encoding='utf-8'))
    dev=read(BASE/'data/desenvolvimento_revisado_v2/manifesto.json');cohort=read(BASE/'data/coorte_97_v1/manifesto.json');train,test=conferir_particoes(dev,cohort)
    oldprotocol=read(BASE/'output/desenvolvimento_v2/protocolo_antes_dos_ajustes.json')
    if oldprotocol['sha256_rotulos']!=dev['sha256_registros']:raise ValueError('Protocolo anterior se refere a outro desenvolvimento')
    protocol={'schema':1,'etapa':'avaliacao_exploratoria_coorte97_v1','sha256_desenvolvimento':dev['sha256_registros'],'sha256_coorte':cohort['sha256_registros'],
        'sha256_auditoria':cohort['sha256_auditoria'],'n_treino':len(train),'n_avaliacao':len(test),'condicoes':oldprotocol['condicoes'],
        'parametros_fixados_no_desenvolvimento':oldprotocol['hiperparametros'], 'semente':42,
        'treino':'Ajustar cada classificador em todos os 294 casos do desenvolvimento; sem busca de hiperparâmetros ou seleção pelo resultado dos 97.',
        'pesos':'n_treino/(3*n_classe_treino), somente na condição separada pesos_balanceados; sem usar frequências da coorte.',
        'tfidf_classificacao':'Ajustado somente nos 294 textos de treino, depois transformados os 97.',
        'metrica_primaria':'F1 macro nas três classes; precisão, recall, F1 e suporte por classe, matriz de confusão e referência majoritária.',
        'ranking':'Avaliar somente os 97 julgados usando scores de recuperação já calculados. AP/P@k: apenas Adequado relevante. NDCG: Adequado2, Parcial1, Inadequado0, ganho2^rel-1. Empates por ID crescente. Uma vaga, reportar AP, não MAP.',
        'limite_ranking':'Escores TF-IDF de recuperação ajustados na coleção utilizável inteira sem rótulos; experimento distinto da classificação com TF-IDF ajustado no treino. Métricas restritas ao conjunto julgado, não à coleção de 2483.',
        'proveniencia':{'IA_com_ratificacao_assistida':5,'IA_sem_conferencia':92,'humana_independente':0},
        'n_excluidos_relacao_documental':3,'n_adequados':4,'limite':cohort['limitacao'],
        'versoes':{m:importlib.metadata.version(m) for m in ['numpy','scikit-learn','xgboost']},'plataforma':platform.platform()}
    gravar_json_atomico(a.saida/'protocolo_pre_execucao.json',protocol)
    manifest,allrows,alltexts=carregar(BASE/'data/validacao_ampliada_v1/manifesto.json');indices={r['id']:i for i,r in enumerate(allrows)}
    itrain=[indices[r['id']] for r in train];itest=[indices[r['id']] for r in test]
    ytrain=np.array([CLASSES.index(r['rotulo']) for r in train]);ytest=np.array([CLASSES.index(r['rotulo_referencia']) for r in test])
    texts_train=[alltexts[i] for i in itrain];texts_test=[alltexts[i] for i in itest]
    data={'tfidf':(texts_train,texts_test)}
    for method in ['bge','qwen']:
        meta=read(a.escala/(method+'_medicao.json'));path=a.escala/(method+'.npy')
        if meta['ids_ordem_vetores']!=[r['id'] for r in allrows] or hashlib.sha256(path.read_bytes()).hexdigest()!=meta['sha256_vetores']:raise ValueError('Vetores fora de ordem ou modificados')
        if meta['sha256_manifesto_registros']!=manifest['sha256_registros']:raise ValueError('Vetores de outra seleção')
        vectors=np.load(path,allow_pickle=False);data[method]=(vectors[itrain],vectors[itest])
    from sklearn.linear_model import LogisticRegression
    from sklearn.svm import SVC
    from xgboost import XGBClassifier
    from sklearn.pipeline import make_pipeline
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.utils.class_weight import compute_sample_weight
    from sklearn.metrics import accuracy_score,classification_report,confusion_matrix,f1_score
    from sklearn.dummy import DummyClassifier
    factories={'lr':lambda:LogisticRegression(max_iter=2000,random_state=42),'svm':lambda:SVC(kernel='linear',probability=True,random_state=42),'xgb':lambda:XGBClassifier(n_estimators=50,max_depth=3,learning_rate=.1,random_state=42,eval_metric='mlogloss',n_jobs=6)}
    def metrics(pred):return {'accuracy_concordancia':accuracy_score(ytest,pred),'f1_macro':f1_score(ytest,pred,labels=[0,1,2],average='macro',zero_division=0),'por_classe':classification_report(ytest,pred,labels=[0,1,2],target_names=CLASSES,zero_division=0,output_dict=True),'matriz_confusao':confusion_matrix(ytest,pred,labels=[0,1,2]).tolist(),'ordem_classes':CLASSES,'contagem_predicoes':dict(collections.Counter(CLASSES[int(x)] for x in pred))}
    results=[]
    for condition in protocol['condicoes']:
      for method,(xt,xv) in data.items():
        for name,factory in factories.items():
            clf=factory()
            if method=='tfidf':clf=make_pipeline(TfidfVectorizer(ngram_range=(1,2),min_df=1,max_df=1.0,lowercase=True),clf)
            params={}
            if condition=='pesos_balanceados':params[clf.steps[-1][0]+'__sample_weight' if method=='tfidf' else 'sample_weight']=compute_sample_weight('balanced',ytrain)
            start=time.perf_counter();clf.fit(xt,ytrain,**params);fit_seconds=time.perf_counter()-start
            start=time.perf_counter();pred=clf.predict(xv);predict_seconds=time.perf_counter()-start
            result={'condicao':condition,'representacao':method,'classificador':name,**metrics(pred),'fit_s_uma_passagem':fit_seconds,'inferencia_s_uma_passagem':predict_seconds}
            results.append(result)
            gravar_json_atomico(a.saida/('predicoes_'+condition+'_'+method+'_'+name+'.json'),[{'id':r['id'],'rotulo_referencia_assistida':CLASSES[int(y)],'predito':CLASSES[int(z)],'conferencia_autor':r['conferencia_autor']} for r,y,z in zip(test,ytest,pred)])
            print(condition,method,name,'F1macro',round(result['f1_macro'],4),'recall_A',result['por_classe']['Adequado']['recall'],flush=True)
    dummy=DummyClassifier(strategy='most_frequent').fit(np.zeros((len(train),1)),ytrain)
    baseline=metrics(dummy.predict(np.zeros((len(test),1))))
    gravar_json_atomico(a.saida/'classificacao_coorte97.json',{'protocolo':protocol,'n':len(test),'distribuicao':cohort['distribuicao'],'baseline_majoritaria':baseline,'resultados':results,'nota':'Não retunar a partir destes resultados. Trata-se de concordância exploratória com referência de IA e auditoria assistida limitada.'})
    rankings=[]
    for method in ['tfidf','bge','qwen']:
        path=a.escala/('ranking_'+method+'.csv')
        with path.open(encoding='utf-8',newline='') as f:raw=list(csv.DictReader(f))
        if len({r['id'] for r in raw})!=len(allrows) or {r['id'] for r in raw}!={r['id'] for r in allrows}:raise ValueError('Ranking completo incompleto ou repetido')
        scores={r['id']:float(r['score']) for r in raw};positions={r['id']:int(r['posicao']) for r in raw}
        evaluated,order=metricas_ranking([r['id'] for r in test],[scores[r['id']] for r in test],ytest)
        rankings.append({'representacao':method,**evaluated,'sha256_ranking_fonte':hashlib.sha256(path.read_bytes()).hexdigest()})
        with (a.saida/('ranking_julgado97_'+method+'.csv')).open('w',encoding='utf-8',newline='') as f:
            writer=csv.DictWriter(f,fieldnames=['posicao_subconjunto97','id','score','posicao_colecao2483','rotulo_referencia_assistida']);writer.writeheader()
            for pos,j in enumerate(order,1):
                r=test[int(j)];writer.writerow({'posicao_subconjunto97':pos,'id':r['id'],'score':scores[r['id']],'posicao_colecao2483':positions[r['id']],'rotulo_referencia_assistida':r['rotulo_referencia']})
    gravar_json_atomico(a.saida/'ranking_coorte97.json',{'n':len(test),'n_consultas':1,'universo':'Subconjunto de 97 integralmente julgado pela referência assistida, não a coleção inteira.','definicao':protocol['ranking'],'limitacao':cohort['limitacao'],'representacoes':rankings})

if __name__=='__main__':main()
