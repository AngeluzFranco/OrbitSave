## 🚀 Inicio Rápido - PrizePool Contract

### ⚡ 5 Minutos para Empezar

```bash
# 1. Navegar al directorio del contrato
cd contracts/prize-pool

# 2. Compilar (debug)
make build

# 3. Ejecutar tests
make test

# 4. Compilar release (optimizado)
make build-release

# 5. Desplegar en Testnet (si tienes soroban-cli)
pwsh deploy.ps1  # Windows PowerShell
# o
bash deploy.sh   # Linux/Mac (adaptado)
```

### 📋 Requisitos

- ✓ **Rust** 1.70+ ([instalar](https://rustup.rs/))
- ✓ **Soroban CLI** ([instalar](https://developers.stellar.org/docs/tools/soroban-cli))
- ✓ **Cargo** (incluido en Rust)
- ✓ **Freighter Wallet** (para interactuar desde frontend)

### 🔍 Verificar Instalación

```bash
# Verificar Rust
rustc --version

# Verificar Cargo
cargo --version

# Verificar Soroban CLI
soroban --version
```

### 📂 Estructura

```
prize-pool/
├── src/
│   ├── lib.rs      ← Contrato aquí
│   └── test.rs     ← Tests aquí
├── README.md       ← Guía general
├── TECHNICAL.md    ← Detalles técnicos
├── ARCHITECTURE.md ← Diagramas
└── Makefile        ← Comandos
```

### 🎯 Comando más Usado

```bash
# Compilar el contrato
cargo build --target wasm32-unknown-unknown --release

# Output:
# target/wasm32-unknown-unknown/release/prize_pool.wasm ✓
```

### 🌐 URLs Útiles

- 🔗 [Stellar Testnet](https://stellar.expert/explorer/testnet)
- 🔗 [Soroban RPC](https://soroban-testnet.stellar.org)
- 🔗 [Freighter](https://www.freighter.app/)

### 📝 Pasos para Desplegar

1. **Compilar**
   ```bash
   make build-release
   ```

2. **Tener USDC de prueba** (pedir fondos en testnet)
   ```
   USDC Contract: CBBD47AB7C010CB047B7DFC3CA3B51D0D3C20ECC3C0426800551168886474B0A
   ```

3. **Ejecutar deploy**
   ```bash
   pwsh deploy.ps1
   ```

4. **Guardar Contract ID**
   ```
   Se guarda automáticamente en: .contract-config.json
   ```

5. **Copiar a frontend**
   ```bash
   # En client/.env.local
   NEXT_PUBLIC_CONTRACT_ID=<ID_DEL_CONTRATO>
   ```

### 🧪 Tests

```bash
# Ejecutar tests
make test
cargo test

# Con output detallado
cargo test -- --nocapture
```

### 🐛 Troubleshooting

**Error: "cannot find path 'wasm32-unknown-unknown'"**
```bash
rustup target add wasm32-unknown-unknown
```

**Error: "soroban not found"**
```bash
# Instalar Soroban CLI
npm install -g @stellar/soroban-cli
```

**Error: "USDC transfer fails"**
```bash
# Verificar que tienes saldo de prueba
# En stellar.expert/explorer/testnet busca tu dirección
```

### 📞 Comandos de Soroban CLI

```bash
# Ver versión
soroban --version

# Desplegar manualmente
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/prize_pool.wasm \
  --network testnet \
  --source <CLAVE_PRIVADA>

# Invocar función
soroban contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  --source <CLAVE_PRIVADA> \
  --fn get_total_deposited
```

### 💡 Tips

1. **Guardar Contract ID**
   ```bash
   export CONTRACT_ID=C...  # Linux/Mac
   # o PowerShell
   $env:CONTRACT_ID = "C..."
   ```

2. **Ver código compilado**
   ```bash
   ls -la target/wasm32-unknown-unknown/release/
   ```

3. **Limpiar compilación**
   ```bash
   make clean
   cargo clean
   ```

4. **Watch mode (recompilar al cambiar)**
   ```bash
   cargo watch -x build
   ```

### 📊 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `src/lib.rs` | Contrato principal |
| `Cargo.toml` | Dependencias |
| `README.md` | Documentación |
| `deploy.ps1` | Script despliegue |
| `Makefile` | Automatización |

### 🎓 Próximas Lecturas

1. **[README.md](README.md)** - Guía completa
2. **[TECHNICAL.md](TECHNICAL.md)** - Especificación API
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Cómo funciona

### ✅ Checklist de Despliegue

- [ ] Tengo Rust instalado
- [ ] Tengo Soroban CLI instalado  
- [ ] Tengo clave privada Stellar (starts with S)
- [ ] Tengo dirección pública (starts with G)
- [ ] Tengo USDC de prueba en Testnet
- [ ] Contract compila sin errores (`make build-release`)
- [ ] Tests pasan (`make test`)
- [ ] Script de despliegue listo (`deploy.ps1`)

### 🚀 ¡Ahora Estás Listo!

```bash
# Compila el contrato
make build-release

# ¡Y listo! El archivo WASM está en:
# target/wasm32-unknown-unknown/release/prize_pool.wasm
```

---

**¿Preguntas?** Revisa [TECHNICAL.md](TECHNICAL.md) o consulta la documentación oficial de Soroban.
