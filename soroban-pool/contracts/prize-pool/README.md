# OrbitSave - Prize Pool Smart Contract

Contrato inteligente Soroban para el sistema de **lotería sin pérdida** (Prize-Linked Savings) de OrbitSave.

## 🎯 Funcionalidades

### Funciones Principales

- **`init(admin, token, period_secs, apr_bps)`**  
  Inicializa el pool con la configuración.
  - `admin`: Dirección del administrador
  - `token`: Dirección del token (ej: USDC)
  - `period_secs`: Duración del período de sorteo (segundos)
  - `apr_bps`: APR en basis points (500 = 5%)

- **`deposit(from, amount)`**  
  Deposita tokens en el pool.

- **`withdraw(to, amount)`**  
  Retira tokens sin penalización del principal.

- **`commit_seed(from, seed_hash)`**  
  Fase 1 del commit-reveal para aleatoriedad.

- **`reveal_seed(from, seed)`**  
  Fase 2 del commit-reveal.

- **`draw()`**  
  Ejecuta el sorteo y selecciona un ganador.

### Funciones de Lectura

- **`get_balance(who)`** → `i128`  
  Saldo del usuario.

- **`get_total_deposited()` → `i128`  
  Total depositado en el pool.

- **`get_config()` → `PoolConfig`  
  Configuración del pool.

- **`get_time_remaining()` → `u64`  
  Tiempo restante del período (segundos).

- **`get_win_probability(who)` → `u32`  
  Probabilidad aproximada de ganar (en basis points).

## 🛠️ Compilación

### Build Debug
```bash
make build
# o
cargo build --target wasm32-unknown-unknown
```

### Build Release (Optimizado)
```bash
make build-release
# o
cargo build --target wasm32-unknown-unknown --release
```

### Tests
```bash
make test
# o
cargo test
```

## 🚀 Despliegue

### 1. Compilar primero
```bash
make build-release
```

### 2. Desplegar en Testnet
```bash
# Configurar variables de entorno
export STELLAR_SOURCE=<TU_CUENTA_PÚBLICA>
export SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
export SOROBAN_RPC_HOST="https://soroban-testnet.stellar.org"

# Desplegar
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/prize_pool.wasm \
  --network testnet \
  --source $STELLAR_SOURCE
```

O usando el Makefile:
```bash
CONTRACT_ID=<id> STELLAR_SOURCE=<cuenta> make deploy
```

### 3. Inicializar el contrato
```bash
ADMIN_ADDRESS=<dirección_admin>
USDC_TOKEN_ID=<usdc_testnet_id>  # CBBD47AB7C010CB047B7DFC3CA3B51D0D3C20ECC3C0426800551168886474B0A
PERIOD_SECS=3600  # 1 hora
APR_BPS=500       # 5%

soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source $ADMIN_ADDRESS \
  --fn init \
  -- \
  --admin $ADMIN_ADDRESS \
  --token $USDC_TOKEN_ID \
  --period_secs $PERIOD_SECS \
  --apr_bps $APR_BPS
```

## 📋 Estructura del Código

```
src/
├── lib.rs          # Contrato principal (tipos + implementación)
└── test.rs         # Suite de tests
```

### Tipos Principales

**PoolConfig**
```rust
pub struct PoolConfig {
    pub admin: Address,
    pub token: Address,
    pub period_secs: u64,
    pub apr_bps: u32,
    pub created_at: u64,
}
```

**UserDeposit**
```rust
pub struct UserDeposit {
    pub amount: i128,
    pub deposited_at: u64,
}
```

**DataKey** (enumeración de claves de almacenamiento)
- `Config`: Configuración del pool
- `TotalDeposited`: Total acumulado
- `UserDeposit(Address)`: Depósito individual
- `PeriodStart`: Timestamp de inicio del período
- `CurrentWinner`: Ganador actual
- `SeedCommit(Address)`: Hash comprometido
- `SeedRevealed(Address)`: Seed revelado
- `DrawExecuted`: Indicador de sorteo ejecutado
- `PrizeAmount`: Monto del premio

## 🔐 Seguridad (MVP)

- **Autenticación**: Todas las funciones críticas requieren firma (`require_auth()`)
- **Validaciones**: Comprobación de saldos y estados
- **Aleatoriedad**: Commit-reveal básico (roadmap: VRF/Oráculo)
- **Custodia**: Los fondos permanecen en el contrato

## 📊 Eventos Emitidos

| Evento | Parámetros |
|--------|-----------|
| `init` | admin, token, period_secs |
| `deposit` | user, amount |
| `withdraw` | user, amount |
| `commit_seed` | user |
| `reveal_seed` | user |
| `draw_executed` | prize_amount, ledger_sequence |

## 🔄 Flujo de Uso

1. **Inicializar**: Admin llama `init()`
2. **Depositar**: Usuarios llaman `deposit(amount)`
3. **Esperar**: Se cierra el período
4. **Commit**: Usuarios opcionalmente hacen `commit_seed(hash)`
5. **Reveal**: Usuarios hacen `reveal_seed(seed)`
6. **Draw**: Admin llama `draw()` para ejecutar sorteo
7. **Reclamar**: Ganador recibe el premio
8. **Retirar**: Todos pueden retirar su principal sin penalización

## 📝 Notas

- El MVP usa pseudoaleatoriedad básica (ledger sequence)
- La selección de ganador está simplificada (roadmap: TWAB)
- En producción: implementar SHA-256 real, snapshot de balances, validaciones adicionales
- Testnet USDC: `CBBD47AB7C010CB047B7DFC3CA3B51D0D3C20ECC3C0426800551168886474B0A`

## 🔗 Referencias

- [Soroban Docs](https://developers.stellar.org/docs/build/smart-contracts/overview)
- [Soroban SDK Crate](https://docs.rs/soroban-sdk/)
- [Stellar Testnet](https://stellar.expert/explorer/testnet)
- [Freighter Wallet](https://www.freighter.app/)

## 📄 Licencia

Proyecto de código abierto para hackathon Stellar.
