#![no_std]
// Esta es la línea que corregimos. Ya no importamos 'Client' aquí.
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, token};

#[contracttype]
pub enum DataKey {
    Token, // Guardará la dirección del token que aceptamos (ej. USDC)
}

#[contract]
pub struct PrizePoolContract;

#[contractimpl]
impl PrizePoolContract {
    /// Inicializa el contrato con la dirección del token que aceptará.
    pub fn initialize(env: Env, token_address: Address) {
        if env.storage().instance().has(&DataKey::Token) {
            panic!("El contrato ya ha sido inicializado");
        }
        // Guardamos la dirección del token que vamos a usar
        env.storage().instance().set(&DataKey::Token, &token_address);
    }

    /// Un usuario deposita tokens en el pool.
    pub fn deposit(env: Env, user: Address, amount: i128) {
        // 1. Asegurarnos de que el usuario autorizó este movimiento
        user.require_auth();

        // 2. Obtener la dirección del token que guardamos
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();

        // 3. Crear un cliente para ESE token (esto ya estaba bien)
        let token_client = token::Client::new(&env, &token_address);

        // 4. Transferir los fondos DESDE el usuario HACIA este contrato
        token_client.transfer(
            &user, // Desde
            &env.current_contract_address(), // Hacia
            &amount // Cuánto
        );
    }

    /// Retirar fondos (un admin lo haría, o el usuario)
    pub fn withdraw(env: Env, to: Address, amount: i128) {
        // Aquí faltaría la lógica de autorización (ej. solo un admin)
        
        // Obtener el cliente del token
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);

        // Transferir fondos DESDE este contrato HACIA el destinatario
        token_client.transfer(
            &env.current_contract_address(), // Desde
            &to, // Hacia
            &amount // Cuánto
        );
    }

    /// Ver el balance de este contrato
    pub fn contract_balance(env: Env) -> i128 {
        let token_address: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_address);
        
        token_client.balance(&env.current_contract_address())
    }
}