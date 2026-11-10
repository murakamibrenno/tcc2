# Interpretabilidade do experimento atual

Inspeção posterior à avaliação, sem retreinar por seus resultados, mudar rótulos, limiares ou escolher hiperparâmetros. Os cinco casos são os mesmos da auditoria definida antes das métricas, e não foram selecionados para mostrar acertos.

- TF-IDF + Regressão Logística com pesos: contribuição local de cada termo para o contraste logit Adequado menos logit Inadequado. Soma das contribuições e intercepto confere com a margem completa (tolerância absoluta 1e-9). O contraste não cobre sozinho a classe Parcial.
- TF-IDF + XGBoost com pesos: importância global de features, sem direção e sem atribuição local. Não foi implementado SHAP ou LIME.
- BGE + Regressão Logística e Qwen + SVM com pesos: oito blocos de tokens por caso, oitenta intervenções no total. Zera-se a attention mask, conservando IDs, posições e primeiro token; a média Qwen usa a mesma máscara. Nenhum token fora da janela de 512 é revelado.
- Delta = valor original menos valor mascarado. LR usa logit Adequado; SVM usa margem OvR agregada, que não é probabilidade e pode mudar com os votos das comparações. Também se registra a variação do cosseno da vaga.

As predições dos quatro classificadores nos 97 casos foram reproduzidas exatamente. As reencodificações sem máscaras conferiram com o cache denso (tolerâncias relativas/absolutas 2e-4). Os cinco contrastes lexicais foram verificados. No exame denso, só cerca de 2.155 a 3.079 caracteres estavam acessíveis, embora a entrada permita até 8.000. O currículo curto de 2.204 caracteres coube inteiro. Evidências posteriores podem não influenciar a predição.

Nos cinco casos, a oclusão alterou a classe de um caso BGE em uma intervenção e de dois casos Qwen em três intervenções. Isso registra sensibilidade a máscaras artificiais, sem estabelecer causalidade, fidelidade semântica ou verdade sobre competências. Não valida os rótulos da IA. As demais previsões não mudarem de classe também não demonstra robustez geral.

## Reprodução

```powershell
cd piloto_tfidf
python interpretar_experimento_atual.py --escala CAMINHO_VETORES_V1 --saida NOVA_SAIDA
python exportar_experimento_atual_ui.py --escala CAMINHO_VETORES_V1 --interpretacao output/interpretabilidade_atual_v1/interpretabilidade_atual.json
```

São necessários os textos processados, manifestos, vetores/cache e revisões fixadas dos modelos. O programa não sobrescreve interpretação existente. A interface apresenta resultados pré-calculados; não é serviço de inferência em tempo real.
