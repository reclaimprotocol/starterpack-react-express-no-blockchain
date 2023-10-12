// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ReclaimContractInterface {
    function verifyMerkelIdentity(
        string memory provider,
		uint256 _merkleTreeRoot,
		uint256 _signal,
		uint256 _nullifierHash,
		uint256 _externalNullifier,
		bytes32 dappId,
		uint256[8] calldata _proof
    ) external returns (bool);
}

contract C_GCoin is ERC20 {
    address public owner;
    address public reclaimContractAddress;
    bytes32 public dappId;
    uint256 public externalNullifier;
    string public provider;

    constructor(
        uint256 _externalNullifier,
        bytes32 _dappId,
        address _reclaimContractAddress,
        string memory _provider
    ) ERC20("TestingCoin", "TeCON") {
        owner = msg.sender;
        externalNullifier = _externalNullifier;
        dappId = _dappId;
        reclaimContractAddress = _reclaimContractAddress;
        provider = _provider;
    }

    function airDrop(
        uint256 _merkleTreeRoot,
        uint256 _signal,
        uint256 _nullifierHash,
        uint256[8] calldata _proof
    ) external {
        require(
            ReclaimContractInterface(reclaimContractAddress).verifyMerkelIdentity(
                provider,
                _merkleTreeRoot,
                _signal,
                _nullifierHash,
                externalNullifier,
                dappId,
                _proof
            ),
            "Proof not valid"
        );
        _mint(msg.sender, 100 * (10 ** decimals()));
    }
}
