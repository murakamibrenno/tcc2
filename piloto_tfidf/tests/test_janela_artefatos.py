"""Valida evidência publicada sem baixar modelos ou depender dos caches vetoriais."""
import csv,hashlib,json,sys,unittest
from pathlib import Path
import numpy as np
BASE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(BASE))
from avaliar_coorte_97 import metricas_ranking
OUT=BASE/'output/janela_equivalente_v1'
def read(p):return json.loads(Path(p).read_text(encoding='utf8'))

@unittest.skipUnless((OUT/'comparacao_original_equivalente.json').exists(),'Experimento complementar ainda não publicado')
class ArtefatosJanela(unittest.TestCase):
    def test_prefixos_derivam_dos_textos_e_cabem_nos_dois_tokenizers(self):
        selection={r['id']:r for r in read(BASE/'data/validacao_ampliada_v1/manifesto.json')['registros'] if r['texto_utilizavel']}
        rows=read(OUT/'manifesto_prefixos.json')['registros']
        self.assertEqual(len(rows),2483);self.assertEqual({r['id'] for r in rows},set(selection))
        for r in rows:
            original=(BASE.parent/selection[r['id']]['fonte_texto']).read_text(encoding='utf-8-sig').replace('\r\n','\n').replace('\r','\n')
            prefix=original.strip()[:8000][:r['caracteres_prefixo']]
            self.assertEqual(hashlib.sha256(prefix.encode()).hexdigest(),r['sha256_prefixo'])
            self.assertEqual(prefix,prefix.rstrip())
            self.assertTrue(all(0<n<=512 for n in r['tokens_com_especiais'].values()))
    def test_fontes_primarias_permanecem_inalteradas(self):
        protocol=read(OUT/'protocolo_pre_execucao.json')
        portable=read(OUT/'fontes_normalizadas_lf.json')['fontes']
        for name,expected in protocol['hashes_originais'].items():
            self.assertEqual(portable[name]['sha256_bytes_na_execucao'],expected)
            text=(BASE.parent/name).read_text(encoding='utf8').replace('\r\n','\n').replace('\r','\n')
            self.assertEqual(hashlib.sha256(text.encode()).hexdigest(),portable[name]['sha256_utf8_lf'],name)
        self.assertEqual(hashlib.sha256((BASE/'experimento_janela_equivalente.py').read_bytes()).hexdigest(),protocol['sha256_script'])
    def test_matrizes_metricas_e_predicoes_usam_os_mesmos_97(self):
        cohort=read(BASE/'data/coorte_97_v1/manifesto.json')['registros'];reference={r['id']:r['rotulo_referencia'] for r in cohort}
        result=read(OUT/'classificacao.json');self.assertEqual(len(result['resultados']),18)
        classes=['Inadequado','Parcialmente Adequado','Adequado']
        for row in result['resultados']:
            pred=read(OUT/('predicoes_'+'_'.join(row[k] for k in ['condicao','representacao','classificador'])+'.json'))
            self.assertEqual({r['id'] for r in pred},set(reference))
            matrix=np.zeros((3,3),dtype=int)
            for r in pred:
                self.assertEqual(r['referencia_original'],reference[r['id']])
                matrix[classes.index(reference[r['id']]),classes.index(r['predito'])]+=1
            self.assertEqual(matrix.tolist(),row['matriz_confusao']);self.assertEqual(int(matrix.sum()),97)
            f1=[]
            for i in range(3):
                den=matrix[i].sum()+matrix[:,i].sum();f1.append(2*matrix[i,i]/den if den else 0)
            self.assertAlmostEqual(float(np.mean(f1)),row['f1_macro'])
    def test_ranking_recalculavel_e_topo_sem_rotulos_nao_vira_negativo(self):
        cohort=read(BASE/'data/coorte_97_v1/manifesto.json')['registros'];classes=['Inadequado','Parcialmente Adequado','Adequado']
        new={r['representacao']:r for r in read(OUT/'ranking97.json')['representacoes']}
        summary=read(OUT/'comparacao_original_equivalente.json')
        human={r['id']:r['rotulo_final'] for r in read(BASE/'validation/conferencia_top5_autor_v1.json')['casos']}
        for r in summary['ranking_comparado']:
            with (OUT/('ranking_'+r['representacao']+'.csv')).open(encoding='utf8',newline='') as f:rows=list(csv.DictReader(f))
            self.assertEqual(len(rows),2483);scores={x['id']:float(x['score']) for x in rows}
            metrics,_=metricas_ranking([x['id'] for x in cohort],[scores[x['id']] for x in cohort],[classes.index(x['rotulo_referencia']) for x in cohort])
            for k in ['AP_adequado','NDCG_graduado','P@5','P@10']:self.assertAlmostEqual(metrics[k],new[r['representacao']][k])
            top=r['top5_completo'];self.assertEqual(top['ids'],[x['id'] for x in rows[:5]])
            if any(cid not in human for cid in top['ids']):self.assertIsNone(top['P@5'])

if __name__=='__main__':unittest.main()
