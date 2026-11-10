import copy,json,sys,unittest
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(BASE))
from preparar_teste_humano import preparar_casos,validar_respostas

class ValidacaoAmpliada(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.m=json.loads((BASE/'data/validacao_ampliada_v1/manifesto.json').read_text(encoding='utf-8'))
    def test_grupos_teste_nao_foram_usados(self):
        r=self.m['registros'];test={x['grupo_documental'] for x in r if x['papel']=='teste_humano_reservado'}
        dev={x['grupo_documental'] for x in r if x['papel'].startswith('desenvolvimento')}
        history=json.loads((BASE/'validation/revisao_adjudicada.json').read_text(encoding='utf-8'))
        seen={str(x['id']) for x in history['decisoes_aprovadas']+history['decisoes_ia_autorizadas']}
        oldgroups={x['grupo_documental'] for x in r if x['id'] in seen}
        self.assertFalse(test&(dev|oldgroups))
    def test_formulario_so_contem_id_e_texto_integral(self):
        cases=preparar_casos(self.m,BASE.parent)
        self.assertEqual(len(cases),100)
        self.assertTrue(all(set(c)=={'id','texto_integral'} for c in cases))
        self.assertTrue(all(c['texto_integral'] for c in cases))
    def test_revisao_incompleta_nao_libera_teste(self):
        with self.assertRaises(ValueError):validar_respostas({'avaliador':'autor','sha256_manifesto':self.m['sha256_registros'],'respostas':[]},self.m)
    def test_rótulos_duplicados_ou_sem_evidencia_rejeitados(self):
        ids=[r['id'] for r in self.m['registros'] if r['papel']=='teste_humano_reservado']
        rows=[{'id':i,'rotulo_manual':'Inadequado','justificativa':'Sem evidências técnicas pertinentes.','criterios':{k:{'atende':'nao','evidencia':''} for k in ['sql','servicos','git','programacao']}} for i in ids]
        p={'avaliador':'autor','sha256_manifesto':self.m['sha256_registros'],'respostas':rows}
        self.assertEqual(len(validar_respostas(p,self.m)),100)
        bad=copy.deepcopy(p);bad['respostas'][0]['criterios']['sql']['atende']='sim'
        with self.assertRaises(ValueError):validar_respostas(bad,self.m)
        bad=copy.deepcopy(p);bad['respostas'][0]['id']=bad['respostas'][1]['id']
        with self.assertRaises(ValueError):validar_respostas(bad,self.m)

if __name__=='__main__':unittest.main()
