"""Exporta complementos documentados sem alterar o snapshot experimental primário."""
from pathlib import Path
import hashlib
import json
from statistics import median

ROOT = Path(__file__).resolve().parents[1]
FONTES = {
    'conferencias': 'piloto_tfidf/validation/conferencias_autor_consolidadas_v1.json',
    'janela': 'piloto_tfidf/output/janela_equivalente_v1/comparacao_original_equivalente.json',
    'top5_primario': 'piloto_tfidf/validation/conferencia_top5_autor_v1.json',
    'custo_tfidf': 'piloto_tfidf/output/escala_v1/tfidf_medicao.json',
    'custo_bge': 'piloto_tfidf/output/escala_v1/bge_medicao.json',
    'custo_qwen': 'piloto_tfidf/output/escala_v1/qwen_medicao.json',
}

def exportar():
    raw = {name: (ROOT / path).read_text(encoding='utf-8').replace('\r\n', '\n') for name, path in FONTES.items()}
    audit, window, top = (json.loads(raw[k]) for k in ['conferencias', 'janela', 'top5_primario'])
    assert audit['n_ids_unicos'] == len({r['id'] for r in audit['registros']}) == 72
    assert sum(audit['distribuicao_atual'].values()) == 72
    assert len(window['classificacao_comparada']) == 18
    resources = []
    for method in ['tfidf', 'bge', 'qwen']:
        source = json.loads(raw['custo_' + method])
        assert source['dimensoes'][0] == source['n_concluidos'] == 2483
        if method == 'tfidf':
            repetitions = source['ajuste_vetorizacao_repeticoes']
            seconds = median(row['segundos'] for row in repetitions)
            rss = max(row['pico_rss_bytes_amostrado'] for row in repetitions)
        else:
            repetitions = [source['vetorizacao_sem_carregamento']]
            seconds = repetitions[0]['segundos']
            rss = repetitions[0]['pico_rss_bytes_amostrado']
        resources.append({
            'representacao': method,
            'n_documentos': source['n_concluidos'],
            'dimensoes': source['dimensoes'][1],
            'vetorizacao_s': seconds,
            'consulta_escores_s': source['consulta_e_escores_mediana_s'],
            'repeticoes_vetorizacao': len(repetitions),
            'pico_rss_bytes': rss,
            'pico_gpu_alocado_bytes': source.get('pico_gpu_alocado_bytes'),
            'arquivo_vetorial_bytes': source['vetores_bytes_disco'],
            'dispositivo': 'CPU' if method == 'tfidf' else source['hardware']['gpu'],
            'formato_arquivo': 'NPZ esparso comprimido' if method == 'tfidf' else 'NPY float32',
        })
    result = {
        'schema': 1,
        'recursos_execucao_primaria': resources,
        'conferencias': {k: audit[k] for k in ['data_local', 'unidade', 'criterio', 'n_registros_por_etapa', 'soma_etapas', 'sobreposicoes', 'n_ids_unicos', 'distribuicao_atual', 'ids_fora', 'registros', 'limite']},
        'janela': {
            'data': window['protocolo']['data'],
            'natureza': window['protocolo']['natureza'],
            'limite_tokens': window['protocolo']['limite_tokens'],
            'n_documentos': window['protocolo']['mesmos_ids'],
            'n_desenvolvimento': window['protocolo']['n_treino'],
            'n_avaliacao': window['protocolo']['n_avaliacao'],
            'prefixos': window['prefixos'],
            'ranking_comparado': window['ranking_comparado'],
            'classificacao_comparada': window['classificacao_comparada'],
            'limites': window['protocolo']['limites'],
            'top5_primario': [{'representacao': r['representacao'], 'P@5': r['p_at_5']} for r in top['resultados']],
        },
        'fontes': {name: {'caminho': FONTES[name], 'sha256_utf8_lf': hashlib.sha256(raw[name].encode('utf-8')).hexdigest()} for name in FONTES},
    }
    output = ROOT / 'aplicacao_mockup/src/data/complementosMonografia.json'
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    return output

if __name__ == '__main__':
    print(exportar())
