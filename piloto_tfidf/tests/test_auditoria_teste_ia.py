import copy,hashlib,json,sys,unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1];sys.path.insert(0,str(BASE))
from preparar_auditoria_teste_ia import validar

class AuditoriaTesteIA(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        load=lambda p:json.loads((BASE/p).read_text(encoding='utf-8'))
        cls.review=load('validation/revisao_teste_ia_100_v1.json')
        cls.selection=load('data/validacao_ampliada_v1/manifesto.json')
        cls.dev=load('data/desenvolvimento_revisado_v2/manifesto.json')
    def check(self,r):return validar(r,self.selection,self.dev,BASE.parent)
    def refresh(self,r):
        r['sha256_registros']=hashlib.sha256(json.dumps(r['registros'],sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
        return r
    def test_100_ia_97_elegiveis_sem_confirmacao_humana(self):
        eligible=self.check(self.review)
        self.assertEqual(len(eligible),97)
        self.assertEqual(sum(r['rotulo_ia']=='Adequado' for r in eligible),4)
        self.assertEqual(self.review['n_auditados_pelo_autor'],0)
    def test_nao_incluir_relacao_documental_com_treino(self):
        r=copy.deepcopy(self.review);x=next(x for x in r['registros'] if x['id']=='11981094');x['elegivel_avaliacao_principal']=True
        with self.assertRaises(ValueError):self.check(self.refresh(r))
    def test_nao_transformar_ia_em_referencia_humana(self):
        r=copy.deepcopy(self.review);r['registros'][0]['ratificado_individualmente_pelo_autor']=True
        with self.assertRaises(ValueError):self.check(self.refresh(r))
        r=copy.deepcopy(self.review);r['n_auditados_pelo_autor']=5
        with self.assertRaises(ValueError):self.check(r)
    def test_evidencia_inventada_rejeitada(self):
        r=copy.deepcopy(self.review);x=next(x for x in r['registros'] if x['rotulo_ia']=='Adequado');x['criterios']['sql']['evidencia']='Trecho que não existe no currículo'
        with self.assertRaises(ValueError):self.check(self.refresh(r))
    def test_auditoria_precisa_de_cinco_casos_elegiveis(self):
        r=copy.deepcopy(self.review);r['auditoria_planejada']['ids'][0]='28078163'
        with self.assertRaises(ValueError):self.check(r)
    def test_casos_nao_podem_ser_trocados_apos_selecao(self):
        r=copy.deepcopy(self.review);r['registros'][0]['id']=r['registros'][1]['id']
        with self.assertRaises(ValueError):self.check(self.refresh(r))

if __name__=='__main__':unittest.main()
