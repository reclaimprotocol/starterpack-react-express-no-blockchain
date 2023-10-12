import { useEffect, useState } from "react";
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import contractABI from '../assets/gcoinABI.json';
import { Identity } from "@semaphore-protocol/identity";


export function Register({ setStep }
    :
    {
        setStep: (step: number) => void
    }) {
    const [fullProof, setFullProof] = useState();
    const [isLoading, setIsLoading] = useState(false)

    ///getting the fullproof from localstorage
    useEffect(() => {
        const storedFullProof = localStorage.getItem('fullProof');
        if (storedFullProof) {
            const parsedObject = JSON.parse(storedFullProof);
            setFullProof(parsedObject);
            console.log(parsedObject, 'fullProof found in localstorage')
        }
    }, [])

    ///preparing for contract writing
    const { config } = usePrepareContractWrite({
        enabled:!!fullProof,
        address: "0x003EFcCBe8303d338e944F263a77cBc036Bd9ae8",
        abi: contractABI,
        functionName: 'emitEvent',
        args: [fullProof],
        chainId: 420,
        onSuccess(data) {
            console.log('Successful - register prepare: ', data);
        },
        onError(error) {
            console.log('Error in verify Proof: ', error)
        }
    });
    const contractWrite = useContractWrite(config);

    useEffect(() => {
        async function completeStep() {
            setTimeout(() => {
                setStep(4)
            }, 4000)
        }
        if (contractWrite.isSuccess) {
            setIsLoading(true)
            completeStep()
        }
    }, [contractWrite.isSuccess])

    return (
        <>
            <div className='button-container'>
                {!contractWrite.isSuccess &&
                    <button
                        className="glow-on-hover"
                        onClick={() => {
                            contractWrite.write?.()
                        }}
                    >
                        Verify Reclaim Proof
                    </button>
                }
                {(contractWrite.isLoading || isLoading) && <div className='loading-spinner' />}
            </div>
        </>
    )
}