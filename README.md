# OrbitSave — Tu ahorro, tu boleto a premios sin riesgo.

Lotería sin pérdida (Prize-Linked Savings) nativa en Stellar con Soroban. Deposita stablecoins (p. ej., USDC en Stellar), participa en sorteos periódicos del rendimiento y recupera siempre tu depósito. Ideal para inclusión financiera, microahorro y activación de economías locales.

- Nombre de la app: OrbitSave
- Tagline: Tu ahorro, tu boleto a premios sin riesgo.
- Idea base: PoolTogether-XLM (No-Loss Lottery), optimizada para Stellar (fees bajos, UX simple, microdepósitos).

---

## Visión y valor

- Inclusión financiera: microahorros desde centavos con tarifas mínimas; nadie pierde el principal.
- Economía local: premios canjeables en comercios aliados y pools comunitarios (barrios/cooperativas).
- Transparencia total: reglas on-chain, eventos auditables, aleatoriedad verificable (commit–reveal en MVP; VRF en roadmap).
- UX web3 accesible: wallet Freighter, QR/links de onboarding, PWA mobile-first.

---

## Estado del proyecto (avance hasta ahora)

- Estrategia y alcance de MVP definidos.
- Naming y narrativa listos (OrbitSave + tagline).
- Benchmark y diferenciadores vs. mercado (PoolTogether, GoodGhosting, etc.).
- Arquitectura del MVP diseñada (contratos Soroban + frontend React).
- Skeleton de contrato Soroban (PrizePool) entregado: depósitos/retiros, ventanas de sorteo, commit–reveal, draw con premio simulado, eventos de auditoría.
- Skeleton de frontend Next.js entregado: conexión Freighter, flujo de firma placeholder, UI base.
- Storyboard de demo listo (sorteo en vivo en testnet, nadie pierde).
- Enfoque de inclusión financiera y economía local documentado (pools comunitarios, premios patrocinados, canje local).
- Roadmap técnico post-hackathon propuesto (VRF, TWAB robusto, integración de yield real con YBX, multipools).

Archivos base ya provistos en esta conversación:
- Contrato: `contracts/prize_pool/src/lib.rs` (Rust + soroban-sdk; stub funcional para MVP).
- Frontend: `web/app/page.tsx` (Next.js; conexión Freighter y flujo de firma de ejemplo).

---

## Funcionalidades

MVP (Hackathon):
- Depositar y retirar en 1 pool.
- Periodo de sorteo con countdown.
- Aleatoriedad transparente (commit–reveal básico; mezcla determinística).
- Selección de ganador ponderada por saldo (en el stub se incluye placeholder; se expandirá).
- Premio simulado on-chain (APR educativo) o “jackpot patrocinado”.
- UI: conectar wallet, depositar, ver probabilidad, ver ganador y reclamar premio.

Stretch (post-MVP):
- Múltiples pools (pequeño/mediano/grande o comunitarios).
- TWAB (Time-Weighted Average Balance) para evitar “sniping”.
- Oráculo de aleatoriedad (VRF/drand vía relayer).
- Integración de rendimiento real (p. ej., YBX) en vez de APR simulado.
- Badges/NFTs de participación (POAP Stellar) y referidos.
- Canje de premios en comercios locales vía QR.

---

## Arquitectura

- Smart contracts (Soroban):
  - PrizePool (núcleo): depósitos/retiros, periodos, commits/reveals, draw, distribución de premios simulados, eventos.
  - Ticket/SFT (futuro): representación de participación y base para TWAB.
  - RNG Module (MVP): commit–reveal/RANDAO ligero con fallback; roadmap a VRF con oráculo.
  - YieldSourceAdapter (futuro): interfaz a YBX u otras fuentes de rendimiento.

- Frontend (Next.js/React):
  - Conexión con Freighter.
  - Pantalla de depósito/retiro y probabilidad.
  - Countdown y sorteo en vivo (mostrar hash/tx).
  - Panel de auditoría (commits, reveals, seed final, evento de ganador).

- Servicios opcionales:
  - Indexado ligero de eventos (cache sólo lectura).
  - Relayer para VRF/cron (sin custodiar fondos).

---

## Seguridad y transparencia (MVP)

- Aleatoriedad: commit–reveal multiparte + sal de ledger (limitaciones comunicadas en UI). Roadmap a VRF.
- Anti-“sniping”: snapshot al cierre del periodo o TWAB (implementar en siguiente iteración).
- Custodia: los fondos permanecen en el contrato; retiros sin penalización del principal.
- Auditoría: eventos on-chain para cada acción (depósito, retiro, commit, reveal, draw, ganador).

---

## Inclusión financiera y economía local

- Depósito mínimo ultra-bajo; sponsoring de fees para primeros depósitos.
- Pools comunitarios con premios patrocinados por comercios locales.
- Opción de premios como vouchers/QR canjeables localmente (fase 2).
- Localización: español-first, PWA, onboarding por QR/links.

---

## Estructura del repositorio (propuesta)

```
/contracts
  /prize_pool
    Cargo.toml
    src/lib.rs
/web
  /app
    page.tsx
  package.json
  next.config.js
  .env.local.example
```

---

## Contrato (API actual del stub)

Métodos principales del `PrizePool` (stub de MVP):

- `init(admin, period_secs, apr_bps)`
- `deposit(from, amount)`
- `withdraw(to, amount)`
- `commit_seed(from, seed_hash)`
- `reveal_seed(from, seed)`
- `draw()`
- Lecturas: `get_balance(who)`, `get_total()`, `get_period()`

Notas del stub:
- Transferencias de token modeladas mínimamente (adapter pendiente).
- Selección de ganador y TWAB simplificados para la demo inicial.
- Premio simulado (p. ej., 0.1% por periodo) para propósito educativo.

---

## Cómo correr el proyecto (guía rápida)

Requisitos:
- Rust + `soroban-cli`
- Node.js 18+ y pnpm/npm
- Freighter wallet (navegador), cuenta en testnet.

1) Backend (contrato)

```bash
# 1. Build
cd contracts/prize_pool
cargo build --target wasm32-unknown-unknown --release

# 2. Deploy (ejemplo genérico; ajusta a tu entorno soroban-cli)
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/prize_pool.wasm \
  --network testnet \
  --source <TU-CUENTA> \
  --json

# Guarda el CONTRACT_ID retornado
export CONTRACT_ID=<ID_DEL_CONTRATO>

# 3. Init
soroban contract invoke \
  --id $CONTRACT_ID \
  --network testnet \
  --source <TU-CUENTA> \
  --fn init \
  -- \
  --admin <DIRECCION_ADMIN> \
  --period_secs 3600 \
  --apr_bps 500
```

2) Frontend (web)

```bash
cd web
cp .env.local.example .env.local
# Establece variables como:
# NEXT_PUBLIC_CONTRACT_ID=<ID_DEL_CONTRATO>
# NEXT_PUBLIC_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
# NEXT_PUBLIC_RPC_URL=<RPC DE SOROBAN TESTNET>

pnpm install   # o npm install
pnpm dev       # o npm run dev
# Abre http://localhost:3000
```

---

## Demo (guion de 3 minutos)

1) Conectar Freighter, depositar 5 USDC (testnet); ver probabilidad y countdown.
2) Cierra el periodo, `draw()` on-chain (mostrar TX/seed reveal). UI anuncia ganador.
3) Ganador hace Claim; todos pueden retirar su depósito en vivo.
4) Panel de auditoría con commits/reveals/seed final y eventos del ledger.

KPIs a mostrar:
- Time-to-first-deposit < 60 s.
- Coste por operación: centavos o menos.
- Número de participantes en vivo.

---

## Roadmap

- Corto plazo:
  - TWAB o snapshot robusto.
  - Selección de ganador proporcional a saldo (lista de participantes y pesos).
  - UI de auditoría + cron seguro (keeper sin custodia).
- Próximo hito:
  - Oráculo de aleatoriedad (VRF/drand) vía relayer.
  - Multipools y parámetros gobernables.
  - Integración yield real (YBX u otros).
  - Badges/NFTs de participación y referidos.

---

## Diferenciadores clave

- Stellar-first: microdepósitos y sorteos frecuentes con fees mínimos.
- UX accesible web3 (Freighter, QR) para usuarios nuevos.
- Narrativa de impacto: ahorro sin pérdida + comercio local.
- Transparencia radical: auditoría en vivo del sorteo.

---

## Notas legales y de comunicación

- Mensajería: “premios de ahorro sin pérdida” (evitar término “apuestas”).
- KYC/AML: umbrales para premios altos en producción (no aplicable a testnet).
- Disclaimers en MVP: aleatoriedad en commit–reveal, rendimiento simulado.

---

## Créditos y tecnología

- Stellar + Soroban (Rust, `soroban-sdk`)
- Wallet: Freighter
- Frontend: Next.js/React + Tailwind (opcional)
- Inspiración: Prize-linked savings (PoolTogether), adaptado a Stellar para inclusión y microahorro.

---

## Contribuir

Issues y PRs bienvenidos. Durante el hackathon priorizamos:
- Selección de ganador ponderada + lista de participantes.
- Integración Soroban RPC real en `web/app/page.tsx`.
- UI de countdown y panel de auditoría.
- Script de despliegue automatizado y `.env` de ejemplo.
