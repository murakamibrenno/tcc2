"""Publica snapshot atual auditável; não recalcula métricas nem preenche rótulos ausentes."""
from __future__ import annotations
import argparse,csv,hashlib,json,re
from pathlib import Path
from protocolo_experimento import gravar_json_atomico

BASE=Path(__file__).resolve().parent
def exportar(escala,interpretacao):
    load=lambda p:json.loads(p.read_text(encoding='utf-8'))
    selection=load(BASE/'data/validacao_ampliada_v1/manifesto.json');dev=load(BASE/'data/desenvolvimento_revisado_v2/manifesto.json');cohort=load(BASE/'data/coorte_97_v1/manifesto.json')
    quality=load(BASE/'output/coorte97_v1/classificacao_coorte97.json');rank=load(BASE/'output/coorte97_v1/ranking_coorte97.json');interp=load(interpretacao)
    auc=load(BASE/'output/complemento_auc97_v1/roc_auc_coorte97.json')
    if auc['protocolo']['sha256_coorte']!=cohort['sha256_registros'] or auc['protocolo']['sha256_desenvolvimento']!=dev['sha256_registros']:raise ValueError('Complemento AUC de outro experimento')
    if (quality['protocolo']['sha256_coorte']!=cohort['sha256_registros']
        or quality['protocolo']['sha256_desenvolvimento']!=dev['sha256_registros']
        or interp['protocolo']['sha256_coorte']!=cohort['sha256_registros']
        or interp['protocolo']['sha256_desenvolvimento']!=dev['sha256_registros']):raise ValueError('Snapshots de experimentos diferentes')
    bydev={r['id']:r for r in dev['registros']};bytest={r['id']:r for r in cohort['registros']};excluded={'11981094','28078163','31677347'}
    scores={};methods=[]
    names={'tfidf':'TF-IDF','bge':'BGE large','qwen':'Qwen 0.5B'}
    for method in names:
        expected=next(r['sha256_ranking_fonte'] for r in rank['representacoes'] if r['representacao']==method)
        if hashlib.sha256((escala/('ranking_'+method+'.csv')).read_bytes()).hexdigest()!=expected:raise ValueError('Ranking fonte diverge da avaliação publicada')
        with (escala/('ranking_'+method+'.csv')).open(encoding='utf-8',newline='') as f:rows=list(csv.DictReader(f))
        if len(rows)!=2483 or len({r['id'] for r in rows})!=2483:raise ValueError('Ranking completo inválido')
        scores[method]={r['id']:{'score':float(r['score']),'posicao':int(r['posicao'])} for r in rows}
        meta=load(escala/(method+'_medicao.json'))
        methods.append({'id':method,'nome':names[method],'modelo':meta.get('modelo','TfidfVectorizer'),'dimensoes_recuperacao':meta['dimensoes'][1],
            'vetorizacao_segundos':sorted(x['segundos'] for x in meta['ajuste_vetorizacao_repeticoes'])[1] if method=='tfidf' else meta['vetorizacao_sem_carregamento']['segundos'],
            'repeticoes_vetorizacao':3 if method=='tfidf' else 1,'device':'CPU' if method=='tfidf' else meta['hardware']['device'],
            'consulta_escores_mediana_segundos':meta['consulta_e_escores_mediana_s'],'nota_custo':'Consulta e cálculo de escores, sem ordenação/exportação. Vetorização densa sem carga/download; TF-IDF mediana de três ajustes. Etapas/hardware distintos; sem teste de significância.'})
    curriculos=[]
    for r in selection['registros']:
        if not r['texto_utilizavel']:continue
        cid=r['id'];text=(BASE.parent/r['fonte_texto']).read_text(encoding='utf-8-sig').replace('\r\n','\n').replace('\r','\n')
        if hashlib.sha256(text.encode()).hexdigest()!=r['sha256_texto_utf8_lf']:raise ValueError('Texto fonte alterado')
        lines=[s.strip() for s in text.splitlines() if s.strip() and not re.match(r'^--- PAGE \d+ ---$',s.strip())]
        label=None;provenance='Sem anotação de aderência';role='Fora do subconjunto julgado'
        if cid in bydev:
            row=bydev[cid];label=row['rotulo'];role='Desenvolvimento' if row['incluir'] else 'Desenvolvimento — dúvida excluída'
            provenance='IA com ratificação assistida do autor' if row['ratificado_individualmente_pelo_autor'] else 'IA autorizada'
        if cid in bytest:
            row=bytest[cid];label=row['rotulo_referencia'];role='Coorte de avaliação'
            provenance='IA com ratificação assistida do autor' if row['conferencia_autor']=='ratificacao_assistida' else 'IA sem conferência humana'
        if cid in excluded:role='Excluído da avaliação — histórico relacionado';provenance='IA; excluído da avaliação principal'
        curriculos.append({'id':cid,'titulo':(lines[0] if lines else cid)[:130],'categoria':r['categoria_origem'],'caracteres':r['caracteres'],'papel':role,
            'rotulo':label,'origem_rotulo':provenance,'coorte97':cid in bytest,'desenvolvimento294':cid in bydev and bydev[cid]['incluir'],
            'scores':{method:scores[method][cid]['score'] for method in names},'posicoes_colecao':{method:scores[method][cid]['posicao'] for method in names}})
    predictions={}
    for row in quality['resultados']:
        key='_'.join([row['condicao'],row['representacao'],row['classificador']]);pred=load(BASE/('output/coorte97_v1/predicoes_'+key+'.json'))
        if {r['id'] for r in pred}!=set(bytest):raise ValueError('Predições fora da coorte de 97')
        predictions[key]=pred
    rawsample={}
    for cid in interp['protocolo']['casos']:
        r=next(r for r in selection['registros'] if r['id']==cid);rawsample[cid]=(BASE.parent/r['fonte_texto']).read_text(encoding='utf-8-sig')
    return {'schema':1,'versao':'experimento_atual_interpretabilidade_v1','data':'2026-11-10',
        'universos':{'pdfs_inventariados':2484,'textos_utilizaveis':2483,'pdf_em_branco':1,'desenvolvimento':294,'avaliacao':97,'duvidas_desenvolvimento_excluidas':6,'relacionados_excluidos_avaliacao':3},
        'proveniencia_avaliacao':{'IA_com_ratificacao_assistida':5,'IA_sem_conferencia':92,'humana_independente':0},
        'limitacoes':['Avaliação exploratória: a mesma IA participou das anotações de desenvolvimento e avaliação.','Cinco ratificações assistidas de amostra intencional não validam os demais 92 rótulos nem constituem julgamento humano independente.','Há quatro Adequados na coorte; um caso altera o recall em 25 pontos percentuais.','A amostra foi enriquecida por sinais técnicos. As métricas dos 97 não estimam qualidade ou prevalência na coleção inteira.','Textos integrais preservados; entrada de até 8.000 caracteres, com limite adicional de 512 tokens em BGE e Qwen. Evidências podem ficar fora da janela.','Interpretabilidade descreve modelos e sensibilidade a máscaras artificiais; não comprova competência nem causalidade.'],
        'vaga':load(BASE/'data/vaga_referencia.json'),'metodos':methods,'curriculos':curriculos,
        'classificacao':quality,'predicoes':predictions,'ranking':rank,'interpretabilidade':interp,'textos_casos_inspecao':rawsample,'auc_complementar':auc,
        'rastreabilidade':{'sha256_desenvolvimento':dev['sha256_registros'],'sha256_coorte':cohort['sha256_registros'],'sha256_auditoria':cohort['sha256_auditoria'],'fontes':'piloto_tfidf/output/coorte97_v1 e piloto_tfidf/output/interpretabilidade_atual_v1; históricos anteriores preservados.'}}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--escala',type=Path,required=True);p.add_argument('--interpretacao',type=Path,required=True);p.add_argument('--saida',type=Path,default=BASE.parent/'aplicacao_mockup/src/data/experimentoAtual.json');a=p.parse_args()
    result=exportar(a.escala,a.interpretacao)
    # JSON compacto reduz o pacote sem arredondar métricas ou apagar a proveniência.
    a.saida.parent.mkdir(parents=True,exist_ok=True);tmp=a.saida.with_suffix('.tmp');tmp.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8');tmp.replace(a.saida)
    print('UI:',len(result['curriculos']),'documentos;',len(result['classificacao']['resultados']),'configurações; cinco casos de inspeção.')

if __name__=='__main__':main()
