"""CV exploratória no piloto revisado. Não lê respostas do teste humano."""
import argparse, collections, csv, hashlib, json, time
from pathlib import Path
import numpy as np
from sklearn.base import clone
from sklearn.dummy import DummyClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score,classification_report,confusion_matrix,f1_score
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.pipeline import make_pipeline
from sklearn.svm import SVC
from xgboost import XGBClassifier
from executar_escala_v1 import carregar
from protocolo_experimento import gravar_json_atomico

BASE=Path(__file__).resolve().parent
CLASSES=['Inadequado','Parcialmente Adequado','Adequado']

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--escala',type=Path,required=True);p.add_argument('--saida',type=Path,required=True);a=p.parse_args()
    manifest,records,texts=carregar(BASE/'data/validacao_ampliada_v1/manifesto.json')
    pilot=json.loads((BASE/'data/revisao_piloto_v1/manifesto.json').read_text(encoding='utf-8'))
    rows=[r for r in pilot['registros'] if r['incluir']];indices={r['id']:i for i,r in enumerate(records)}
    ix=[indices[r['id']] for r in rows];y=np.array([CLASSES.index(r['rotulo_revisado']) for r in rows]);groups=np.array([records[i]['grupo_documental'] for i in ix]);ts=[texts[i] for i in ix]
    # Congela folds antes de ajustar qualquer classificador. Nenhum teste final é consumido.
    folds=list(StratifiedGroupKFold(3,shuffle=True,random_state=42).split(ts,y,groups))
    for train,val in folds:
        assert not set(groups[train])&set(groups[val])
        assert set(y[train])=={0,1,2}
    fold_ids=[{'treino':[rows[i]['id'] for i in tr],'validacao':[rows[i]['id'] for i in va]} for tr,va in folds]
    gravar_json_atomico(a.saida/'folds_desenvolvimento.json',fold_ids)
    representations={'tfidf':ts}
    for method in ['bge','qwen']:
        meta=json.loads((a.escala/(method+'_medicao.json')).read_text(encoding='utf-8'))
        assert meta['ids_ordem_vetores']==[r['id'] for r in records]
        path=a.escala/(method+'.npy');assert hashlib.sha256(path.read_bytes()).hexdigest()==meta['sha256_vetores']
        representations[method]=np.load(path,allow_pickle=False)[ix]
    models={'lr':LogisticRegression(max_iter=2000,random_state=42),'svm':SVC(kernel='linear',probability=True,random_state=42),'xgb':XGBClassifier(n_estimators=50,max_depth=3,learning_rate=.1,random_state=42,eval_metric='mlogloss',n_jobs=6)}
    results=[]
    for rep,X in representations.items():
        for name,model in models.items():
            predictions=np.full(len(y),-1);times=[]
            for train,val in folds:
                clf=clone(model)
                if rep=='tfidf':clf=make_pipeline(TfidfVectorizer(ngram_range=(1,2),min_df=1,max_df=1.0,lowercase=True),clf)
                xt=[X[i] for i in train] if rep=='tfidf' else X[train];xv=[X[i] for i in val] if rep=='tfidf' else X[val]
                start=time.perf_counter();clf.fit(xt,y[train]);predictions[val]=clf.predict(xv);times.append(time.perf_counter()-start)
            result={'representacao':rep,'classificador':name,'accuracy':accuracy_score(y,predictions),'f1_macro':f1_score(y,predictions,labels=[0,1,2],average='macro',zero_division=0),'por_classe':classification_report(y,predictions,labels=[0,1,2],target_names=CLASSES,zero_division=0,output_dict=True),'matriz_confusao':confusion_matrix(y,predictions,labels=[0,1,2]).tolist(),'tempos_fit_predict_folds_s':times}
            results.append(result);print(rep,name,'F1macro',result['f1_macro'],flush=True)
    dummy=np.full(len(y),-1)
    for tr,va in folds:
        d=DummyClassifier(strategy='most_frequent').fit(np.zeros((len(tr),1)),y[tr]);dummy[va]=d.predict(np.zeros((len(va),1)))
    report={'status':'exploratorio_desenvolvimento_proveniencia_mista','n':len(rows),'distribuicao':dict(collections.Counter(r['rotulo_revisado'] for r in rows)), 'anotacao':'60 casos ratificados individualmente, 40 por IA autorizada no piloto original; 99 retidos. Não são 99 rótulos humanos independentes.', 'protocolo':'3 folds estratificados por grupos, seed42; parâmetros fixos, TF-IDF ajustado dentro de cada treino; sem escolha de hiperparâmetros. Classe Adequado tem apenas3 casos.', 'teste_humano_consumido':False,'baseline':{'accuracy':accuracy_score(y,dummy),'f1_macro':f1_score(y,dummy,labels=[0,1,2],average='macro',zero_division=0)},'combinacoes':results}
    gravar_json_atomico(a.saida/'classificacao_desenvolvimento.json',report)

if __name__=='__main__':main()
