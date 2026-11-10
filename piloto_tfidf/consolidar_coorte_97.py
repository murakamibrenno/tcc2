"""Consolida referência exploratória de IA com cinco ratificações humanas assistidas."""
from __future__ import annotations
import argparse,collections,hashlib,json
from pathlib import Path
from preparar_auditoria_teste_ia import validar
from protocolo_experimento import gravar_json_atomico

BASE=Path(__file__).resolve().parent

def digest(value):
    return hashlib.sha256(json.dumps(value,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()

def consolidar(review,selection,development,audit,repo):
    eligible=validar(review,selection,development,repo)
    if audit['sha256_revisao_ia']!=review['sha256_registros']:raise ValueError('Auditoria de outra revisão')
    if audit['tipo']!='ratificacao_humana_assistida' or audit['independente'] is not False:raise ValueError('Auditoria não é referência humana independente')
    expected=set(review['auditoria_planejada']['ids']);rows=audit['decisoes'];ids=[r['id'] for r in rows]
    if len(ids)!=len(set(ids)) or set(ids)!=expected:raise ValueError('Auditoria deve abranger somente os cinco casos apresentados')
    if not audit.get('mensagem_do_autor','').strip():raise ValueError('Autorização humana não registrada')
    byid={r['id']:r for r in eligible}
    for r in rows:
        if r['decisao']!='aprovado_sem_correcao' or r['rotulo_ratificado']!=byid[r['id']]['rotulo_ia']:raise ValueError('A ratificação registrada não corresponde à aprovação recebida')
    records=[{'id':r['id'],'grupo_documental':r['grupo_documental_corrigido'],'rotulo_referencia':r['rotulo_ia'],
        'origem_rotulo':'assistente_IA','conferencia_autor':'ratificacao_assistida' if r['id'] in expected else 'nao_realizada',
        'sugestoes_ia_visiveis_na_conferencia':r['id'] in expected,'referencia_humana_independente':False,
        'fonte_texto':r['fonte_texto'],'sha256_texto_utf8_lf':r['sha256_texto_utf8_lf']} for r in eligible]
    return {'schema':1,'versao':'coorte_97_ia_auditoria_limitada_v1','status':'referencia_exploratoria_consolidada',
        'sha256_revisao_ia':review['sha256_registros'],'sha256_selecao_original':selection['sha256_registros'],'sha256_auditoria':digest(audit),
        'n':len(records),'n_ratificacoes_humanas_assistidas':5,'n_ia_sem_conferencia':len(records)-5,
        'distribuicao':dict(collections.Counter(r['rotulo_referencia'] for r in records)),
        'limitacao':'Mesma IA participou do desenvolvimento e da avaliação. Cinco ratificações de amostra intencional com sugestões visíveis não são julgamento humano independente, não validam os outros rótulos e não estimam acurácia da população.',
        'registros':records,'sha256_registros':digest(records)}

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--saida',type=Path,default=BASE/'data/coorte_97_v1/manifesto.json');a=p.parse_args()
    if a.saida.exists():raise ValueError('Coorte já congelada; use nova saída')
    read=lambda p:json.loads(p.read_text(encoding='utf-8'))
    result=consolidar(read(BASE/'validation/revisao_teste_ia_100_v1.json'),read(BASE/'data/validacao_ampliada_v1/manifesto.json'),read(BASE/'data/desenvolvimento_revisado_v2/manifesto.json'),read(BASE/'validation/auditoria_humana_5_casos_v1.json'),BASE.parent)
    gravar_json_atomico(a.saida,result)
    print(json.dumps({k:v for k,v in result.items() if k!='registros'},ensure_ascii=True))

if __name__=='__main__':main()
