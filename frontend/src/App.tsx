import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Register } from './components/register.component';
import transformProof from './utils/transformProof';
import { Airdrop } from './components/airdrop.component';
import { call } from 'viem/_types/actions/public/call';
import { Identity } from '@semaphore-protocol/identity';

const BASEURL = "http://localhost:8000";



function App() {

  const [company, setCompany] = useState('');
  const [step, setStep] = useState(0);
  const [link, setLink] = useState('');
  const [userId, setUserId] = useState();
  const [proofObj, setProofObj] = useState();
  const [identity, setIdentity] = useState<Identity>(new Identity('1'));
  const { address, connector, isConnected } = useAccount();
  // console.log(identity,'wwwww')
  const { connect, connectors, isLoading, pendingConnector } = useConnect({
    chainId: 420,
    onError(error: Error) {
      console.log("useConnect Error: ", error);
    }
  })

  useEffect(() => {
    if (isConnected) {
      setStep(4)
    }
  }, [isConnected])

  useEffect(() => {
    console.log('step', step)
  }, [step])

  

  const makeInterval = async function (callbackId:string) {
    console.log('interval started')
    const interval = setInterval(async () => {
      console.log('interval iteration')
      const proofReceived = await fetchProof(callbackId)
      if (proofReceived) {
        clearInterval(interval);
        setStep(3);
      }
    }, 3000)
  }

  const fetchProof = async (callbackId:string) => {
    if (!callbackId) return
    try {
      console.log(`requesting ${BASEURL}/get-proofs?id=${callbackId}`);
      const response = await fetch(`${BASEURL}/get-proofs?id=${callbackId}`);
      if (response.status === 200) {
        const proofData = await response.json();
        setProofObj(proofData[0])
        localStorage.setItem('fullProof', JSON.stringify(transformProof(proofData[0])))
        console.log('proof fetched successfully', proofData[0])
        return true
      }
      else return false
    }
    catch (error) {
      console.log(error)
      return false
    }
  }

  const completeStep0 = async function () {
    try {
      const response = await axios.get(BASEURL + "/request-proofs");
      const _link = response.data.reclaimUrl
      setLink(_link);
      makeInterval(response.data.callbackId);
      setStep(2)
    } catch (e) {
      console.log('Error', e)
    }
  }
  const step0 = <>
    <p>
      connect your wallet
    </p>
    {
      !isConnected &&
      connectors.map((connector) => (
        <button
          disabled={!connector.ready || isConnected}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
          {isLoading &&
            connector.id === pendingConnector?.id &&
            ' (connecting)'}
        </button>
      ))
    }
  </>
  const step1 = <>
    <p> Which company do you belong to? </p>
    <div><input onChange={evt => setCompany(evt.target.value)} /><input type="submit" onClick={() => { completeStep0() }} /></div>
  </>
  const step2 = <>
    <p> Scan the QR code or visit the below link to prove you are an employee of {company} </p>

    <div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
      <QRCode
        size={256}
        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
        value={link}
        viewBox={`0 0 256 256`}
      />
    </div>

    <a href={link}>Open Link </a>
  </>
  const step3 = <>
    <p>Successfully verified you are an employee of {company}</p>
    <a href="https://duckduckgo.com">Start Gossiping</a>
    <Register identity = {identity} setStep={setStep} setIdentity={setIdentity}/>
  </>
  const step4 = <Airdrop identity = {identity} userAddrSignal={address!} shouldRender = {true}/>
  
  const steps = [step0, step1, step2, step3, step4]
  return (
    <div className="App">
      <header className="App-header">
        {steps[step]}
      </header>
    </div>
  );
}

export default App;
