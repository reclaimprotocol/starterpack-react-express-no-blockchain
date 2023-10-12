# Centralized Server Starter Pack
This starter pack lets you quickly setup a backend using express js and a frontend using react. 
This starter pack takes care of 
1. Asking for some information from the user
2. Asking the user for relevant proofs
3. Show the QR code for the user to scan and submit proofs
4. Wait for the user to submit proof
5. Redirect to a success page once proofs are submitted

What you will need to change
1. The proofs you need to ask for here
2. The business logic that should be executed once the proofs are submitted here
3. Ofcourse, the UI :)

## Run locally
### setup ngrok
Though this step is optional, we recommend using ngrok so that your local host server is accessible from your mobile phone without having to setup any fancy networking configuration. 
1. Sign up for ngrok & fetch your auth token
2. Setup ngrok on your commandline `ngrok config add-authtoken <your auth token>`
3. run ngrok for port 3001 using `ngrok http 3001` 

### run backend
1. `cd backend`
2. edit .env and set NGROK_BASEURL="<url returned on step 3 above>"
3. `npm start`

### run frontend
1. `cd frontend`
2. `npm start`

Open `localhost:3000` on your browser

