import sys
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from conferir_textos_processados import comparar_tokens, tokens_conferencia


class TextosProcessadosTests(unittest.TestCase):
    def test_pagina_sem_conteudo_nao_vira_texto_valido(self):
        self.assertEqual(tokens_conferencia("--- PAGE 1 ---\n"), [])

    def test_perda_de_simbolos_de_linguagem_e_detectada(self):
        result = comparar_tokens("C# C++ SQL SQL", "C C SQL")
        self.assertEqual(result["perdas_tokens"], {"#": 1, "+": 2, "sql": 1})
        self.assertLess(result["cobertura_tokens_pdf"], 1)

    def test_cobertura_nao_e_teste_de_semantica(self):
        result = comparar_tokens("not using git", "using git not")
        self.assertEqual(result["cobertura_tokens_pdf"], 1)
        self.assertIsNone(comparar_tokens("", "texto")["cobertura_tokens_pdf"])
