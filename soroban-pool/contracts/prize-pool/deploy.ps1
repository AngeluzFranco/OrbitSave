#!/usr/bin/env pwsh
# Script de despliegue para OrbitSave Prize Pool Contract (PowerShell)

# Variables de configuración
$NETWORK = "testnet"
$RPC_HOST = "https://soroban-testnet.stellar.org"
$NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"

# USDC Contract ID en Testnet
$USDC_TOKEN = "CBBD47AB7C010CB047B7DFC3CA3B51D0D3C20ECC3C0426800551168886474B0A"

# Parámetros del contrato
$PERIOD_SECS = 3600  # 1 hora
$APR_BPS = 500       # 5%

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OrbitSave Prize Pool - Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Validar que Soroban CLI esté instalado
if (-not (Get-Command soroban -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Soroban CLI no encontrado. Instálalo desde:" -ForegroundColor Red
    Write-Host "https://developers.stellar.org/docs/build/smart-contracts/smart-contracts-guide#install-the-stellar-cli"
    exit 1
}

# Validar que Rust esté instalado
if (-not (Get-Command cargo -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Cargo no encontrado. Instala Rust desde:" -ForegroundColor Red
    Write-Host "https://rustup.rs/"
    exit 1
}

# Solicitar datos del usuario
Write-Host "Por favor proporciona los siguientes datos:" -ForegroundColor Yellow
$ADMIN_KEY = Read-Host "Clave privada del admin (Starting with S)"
$ADMIN_ADDRESS = Read-Host "Dirección pública del admin"

if ([string]::IsNullOrWhiteSpace($ADMIN_KEY) -or [string]::IsNullOrWhiteSpace($ADMIN_ADDRESS)) {
    Write-Host "Error: Debes proporcionar la clave privada y dirección." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuración:" -ForegroundColor Green
Write-Host "- Network: $NETWORK"
Write-Host "- RPC: $RPC_HOST"
Write-Host "- Admin: $ADMIN_ADDRESS"
Write-Host "- Token (USDC): $USDC_TOKEN"
Write-Host "- Período: $PERIOD_SECS segundos"
Write-Host "- APR: $APR_BPS bps (5%)"
Write-Host ""

# Paso 1: Build Release
Write-Host "Paso 1: Compilando el contrato (release)..." -ForegroundColor Yellow
cargo build --target wasm32-unknown-unknown --release
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error durante la compilación" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Compilación exitosa" -ForegroundColor Green
Write-Host ""

# Paso 2: Deploy
Write-Host "Paso 2: Desplegando el contrato en $NETWORK..." -ForegroundColor Yellow
$DeployOutput = soroban contract deploy `
    --wasm target/wasm32-unknown-unknown/release/prize_pool.wasm `
    --network $NETWORK `
    --source $ADMIN_KEY `
    --json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error durante el despliegue:" -ForegroundColor Red
    Write-Host $DeployOutput
    exit 1
}

$CONTRACT_ID = $DeployOutput | ConvertFrom-Json | Select-Object -ExpandProperty result

Write-Host "✓ Contrato desplegado exitosamente" -ForegroundColor Green
Write-Host "✓ Contract ID: $CONTRACT_ID" -ForegroundColor Green
Write-Host ""

# Paso 3: Inicializar
Write-Host "Paso 3: Inicializando el contrato..." -ForegroundColor Yellow
soroban contract invoke `
    --id $CONTRACT_ID `
    --network $NETWORK `
    --source $ADMIN_KEY `
    --fn init `
    -- `
    --admin $ADMIN_ADDRESS `
    --token $USDC_TOKEN `
    --period_secs $PERIOD_SECS `
    --apr_bps $APR_BPS

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error durante la inicialización" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Inicialización exitosa" -ForegroundColor Green
Write-Host ""

# Guardar configuración
Write-Host "Paso 4: Guardando configuración..." -ForegroundColor Yellow
$Config = @{
    CONTRACT_ID = $CONTRACT_ID
    NETWORK = $NETWORK
    RPC_HOST = $RPC_HOST
    ADMIN = $ADMIN_ADDRESS
    TOKEN = $USDC_TOKEN
    PERIOD_SECS = $PERIOD_SECS
    APR_BPS = $APR_BPS
    TIMESTAMP = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
}

$ConfigJson = $Config | ConvertTo-Json
$ConfigJson | Out-File -FilePath ".contract-config.json" -Encoding UTF8

Write-Host "✓ Configuración guardada en .contract-config.json" -ForegroundColor Green
Write-Host ""

# Resumen
Write-Host "========================================" -ForegroundColor Green
Write-Host "✓ Despliegue Completado Exitosamente" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Datos importantes:" -ForegroundColor Cyan
Write-Host "Contract ID: $CONTRACT_ID"
Write-Host "Admin: $ADMIN_ADDRESS"
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Guarda el CONTRACT_ID (necesario para frontend)"
Write-Host "2. Comparte la configuración con tu frontend (.env)"
Write-Host "3. Abre en Stellar Expert para verificar:"
Write-Host "   https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
Write-Host ""
