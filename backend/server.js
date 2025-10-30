// Importar dependencias
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import {
  Keypair,
  rpc,
  TransactionBuilder,
  Operation,
  scValToNative,
  nativeToScVal,
  Address,
  Account,
  Contract
} from '@stellar/stellar-sdk';

// --- 1. Configuración Inicial ---
const RPC_URL = "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const PRIZE_POOL_ID = process.env.PRIZE_POOL_ID;
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;
const adminKeypair = Keypair.fromSecret(ADMIN_SECRET_KEY);
const ADMIN_PUBLIC_KEY = adminKeypair.publicKey();
const server = new rpc.Server(RPC_URL, { allowHttp: true });
const app = express();
app.use(express.json());
app.use(cors());
const port = 3001;

console.log(`Clave pública del Admin (Backend): ${ADMIN_PUBLIC_KEY}`);
console.log(`Contrato Prize Pool ID: ${PRIZE_POOL_ID}`);

// --- 2. Endpoint de LECTURA (GET /balance) ---
app.get('/balance', async (req, res) => {
  console.log("Recibida petición GET /balance");
  try {
    const tx = new TransactionBuilder(new Account(ADMIN_PUBLIC_KEY, "0"), {
      fee: '100',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        // <--- 2. CORREGIDO: No pasar '[]' si no hay argumentos
        new Contract(PRIZE_POOL_ID).call('contract_balance')
      )
      .setTimeout(60)
      .build();

    const simulation = await server.simulateTransaction(tx);

    if (simulation.result) {
      const balance = scValToNative(simulation.result.retval);
      res.json({ balance: balance.toString() });
    } else {
      console.error("Simulación fallida:", simulation);
      res.status(500).json({ error: "No se pudo simular la transacción." });
    }
  } catch (error) {
    console.error("Error en GET /balance:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- 3. Endpoint de ESCRITURA (POST /withdraw) ---
app.post('/withdraw', async (req, res) => {
  const { toAddress, amount } = req.body;
  console.log(`Recibida petición POST /withdraw: Mover ${amount} a ${toAddress}`);

  if (!toAddress || !amount) {
    return res.status(400).json({ error: "Faltan 'toAddress' o 'amount' en el body." });
  }

  try {
    const sourceAccount = await server.getAccount(ADMIN_PUBLIC_KEY);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        // <--- 3. CORREGIDO: Pasar argumentos directamente, no en un array
        new Contract(PRIZE_POOL_ID).call('withdraw',
          new Address(toAddress).toScVal(),
          nativeToScVal(BigInt(amount), { type: 'i128' })
        )
      )
      .setTimeout(60)
      .build();

    tx.sign(adminKeypair);
    const sendResult = await server.sendTransaction(tx);
    console.log("Transacción enviada:", sendResult);
    res.json({ success: true, result: sendResult });

  } catch (error) {
    console.error("Error en POST /withdraw:", error);
    res.status(500).json({ error: error.message, details: error?.response?.data });
  }
});

// --- 4. Iniciar el Servidor ---
app.listen(port, () => {
  console.log(`Servidor de Backend escuchando en http://localhost:${port}`);
});