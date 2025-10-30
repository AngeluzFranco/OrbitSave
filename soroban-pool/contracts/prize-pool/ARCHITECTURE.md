# 📦 Estructura del Contrato PrizePool

```
prize-pool/
├── Cargo.toml                 # Configuración del proyecto Rust
├── Makefile                   # Comandos de compilación/despliegue
├── README.md                  # Guía rápida
├── TECHNICAL.md               # Documentación técnica completa
├── .env.example               # Ejemplo de variables de entorno
├── deploy.ps1                 # Script de despliegue (PowerShell)
└── src/
    ├── lib.rs                 # Contrato principal
    └── test.rs                # Tests unitarios
```

## 📊 Flujo de Datos

```
Usuario A          Usuario B          Usuario C
   │                 │                  │
   ├──────────┬──────┴──────┬───────────┤
   │          │             │           │
   ▼          ▼             ▼           ▼
┌──────────────────────────────────────────┐
│     PrizePool Smart Contract             │
│  - Almacenamiento de depósitos           │
│  - Lógica de sorteo                      │
│  - Gestión de premios                    │
└──────────────────────────────────────────┘
   │
   └──► USDC Token Contract (Testnet)
        - transfer_from()
        - transfer()
```

## 🔄 Ciclo de Vida del Pool

```
1. INIT (Admin)
   └─> Configuración del pool (período, APR)

2. DEPÓSITO (Usuarios)
   ├─> Usuario A deposita 100 USDC
   ├─> Usuario B deposita 50 USDC
   └─> Usuario C deposita 200 USDC
       └─> Total: 350 USDC

3. PERÍODO ABIERTO (Countdown)
   ├─> Usuarios pueden ver probabilidades
   ├─> Usuarios pueden retirar (sin penalización)
   └─> Duración: 3600 segundos (configurable)

4. COMMIT-REVEAL (Aleatoriedad)
   ├─> commit_seed() - usuarios guardan hash
   └─> reveal_seed() - usuarios revelan seed

5. DRAW (Admin)
   ├─> Verifica que período haya terminado
   ├─> Calcula premio (350 * 500 / 10000 = 17.5 USDC)
   ├─> Selecciona ganador (algoritmo: ponderado por balance)
   └─> Emite evento draw_executed

6. RECLAMACIÓN (Ganador)
   └─> Ganador recibe 17.5 USDC

7. RETIRO (Todos)
   └─> Usuarios retiran su principal (sin penalización)

8. RESETEO
   └─> Comienza nuevo período (volver a paso 2)
```

## 🎯 Casos de Uso

### Caso 1: Depósito Exitoso
```
Usuario: "Quiero depositar 100 USDC"
    ↓
Autenticación: ✓ Firma requerida
    ↓
Validación: ✓ Saldo disponible
    ↓
Transferencia: 100 USDC → Contrato
    ↓
Almacenamiento: UserDeposit actualizado
    ↓
Evento: "deposit" emitido
    ↓
Resultado: ✓ Éxito
```

### Caso 2: Retiro Parcial
```
Usuario: "Quiero retirar 30 USDC"
    ↓
Autenticación: ✓ Firma requerida
    ↓
Validación: ✓ Balance = 100, Retiro = 30 (OK)
    ↓
Transferencia: 30 USDC → Usuario
    ↓
Almacenamiento: UserDeposit = 70
    ↓
Evento: "withdraw" emitido
    ↓
Resultado: ✓ Éxito, balance restante: 70 USDC
```

### Caso 3: Sorteo
```
Admin: "Ejecutar sorteo"
    ↓
Verificaciones:
  ✓ Admin autenticado
  ✓ Período terminado
  ✓ Hay depósitos en pool
    ↓
Cálculos:
  - Total: 350 USDC
  - APR: 500 bps = 5%
  - Premio: 17.5 USDC
    ↓
Selección de ganador:
  - Algoritmo pseudoaleatorio (MVP)
  - Ponderado por balance
  - Ganador: Usuario C
    ↓
Evento: "draw_executed" con premio=17.5
    ↓
Estado: DrawExecuted = true
    ↓
Resultado: ✓ Sorteo completado, ganador seleccionado
```

## 📈 Estadísticas del MVP

| Métrica | Valor |
|---------|-------|
| Período default | 3600 seg (1 hora) |
| APR educativo | 500 bps (5%) |
| Mínimo depósito | 1 (configurable) |
| Máximo depósito | i128::MAX |
| Token de prueba | USDC Testnet |
| Red | Stellar Testnet |
| Almacenamiento | Instance storage |
| Gas típico | ~5-10K stroops |

## 🔐 Matriz de Seguridad

| Función | Autenticación | Validación | Gas |
|---------|---------------|-----------|-----|
| init | ✓ Admin | Config | Alto |
| deposit | ✓ Usuario | Amount > 0 | Medio |
| withdraw | ✓ Usuario | Balance OK | Medio |
| commit_seed | ✓ Usuario | Seed present | Bajo |
| reveal_seed | ✓ Usuario | Hash match | Bajo |
| draw | ✓ Admin | Period end | Alto |
| get_balance | ✗ Lectura | N/A | Bajo |
| get_total | ✗ Lectura | N/A | Bajo |

## 🚀 Pasos para Desplegar

### 1. Compilar
```bash
make build-release
```

### 2. Desplegar
```bash
CONTRACT_ID=xxx STELLAR_SOURCE=Sxxx make deploy
```

O usar el script:
```bash
pwsh deploy.ps1
```

### 3. Verificar
```bash
https://stellar.expert/explorer/testnet/contract/{CONTRACT_ID}
```

## 📝 Eventos en Tiempo Real

Cada acción emite un evento que puede ser monitoreado:

```
LEDGER → Events
  ├─ init(admin, token, period_secs)
  ├─ deposit(user, amount)
  ├─ deposit(user, amount)
  ├─ withdraw(user, amount)
  ├─ commit_seed(user)
  ├─ reveal_seed(user)
  ├─ draw_executed(prize_amount, sequence)
  └─ deposit(user, amount)  ← nuevo período
```

## 💾 Persistencia de Datos

```
Ledger (Blockchain Stellar)
    ↓
Soroban Instance Storage
    ↓
DataKey mapping:
  - Config → PoolConfig
  - TotalDeposited → i128
  - UserDeposit(addr) → UserDeposit
  - PeriodStart → u64
  - DrawExecuted → bool
  - SeedCommit(addr) → BytesN<32>
  - SeedRevealed(addr) → Bytes
  - CurrentWinner → Address
  - PrizeAmount → i128
```

## 🔗 Integración Frontend

Frontend debe llamar a través de RPC:

```
Frontend (Next.js)
    ↓ (Freighter firma)
    ↓
Stellar RPC (Testnet)
    ↓ (envía transacción)
    ↓
Soroban Network
    ↓ (ejecuta contrato)
    ↓
PrizePool Contract
    ↓ (emite eventos)
    ↓
Frontend (escucha eventos)
    ↓
UI Actualizada
```

---

**Creado**: 29 de octubre de 2025  
**Estado**: MVP Funcional  
**Red**: Stellar Testnet  
**Próximo Paso**: Integración Frontend + Despliegue
