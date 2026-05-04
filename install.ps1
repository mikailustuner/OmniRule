# ═══════════════════════════════════════════════════════════════════
#  OmniRule Universal Installer  v1.15.0  (PowerShell)
#  Usage:
#    .\install.ps1                          # local install
#    .\install.ps1 --opencode              # global OpenCode config
#    .\install.ps1 --opencode --dry-run    # preview only
#    .\install.ps1 --opencode --force      # skip prompt
#
#  If blocked by execution policy, run once:
#    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
# ═══════════════════════════════════════════════════════════════════

param(
  [switch]$opencode,
  [switch]$dryRun,
  [switch]$force,
  [switch]$help
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function ok   ($m) { Write-Host "  [+] $m" -ForegroundColor Green }
function info ($m) { Write-Host "  [i] $m" -ForegroundColor Cyan }
function warn ($m) { Write-Host "  [!] $m" -ForegroundColor Yellow }
function fail ($m) { Write-Host "  [x] $m" -ForegroundColor Red }
function step ($m) { Write-Host "`n$m" -ForegroundColor White }

function Print-Header {
  Write-Host ""
  Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Blue
  Write-Host "  ║       OmniRule Installer v1.15       ║" -ForegroundColor Blue
  Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Blue
  Write-Host ""
}

if ($help) {
  Write-Host "Usage: .\install.ps1 [--opencode] [--dry-run] [--force]"
  exit 0
}

# ─── Paths ───────────────────────────────────────────────────────
$SOURCE_DIR  = $PSScriptRoot
$OPENCODE_DIR = Join-Path $env:USERPROFILE ".config\opencode"
$TARGET_DIR  = if ($opencode) { $OPENCODE_DIR } else { Join-Path $SOURCE_DIR ".omnirule-local" }
$timestamp   = Get-Date -Format "yyyyMMdd-HHmmss"
$BACKUP_DIR  = Join-Path $TARGET_DIR ".omnirule-backup-$timestamp"

# Items to skip when copying source → target
$EXCLUDE = @(
  ".git", "node_modules", ".next", "dist", "build", "coverage",
  "omniweb",         # Next.js app — not part of the agent toolkit
  "userspec",        # handled separately
  ".omnirule-local", ".omnirule-backup-*",
  ".designrules",
  "install.sh", "install.ps1",
  ".lefthook"
)

# ─── Prereqs ─────────────────────────────────────────────────────
function Check-Prereqs {
  step "Checking prerequisites..."
  $missing = 0

  $nv = node --version 2>$null
  if ($LASTEXITCODE -eq 0) { ok "Node.js $nv" } else { fail "Node.js not found."; $missing++ }

  $npm = npm --version 2>$null
  if ($LASTEXITCODE -eq 0) { ok "npm $npm" } else { fail "npm not found."; $missing++ }

  if ($missing -gt 0) { Write-Host "`nPrerequisite check failed." -ForegroundColor Red; exit 1 }
}

# ─── Backup ──────────────────────────────────────────────────────
function Backup-Existing {
  if ($dryRun) {
    Write-Host "  [dry-run] Would back up $TARGET_DIR => $BACKUP_DIR" -ForegroundColor DarkGray
    return
  }
  if ((Test-Path $TARGET_DIR) -and (Get-ChildItem $TARGET_DIR -ErrorAction SilentlyContinue)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
    Get-ChildItem $TARGET_DIR | Where-Object { $_.Name -notlike ".omnirule-backup-*" } | ForEach-Object {
      Copy-Item $_.FullName (Join-Path $BACKUP_DIR $_.Name) -Recurse -Force -ErrorAction SilentlyContinue
    }
    ok "Backup: $BACKUP_DIR"
  } else {
    info "Fresh install — no backup needed"
  }
}

# ─── Existing check ───────────────────────────────────────────────
function Check-Existing {
  if (-not (Test-Path $TARGET_DIR)) { return }
  if (-not (Get-ChildItem $TARGET_DIR -ErrorAction SilentlyContinue)) { return }

  if ($dryRun) { warn "Existing config found (dry-run, skipping prompt)"; return }
  if ($force)  { warn "Existing config found — overwriting (--force)";    return }

  Write-Host ""
  warn "Existing config found at: $TARGET_DIR"
  Write-Host "  OmniRule files will be backed up before overwriting." -ForegroundColor DarkGray
  $answer = Read-Host "  Continue? [y/N]"
  if ($answer -notmatch "^[Yy]$") { Write-Host "Aborted."; exit 0 }
}

# ─── Copy everything ─────────────────────────────────────────────
function Deploy-All {
  step "Deploying assets..."
  $count = 0

  Get-ChildItem $SOURCE_DIR -Force | ForEach-Object {
    $name = $_.Name

    # Check exclusions (support wildcards)
    $skip = $false
    foreach ($ex in $EXCLUDE) {
      if ($name -like $ex) { $skip = $true; break }
    }
    if ($skip) { return }

    if ($dryRun) {
      Write-Host "  [dry-run] $name" -ForegroundColor DarkGray
    } else {
      Copy-Item $_.FullName (Join-Path $TARGET_DIR $name) -Recurse -Force
    }
    ok $name
    $count++
  }

  info "$count items deployed"
}

# ─── opencode.json ────────────────────────────────────────────────
function Deploy-OpencodeJson {
  $src = Join-Path $SOURCE_DIR "userspec\opencode.json"
  if (-not (Test-Path $src)) { return }

  if ($dryRun) {
    Write-Host "  [dry-run] userspec\opencode.json => opencode.json (patched)" -ForegroundColor DarkGray
    return
  }

  $dst = Join-Path $TARGET_DIR "opencode.json"
  Copy-Item $src $dst -Force

  # Patch {{CONFIG_DIR}} — normalize to forward slashes for JSON compatibility
  $normalized = $TARGET_DIR -replace '\\', '/'
  $content = Get-Content $dst -Raw -Encoding UTF8
  $patched  = $content -replace '\{\{CONFIG_DIR\}\}', $normalized
  Set-Content $dst $patched -Encoding UTF8 -NoNewline
  ok "opencode.json => patched"
}

# ─── Validate references ──────────────────────────────────────────
function Validate-Refs {
  if ($dryRun) { return }
  $json = Join-Path $TARGET_DIR "opencode.json"
  if (-not (Test-Path $json)) { return }

  step "Validating file references..."
  $missing = 0
  $content = Get-Content $json -Raw
  $refs = [regex]::Matches($content, '(?<=\{file:)[^}]+') | ForEach-Object { $_.Value }

  foreach ($ref in $refs) {
    $full = Join-Path $TARGET_DIR $ref
    if (-not (Test-Path $full)) {
      warn "Missing: $ref"
      $missing++
    }
  }
  if ($missing -eq 0) { ok "All {file:...} references resolved" }
  else                { warn "$missing reference(s) unresolved — check above" }
}

# ─── npm install ─────────────────────────────────────────────────
function Run-NpmInstall {
  if (-not (Test-Path (Join-Path $TARGET_DIR "package.json"))) { return }
  if ($dryRun) { Write-Host "  [dry-run] npm install" -ForegroundColor DarkGray; return }

  step "Installing dependencies..."
  Push-Location $TARGET_DIR
  try {
    npm install --prefer-offline --no-fund --no-audit 2>&1 |
      Where-Object { $_ -match "added|updated|warn|error" } |
      Select-Object -First 10 |
      ForEach-Object { Write-Host "  $_" -ForegroundColor DarkGray }
    ok "npm install complete"
  } finally { Pop-Location }
}

# ─── Main ────────────────────────────────────────────────────────
Print-Header
info "OS:     Windows (PowerShell)"
info "Mode:   $(if ($opencode) { 'Global OpenCode' } else { 'Local' })"
info "Source: $SOURCE_DIR"
info "Target: $TARGET_DIR"
if ($dryRun) { warn "DRY RUN — no files written" }
if ($force)  { warn "FORCE — no confirmation prompt" }

Check-Prereqs
Check-Existing
if (-not $dryRun) { New-Item -ItemType Directory -Path $TARGET_DIR -Force | Out-Null }

Backup-Existing
Deploy-All
Deploy-OpencodeJson
Validate-Refs
Run-NpmInstall

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   Installation complete!  ✔          ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
info "Installed to: $TARGET_DIR"
if (Test-Path $BACKUP_DIR) { info "Backup:       $BACKUP_DIR" }

if ($opencode) {
  Write-Host ""
  Write-Host "  Next steps:" -ForegroundColor White
  Write-Host "  1. Open OpenCode in your project"
  Write-Host "  2. OmniRule fleet is globally available"
  Write-Host "  3. Try: /orchestrate <your task>" -ForegroundColor Cyan
  Write-Host ""
  warn "If blocked by execution policy, run once:"
  Write-Host "  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned" -ForegroundColor DarkGray
}
Write-Host ""
