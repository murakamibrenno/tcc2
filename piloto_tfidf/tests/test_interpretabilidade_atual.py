import sys,unittest
from pathlib import Path
import numpy as np
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from interpretar_experimento_atual import blocos_visiveis,verificar_decomposicao

class InterpretabilidadeTests(unittest.TestCase):
 def test_blocos_preservam_primeiro_especiais_padding_e_cobrem_visiveis(self):
  blocks=blocos_visiveis([1]*12+[0]*3,[1,0,0,0,0,0,0,0,0,0,0,1,0,0,0])
  self.assertEqual(len(blocks),8)
  self.assertEqual(np.concatenate(blocks).tolist(),list(range(1,11)))
  self.assertEqual(blocos_visiveis([1,0],[1,0]),[])
 def test_decomposicao_fecha_e_rejeita_explicacao_incorreta(self):
  verificar_decomposicao([.2,-.3,.7],.1,.7)
  with self.assertRaises(ValueError):verificar_decomposicao([.2,-.3,.7],.1,.9)
