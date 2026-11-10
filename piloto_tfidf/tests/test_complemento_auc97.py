import unittest,json
from pathlib import Path
import numpy as np
BASE=Path(__file__).resolve().parents[1]

class ComplementoAUCTests(unittest.TestCase):
 def test_auc_publicada_confere_com_comparacoes_pos_neg(self):
  read=lambda p:json.loads(p.read_text(encoding='utf-8'))
  report=read(BASE/'output/complemento_auc97_v1/roc_auc_coorte97.json')
  scores=read(BASE/'output/complemento_auc97_v1/probabilidades_coorte97.json')
  cohort=read(BASE/'data/coorte_97_v1/manifesto.json');labels={r['id']:r['rotulo_referencia'] for r in cohort['registros']}
  self.assertEqual(report['protocolo']['sha256_coorte'],cohort['sha256_registros'])
  self.assertEqual(len(report['resultados']),18)
  classes=['Inadequado','Parcialmente Adequado','Adequado']
  for r in report['resultados']:
   key='_'.join([r['condicao'],r['representacao'],r['classificador']]);rows=scores[key]
   self.assertEqual(len(rows),97);self.assertEqual({x['id'] for x in rows},set(labels))
   probs=np.array([x['probabilidades_I_P_A'] for x in rows]);self.assertTrue(np.allclose(probs.sum(1),1))
   values=[]
   for j,cls in enumerate(classes):
    positive=np.array([labels[x['id']]==cls for x in rows]);diff=probs[positive,j,None]-probs[~positive,j]
    value=float(np.mean((diff>0)+.5*(diff==0)));values.append(value)
    self.assertAlmostEqual(value,r['auc_ovr_por_classe'][cls],places=12)
   self.assertAlmostEqual(float(np.mean(values)),r['auc_ovr_macro'],places=12)
   self.assertAlmostEqual(float(np.average(values,weights=[58,35,4])),r['auc_ovr_ponderada'],places=12)
