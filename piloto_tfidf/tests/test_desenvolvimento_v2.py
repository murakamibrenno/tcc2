import copy,json,sys,unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(BASE))
from consolidar_desenvolvimento_v2 import consolidar

class DesenvolvimentoV2(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        load=lambda p:json.loads((BASE/p).read_text(encoding='utf-8'))
        cls.selection=load('data/validacao_ampliada_v1/manifesto.json')
        cls.pilot=load('data/revisao_piloto_v1/manifesto.json')
        cls.review=load('validation/revisao_desenvolvimento_201_v1.json')
    def run_consolidation(self,review):return consolidar(self.selection,self.pilot,review,BASE.parent)
    def test_revisao_completa_com_duvidas_excluidas_e_proveniencia(self):
        r=self.run_consolidation(self.review)
        self.assertEqual(r['n_casos_conferidos'],300)
        self.assertEqual(r['n_incluidos'],294)
        self.assertEqual(r['n_pendentes'],6)
        self.assertEqual(r['distribuicao']['Adequado'],6)
        self.assertEqual(r['proveniencia_incluidos'],{'ratificado_individualmente':59,'IA_autorizada':235})
        self.assertFalse(r['teste_humano_consumido'])
    def test_caso_teste_injetado_rejeitado(self):
        r=copy.deepcopy(self.review)
        r['registros'][0]['id']=next(x['id'] for x in self.selection['registros'] if x['papel']=='teste_humano_reservado')
        with self.assertRaises(ValueError):self.run_consolidation(r)
    def test_nao_promover_rotulos_ia_a_humanos(self):
        r=copy.deepcopy(self.review);r['registros'][0]['ratificado_individualmente_pelo_autor']=True
        with self.assertRaises(ValueError):self.run_consolidation(r)
    def test_duvida_nao_pode_entrar_no_treino(self):
        r=copy.deepcopy(self.review);pending=next(x for x in r['registros'] if not x['incluir_treino']);pending['incluir_treino']=True;pending['rotulo']='Adequado'
        with self.assertRaises(ValueError):self.run_consolidation(r)
    def test_evidencia_inventada_ou_fonte_alterada_rejeitada(self):
        r=copy.deepcopy(self.review);row=next(x for x in r['registros'] if x['rotulo']=='Adequado');row['criterios']['sql']['evidencia']='Citação que não existe na fonte'
        with self.assertRaises(ValueError):self.run_consolidation(r)
        r=copy.deepcopy(self.review);r['registros'][0]['sha256_texto_utf8_lf']='alterado'
        with self.assertRaises(ValueError):self.run_consolidation(r)
    def test_adequado_precisa_dos_quatro_criterios(self):
        r=copy.deepcopy(self.review);row=next(x for x in r['registros'] if x['rotulo']=='Adequado');row['criterios']['git']['atende']=False
        with self.assertRaises(ValueError):self.run_consolidation(r)

if __name__=='__main__':unittest.main()
