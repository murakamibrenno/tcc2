"""Inspeção pós-avaliação de modelos fixos: termos e sensibilidade por blocos visíveis."""
from __future__ import annotations
import argparse,hashlib,json,os
from pathlib import Path
import numpy as np
from protocolo_experimento import gravar_json_atomico

BASE=Path(__file__).resolve().parent
CLASSES=['Inadequado','Parcialmente Adequado','Adequado']

def verificar_decomposicao(contribuicoes,intercepto,margem):
    if not np.isclose(float(np.sum(contribuicoes))+float(intercepto),float(margem),rtol=0,atol=1e-9):raise ValueError('Decomposição lexical não fecha a margem do modelo')

def blocos_visiveis(attention,special,n_blocos=8):
    # Mantém o primeiro token para não deixar prefixos causais sem nenhuma chave.
    ids=np.flatnonzero(np.asarray(attention,dtype=bool)&~np.asarray(special,dtype=bool))
    ids=ids[ids>0]
    return [x for x in np.array_split(ids,min(n_blocos,len(ids))) if len(x)] if len(ids) else []

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--escala',type=Path,required=True);p.add_argument('--saida',type=Path,required=True);a=p.parse_args()
    if (a.saida/'interpretabilidade_atual.json').exists():raise ValueError('Resultado já existe; usar saída nova')
    from executar_escala_v1 import carregar
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.svm import SVC
    from sklearn.utils.class_weight import compute_sample_weight
    from xgboost import XGBClassifier
    load=lambda p:json.loads(p.read_text(encoding='utf-8'))
    dev=load(BASE/'data/desenvolvimento_revisado_v2/manifesto.json');cohort=load(BASE/'data/coorte_97_v1/manifesto.json');audit=load(BASE/'validation/auditoria_humana_5_casos_v1.json')
    _,allrows,alltexts=carregar(BASE/'data/validacao_ampliada_v1/manifesto.json');idx={r['id']:i for i,r in enumerate(allrows)}
    train=[r for r in dev['registros'] if r['incluir']];y=np.array([CLASSES.index(r['rotulo']) for r in train]);itr=[idx[r['id']] for r in train];ite=[idx[r['id']] for r in cohort['registros']]
    sample=[r['id'] for r in audit['decisoes']];isample=[idx[cid] for cid in sample];weights=compute_sample_weight('balanced',y)
    protocol={'schema':1,'sha256_desenvolvimento':dev['sha256_registros'],'sha256_coorte':cohort['sha256_registros'],'n_treino':len(train),'casos':sample,
        'escolha_casos':'Os cinco casos da auditoria já definida antes das métricas da coorte, sem escolher exemplos pelos erros observados.',
        'escolha_modelos':'Inspeção pós-avaliação de TF-IDF/LR e TF-IDF/XGBoost com pesos, BGE/LR com pesos e Qwen/SVM com pesos. Nenhum parâmetro ou rótulo é alterado.',
        'limite':'Contribuições lineares descrevem o modelo ajustado, não competência profissional. Oclusão é sensibilidade a uma intervenção artificial, não explicação causal, importância semântica garantida ou validação humana independente.',
        'oclusao':'Oito blocos contíguos entre tokens efetivamente acessíveis, até512. Zerar attention_mask do bloco, preservando input_ids, posições e primeiro token. Não excluir texto nem revelar tokens que estavam fora da janela. Mesma máscara no pooling Qwen.',
        'margens':'LR: logit Adequado. SVM: decision_function OvR agregada de Adequado; não é probabilidade. Delta = valor original menos valor com bloco mascarado.'}
    gravar_json_atomico(a.saida/'protocolo_interpretabilidade.json',protocol)
    vec=TfidfVectorizer(ngram_range=(1,2),min_df=1,max_df=1.,lowercase=True);xt=vec.fit_transform([alltexts[i] for i in itr]);xv=vec.transform([alltexts[i] for i in ite]);xs=vec.transform([alltexts[i] for i in isample]);terms=vec.get_feature_names_out();df=np.asarray((xt>0).sum(0)).ravel()
    lr=LogisticRegression(max_iter=2000,random_state=42).fit(xt,y,sample_weight=weights)
    xgb=XGBClassifier(n_estimators=50,max_depth=3,learning_rate=.1,random_state=42,eval_metric='mlogloss',n_jobs=6).fit(xt,y,sample_weight=weights)
    def check(clf,X,method,name):
        old=load(BASE/('output/coorte97_v1/predicoes_pesos_balanceados_'+method+'_'+name+'.json'))
        expected=[r['predito'] for r in old];actual=[CLASSES[int(v)] for v in clf.predict(X)]
        if expected!=actual:raise ValueError('Modelo de inspeção diverge das predições registradas: '+method+'/'+name)
    check(lr,xv,'tfidf','lr');check(xgb,xv,'tfidf','xgb')
    def top(values,n=15):
        return [{'termo':str(terms[j]),'valor':float(values[j]),'n_docs_treino':int(df[j])} for j in np.argsort(-np.abs(values),kind='stable')[:n] if values[j]!=0]
    lexical={'dimensoes_classificacao':xt.shape[1],'global_lr_contraste_adequado_inadequado':top(lr.coef_[2]-lr.coef_[0]),'global_xgb_importancias':top(xgb.feature_importances_),
        'nota_xgb':'Importância global não direcional das features no treino; não é contribuição local nem explica por si uma previsão.',
        'nota_termos':'Listas sem filtro editorial de stop words ou anos. Termos frequentes podem receber peso; não equivalem à rubrica de quatro requisitos.','casos':[]}
    contrast=lr.coef_[2]-lr.coef_[0];bias=lr.intercept_[2]-lr.intercept_[0]
    for j,cid in enumerate(sample):
        row=xs[j];values=np.zeros(len(terms));values[row.indices]=row.data*contrast[row.indices];d=lr.decision_function(row)[0];margin=float(d[2]-d[0]);verificar_decomposicao(values,bias,margin)
        lexical['casos'].append({'id':cid,'predito_lr':CLASSES[int(lr.predict(row)[0])],'contraste':'logit Adequado menos logit Inadequado','margem':margin,'intercepto':float(bias),'soma_contribuicoes':float(values.sum()),'contribuicoes_mais_fortes':top(values),
            'soma_demais_contribuicoes':float(values.sum()-sum(x['valor'] for x in top(values)))})
    import torch
    from transformers import AutoModel,AutoTokenizer
    torch.manual_seed(42);torch.set_num_threads(6);device='cuda' if torch.cuda.is_available() else 'cpu';pins=load(a.escala/'revisoes_modelos.json')
    dense={}
    for method in ['bge','qwen']:
        meta=load(a.escala/(method+'_medicao.json'));path=a.escala/(method+'.npy');assert hashlib.sha256(path.read_bytes()).hexdigest()==meta['sha256_vetores'];assert meta['ids_ordem_vetores']==[r['id'] for r in allrows]
        vectors=np.load(path,allow_pickle=False);query=np.load(a.escala/(method+'_consulta.npy'),allow_pickle=False).ravel()
        clf=LogisticRegression(max_iter=2000,random_state=42) if method=='bge' else SVC(kernel='linear',probability=True,random_state=42)
        clf.fit(vectors[itr],y,sample_weight=weights);check(clf,vectors[ite],method,'lr' if method=='bge' else 'svm')
        pin=pins[method]
        if method=='bge':
            from sentence_transformers import SentenceTransformer
            model=SentenceTransformer(pin['modelo'],revision=pin['revision'],device=device,local_files_only=True);model.max_seq_length=512;tokenizer=model.tokenizer
        else:
            tokenizer=AutoTokenizer.from_pretrained(pin['modelo'],revision=pin['revision'],local_files_only=True)
            model=AutoModel.from_pretrained(pin['modelo'],revision=pin['revision'],local_files_only=True,dtype=torch.float32).to(device)
        model.eval();examples=[]
        for cid in sample:
            text=alltexts[idx[cid]]
            tokens=tokenizer(text,truncation=True,max_length=512,return_tensors='pt',return_offsets_mapping=True,return_special_tokens_mask=True)
            offsets=tokens.pop('offset_mapping')[0].numpy();special=tokens.pop('special_tokens_mask')[0].numpy();attention=tokens['attention_mask'][0].numpy()
            blocks=blocos_visiveis(attention,special)
            batches=[]
            for block in [None]+blocks:
                features={k:v.clone() for k,v in tokens.items()}
                if block is not None:features['attention_mask'][0,torch.tensor(block)]=0
                batches.append(features)
            encoded=[]
            with torch.inference_mode():
                for start in range(0,len(batches),4):
                    features={k:torch.cat([b[k] for b in batches[start:start+4]]).to(device) for k in tokens}
                    if method=='bge':z=model(features)['sentence_embedding']
                    else:
                        hidden=model(**features).last_hidden_state;mask=features['attention_mask'].unsqueeze(-1).float();z=(hidden*mask).sum(1)/mask.sum(1).clamp(min=1)
                    encoded.append(torch.nn.functional.normalize(z,p=2,dim=1).cpu().numpy().astype(np.float32))
            emb=np.vstack(encoded)
            if not np.isfinite(emb).all() or not np.allclose(emb[0],vectors[idx[cid]],rtol=2e-4,atol=2e-4):raise ValueError('Encoder da inspeção difere do cache validado: '+method+'/'+cid)
            margins=clf.decision_function(emb)[:,2];scores=emb@query;pred=[CLASSES[int(v)] for v in clf.predict(emb)];details=[]
            for j,block in enumerate(blocks,1):
                charstart=int(min(offsets[block,0]));charend=int(max(offsets[block,1]));details.append({'bloco':j,'n_tokens_mascarados':len(block),'inicio_char':charstart,'fim_char':charend,'trecho':text[charstart:charend],
                    'delta_margem_adequado':float(margins[0]-margins[j]),'delta_cosseno_vaga':float(scores[0]-scores[j]),'predito_com_oclusao':pred[j]})
            original=next(r for r in allrows if r['id']==cid)
            examples.append({'id':cid,'n_chars_texto_integral':original['caracteres'],'n_chars_entrada':len(text),'n_tokens_visiveis':int(attention.sum()),'fim_char_visivel':int(offsets[:,1].max()),
                'max_erro_abs_vs_cache':float(np.max(np.abs(emb[0]-vectors[idx[cid]]))),'predito_original':pred[0],'margem_adequado_original':float(margins[0]),'cosseno_vaga_original':float(scores[0]),'blocos':details})
            print(method,cid,'blocos',len(blocks),'cache_OK',flush=True)
        dense[method]={'modelo':pin['modelo'],'revision':pin['revision'],'device':device,'classificador':'LR com pesos' if method=='bge' else 'SVM com pesos','tipo_margem':'logit' if method=='bge' else 'OvR agregado, não probabilidade','casos':examples}
        del model
        if device=='cuda':torch.cuda.empty_cache()
    gravar_json_atomico(a.saida/'interpretabilidade_atual.json',{'protocolo':protocol,'tfidf':lexical,'densos':dense,'confirmacao':'Predições dos quatro classificadores nos 97 idênticas ao relatório publicado; embeddings originais conferidos contra o cache. Nenhum ajuste de decisão após oclusão.'})

if __name__=='__main__':main()
