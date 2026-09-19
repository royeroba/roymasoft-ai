<#
.SYNOPSIS
    Instala roymasoft-ai en un repositorio destino.

.DESCRIPTION
    Fase 1: solo proyecta el harness a los cinco agentes. Los componentes externos
    (engram, CBM, Context7, rtk) entran en la fase 4 y todavía no se instalan.

.PARAMETER Project
    Ruta del repositorio destino. Por defecto, el directorio actual.

.EXAMPLE
    pwsh install.ps1
    pwsh install.ps1 -Project C:\proyectos\cliente-a
#>
[CmdletBinding()]
param(
    [string]$Project = (Get-Location).Path
)

$ErrorActionPreference = 'Stop'

$harness = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = Resolve-Path -LiteralPath $Project -ErrorAction SilentlyContinue

if (-not $target) {
    Write-Error "El destino no existe: $Project"
    exit 1
}

if ($target.Path -eq $harness) {
    Write-Error "Ejecuta esto contra un repositorio destino, no contra el harness."
    exit 1
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Error "Node no está en el PATH. roymasoft-ai lo necesita para la proyección."
    exit 1
}

& node (Join-Path $harness 'build/project.mjs') $target.Path
if ($LASTEXITCODE -ne 0) {
    Write-Error "La proyección falló con código $LASTEXITCODE"
    exit $LASTEXITCODE
}

Write-Host ""
Write-Host "Siguiente paso: reinicia tu agente y pídele algo ambiguo." -ForegroundColor Cyan
Write-Host "Debe preguntar en vez de asumir, y responder sin preámbulo." -ForegroundColor Cyan
