import { useEffect, useState } from "react";
import { useContractWrite, usePrepareContractWrite } from 'wagmi';
import contractABI from '../assets/gcoinABI.json';
import { Identity } from "@semaphore-protocol/identity";


export function Register({setStep, identity, setIdentity }
    :
    {
        setStep: (step: number) => void,
        identity: Identity | undefined,
        setIdentity: (identity: Identity) => void
    }) {



    const [isPrepared, setIsPrepared] = useState(false);
    const [fullProof, setFullProof] = useState();

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
        address: "0xCc08210D8f15323104A629a925E4cc59D0fa2Fe1",
        abi: contractABI,
        functionName: 'merkelizeUser',
        args: [
            fullProof
            , identity?.commitment.toString()],
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
    useEffect(()=>{
        if(contractWrite.isSuccess){
            setStep(4)
        }
    },[contractWrite.isSuccess])
    return (
        <>
            {!contractWrite.isSuccess &&
                <div className='button-container'>
                    <button
                        className="glow-on-hover"
                        onClick={() => {
                            contractWrite.write?.()
                        }}
                    // disabled={contractWrite.isLoading || contractWrite.isSuccess || !isPrepared}
                    >
                        Verify Reclaim Proof &
                        <br />
                        Register Semaphore Identity
                    </button>
                    {contractWrite.isLoading && <div className='loading-spinner' />}
                </div>
            }
        </>
    )
}