import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import axios from 'axios';

import ReactDOM from 'react-dom';
import QRCode from 'react-qr-code';

const BASEURL = "http://localhost:3001";
function App() {
  
  const [ company, setCompany ] = useState();
  const [ step, setStep ] = useState(0);
  const [ link, setLink ] = useState();
  const [ userId, setUserId ] = useState();

  const makeInterval = async function(uid) {
    const interval = setInterval(async () => {
      const st = await axios.get(BASEURL+"/status?userId="+uid);
      if(st.data.verified == 1){
        clearInterval(interval);
	completeStep1();
      }
    }, 2000)
  }


  const completeStep0 = async function() {
    const response = await axios.get(BASEURL+"/request-proofs");
    const _link = response.data.reclaimUrl;
    setLink(_link);
    await setUserId(response.data.userId);
    makeInterval(response.data.userId);
    setStep(1)
  }
  const completeStep1 = async function(){
    setStep(2);
  }
  const step0 = <>
		  <p> Which company do you belong to? </p>
		  <div><input onChange={evt => setCompany(evt.target.value)}/><input type="submit"onClick={() => {completeStep0()}}/></div>
		</>
  const step1 = <>
		  <p> Scan the QR code or visit the below link to prove you are an employee of {company} </p>
		  <a href={link}>Open Link </a>
		</>
  const step2 = <>
		  <p>Successfully verified you are an employee of {company}</p>
		  <a href="https://duckduckgo.com">Start Gossiping</a>
		</>
  const steps = [step0, step1, step2]
  return (
    <div className="App">
      <header className="App-header">
	  {step!=1?<img src={logo} className="App-logo" alt="logo" />:<div style={{ height: "auto", margin: "0 auto", maxWidth: 256, width: "100%" }}>
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={link}
                viewBox={`0 0 256 256`}
              />
            </div>
	  }
	{steps[step]}
      </header>
    </div>
  );
}

export default App;
