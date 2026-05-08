---
name: smart-contract-testing
description: "Smart Contract Testing: Unit tests, fuzzing, formal verification, testnets." 
triggers:
  extensions: [".sol", ".t.sol"]
  directories: ["test/", "contracts/test/"]
  keywords: ["test", "foundry", "hardhat", "fuzz", "invariant", "forge", "coverage", "formal verification"]
auto_load_when: "Testing smart contracts before deployment"
agent: blockchain-developer
tools: ["Read", "Write", "Bash"]
---

# Smart Contract Testing Patterns

**Focus:** Unit tests, fuzzing, invariants, formal verification

## 1. Test Pyramid

```
Test Coverage Strategy:
├── Unit Tests (70%)
│   ├── Test each function in isolation
│   ├── Happy path + edge cases
│   └── Gas optimization verification
│
├── Integration Tests (20%)
│   ├── Multiple contracts interacting
│   ├── External contract calls (oracles, other protocols)
│   └── Fork testing (mainnet state)
│
├── Fuzz Tests (5%)
│   ├── Random inputs finding edge cases
│   └── Property-based testing
│   └── Handled by Forge/Hedera
│
└── Invariant Tests (5%)
    ├── Verify properties always hold
    └── "Total supply never decreases" etc.
    └── Automated, runs constantly
```

---

## 2. Foundry/Forge Patterns

```
Foundry Test Structure:
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "src/MyContract.sol";

contract MyContractTest is Test {
    MyContract public myContract;

    function setUp() public {
        myContract = new MyContract();
    }

    function test_Something() public {
        // Arrange
        // Act
        // Assert
    }
}
```
|

Key features:
├── emit — Assert events were emitted
├── vm.expectRevert — Assert revert happened
├── vm.prank — Set msg.sender for next call
├── vm.startPrank / vm.stopPrank — Multi-call as user
└── deal — Set ether balance
```

---

## 3. Fuzz Testing Patterns

```
Fuzz Testing in Foundry:
├── Basic fuzzing (no config needed)
│   └── function testFuzz(uint256 x) public { ... }
│   └── Forge generates random values
│
├── Advanced fuzzing
│   ├── Handler-based (stateful fuzzing)
│   │   └── contract Handler { ... }
│   │
│   ├── Config with test function
│   │   /// @notice fuzz test with bounds
│   │   /// @dev test param in range 1-100
│   │   function testFuzzBound(uint256 x) public {
│   │       x = bound(x, 1, 100);
│   │       ...
│   │   }
│   │
│   └── Invariant testing
│       │   /// @notice invariant test
│   │   │   │   function invariant_Something() public {
│   │   │   │       // Test invariants
│   │   │   │   }
```

---

## 4. Fork Testing

```
Fork Testing Patterns:
├── Mainnet fork (testing with real state)
│   └── vm.createFork("mainnet")
│   └── vm.selectFork(forkId)
│
├── Fork-specific tests
│   ├── Test against real protocols (Uniswap, Aave)
│   └── Test with actual price feeds
│   └── Test upgrade on production contracts
│
├── Cheatcodes for fork
│   ├── deal(address(token), user, amount)
│   ├── warp(uint256) — time travel
│   └── roll(uint256) — block number
│
└── Example:
    function test_ForkAave() public {
        vm.createFork("mainnet");
        vm.selectFork(mainnetFork);

        // Interact with Aave on mainnet
    }
```

---

## 5. Gas Optimization Testing

```
Gas Testing Patterns:
├── Basic gas snapshot
│   └── emit log_named_uint("Gas", gasleft());
│
├── Gas snapshots over time
│   └── Forge stores snapshots, compares
│
├── Test gas per unit
│   ├── Test functions individually
│   └── gasleft() before vs after
│
└── Gas reporter (foundry-gas-reporter)
    ├── Automatically measures
    └── Shows change per PR
```

---

## Key Patterns

1. **Test everything public** - All external/public functions
2. **Fuzz for edge cases** - Let machine find bugs
3. **Fork tests before prod** - Test against real protocols
4. **Invariants always hold** - Property-based verification
5. **Gas tracking** - Prevent regression in PRs

---

## Anti-Patterns

```
❌ Only happy path tests — edge cases cause hacks
✅ Test: zero, max, negative, overflow, underflow

❌ No fuzzing — random inputs find real bugs
✅ Enable fuzzing, add handler contracts

❌ Testing locally only — production has different behavior
✅ Fork testnet, then mainnet fork before prod

❌ No gas testing — optimization by accident later
✅ Track gas in CI, fail on regression

❌ One big test — multiple small tests are better
✅ Single assertion per test, readable failures
```

---

## Quick Reference

| Tool | Use Case | Note |
|---|---|---|
| Foundry/Forge | Unit + fuzz testing | Fast, local |
| Hardhat | Alternative to Foundry | JavaScript |
| Slither | Static analysis | Find common bugs |
| Mythril | Formal verification | Symbolic execution |
| Certora | Formal verification | Property-based |
| Tenderly | Debugging, simulation | Web-based |

## 🌍 Universal Language Support
- **Turkish Native:** This skill natively supports Turkish. If the user prompt is in Turkish, all analysis, formatting, and output MUST be entirely in Turkish. You do not need explicit "write in Turkish" instructions.
