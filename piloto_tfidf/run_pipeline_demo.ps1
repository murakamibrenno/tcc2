# Preflight seguro: não seleciona corpus, não treina e não sobrescreve resultados.
param([string]$Python = (Join-Path $PSScriptRoot '.venv\Scripts\python.exe'))
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $Python)) {
    throw 'Informe -Python com o caminho do intérprete configurado para o projeto.'
}
Push-Location $PSScriptRoot
try {
    & $Python validar_experimento.py --saida validation/relatorio_validacao.json
    $validationExitCode = $LASTEXITCODE
    Write-Host 'A interface exibe os resultados anteriores. Inicie-a separadamente com npm run dev.'
    Write-Host 'Consulte ../VALIDACAO_PRATICA_CHECKLIST.md antes de recalcular o experimento.'
} finally {
    Pop-Location
}
exit $validationExitCode
