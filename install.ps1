<#
.SYNOPSIS
    Envoltorio de compatibilidad. El instalador real es el CLI de Node.

.DESCRIPTION
    A partir de v0.2.0 la lógica vive en bin/roymasoft.mjs: una sola implementación que corre
    en Windows, macOS y Linux, en vez de dos que se desincronizan.

    Usa directamente:
      node bin/roymasoft.mjs init [ruta]
      node bin/roymasoft.mjs doctor
      node bin/roymasoft.mjs sync
      node bin/roymasoft.mjs update

    Este script traduce los flags antiguos y reenvía.
#>
[CmdletBinding()]
param(
    [string]$Project,
    [switch]$Stack,
    [switch]$Doctor
)

$ErrorActionPreference = 'Stop'
$harness = Split-Path -Parent $MyInvocation.MyCommand.Path
$cli = Join-Path $harness 'bin/roymasoft.mjs'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node no esta en el PATH. roymasoft-ai lo necesita."
    exit 1
}

Write-Host "install.ps1 esta obsoleto. Usa: node bin/roymasoft.mjs <comando>" -ForegroundColor Yellow
Write-Host ""

if ($Doctor) {
    & node $cli doctor
    exit $LASTEXITCODE
}

# -Stack ya no existe por separado: init detecta, reporta y pregunta antes de instalar.
if ($Stack) {
    Write-Host "-Stack se integro en 'init'. Reenviando a: init --yes" -ForegroundColor Yellow
    if ($Project) { & node $cli init $Project --yes } else { & node $cli init --yes }
    exit $LASTEXITCODE
}

if ($Project) { & node $cli init $Project } else { & node $cli init }
exit $LASTEXITCODE
