import copy
import json
import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from consolidar_revisao_piloto import consolidar, BASE


class ConsolidacaoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.registro=json.loads((BASE/'validation/revisao_adjudicada.json').read_text(encoding='utf-8'))
        cls.piloto=json.loads((BASE/'data/curriculos_piloto.json').read_text(encoding='utf-8-sig'))

    def test_referencia_preserva_proveniencia_e_exclusao(self):
        r=consolidar(self.registro,self.piloto,BASE.parent)
        self.assertEqual((r['n_documentos_revisados'],r['n_retidos']), (100,99))
        self.assertEqual((r['n_ratificados_individualmente'],r['n_ia_autorizacao_antecipada']), (60,40))
        self.assertFalse(r['apto_como_teste_humano_independente'])
        self.assertEqual([x['id'] for x in r['registros'] if not x['incluir']],['26746496'])
        self.assertTrue(all(x['papel_experimental']=='desenvolvimento' for x in r['registros']))

    def test_decisao_duplicada_nao_sobrescreve_silenciosamente(self):
        r=copy.deepcopy(self.registro)
        r['decisoes_aprovadas'].append(copy.deepcopy(r['decisoes_aprovadas'][0]))
        with self.assertRaisesRegex(ValueError,'repetidas'):
            consolidar(r,self.piloto,BASE.parent)

    def test_decisao_ausente_impede_consolidacao(self):
        r=copy.deepcopy(self.registro);r['decisoes_ia_autorizadas'].pop()
        with self.assertRaisesRegex(ValueError,'incompleta'):
            consolidar(r,self.piloto,BASE.parent)
