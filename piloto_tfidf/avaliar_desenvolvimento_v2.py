"""CV exploratória no desenvolvimento ampliado; duas condições fixas, sem consumir teste."""
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
from sklearn.utils.class_weight import compute_sample_weight
from xgboost import XGBClassifier
from executar_escala_v1 import carregar
from protocolo_experimento import gravar_json_atomico

BASE=Path(__file__).resolve().parent
CLASSES=['Inadequado','Parcialmente Adequado','Adequado']

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--escala',type=Path,required=True);p.add_argument('--saida',type=Path,required=True);a=p.parse_args()
    if (a.saida/'classificacao_desenvolvimento_v2.json').exists():raise ValueError('Resultado já existe; use nova saída')
    manifest,records,texts=carregar(BASE/'data/validacao_ampliada_v1/manifesto.json')
    pilot=json.loads((BASE/'data/desenvolvimento_revisado_v2/manifesto.json').read_text(encoding='utf-8'))
    rows=[r for r in pilot['registros'] if r['incluir']];indices={r['id']:i for i,r in enumerate(records)}
    frozen=json.dumps(pilot['registros'],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()
    if hashlib.sha256(frozen).hexdigest()!=pilot['sha256_registros']:raise ValueError('Manifesto de rótulos modificado')
    testgroups={r['grupo_documental'] for r in manifest['registros'] if r['papel']=='teste_humano_reservado'}
    if {r['grupo_documental'] for r in rows}&testgroups:raise ValueError('Grupo de teste encontrado no desenvolvimento')
    ix=[indices[r['id']] for r in rows];y=np.array([CLASSES.index(r['rotulo']) for r in rows]);groups=np.array([records[i]['grupo_documental'] for i in ix]);ts=[texts[i] for i in ix]
    # Congela folds antes de ajustar qualquer classificador. Nenhum teste final é consumido.
    folds=list(StratifiedGroupKFold(3,shuffle=True,random_state=42).split(ts,y,groups))
    for train,val in folds:
        assert not set(groups[train])&set(groups[val])
        assert set(y[train])=={0,1,2}
    fold_ids=[{'treino':[rows[i]['id'] for i in tr],'validacao':[rows[i]['id'] for i in va]} for tr,va in folds]
    gravar_json_atomico(a.saida/'folds_desenvolvimento.json',fold_ids)
    protocol={'sha256_rotulos':pilot['sha256_registros'],'n':len(rows),'semente':42,'n_folds':3,'condicoes':['original','pesos_balanceados'],
        'definicao_pesos':'Peso n_treino/(n_classes*n_classe_treino), calculado somente no treino; mesma fórmula para LR, SVM e XGBoost.',
        'hiperparametros':'LR max_iter2000; SVC linear probabilityTrue; XGB 50 árvores profundidade3 lr0.1. Sem busca de hiperparâmetros.',
        'metrica_primaria':'F1 macro em três classes; recall/F1 e suporte por classe obrigatórios. Comparação exploratória, teste humano não consumido.'}
    gravar_json_atomico(a.saida/'protocolo_antes_dos_ajustes.json',protocol)
    representations={'tfidf':ts}
    for method in ['bge','qwen']:
        meta=json.loads((a.escala/(method+'_medicao.json')).read_text(encoding='utf-8'))
        assert meta['ids_ordem_vetores']==[r['id'] for r in records]
        path=a.escala/(method+'.npy');assert hashlib.sha256(path.read_bytes()).hexdigest()==meta['sha256_vetores']
        representations[method]=np.load(path,allow_pickle=False)[ix]
    models={'lr':LogisticRegression(max_iter=2000,random_state=42),'svm':SVC(kernel='linear',probability=True,random_state=42),'xgb':XGBClassifier(n_estimators=50,max_depth=3,learning_rate=.1,random_state=42,eval_metric='mlogloss',n_jobs=6)}
    results=[]
    for condition in protocol['condicoes']:
      for rep,X in representations.items():
        for name,model in models.items():
            predictions=np.full(len(y),-1);times=[]
            for train,val in folds:
                clf=clone(model)
                if rep=='tfidf':clf=make_pipeline(TfidfVectorizer(ngram_range=(1,2),min_df=1,max_df=1.0,lowercase=True),clf)
                xt=[X[i] for i in train] if rep=='tfidf' else X[train];xv=[X[i] for i in val] if rep=='tfidf' else X[val]
                fit_params={}
                if condition=='pesos_balanceados':
                    key=clf.steps[-1][0]+'__sample_weight' if rep=='tfidf' else 'sample_weight'
                    fit_params[key]=compute_sample_weight('balanced',y[train])
                start=time.perf_counter();clf.fit(xt,y[train],**fit_params);predictions[val]=clf.predict(xv);times.append(time.perf_counter()-start)
            assert np.all(predictions>=0)
            result={'condicao':condition,'representacao':rep,'classificador':name,'accuracy':accuracy_score(y,predictions),'f1_macro':f1_score(y,predictions,labels=[0,1,2],average='macro',zero_division=0),'por_classe':classification_report(y,predictions,labels=[0,1,2],target_names=CLASSES,zero_division=0,output_dict=True),'matriz_confusao':confusion_matrix(y,predictions,labels=[0,1,2]).tolist(),'tempos_fit_predict_folds_s':times,'contagem_predicoes':dict(collections.Counter(CLASSES[int(v)] for v in predictions))}
            results.append(result);print(condition,rep,name,'F1macro',round(result['f1_macro'],4),'recall_Adequado',result['por_classe']['Adequado']['recall'],flush=True)
            gravar_json_atomico(a.saida/('predicoes_dev_'+condition+'_'+rep+'_'+name+'.json'),[{'id':r['id'],'real':CLASSES[int(v)],'predito':CLASSES[int(z)]} for r,v,z in zip(rows,y,predictions)])
    dummy=np.full(len(y),-1)
    for tr,va in folds:
        d=DummyClassifier(strategy='most_frequent').fit(np.zeros((len(tr),1)),y[tr]);dummy[va]=d.predict(np.zeros((len(va),1)))
    report={'status':'exploratorio_desenvolvimento_proveniencia_mista','n':len(rows),'distribuicao':dict(collections.Counter(r['rotulo'] for r in rows)),
        'anotacao':pilot['proveniencia_incluidos'],'n_pendentes_excluidos':pilot['n_pendentes'],'protocolo':protocol,
        'teste_humano_consumido':False,'baseline':{'accuracy':accuracy_score(y,dummy),'f1_macro':f1_score(y,dummy,labels=[0,1,2],average='macro',zero_division=0)},'combinacoes':results}
    gravar_json_atomico(a.saida/'classificacao_desenvolvimento_v2.json',report)

if __name__=='__main__':main()
