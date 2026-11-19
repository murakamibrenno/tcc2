import sys,unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]))
from experimento_janela_equivalente import prefixo_comum

class FakeTokenizer:
    def __init__(self,width=1,special=0,inflate_prefix=None):self.width=width;self.special=special;self.inflate_prefix=inflate_prefix
    def __call__(self,text,add_special_tokens=True,truncation=False,max_length=None,return_offsets_mapping=False):
        offsets=[(i,min(i+self.width,len(text))) for i in range(0,len(text),self.width)]
        if text==self.inflate_prefix:offsets += [(len(text)-1,len(text))]
        values=[(0,0)]*self.special+offsets
        if truncation:values=values[:max_length]
        result={'input_ids':list(range(len(values)))}
        if return_offsets_mapping:result['offset_mapping']=values
        return result

class PrefixoComum(unittest.TestCase):
    def test_usa_conteudo_comum_e_nao_numero_igual_de_tokens(self):
        text,counts=prefixo_comum('abcdefghij',{'bge':FakeTokenizer(1,2),'qwen':FakeTokenizer(2)},6)
        self.assertEqual(text,'abcd');self.assertEqual(counts,{'bge':6,'qwen':2})
    def test_recua_quando_retokenizacao_muda_fronteira(self):
        text,counts=prefixo_comum('abcdef',{'a':FakeTokenizer(inflate_prefix='abcd'),'b':FakeTokenizer()},4)
        self.assertEqual(text,'abc');self.assertTrue(all(n<=4 for n in counts.values()))
    def test_preserva_unicode_e_prefixo_e_retira_so_espaco_final(self):
        original='ação 技术  '
        text,counts=prefixo_comum(original,{'a':FakeTokenizer(),'b':FakeTokenizer(2)},50)
        self.assertEqual(text,'ação 技术');self.assertTrue(original.startswith(text))
    def test_rejeita_entrada_sem_conteudo_ou_sem_tokenizers(self):
        with self.assertRaises(ValueError):prefixo_comum('  ',{'a':FakeTokenizer()})
        with self.assertRaises(ValueError):prefixo_comum('abc',{})

if __name__=='__main__':unittest.main()
