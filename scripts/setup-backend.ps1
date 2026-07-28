param(
    [switch] $SkipDocker,
    [string] $SuperuserName,
    [string] $SuperuserEmail,
    [string] $SuperuserPassword
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Backend = Join-Path $Root "backend"

Set-Location $Backend

if (-not (Get-Command composer -ErrorAction SilentlyContinue)) {
    throw "Composer no esta disponible en PATH. Instala Composer y vuelve a ejecutar este script."
}

composer install

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

function Set-EnvValue {
    param(
        [string] $Key,
        [string] $Value
    )

    $envPath = ".env"
    $content = Get-Content -Raw -LiteralPath $envPath
    $escapedValue = $Value.Replace('"', '\"')
    $line = "$Key=`"$escapedValue`""

    if ($content -match "(?m)^$Key=") {
        $content = $content -replace "(?m)^$Key=.*$", $line
    } else {
        $content = $content.TrimEnd() + "`n$line`n"
    }

    Set-Content -LiteralPath $envPath -Value $content
}

$currentEnv = Get-Content -Raw -LiteralPath ".env"

if (-not $SuperuserName) {
    $SuperuserName = if ($currentEnv -match '(?m)^SUPERUSER_NAME=(.+)$' -and $matches[1].Trim()) { $matches[1].Trim('"') } else { Read-Host "Nombre del superusuario" }
}

if (-not $SuperuserEmail) {
    $SuperuserEmail = if ($currentEnv -match '(?m)^SUPERUSER_EMAIL=(.+)$' -and $matches[1].Trim()) { $matches[1].Trim('"') } else { Read-Host "Email del superusuario" }
}

if (-not $SuperuserPassword) {
    $SuperuserPassword = if ($currentEnv -match '(?m)^SUPERUSER_PASSWORD=(.+)$' -and $matches[1].Trim()) { $matches[1].Trim('"') } else { Read-Host "Password del superusuario" }
}

Set-EnvValue -Key "SUPERUSER_NAME" -Value $SuperuserName
Set-EnvValue -Key "SUPERUSER_EMAIL" -Value $SuperuserEmail
Set-EnvValue -Key "SUPERUSER_PASSWORD" -Value $SuperuserPassword

php artisan key:generate --force
php artisan jwt:secret --force

if (-not $SkipDocker) {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        Set-Location $Root
        docker compose up -d postgres
        Set-Location $Backend
    } else {
        Write-Host "Docker no esta disponible. Se omite el levantamiento automatico de PostgreSQL."
        Write-Host "Asegurate de tener PostgreSQL activo con la configuracion de backend/.env."
    }
}

php artisan migrate:fresh --seed

Write-Host ""
Write-Host "Backend listo."
Write-Host "API local: http://localhost:8000/api"
Write-Host "Superusuario: $SuperuserEmail"
Write-Host "Ejecuta: php artisan serve"
