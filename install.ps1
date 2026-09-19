<#
.SYNOPSIS
    Instala y proyecta roymasoft-ai.

.DESCRIPTION
    Tres modos, ninguno implícito:

      -Project <ruta>   Proyecta el harness al repositorio destino. No instala nada.
      -Stack            Instala los componentes marcados `enabled = true` en stack.toml.
      -Doctor           Diagnóstico read-only. No escribe nada.

    Sin parámetros equivale a -Project en el directorio actual.

.EXAMPLE
    powershell -File install.ps1
    powershell -File install.ps1 -Project C:\proyectos\cliente-a
    powershell -File install.ps1 -Doctor
    powershell -File install.ps1 -Stack -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$Project,
    [switch]$Stack,
    [switch]$Doctor
)

$ErrorActionPreference = 'Stop'
$harness = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Step { param($m) Write-Host "  $m" }
function Write-Ok   { param($m) Write-Host "  [ ok ] $m" -ForegroundColor Green }
function Write-Warn { param($m) Write-Host "  [warn] $m" -ForegroundColor Yellow }
function Write-Bad  { param($m) Write-Host "  [fail] $m" -ForegroundColor Red }

function Test-Tool {
    param([string]$Probe)
    if (-not $Probe) { return $false }
    $exe = ($Probe -split '\s+')[0]
    return [bool](Get-Command $exe -ErrorAction SilentlyContinue)
}

<#
    Lector del subconjunto de TOML que usamos: tablas [components.x] con claves escalares.
    No es un parser general y no pretende serlo — solo lee el archivo que este repo controla.
#>
function Read-Components {
    param([string]$Path)
    $components = [ordered]@{}
    $current = $null
    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if ($trimmed -match '^\[components\.([A-Za-z0-9_-]+)\]$') {
            $current = $Matches[1]
            $components[$current] = [ordered]@{}
            continue
        }
        if ($trimmed -match '^\[') { $current = $null; continue }
        if (-not $current) { continue }
        if ($trimmed -match '^([a-z_]+)\s*=\s*(.+)$') {
            $key = $Matches[1]
            $raw = $Matches[2].Trim()
            # Un valor entrecomillado termina en su comilla de cierre; lo que siga es comentario.
            # Uno sin comillas termina en el primer '#'.
            if ($raw.StartsWith('"')) {
                $close = $raw.IndexOf('"', 1)
                if ($close -gt 0) { $value = $raw.Substring(1, $close - 1) } else { $value = $raw.Trim('"') }
            } else {
                $hash = $raw.IndexOf('#')
                if ($hash -ge 0) { $value = $raw.Substring(0, $hash).Trim() } else { $value = $raw }
            }
            $components[$current][$key] = $value
        }
    }
    return $components
}

# ── Doctor ───────────────────────────────────────────────────────────────────

function Invoke-Doctor {
    Write-Host "`nroymasoft-ai — doctor`n"

    Write-Host "Entorno"
    if (Get-Command node -ErrorAction SilentlyContinue) {
        Write-Ok "node $((node --version))"
    } else {
        Write-Bad "node no está en el PATH — la proyección no puede correr"
    }
    if (Get-Command git -ErrorAction SilentlyContinue) { Write-Ok "git" } else { Write-Warn "git no encontrado" }

    Write-Host "`nHarness"
    foreach ($required in @('behavior/_core.md', 'build/project.mjs', 'stack.toml')) {
        $path = Join-Path $harness $required
        if (Test-Path -LiteralPath $path) { Write-Ok $required } else { Write-Bad "falta $required" }
    }

    $core = Join-Path $harness 'behavior/_core.md'
    if (Test-Path -LiteralPath $core) {
        $tokens = [int]((Get-Item -LiteralPath $core).Length / 4)
        if ($tokens -le 1500) { Write-Ok "presupuesto del core: ~$tokens tokens" }
        else { Write-Warn "presupuesto del core: ~$tokens tokens (objetivo 1500)" }
    }

    $skills = Get-ChildItem -LiteralPath (Join-Path $harness 'skills') -Directory -ErrorAction SilentlyContinue |
              Where-Object { $_.Name -notlike '_*' }
    Write-Ok "$($skills.Count) skill(s): $(($skills.Name) -join ', ')"

    Write-Host "`nComponentes"
    $components = Read-Components -Path (Join-Path $harness 'stack.toml')
    foreach ($name in $components.Keys) {
        $c = $components[$name]
        $enabled = $c['enabled'] -eq 'true'
        # Sin `check` no hay binario que comprobar: el componente corre bajo demanda.
        $onDemand = [string]::IsNullOrWhiteSpace($c['check'])
        $present = if ($onDemand) { $true } else { Test-Tool $c['check'] }
        if ($onDemand) {
            if ($enabled) { Write-Ok "$name — activo (bajo demanda, sin binario)" }
            else { Write-Step "$name — desactivado (bajo demanda, sin binario)" }
            continue
        }
        if (-not $enabled -and -not $present) { Write-Step "$name — desactivado" }
        elseif (-not $enabled -and $present)  { Write-Warn "$name — instalado, pero desactivado en stack.toml" }
        elseif ($enabled -and $present)       { Write-Ok "$name — activo" }
        else                                  { Write-Bad "$name — activado pero no instalado. Corre: install.ps1 -Stack" }
    }

    Write-Host "`nRecuerda: activa solo los MCP del cliente en el que estás trabajando.`n"
}

# ── Stack ────────────────────────────────────────────────────────────────────

function Invoke-Stack {
    Write-Host "`nroymasoft-ai — instalación de componentes`n"

    $components = Read-Components -Path (Join-Path $harness 'stack.toml')
    $enabled = $components.Keys | Where-Object { $components[$_]['enabled'] -eq 'true' }

    if (-not $enabled) {
        Write-Warn "Ningún componente activado en stack.toml."
        Write-Step "Edita stack.toml y pon `enabled = true` en el que quieras. Adóptalos de uno en uno."
        return
    }

    foreach ($name in $enabled) {
        $c = $components[$name]
        if (Test-Tool $c['check']) {
            Write-Ok "$name ya está instalado"
            continue
        }
        $cmd = $c['install']
        if (-not $cmd -or $cmd -like '(no requiere*') {
            Write-Ok "$name no necesita instalación"
            continue
        }
        if ($PSCmdlet.ShouldProcess($name, "ejecutar: $cmd")) {
            Write-Step "$name -> $cmd"
            try {
                Invoke-Expression $cmd
                if (Test-Tool $c['check']) { Write-Ok "$name instalado" }
                else { Write-Warn "${name}: el comando terminó pero la comprobación sigue fallando" }
            } catch {
                Write-Bad "$name falló: $($_.Exception.Message)"
            }
        }
    }

    Write-Host "`nRegistra los MCP en tu agente con los perfiles de stack.toml."
    Write-Host "Los perfiles NO son opcionales: sin ellos el ahorro de tokens se anula.`n"
}

# ── Project ──────────────────────────────────────────────────────────────────

function Invoke-Project {
    param([string]$Path)

    $target = Resolve-Path -LiteralPath $Path -ErrorAction SilentlyContinue
    if (-not $target) { Write-Error "El destino no existe: $Path"; exit 1 }
    if ($target.Path -eq $harness) { Write-Error "Ejecuta esto contra un repositorio destino, no contra el harness."; exit 1 }
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node no está en el PATH. roymasoft-ai lo necesita para la proyección."
        exit 1
    }

    & node (Join-Path $harness 'build/project.mjs') $target.Path
    if ($LASTEXITCODE -ne 0) { Write-Error "La proyección falló con código $LASTEXITCODE"; exit $LASTEXITCODE }

    Write-Host ""
    Write-Host "Siguiente: reinicia tu agente y pídele algo ambiguo." -ForegroundColor Cyan
    Write-Host "Debe preguntar en vez de asumir, y responder sin preámbulo." -ForegroundColor Cyan
    if (-not (Test-Path -LiteralPath (Join-Path $target.Path 'PROJECT.md'))) {
        Write-Host "Este repo no tiene PROJECT.md. Corre /onboard-repo para generarlo." -ForegroundColor Cyan
    }
}

# ── Main ─────────────────────────────────────────────────────────────────────

if ($Doctor) { Invoke-Doctor; exit 0 }
if ($Stack)  { Invoke-Stack;  exit 0 }

# Sin ternario: Windows PowerShell 5.1 no lo soporta y este script tiene que correr ahí.
if ($Project) { $targetPath = $Project } else { $targetPath = (Get-Location).Path }
Invoke-Project -Path $targetPath
