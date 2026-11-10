"""Representações e ranking sem consumir rótulos; saídas novas, separadas do histórico."""
from __future__ import annotations
import argparse, csv, hashlib, importlib.metadata, json, os, platform, threading, time
from pathlib import Path
import numpy as np
import psutil
from protocolo_experimento import gravar_json_atomico, fingerprint_textos, BGE_QUERY_PREFIX

BASE=Path(__file__).resolve().parent
MODELS={'bge':'BAAI/bge-large-en-v1.5','qwen':'Qwen/Qwen2.5-0.5B'}

class Medicao:
    def __enter__(self):
        self.stop=threading.Event();self.peak=0;self.proc=psutil.Process()
        def sample():
            while not self.stop.is_set():
                self.peak=max(self.peak,self.proc.memory_info().rss);self.stop.wait(.02)
        self.worker=threading.Thread(target=sample,daemon=True);self.worker.start()
        self.start=time.perf_counter();return self
    def __exit__(self,*args):
        self.seconds=time.perf_counter()-self.start;self.stop.set();self.worker.join()
    def result(self):return {'segundos':self.seconds,'pico_rss_bytes_amostrado':self.peak,'periodo_amostragem_s':.02}

def carregar(manifest):
    data=json.loads(manifest.read_text(encoding='utf-8'));records=[];texts=[]
    for r in data['registros']:
        if not r['texto_utilizavel']:continue
        t=(BASE.parent/r['fonte_texto']).read_text(encoding='utf-8-sig').replace('\r\n','\n').replace('\r','\n')
        if hashlib.sha256(t.encode()).hexdigest()!=r['sha256_texto_utf8_lf']:raise ValueError('Fonte mudou: '+r['id'])
        records.append(r);texts.append(t.strip()[:8000])
    return data,records,texts

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--metodo',choices=['tfidf','bge','qwen'],required=True)
    p.add_argument('--manifesto',type=Path,default=BASE/'data/validacao_ampliada_v1/manifesto.json')
    p.add_argument('--saida',type=Path,required=True)
    a=p.parse_args();a.saida.mkdir(parents=True,exist_ok=True)
    data,records,texts=carregar(a.manifesto)
    query=(BASE/'data/vaga_referencia.txt').read_text(encoding='utf-8').strip()[:8000]
    report={'metodo':a.metodo,'n_tentados':2484,'n_textos_utilizaveis':len(texts),'n_sem_texto':2484-len(texts),
        'sha256_manifesto_registros':data['sha256_registros'],'max_chars':8000,'rotulos_consumidos':False,
        'qualidade':'Não medida nesta execução; teste humano pendente.',
        'hardware':{'plataforma':platform.platform(),'cpu':platform.processor(),'cpus_logicas':os.cpu_count(),'ram_bytes':psutil.virtual_memory().total},
        'versoes':{m:importlib.metadata.version(m) for m in ['numpy','scikit-learn','torch','transformers','sentence-transformers','xgboost','psutil']}}
    revisions=a.saida/'revisoes_modelos.json'
    if not revisions.exists():
        from huggingface_hub import HfApi
        gravar_json_atomico(revisions,{k:{'modelo':v,'revision':HfApi().model_info(v).sha} for k,v in MODELS.items()})
    pins=json.loads(revisions.read_text(encoding='utf-8'))
    if a.metodo=='tfidf':
        from sklearn.feature_extraction.text import TfidfVectorizer
        from scipy.sparse import save_npz
        measures=[]
        for _ in range(3):
            with Medicao() as m:
                vectorizer=TfidfVectorizer(ngram_range=(1,2),lowercase=True,min_df=1,max_df=1.0)
                vectors=vectorizer.fit_transform(texts)
            measures.append(m.result())
        report['ajuste_vetorizacao_repeticoes']=measures
        report['ajuste']='Coleção utilizável inteira, somente recuperação sem rótulos. Classificação deve ajustar TF-IDF apenas no treino de cada fold.'
        report['config']={'ngram_range':[1,2],'min_df':1,'max_df':1.0,'lowercase':True}
        latency=[]
        for _ in range(11):
            start=time.perf_counter();q=vectorizer.transform([query]);scores=(vectors@q.T).toarray().ravel();latency.append(time.perf_counter()-start)
        save_npz(a.saida/'tfidf.npz',vectors)
        vector_path=a.saida/'tfidf.npz'
        gravar_json_atomico(a.saida/'vocabulario_tfidf.json',{k:int(v) for k,v in vectorizer.vocabulary_.items()})
    else:
        import torch
        torch.manual_seed(42);torch.set_num_threads(6)
        device='cuda' if torch.cuda.is_available() else 'cpu'
        report['hardware']['device']=device
        if device=='cuda':report['hardware']['gpu']=torch.cuda.get_device_name(0)
        pin=pins[a.metodo];report.update(pin);report['dtype']='float32';report['max_tokens']=512;report['batch_size']=4
        start=time.perf_counter()
        if a.metodo=='bge':
            from sentence_transformers import SentenceTransformer
            model=SentenceTransformer(pin['modelo'],revision=pin['revision'],device=device)
            model.max_seq_length=512
            def encode(ts):return model.encode(ts,batch_size=4,normalize_embeddings=True,show_progress_bar=True,convert_to_numpy=True)
            qtext=BGE_QUERY_PREFIX+query;report['pooling']='CLS conforme configuração do modelo';report['prefixo_consulta']=BGE_QUERY_PREFIX
        else:
            from transformers import AutoModel,AutoTokenizer
            tokenizer=AutoTokenizer.from_pretrained(pin['modelo'],revision=pin['revision'])
            model=AutoModel.from_pretrained(pin['modelo'],revision=pin['revision'],dtype=torch.float32).to(device).eval()
            if tokenizer.pad_token is None:tokenizer.pad_token=tokenizer.eos_token
            def encode(ts):
                blocks=[]
                with torch.inference_mode():
                    for i in range(0,len(ts),4):
                        batch=tokenizer(ts[i:i+4],padding=True,truncation=True,max_length=512,return_tensors='pt').to(device)
                        h=model(**batch).last_hidden_state;mask=batch['attention_mask'].unsqueeze(-1).float()
                        z=(h*mask).sum(1)/mask.sum(1).clamp(min=1)
                        blocks.append(torch.nn.functional.normalize(z,p=2,dim=1).cpu().numpy().astype(np.float32))
                        if i%100==0:print('qwen',i,'/',len(ts),flush=True)
                return np.vstack(blocks)
            qtext=query;report['pooling']='último hidden state, média com máscara e normalização L2'
        if device=='cuda':torch.cuda.synchronize()
        report['carregar_modelo_incluindo_download_s']=time.perf_counter()-start
        encode([texts[0]])
        if device=='cuda':torch.cuda.synchronize();torch.cuda.reset_peak_memory_stats()
        with Medicao() as m:
            vectors=encode(texts)
            if device=='cuda':torch.cuda.synchronize()
        report['vetorizacao_sem_carregamento']=m.result()
        report['repeticoes_vetorizacao_completa']=1
        if device=='cuda':report['pico_gpu_alocado_bytes']=torch.cuda.max_memory_allocated()
        latency=[]
        for _ in range(11):
            start=time.perf_counter();q=encode([qtext]);scores=(vectors@q[0]).ravel()
            if device=='cuda':torch.cuda.synchronize()
            latency.append(time.perf_counter()-start)
        vector_path=a.saida/(a.metodo+'.npy');np.save(vector_path,vectors)
        np.save(a.saida/(a.metodo+'_consulta.npy'),q)
    if not np.isfinite(scores).all():raise ValueError('Scores não finitos')
    if not np.isfinite(vectors.data if a.metodo=='tfidf' else vectors).all():raise ValueError('Vetores não finitos')
    report['consulta_e_escores_repeticoes_s']=latency[1:]
    report['consulta_e_escores_mediana_s']=float(np.median(latency[1:]))
    report['primeira_consulta_descartada_s']=latency[0]
    report['dimensoes']=list(vectors.shape);report['vetores_bytes_disco']=vector_path.stat().st_size
    report['sha256_vetores']=hashlib.sha256(vector_path.read_bytes()).hexdigest()
    report['fingerprint_entrada']=fingerprint_textos(texts,a.metodo,consulta=query,config=report.get('config'),revision=report.get('revision'),max_chars=8000,max_tokens=report.get('max_tokens'))
    report['ids_ordem_vetores']=[r['id'] for r in records]
    rank=a.saida/('ranking_'+a.metodo+'.csv')
    with rank.open('w',encoding='utf-8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=['posicao','id','score','representante_principal']);writer.writeheader()
        for position,i in enumerate(np.argsort(-scores,kind='stable'),1):writer.writerow({'posicao':position,'id':records[i]['id'],'score':float(scores[i]),'representante_principal':records[i]['representante_principal']})
    report['n_concluidos']=len(records);report['status']='execucao_sem_rotulos_concluida'
    gravar_json_atomico(a.saida/(a.metodo+'_medicao.json'),report)
    print(json.dumps({k:v for k,v in report.items() if k!='ids_ordem_vetores'},ensure_ascii=True),flush=True)

if __name__=='__main__':main()
