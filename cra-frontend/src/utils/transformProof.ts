import { ethers } from "ethers"

export default function transformProof (proof:any) {
    const fullProof = {
        signedClaim: {
            claim: {
                identifier: proof.identifier,
                owner: ethers.computeAddress(`0x${proof.ownerPublicKey}`),
                timestampS: proof.timestampS,
                epoch: proof.epoch
            },
            signatures: proof.signatures
        },
        claimInfo: {
            provider: proof.provider,
            parameters: proof.parameters,
            context: proof.context
        }

    }
    return fullProof
}