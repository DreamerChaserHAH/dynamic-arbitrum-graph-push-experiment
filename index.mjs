import { PushAPI } from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const local_http_provider = "http://localhost:8547"
const contract_address = process.env.ARBITRUM_CONTRACT_ADDRESS
const contract_abi = [
    "event Log (address indexed sender, string message)"
]
const provider = new ethers.JsonRpcProvider(local_http_provider);

console.log(process.env.PRIV_KEY)

//const arbitrum_testnet_http_provider = "https://sepolia-rollup.arbitrum.io/rpc"
//const arbitrum_testnet_provider = new ethers.JsonRpcProvider(arbitrum_testnet_http_provider);
const signer = new ethers.Wallet(process.env.PRIV_KEY);

const setup = async () => {
    const pushUser = await PushAPI.initialize(signer, {
        env: "staging",
    })
    
    /*const sendNotifRes = await pushUser.channel.send(['*'], {
        notification: { title: 'test', body: 'test' },
    })*/

    const contract = new ethers.Contract(contract_address, contract_abi, provider);
    contract.on("Log", async (sender, message, event) => {
        //sendNotifRes();
        //console.log(`${sender} says: ${message}`);
        await pushUser.channel.send(['*'], {
            channel: "eip155:421614:"+process.env.CHANNEL_ADDRESS,
            notification: { title: 'test', body: 'test' },
        })
    })
}

setup()