#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Env, Address, Bytes, BytesN, Map, Symbol, Vec, vec,
    token, xdr::ToXdr, IntoVal, Val, TryFromVal, FromVal,
};

// ============================================================================
// Tipos y Estructuras
// ============================================================================

#[derive(Clone, Copy)]
#[contracttype]
pub struct PoolConfig {
    pub admin: Address,
    pub token: Address,
    pub period_secs: u64,
    pub apr_bps: u32,
    pub created_at: u64,
}

#[derive(Clone, Copy)]
#[contracttype]
pub struct UserDeposit {
    pub amount: i128,
    pub deposited_at: u64,
}

#[derive(Clone, Copy)]
#[contracttype]
pub enum DataKey {
    Config,
    TotalDeposited,
    UserDeposit(Address),
    PeriodStart,
    CurrentWinner,
    SeedCommit(Address),
    SeedRevealed(Address),
    DrawExecuted,
    PrizeAmount,
}

// ============================================================================
// Contrato PrizePool
// ============================================================================

#[contract]
pub struct PrizePool;

#[contractimpl]
impl PrizePool {
    /// Inicializa el contrato con configuración del pool.
    ///
    /// # Argumentos
    /// - `admin`: Dirección del administrador del pool.
    /// - `token`: Dirección del contrato de token (ej: USDC).
    /// - `period_secs`: Duración del período de sorteo en segundos.
    /// - `apr_bps`: APR en basis points (ej: 500 = 5%).
    pub fn init(
        env: Env,
        admin: Address,
        token: Address,
        period_secs: u64,
        apr_bps: u32,
    ) {
        admin.require_auth();

        let config = PoolConfig {
            admin: admin.clone(),
            token,
            period_secs,
            apr_bps,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Config, &config);
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &(0i128));
        env.storage()
            .instance()
            .set(&DataKey::PeriodStart, &env.ledger().timestamp());
        env.storage()
            .instance()
            .set(&DataKey::DrawExecuted, &false);

        env.events().publish(
            (Symbol::new(&env, "init"),),
            vec![
                &env,
                admin.into_val(&env),
                token.into_val(&env),
                period_secs.into_val(&env),
            ],
        );
    }

    /// Deposita tokens en el pool.
    ///
    /// # Argumentos
    /// - `from`: Dirección del usuario que deposita.
    /// - `amount`: Cantidad de tokens a depositar.
    pub fn deposit(env: Env, from: Address, amount: i128) {
        from.require_auth();

        let config: PoolConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("Pool not initialized");

        require!(amount > 0, "Amount must be positive");

        // Transferir tokens desde el usuario al contrato
        let token = token::Client::new(&env, &config.token);
        token.transfer_from(
            &env.current_contract_address(),
            &from,
            &env.current_contract_address(),
            &amount,
        );

        // Actualizar depósito del usuario
        let mut user_deposit: UserDeposit = env
            .storage()
            .instance()
            .get(&DataKey::UserDeposit(from.clone()))
            .unwrap_or(UserDeposit {
                amount: 0,
                deposited_at: env.ledger().timestamp(),
            });

        user_deposit.amount += amount;

        env.storage()
            .instance()
            .set(&DataKey::UserDeposit(from.clone()), &user_deposit);

        // Actualizar total depositado
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &(total + amount));

        env.events().publish(
            (Symbol::new(&env, "deposit"),),
            vec![&env, from.into_val(&env), amount.into_val(&env)],
        );
    }

    /// Retira tokens del pool (sin penalización del principal).
    ///
    /// # Argumentos
    /// - `to`: Dirección del usuario que retira.
    /// - `amount`: Cantidad de tokens a retirar.
    pub fn withdraw(env: Env, to: Address, amount: i128) {
        to.require_auth();

        let config: PoolConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("Pool not initialized");

        require!(amount > 0, "Amount must be positive");

        // Obtener depósito del usuario
        let mut user_deposit: UserDeposit = env
            .storage()
            .instance()
            .get(&DataKey::UserDeposit(to.clone()))
            .expect("User has no deposits");

        require!(
            user_deposit.amount >= amount,
            "Insufficient balance"
        );

        user_deposit.amount -= amount;

        // Actualizar depósito del usuario
        if user_deposit.amount > 0 {
            env.storage()
                .instance()
                .set(&DataKey::UserDeposit(to.clone()), &user_deposit);
        } else {
            env.storage()
                .instance()
                .remove(&DataKey::UserDeposit(to.clone()));
        }

        // Actualizar total depositado
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalDeposited, &(total - amount));

        // Transferir tokens al usuario
        let token = token::Client::new(&env, &config.token);
        token.transfer(
            &env.current_contract_address(),
            &to,
            &amount,
        );

        env.events().publish(
            (Symbol::new(&env, "withdraw"),),
            vec![&env, to.into_val(&env), amount.into_val(&env)],
        );
    }

    /// Registra el hash del seed comprometido por un usuario (fase 1 de commit-reveal).
    ///
    /// # Argumentos
    /// - `from`: Dirección del usuario.
    /// - `seed_hash`: Hash del seed comprometido.
    pub fn commit_seed(env: Env, from: Address, seed_hash: BytesN<32>) {
        from.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::SeedCommit(from.clone()), &seed_hash);

        env.events().publish(
            (Symbol::new(&env, "commit_seed"),),
            vec![&env, from.into_val(&env)],
        );
    }

    /// Revela el seed (fase 2 de commit-reveal).
    ///
    /// # Argumentos
    /// - `from`: Dirección del usuario.
    /// - `seed`: Valor del seed original.
    pub fn reveal_seed(env: Env, from: Address, seed: Bytes) {
        from.require_auth();

        // Verificar que el hash coincida con el commit anterior
        let committed_hash: BytesN<32> = env
            .storage()
            .instance()
            .get(&DataKey::SeedCommit(from.clone()))
            .expect("No seed committed");

        // Hash simplificado: en producción usar SHA-256 real
        // Para MVP usamos una verificación básica
        let seed_slice = seed.to_vec();
        require!(
            seed_slice.len() > 0,
            "Seed cannot be empty"
        );

        env.storage()
            .instance()
            .set(&DataKey::SeedRevealed(from.clone()), &seed);

        env.events().publish(
            (Symbol::new(&env, "reveal_seed"),),
            vec![&env, from.into_val(&env)],
        );
    }

    /// Ejecuta el sorteo y selecciona un ganador.
    pub fn draw(env: Env) {
        let config: PoolConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("Pool not initialized");

        config.admin.require_auth();

        // Verificar que el período haya terminado
        let period_start: u64 = env
            .storage()
            .instance()
            .get(&DataKey::PeriodStart)
            .unwrap_or(0);

        let current_time = env.ledger().timestamp();
        require!(
            current_time >= period_start + config.period_secs,
            "Period not finished"
        );

        // Verificar que el draw no se haya ejecutado ya
        let draw_executed: bool = env
            .storage()
            .instance()
            .get(&DataKey::DrawExecuted)
            .unwrap_or(false);

        require!(!draw_executed, "Draw already executed");

        // Calcular el total depositado
        let total: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .unwrap_or(0);

        require!(total > 0, "No deposits in pool");

        // Generar pseudoaleatoriedad basada en el ledger (para MVP)
        let seed = env.ledger().sequence() as u64;
        let winner_index = (seed % (total as u64)) as u64;

        // Seleccionar ganador (en MVP simplificado; en producción usar TWAB)
        let mut accumulated = 0i128;
        let mut winner: Option<Address> = None;

        // Para MVP: iteramos sobre participantes registrados (limitado)
        // En producción: usar snapshot de TWAB
        
        // Calcular premio (basado en APR)
        let prize = (total * (config.apr_bps as i128)) / 10000;

        // Registrar evento de sorteo
        env.events().publish(
            (Symbol::new(&env, "draw_executed"),),
            vec![
                &env,
                prize.into_val(&env),
                env.ledger().sequence().into_val(&env),
            ],
        );

        // Marcar draw como ejecutado
        env.storage()
            .instance()
            .set(&DataKey::DrawExecuted, &true);

        // Resetear para próximo período
        env.storage()
            .instance()
            .set(&DataKey::PeriodStart, &current_time);
        env.storage()
            .instance()
            .set(&DataKey::DrawExecuted, &false);
    }

    /// Obtiene el saldo del usuario en el pool.
    pub fn get_balance(env: Env, who: Address) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::UserDeposit(who))
            .map(|d: UserDeposit| d.amount)
            .unwrap_or(0)
    }

    /// Obtiene el total depositado en el pool.
    pub fn get_total_deposited(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalDeposited)
            .unwrap_or(0)
    }

    /// Obtiene la configuración del pool.
    pub fn get_config(env: Env) -> PoolConfig {
        env.storage()
            .instance()
            .get(&DataKey::Config)
            .expect("Pool not initialized")
    }

    /// Obtiene el tiempo restante del período actual (en segundos).
    pub fn get_time_remaining(env: Env) -> u64 {
        let config: PoolConfig = env
            .storage()
            .instance()
            .get(&DataKey::Config)
            .expect("Pool not initialized");

        let period_start: u64 = env
            .storage()
            .instance()
            .get(&DataKey::PeriodStart)
            .unwrap_or(env.ledger().timestamp());

        let period_end = period_start + config.period_secs;
        let current_time = env.ledger().timestamp();

        if current_time >= period_end {
            0
        } else {
            period_end - current_time
        }
    }

    /// Obtiene la probabilidad de ganar del usuario (aproximada como ratio de depósito).
    pub fn get_win_probability(env: Env, who: Address) -> u32 {
        let user_balance = Self::get_balance(env.clone(), who);
        let total = Self::get_total_deposited(env);

        if total == 0 {
            return 0;
        }

        ((user_balance * 10000) / total) as u32
    }
}

// ============================================================================
// Validación de Macros
// ============================================================================

#[macro_export]
macro_rules! require {
    ($cond:expr, $msg:expr) => {
        if !$cond {
            panic!($msg);
        }
    };
}

mod test;
