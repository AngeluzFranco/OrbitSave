.PHONY: help build build-release test deploy clean

help:
	@echo "OrbitSave Prize Pool Contract - Makefile"
	@echo "========================================"
	@echo "Available targets:"
	@echo "  build              - Build the contract (debug)"
	@echo "  build-release      - Build the contract (optimized/release)"
	@echo "  test               - Run the contract tests"
	@echo "  deploy             - Deploy to Stellar Testnet (requires CONTRACT_ID env var)"
	@echo "  clean              - Clean build artifacts"
	@echo ""

build:
	cargo build --target wasm32-unknown-unknown

build-release:
	cargo build --target wasm32-unknown-unknown --release

test:
	cargo test

deploy: build-release
	@if [ -z "$(CONTRACT_ID)" ]; then \
		echo "Error: CONTRACT_ID environment variable not set"; \
		echo "Usage: CONTRACT_ID=<id> make deploy"; \
		exit 1; \
	fi
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/prize_pool.wasm \
		--network testnet \
		--source $(STELLAR_SOURCE) \
		--json

clean:
	cargo clean

watch:
	cargo watch -x build
