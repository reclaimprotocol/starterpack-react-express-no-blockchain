import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { FullProof, generateProof } from "@semaphore-protocol/proof";
import { SemaphoreEthers } from "@semaphore-protocol/data";
import { useEffect, useState } from "react";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import verficationContractABI from '../assets/verficationContractABI.json';

export function Airdrop({ identity, userAddrSignal, shouldRender }: { identity: Identity, userAddrSignal: string, shouldRender: boolean }) {

    const [isFullProof, setIsFullProof] = useState(false)
    const [semaphoreProof, setSemaphoreProof] = useState<FullProof>()

    const GCoinAddress = '0x7435F35a5160BAEcC4F364990c4F3f3f70c18c77';
    const semaphoreAddress = "0xACE04E6DeB9567C1B8F37D113F2Da9E690Fc128d";
    const groupNo = 190275525;
    const merkleTreeDepth = 16;
    const externalNullifier = 555;


    useEffect(() => {
        const generateSemaphoreProof = async () => {
            await new Promise(f => setTimeout(f, 5000));
            if (!isFullProof && shouldRender) {
                console.log("The Identity is: ", identity);
                const semaphoreEthers = new SemaphoreEthers("optimism-goerli", { address: semaphoreAddress });
                console.log("Here")
                const members = await semaphoreEthers.getGroupMembers(groupNo.toString());
                console.log("The members are: ", members);
                const group = new Group(groupNo, merkleTreeDepth, members);
                console.log("The group is: ", group);
                // console.log("args for generate proof: ", identity, group, externalNullifier, userAddrSignal, { zkeyFilePath: "../assets/semaphore.zkey", wasmFilePath: "../assets/semaphore.wasm" });
                // console.log("identity: ", new Identity("13509870563477528018232035312369982145398206659966133215771158320233840535313"));
                console.log("group: ", group);
                console.log("externalNullifier: ", externalNullifier);

                const fullProof = await generateProof(identity, group, externalNullifier, userAddrSignal);
                console.log("The full semaphore proof is: ", fullProof);
                setSemaphoreProof(fullProof);
                setIsFullProof(true);
                console.log(fullProof?.merkleTreeRoot, 'hi',fullProof?.signal,'hi', fullProof?.nullifierHash,'hi', fullProof?.proof,'hiiiiiiiiii')
            }
        };
        generateSemaphoreProof();
    }, [isFullProof, shouldRender, identity])

    const { config } = usePrepareContractWrite({
        enabled: isFullProof && !!identity,
        address: GCoinAddress,
        abi: verficationContractABI,
        functionName: 'airDrop',
        args: [semaphoreProof?.merkleTreeRoot, semaphoreProof?.signal, semaphoreProof?.nullifierHash, semaphoreProof?.proof],
        chainId: 420,
        onSuccess(data) {
            console.log('Successful - proof prepare: ', data);
        },
        onError(error) {
            console.log('Error in verify Proof wasssap: ', error);
        }
    });

    const contractWrite = useContractWrite(config);

    return (
        <>
            {/* { // verify proof on chain and register identity
                !contractWrite.isSuccess &&
                <div className='button-container' onLoad={() => {!contractWrite.isSuccess && !contractWrite.isLoading && contractWrite.write?.()}}>
                    <div>Airdropping 100 G-Coins</div>
                    <div className="loading-spinner"/>
                </div>
            } */}

            {!contractWrite.isSuccess && shouldRender &&
                <div className='button-container'>
                    <button
                        className="glow-on-hover"
                        onClick={() => { contractWrite.write?.() }}
                        disabled={contractWrite.isLoading || contractWrite.isSuccess || !isFullProof}
                    >
                        Verify Semaphore Proof
                        <br />
                        & Airdrop 100 G-Coins
                    </button>
                    {contractWrite.isLoading && <div className='loading-spinner' />}
                </div>
            }

            { // Airdrop
                contractWrite.isSuccess &&
                <div>
                    <div>Transaction Hash: <a href={`https://goerli-optimism.etherscan.io/tx/${contractWrite.data?.hash}`} >{contractWrite.data?.hash}</a></div><br />
                    <div>Import G-Coins from: <a href={`https://goerli-optimism.etherscan.io/address/${GCoinAddress}`}>{GCoinAddress}</a></div>
                </div>
            }
        </>
    )
}