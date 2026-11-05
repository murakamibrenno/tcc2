# Pipeline completo — corpus auto + experimentos
Set-Location $PSScriptRoot
$py = ".venv\Scripts\python.exe"
& $py expandir_corpus_auto.py --total 80 --incluir-piloto
& $py tfidf_piloto.py
& $py embeddings_piloto.py
& $py exportar_piloto_ui.py
& $py avaliar_ranking.py
& $py classificar_piloto.py
& $py classificar_rigoroso.py
& $py correlacao_rankings.py
& $py interpretabilidade_tfidf.py
& $py particionar_dataset.py
Write-Host "`nUI: cd ..\aplicacao_mockup; npm run dev"
