"""Complemento descritivo ROC-AUC, sem alterar o protocolo primário ou as decisões."""
from __future__ import annotations
import argparse,hashlib,json,importlib.metadata
from pathlib import Path
import numpy as np
from avaliar_coorte_97 import conferir_particoes,CLASSES
from protocolo_experimento import gravar_json_atomico
BASE=Path(__file__).resolve().parent

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--escala',type=Path,required=True);p.add_argument('--saida',type=Path,required=True);a=p.parse_args()
 if (a.saida/'protocolo_complemento.json').exists():raise ValueError('Usar nova saída; não sobrescrever histórico')
 read=lambda p:json.loads(p.read_text(encoding='utf-8'))
 dev=read(BASE/'data/desenvolvimento_revisado_v2/manifesto.json');cohort=read(BASE/'data/coorte_97_v1/manifesto.json');train,test=conferir_particoes(dev,cohort)
 original=read(BASE/'output/coorte97_v1/classificacao_coorte97.json')
 protocol={'etapa':'complemento_descritivo_ROC_AUC','n_treino':len(train),'n_avaliacao':len(test),'classes':CLASSES,
  'sha256_desenvolvimento':dev['sha256_registros'],'sha256_coorte':cohort['sha256_registros'],
  'declaracao':'ROC-AUC prevista no texto original e operacionalizada depois de conhecidos os resultados primários. Complemento exploratório; não foi métrica de seleção. Sem mudar modelos, pesos, parâmetros, rótulos ou limiares.',
  'definicao':'ROC-AUC one-vs-rest binária por classe usando predict_proba; macro = média simples das três AUCs; ponderada = média pelos suportes 58/35/4. Ordem I/P/A.',
  'limite':'Referência assistida da IA, cinco ratificações e 92 sem conferência. Apenas quatro Adequados. Não mede calibração nem substitui recall na decisão registrada.',
  'versoes':{m:importlib.metadata.version(m) for m in ['numpy','scikit-learn','xgboost']}}
 gravar_json_atomico(a.saida/'protocolo_complemento.json',protocol)
 from executar_escala_v1 import carregar
 manifest,allrows,texts=carregar(BASE/'data/validacao_ampliada_v1/manifesto.json');idx={r['id']:i for i,r in enumerate(allrows)}
 it=[idx[r['id']] for r in train];iv=[idx[r['id']] for r in test]
 yt=np.array([CLASSES.index(r['rotulo']) for r in train]);yv=np.array([CLASSES.index(r['rotulo_referencia']) for r in test])
 data={'tfidf':([texts[i] for i in it],[texts[i] for i in iv])}
 for method in ['bge','qwen']:
  meta=read(a.escala/(method+'_medicao.json'));path=a.escala/(method+'.npy')
  if meta['ids_ordem_vetores']!=[r['id'] for r in allrows] or hashlib.sha256(path.read_bytes()).hexdigest()!=meta['sha256_vetores'] or meta['sha256_manifesto_registros']!=manifest['sha256_registros']:raise ValueError('Cache divergente')
  vectors=np.load(path,allow_pickle=False);data[method]=(vectors[it],vectors[iv])
 from sklearn.linear_model import LogisticRegression
 from sklearn.svm import SVC
 from sklearn.pipeline import make_pipeline
 from sklearn.feature_extraction.text import TfidfVectorizer
 from sklearn.utils.class_weight import compute_sample_weight
 from sklearn.metrics import roc_auc_score
 from xgboost import XGBClassifier
 factories={'lr':lambda:LogisticRegression(max_iter=2000,random_state=42),'svm':lambda:SVC(kernel='linear',probability=True,random_state=42),'xgb':lambda:XGBClassifier(n_estimators=50,max_depth=3,learning_rate=.1,random_state=42,eval_metric='mlogloss',n_jobs=6)}
 results=[];probabilities={};supports=np.bincount(yv,minlength=3)
 for condition in original['protocolo']['condicoes']:
  for method,(xt,xv) in data.items():
   for name,factory in factories.items():
    clf=factory()
    if method=='tfidf':clf=make_pipeline(TfidfVectorizer(ngram_range=(1,2),min_df=1,max_df=1.,lowercase=True),clf)
    kwargs={}
    if condition=='pesos_balanceados':kwargs[clf.steps[-1][0]+'__sample_weight' if method=='tfidf' else 'sample_weight']=compute_sample_weight('balanced',yt)
    clf.fit(xt,yt,**kwargs);pred=clf.predict(xv);key=f'{condition}_{method}_{name}'
    previous=read(BASE/('output/coorte97_v1/predicoes_'+key+'.json'))
    if [r['predito'] for r in previous]!=[CLASSES[int(v)] for v in pred]:raise ValueError('Predições divergem: '+key)
    probs=clf.predict_proba(xv)
    if not np.array_equal(clf.classes_,np.arange(3)) or not np.isfinite(probs).all() or not np.allclose(probs.sum(1),1):raise ValueError('Probabilidades inválidas')
    aucs=[float(roc_auc_score((yv==j).astype(int),probs[:,j])) for j in range(3)]
    results.append({'condicao':condition,'representacao':method,'classificador':name,'auc_ovr_por_classe':dict(zip(CLASSES,aucs)),'auc_ovr_macro':float(np.mean(aucs)),'auc_ovr_ponderada':float(np.average(aucs,weights=supports))})
    probabilities[key]=[{'id':r['id'],'probabilidades_I_P_A':v.tolist()} for r,v in zip(test,probs)]
    print(key,'AUCmacro',round(np.mean(aucs),4),'predições reproduzidas',flush=True)
 gravar_json_atomico(a.saida/'roc_auc_coorte97.json',{'protocolo':protocol,'resultados':results})
 gravar_json_atomico(a.saida/'probabilidades_coorte97.json',probabilities)

if __name__=='__main__':main()
