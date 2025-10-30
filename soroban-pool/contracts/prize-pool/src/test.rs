#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env};

#[test]
fn test_init() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PrizePool);
    let admin = Address::random(&env);
    let token = Address::random(&env);

    let client = PrizePoolClient::new(&env, &contract_id);

    client.init(&admin, &token, &3600, &500);

    let config = client.get_config();
    assert_eq!(config.admin, admin);
    assert_eq!(config.token, token);
    assert_eq!(config.period_secs, 3600);
    assert_eq!(config.apr_bps, 500);
}

#[test]
fn test_get_balance_zero() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PrizePool);
    let user = Address::random(&env);

    let client = PrizePoolClient::new(&env, &contract_id);

    let balance = client.get_balance(&user);
    assert_eq!(balance, 0);
}

#[test]
fn test_get_total_deposited() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PrizePool);

    let client = PrizePoolClient::new(&env, &contract_id);

    let total = client.get_total_deposited();
    assert_eq!(total, 0);
}

#[test]
fn test_time_remaining() {
    let env = Env::default();
    let contract_id = env.register_contract(None, PrizePool);
    let admin = Address::random(&env);
    let token = Address::random(&env);

    let client = PrizePoolClient::new(&env, &contract_id);

    client.init(&admin, &token, &3600, &500);

    let time_remaining = client.get_time_remaining();
    assert!(time_remaining > 0);
    assert!(time_remaining <= 3600);
}
