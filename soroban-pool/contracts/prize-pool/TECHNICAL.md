# OrbitSave Prize Pool - Documentación Técnica Completa

## 📑 Índice
1. [Arquitectura](#arquitectura)
2. [Tipos de Datos](#tipos-de-datos)
3. [Funciones Disponibles](#funciones-disponibles)
4. [Almacenamiento](#almacenamiento)
5. [Eventos](#eventos)
6. [Seguridad](#seguridad)
7. [Roadmap](#roadmap)

---

## Arquitectura

El contrato **PrizePool** implementa un sistema de lotería sin pérdida (Prize-Linked Savings) en Soroban con las siguientes capas:

```
┌─────────────────────────────────────────┐
│   Frontend (React/Next.js)              │
│   - Conexión Freighter                  │
│   - Depósito/Retiro                     │
│   - Visualización de probabilidades     │
└────────────┬────────────────────────────┘
             │ Transacciones firmadas
             ▼
┌─────────────────────────────────────────┐
│   PrizePool Contract (Soroban)          │
│   - init()                              │
│   - deposit()                           │
│   - withdraw()                          │
│   - commit_seed() / reveal_seed()       │
│   - draw()                              │
│   - Lecturas: get_balance(), etc.       │
└────────────┬────────────────────────────┘
             │ Invocaciones
             ▼
┌─────────────────────────────────────────┐
│   Token Contract (USDC en Testnet)      │
│   - transfer_from()                     │
│   - transfer()                          │
└─────────────────────────────────────────┘
```

---

## Tipos de Datos

### PoolConfig
```rust
pub struct PoolConfig {
    pub admin: Address,          // Admin que controla el contrato
    pub token: Address,          // Dirección del token (USDC)
    pub period_secs: u64,        // Duración de cada período (segundos)
    pub apr_bps: u32,            // APR en basis points (500 = 5%)
    pub created_at: u64,         // Timestamp de creación
}
```

### UserDeposit
```rust
pub struct UserDeposit {
    pub amount: i128,            // Cantidad depositada (en tokens)
    pub deposited_at: u64,       // Timestamp del depósito
}
```

### DataKey (Almacenamiento)
```rust
pub enum DataKey {
    Config,                      // PoolConfig
    TotalDeposited,             // i128 (total en pool)
    UserDeposit(Address),       // UserDeposit por usuario
    PeriodStart,                // u64 (timestamp inicio)
    CurrentWinner,              // Address del ganador actual
    SeedCommit(Address),        // BytesN<32> (hash del seed)
    SeedRevealed(Address),      // Bytes (seed original)
    DrawExecuted,               // bool
    PrizeAmount,                // i128
}
```

---

## Funciones Disponibles

### 1. init()
**Propósito**: Inicializar el contrato

```rust
pub fn init(
    env: Env,
    admin: Address,
    token: Address,
    period_secs: u64,
    apr_bps: u32,
)
```

**Autenticación**: Requiere firma del `admin`

**Efectos**:
- Almacena la configuración del pool
- Inicializa contadores a 0
- Emite evento `init`

**Ejemplo de uso** (Soroban CLI):
```bash
soroban contract invoke \
  --id $CONTRACT_ID \
  --fn init \
  --source $ADMIN_KEY \
  -- \
  --admin $ADMIN_ADDRESS \
  --token $USDC_TOKEN_ID \
  --period_secs 3600 \
  --apr_bps 500
```

---

### 2. deposit()
**Propósito**: Depositar tokens en el pool

```rust
pub fn deposit(env: Env, from: Address, amount: i128)
```

**Autenticación**: Requiere firma de `from`

**Precondiciones**:
- `amount > 0`
- Pool debe estar inicializado
- Usuario debe tener suficientes tokens

**Efectos**:
- Transfiere `amount` tokens de `from` al contrato
- Actualiza el saldo del usuario
- Actualiza el total depositado
- Emite evento `deposit`

**Ejemplo de uso** (JS/Freighter):
```javascript
// Pseudocódigo
const tx = new TransactionBuilder(sourceAccount, networkPassphrase)
  .addOperation(
    Operation.invokeHostFunction({
      func: xdr.HostFunction.hostFunctionTypeInvokeContract([
        contractId, // PrizePool
        xdr.ScVal.scValTypeSymbol('deposit'),
        userAddress,
        amount
      ]),
      auth: [sourceAccount]
    })
  )
  .build();
  
const signedTx = await freighter.signTransaction(tx.toXDR());
```

---

### 3. withdraw()
**Propósito**: Retirar tokens sin penalización

```rust
pub fn withdraw(env: Env, to: Address, amount: i128)
```

**Autenticación**: Requiere firma de `to`

**Precondiciones**:
- `amount > 0`
- Usuario debe tener al menos `amount` depositado

**Efectos**:
- Transfiere `amount` tokens del contrato a `to`
- Actualiza el saldo del usuario
- Actualiza el total depositado
- Emite evento `withdraw`

**Notas**:
- El retiro es **sin penalización** del principal
- Todos pueden retirar en cualquier momento
- El retiro no afecta la participación en sorteos anteriores

---

### 4. commit_seed()
**Propósito**: Primera fase de commit-reveal para aleatoriedad

```rust
pub fn commit_seed(env: Env, from: Address, seed_hash: BytesN<32>)
```

**Autenticación**: Requiere firma de `from`

**Efectos**:
- Almacena `seed_hash` asociado al usuario
- Emite evento `commit_seed`

**Notas**:
- El usuario guarda el seed original localmente
- Necesario para la fase 2 (`reveal_seed`)
- En MVP: verificación básica (roadmap: SHA-256 completo)

---

### 5. reveal_seed()
**Propósito**: Segunda fase de commit-reveal

```rust
pub fn reveal_seed(env: Env, from: Address, seed: Bytes)
```

**Autenticación**: Requiere firma de `from`

**Precondiciones**:
- Usuario debe haber ejecutado `commit_seed()` previamente
- `seed` debe tener longitud > 0

**Efectos**:
- Almacena el seed revelado
- Emite evento `reveal_seed`

**Notas**:
- Verificación simple (roadmap: comparar hash SHA-256)

---

### 6. draw()
**Propósito**: Ejecutar el sorteo del período

```rust
pub fn draw(env: Env)
```

**Autenticación**: Requiere firma del `admin`

**Precondiciones**:
- El período debe haber terminado
- El sorteo no debe haber sido ejecutado ya
- Debe haber depósitos en el pool

**Efectos**:
- Calcula el premio (basado en APR)
- Genera pseudoaleatoriedad (ledger sequence en MVP)
- Emite evento `draw_executed`
- Reinicia el período

**Cálculo del Premio**:
```
Prize = (Total * APR_BPS) / 10000
Ejemplo: 1000 USDC * 500 / 10000 = 50 USDC
```

---

### Funciones de Lectura (View)

#### get_balance(who: Address) → i128
```rust
pub fn get_balance(env: Env, who: Address) -> i128
```
Retorna el saldo depositado del usuario (0 si no existe).

#### get_total_deposited() → i128
```rust
pub fn get_total_deposited(env: Env) -> i128
```
Retorna el total de tokens depositados en el pool.

#### get_config() → PoolConfig
```rust
pub fn get_config(env: Env) -> PoolConfig
```
Retorna la configuración del pool.

#### get_time_remaining() → u64
```rust
pub fn get_time_remaining(env: Env) -> u64
```
Retorna segundos restantes en el período actual (0 si ya pasó).

#### get_win_probability(who: Address) → u32
```rust
pub fn get_win_probability(env: Env, who: Address) -> u32
```
Retorna la probabilidad aproximada de ganar en basis points.

Fórmula:
```
Prob = (User Balance * 10000) / Total Deposited
Rango: 0-10000 (0% a 100%)
```

---

## Almacenamiento

El contrato usa `env.storage().instance()` para almacenamiento persistente.

### Esquema de almacenamiento

| DataKey | Tipo | Descripción |
|---------|------|------------|
| `Config` | `PoolConfig` | Configuración global |
| `TotalDeposited` | `i128` | Suma de todos los depósitos |
| `UserDeposit(addr)` | `UserDeposit` | Saldo individual |
| `PeriodStart` | `u64` | Timestamp inicio período |
| `CurrentWinner` | `Address` | Dirección del ganador |
| `SeedCommit(addr)` | `BytesN<32>` | Hash comprometido |
| `SeedRevealed(addr)` | `Bytes` | Seed original |
| `DrawExecuted` | `bool` | Flag de sorteo ejecutado |
| `PrizeAmount` | `i128` | Monto del premio |

### Límites

En Soroban:
- Cada clave debe ser `<= 64 bytes`
- Valores típicos: aceptables
- Sin límite total teórico, pero hay costo de gas

---

## Eventos

Los eventos se emiten para auditoría y rastreo:

### Evento: init
```
Topics: (Symbol::new(&env, "init"),)
Data: [admin, token, period_secs]
```

### Evento: deposit
```
Topics: (Symbol::new(&env, "deposit"),)
Data: [user, amount]
```

### Evento: withdraw
```
Topics: (Symbol::new(&env, "withdraw"),)
Data: [user, amount]
```

### Evento: commit_seed
```
Topics: (Symbol::new(&env, "commit_seed"),)
Data: [user]
```

### Evento: reveal_seed
```
Topics: (Symbol::new(&env, "reveal_seed"),)
Data: [user]
```

### Evento: draw_executed
```
Topics: (Symbol::new(&env, "draw_executed"),)
Data: [prize_amount, ledger_sequence]
```

---

## Seguridad

### 1. Autenticación
- Todas las operaciones críticas requieren `require_auth()`
- No hay operaciones silenciosas

### 2. Validaciones
```rust
require!(amount > 0, "Amount must be positive");
require!(user_deposit.amount >= amount, "Insufficient balance");
require!(current_time >= period_start + period_secs, "Period not finished");
```

### 3. Manejo de Tokens
- Usando `soroban_sdk::token::Client`
- Transferencias firmadas del usuario

### 4. Aleatoriedad (MVP)
- Basada en `env.ledger().sequence()`
- Predictible en MVP (roadmap: VRF/Oráculo)

### 5. Anti-Sniping (Roadmap)
- Snapshot al cierre del período
- TWAB (Time-Weighted Average Balance) en futuro

---

## Roadmap

### Corto plazo (Fase 2)
- [ ] Implementar TWAB para ponderación temporal
- [ ] Snapshot al cierre del período
- [ ] Selección de ganador con lista de participantes
- [ ] SHA-256 real para commit-reveal
- [ ] Múltiples pools en paralelo

### Mediano plazo (Fase 3)
- [ ] Oráculo de aleatoriedad (VRF/drand)
- [ ] Integración de rendimiento real (YBX)
- [ ] Parámetros gobernables
- [ ] NFTs de participación (POAP)

### Largo plazo (Fase 4)
- [ ] Referidos con comisiones
- [ ] Sistema de premios patrocinados
- [ ] Canales de pago local (QR)
- [ ] Cross-chain interoperabilidad

---

## Ejemplos de Integración

### Frontend: Depositar con Freighter
```typescript
import StellarSdk from '@stellar/stellar-sdk';

async function depositToPool(amount: number) {
  const userAddress = await freighter.getAddress();
  const sourceAccount = new StellarSdk.Account(userAddress, 0);
  
  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET_NETWORK_PASSPHRASE,
  })
    .addOperation(
      StellarSdk.Operation.invokeHostFunction({
        func: StellarSdk.xdr.HostFunction.hostFunctionTypeInvokeContract([
          StellarSdk.Address.fromString(CONTRACT_ID),
          StellarSdk.nativeToScVal('deposit', StellarSdk.scValTypeSymbol),
          StellarSdk.Address.fromString(userAddress).toScVal(),
          StellarSdk.i128(amount),
        ]),
        auth: [],
      })
    )
    .setTimeout(30)
    .build();
    
  const signedTx = await freighter.signTransaction(tx.toXDR());
  // Enviar a RPC...
}
```

---

## Referencias

- [Soroban SDK](https://docs.rs/soroban-sdk/)
- [Stellar Docs](https://developers.stellar.org/)
- [Stellar Expert](https://stellar.expert/explorer/testnet)
- [PoolTogether](https://pooltogether.com/) (inspiración)

---

## Soporte y Contribuciones

Para preguntas, issues o PRs, visita el repositorio del proyecto.
