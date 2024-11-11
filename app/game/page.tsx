"use client"
import { subtitle, title } from "@/components/primitives";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { CONSTANTS, PushAPI } from "@pushprotocol/restapi";
import { useContext, useEffect, useState } from "react";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
import { PushStream } from "@pushprotocol/restapi/src/lib/pushstream/PushStream";
import toast from "react-hot-toast";

const target_channel = "0xB0905Eddb1E309589d5d5d9534F38C1960902Aa8";

export default function GamePage() {

    const {ready, authenticated} = usePrivy();
    const {ready: walletsReady, wallets} =  useWallets();
    let currentWalletIndex = 0;

    if(!ready){
        return (
            <div>
                <h1 className={title()}>Please wait a few seconds for everything to load up...</h1>
            </div>
        )
    }

    if(!authenticated && !walletsReady){
        return(
            <div className="inline-block max-w-xl text-center justify-center">
            <span className={title()}>Ready to&nbsp;</span>
            <span className={title({ color: "violet" })}>Play?&nbsp;</span>
            <br />
          </div>
        )
    }

    const currentUsingWalletObject = wallets[currentWalletIndex];
    const [pushUser, setPushUser] = useState<PushAPI | null>(null);  

    useEffect(() => {
        const setupPushProfile = async () => {
            await currentUsingWalletObject.switchChain(421614)
            const provider = await currentUsingWalletObject.getEthersProvider();
            let signer = (provider.getSigner());  
            setPushUser(await PushAPI.initialize(signer, {
                env: ENV.STAGING,
            }))
        }

        setupPushProfile()

    }, [currentWalletIndex]);

    useEffect(() => {
        
        const setupWebsocketNotificationService = async () => {
            if(!pushUser) return;

            let pushWebSocket = await pushUser.initStream([CONSTANTS.STREAM.NOTIF], {
                filter: {
                    channels: ['*'],
                },
                connection: {
                    retries: 3,
                },
                raw: false
            })
            
            pushWebSocket.on(CONSTANTS.STREAM.NOTIF, (data: any) => {
                console.log(data["message"]["payload"]["body"])
                toast("Notification received: " + data["message"]["payload"]["body"])
            })     

            console.log("websocket connected")
            pushWebSocket.connect()
        }

        const setupChannelSubscription = async () => {
            if(!pushUser) return

            const subscribeToChannel = async () => {
                if (!pushUser) return;
        
                const subscribeStatus = await pushUser.notification.subscribe("eip155:421614:0xB0905Eddb1E309589d5d5d9534F38C1960902Aa8".toLowerCase(), {
                    
                });
        
                console.log(subscribeStatus);
            }
            
            
            let subscriptions = await pushUser.notification.subscriptions();

            let foundSubscription = false;
            subscriptions.forEach((subscription: any) => {
                if(subscription.channel == target_channel){
                    foundSubscription = true;
                    return;
                }
            });
            
            if(!foundSubscription){
                await subscribeToChannel()
            }

        }

        setupChannelSubscription()
        setupWebsocketNotificationService()
    }, [pushUser]);

    return (
        <div>
            <h1 className={title()}>Game is running already! (supposedly)</h1>
            <span className={subtitle()}>Wait for notifications to come in!</span>
        </div>
    );
}