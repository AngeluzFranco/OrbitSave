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


# 🛠️ Herramientas Necesarias para el MVP de OrbitSave

Aquí tienes el desglose de todas las herramientas y paquetes, divididos por capa.

---

## 1. 💡 Backend (Smart Contract - Lógica del Premio)

El código del contrato se escribe en **Rust** y se compila para **WebAssembly (WASM)**.

| Componente | Herramienta/Lenguaje | Paquete Clave | Propósito en el MVP |
|-------------|----------------------|----------------|----------------------|
| Lenguaje de Programación | Rust | N/A | Desarrollo del Smart Contract **PrizePool**. |
| SDK de Soroban | Rust / Soroban | `soroban-sdk` | Proporciona las estructuras, APIs y macros para interactuar con el entorno Soroban (almacenamiento, llamadas, eventos, etc.). |
| CLI / Herramienta de Dev | Soroban CLI | `soroban-cli` | Herramienta de línea de comandos para compilar el código, desplegar el contrato en Testnet, e invocar sus funciones (`init`, `draw`, `deposit` iniciales). |
| Manejo de Tokens | Interfaz de Tokens | `soroban_sdk::token` | Necesario para modelar los depósitos/retiros de **USDC**. El contrato debe tener un cliente para invocar las funciones `transfer_from` y `transfer` del contrato del token. |

---

## 2. 🖥️ Frontend (Interfaz de Usuario - UX)

El frontend es la interfaz que permite a los usuarios interactuar con la cadena a través de la wallet.

| Componente | Herramienta/Framework | Paquete Clave | Propósito en el MVP |
|-------------|----------------------|----------------|----------------------|
| Framework Base | Next.js / React | `next`, `react` | Construcción de la interfaz de usuario (UI: conectar, depositar, countdown). |
| Interacción con Stellar/Soroban | JavaScript SDK | `@stellar/stellar-sdk` | Paquete base para construir, firmar y enviar transacciones a la red Stellar/Soroban RPC. |
| Conexión de Wallet | API de Freighter | `freighter-api` | Permite que la aplicación detecte la wallet **Freighter**, solicite la firma de transacciones (`signTransaction`) y obtenga la dirección pública del usuario. |
| Llamadas al Contrato | TypeScript / JS | Generación a partir del WASM | Herramientas (a veces incluidas en template projects) para generar interfaces o *wrappers* del contrato Soroban para llamar a funciones como `deposit(..)` o `get_balance(..)`. |
| Estilos (Opcional) | Tailwind CSS | `tailwindcss` | (Opcional, pero recomendado) Para implementar rápidamente el diseño **mobile-first** de la UI. |

---

## 3. 🌐 Redes y Servicios de Infraestructura

Estos son los servicios de red que ya existen y que tu MVP debe consumir.

| Componente | Servicio/Endpoint | Descripción |
|-------------|------------------|--------------|
| Red Blockchain | Stellar Testnet | Entorno de prueba obligatorio. Donde desplegarás el contrato y harás las transacciones de prueba con XLM y USDC de prueba. |
| API de Soroban | Soroban RPC URL | Nodo al que envías todas las transacciones firmadas y las consultas de lectura. Es la puerta de entrada a la cadena de Soroban. |
| Token de Prueba | USDC (Testnet) | Necesitarás la dirección del ID del contrato del token USDC en Testnet para inicializar tu **PrizePool**. |

---

## 4. 📝 Flujo Clave del MVP

El MVP se enfoca en el flujo de lectura/escritura en tiempo real sin necesidad de persistencia histórica (*indexing*).

- **Ver Saldo / Probabilidad:**  
  El frontend llama a lecturas RPC como `get_balance()` para obtener datos en vivo.

- **Depositar / Retirar:**  
  El frontend crea una transacción, pide la firma a **Freighter**, y la envía al **Soroban RPC**.

- **Aleatoriedad (Sorteo):**  
  El *Relayer* mencionado en el flujo completo no es necesario en el MVP.  
  La función `draw()` puede ser invocada manualmente por el administrador (o por cualquier usuario en la demo) usando `soroban-cli` o una función de admin en la UI, simulando la automatización para la demostración.

---
