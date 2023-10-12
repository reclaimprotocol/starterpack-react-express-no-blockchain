import { useEffect, useState } from "react";
import { useContractEvent, useContractWrite, usePrepareContractWrite } from 'wagmi';
import contractABI from '../assets/gcoinABI.json';
import { Identity } from "@semaphore-protocol/identity";
import { isLabelWithInternallyDisabledControl } from "@testing-library/user-event/dist/utils";


export function Register({ setStep, identity, setIdentity }
    :
    {
        setStep: (step: number) => void,
        identity: Identity | undefined,
        setIdentity: (identity: Identity) => void
    }) {



    const [isPrepared, setIsPrepared] = useState(false);
    const [fullProof, setFullProof] = useState();
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const storedFullProof = localStorage.getItem('fullProof');
        if (storedFullProof) {
            const parsedObject = JSON.parse(storedFullProof);
            setFullProof(parsedObject);
            console.log(parsedObject, 'fullProof found in localstorage')
        }
    }, [])



    console.log('identity', identity)
    const { config } = usePrepareContractWrite({
        enabled: !!identity || !!fullProof,
        address: "0x003EFcCBe8303d338e944F263a77cBc036Bd9ae8",
        abi: contractABI,
        functionName: 'emitEvent',
        args: [
            fullProof],
        chainId: 420,
        onSuccess(data) {
            console.log(identity);
            console.log('Successful - register prepare: ', data);
            setIsPrepared(true);
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
    useEffect(() => {
        console.log(isLoading, 'wasssss')
    }, [isLoading])
    return (
        <>

            <div className='button-container'>
                {!contractWrite.isSuccess &&
                    <button
                        className="glow-on-hover"
                        onClick={() => {
                            contractWrite.write?.()
                        }}
                    // disabled={contractWrite.isLoading || contractWrite.isSuccess || !isPrepared}
                    >
                        Verify Reclaim Proof
                    </button>


                }
                {(contractWrite.isLoading || isLoading) && <div className='loading-spinner' />}
            </div>
        </>
    )
}