// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

struct CompleteClaimData {
    bytes32 identifier;
    address owner;
    uint32 timestampS;
    uint32 epoch;
}

struct ClaimInfo {
    string provider;
    string parameters;
    string context;
}

/** Claim with signatures & signer */
struct SignedClaim {
    CompleteClaimData claim;
    bytes[] signatures;
}
struct Proof {
    ClaimInfo claimInfo;
    SignedClaim signedClaim;
}

interface ReclaimContractInterface {
    function verifyProof(Proof memory proof) external view;
}

contract Testing {
    event MyEvent(address indexed userAddress, bool isProofValid);
    address public reclaimContractAddress;

    constructor(address _reclaimContractAddress) {
        reclaimContractAddress = _reclaimContractAddress;
    }

    function substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) public pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    function getContextMessageFromProof(Proof memory proof)
        public
        pure
        returns (string memory)
    {
        string memory context = proof.claimInfo.context;
        return substring(context, 19, 61);
    }

    function stringToAddress(string memory str) public pure returns (address) {
        bytes memory data = bytes(str);
        uint160 result = 0;
        for (uint8 i = 2; i < 42; i++) {
            uint8 digit = uint8(data[i]);
            if (digit >= 48 && digit <= 57) {
                result = result * 16 + (digit - 48);
            } else if (digit >= 65 && digit <= 70) {
                result = result * 16 + (digit - 55);
            } else if (digit >= 97 && digit <= 102) {
                result = result * 16 + (digit - 87);
            } else {
                revert("Invalid address characters");
            }
        }
        return address(result);
    }

    function emitEvent(Proof memory proof) external {
        ReclaimContractInterface(reclaimContractAddress).verifyProof(proof);
        emit MyEvent(stringToAddress(getContextMessageFromProof(proof)), true);
    }
}
