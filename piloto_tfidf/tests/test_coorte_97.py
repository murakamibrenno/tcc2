import copy,json,sys,unittest
from pathlib import Path
import numpy as np
BASE=Path(__file__).resolve().parents[1];sys.path.insert(0,str(BASE))
from consolidar_coorte_97 import consolidar,digest
from avaliar_coorte_97 import conferir_particoes,metricas_ranking

class Coorte97(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        read=lambda p:json.loads((BASE/p).read_text(encoding='utf-8'))
        cls.review=read('validation/revisao_teste_ia_100_v1.json');cls.selection=read('data/validacao_ampliada_v1/manifesto.json');cls.dev=read('data/desenvolvimento_revisado_v2/manifesto.json');cls.audit=read('validation/auditoria_humana_5_casos_v1.json')
    def consolidate(self,audit):return consolidar(self.review,self.selection,self.dev,audit,BASE.parent)
    def test_aprovacao_apenas_nos_cinco_casos(self):
        r=self.consolidate(self.audit);self.assertEqual(r['n'],97);self.assertEqual(r['n_ia_sem_conferencia'],92)
        self.assertEqual(r['distribuicao'],{'Inadequado':58,'Parcialmente Adequado':35,'Adequado':4})
        tr,te=conferir_particoes(self.dev,r);self.assertEqual(len(tr),294);self.assertEqual(len(te),97)
        self.assertFalse(any(x['referencia_humana_independente'] for x in te))
    def test_nao_aprovar_automaticamente_um_sexto_caso(self):
        a=copy.deepcopy(self.audit);a['decisoes'].append({'id':'15289348','decisao':'aprovado_sem_correcao','rotulo_ratificado':'Inadequado'})
        with self.assertRaises(ValueError):self.consolidate(a)
    def test_nao_alterar_rotulo_ou_independencia_na_aprovacao(self):
        a=copy.deepcopy(self.audit);a['decisoes'][0]['rotulo_ratificado']='Inadequado'
        with self.assertRaises(ValueError):self.consolidate(a)
        a=copy.deepcopy(self.audit);a['independente']=True
        with self.assertRaises(ValueError):self.consolidate(a)
    def test_nao_injetar_id_de_treino_no_teste(self):
        r=self.consolidate(self.audit);r['registros'][0]['id']=next(x['id'] for x in self.dev['registros'] if x['incluir']);r['sha256_registros']=digest(r['registros'])
        with self.assertRaises(ValueError):conferir_particoes(self.dev,r)
    def test_metricas_ranking_com_empate_e_relevancia_graduada(self):
        m,order=metricas_ranking(['b','a','c'],[1,1,0],[2,0,1])
        self.assertEqual(order.tolist(),[1,0,2]);self.assertEqual(m['AP_adequado'],.5)
        expected=(3/np.log2(3)+1/np.log2(4))/(3+1/np.log2(3))
        self.assertAlmostEqual(m['NDCG_graduado'],expected);self.assertAlmostEqual(m['P@5'],1/3)
    def test_ranking_sem_relevantes_nao_inventa_ap(self):
        m,_=metricas_ranking(['a','b'],[2,1],[0,0]);self.assertIsNone(m['AP_adequado']);self.assertIsNone(m['NDCG_graduado']);self.assertEqual(m['P@5'],0)
    def test_ranking_rejeita_repeticao_e_valor_nao_finito(self):
        with self.assertRaises(ValueError):metricas_ranking(['a','a'],[1,0],[0,2])
        with self.assertRaises(ValueError):metricas_ranking(['a'],[float('nan')],[2])

if __name__=='__main__':unittest.main()
