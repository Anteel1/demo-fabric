import {
    InitConfig,
    Agent,
    WsOutboundTransport,
    HttpOutboundTransport,
    ConnectionEventTypes,
    ConnectionStateChangedEvent,
    DidExchangeState,
    AutoAcceptCredential,
    CredentialEventTypes,
    CredentialState,
    CredentialStateChangedEvent,
    OutOfBandRecord,
} from '@aries-framework/core'
import { agentDependencies, HttpInboundTransport } from '@aries-framework/node'
import { Schema } from 'indy-sdk'
import fetch from 'node-fetch'


const getGenesisTransaction = async (url: string) => {
    // Legacy code has a small issue with the call-signature from node-fetch
    // @ts-ignore
    const response = await fetch(url)

    return await response.text()
}


const initializeHolderAgent = async () => {
    const genesisTransactionsBCovrinTestNet = await getGenesisTransaction('http://test.bcovrin.vonx.io/genesis')
    // Simple agent configuration. This sets some basic fields like the wallet
    // configuration and the label. It also sets the mediator invitation url,
    // because this is most likely required in a mobile environment.
    const config: InitConfig = {
        label: 'demo-agent-holder',
        walletConfig: {
            id: 'demo-agent-holder',
            key: 'demoagentholder00000000000000000',
        },
        indyLedgers: [
            {
                id: 'bcovrin-test-net',
                isProduction: false,
                indyNamespace: 'bcovrin:test',
                genesisTransactions: genesisTransactionsBCovrinTestNet,
            },
        ],
        autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
        autoAcceptConnections: true,
        endpoints: ['http://localhost:3002'],
    }

    // A new instance of an agent is created here
    const agent = new Agent({ config, dependencies: agentDependencies })

    // Register a simple `WebSocket` outbound transport
    agent.registerOutboundTransport(new WsOutboundTransport())

    // Register a simple `Http` outbound transport
    agent.registerOutboundTransport(new HttpOutboundTransport())

    // Register a simple `Http` inbound transport
    agent.registerInboundTransport(new HttpInboundTransport({ port: 3002 }))

    // Initialize the agent
    await agent.initialize()

    return agent
}


const setupCredentialListener = (holder: Agent) => {
    holder.events.on<CredentialStateChangedEvent>(CredentialEventTypes.CredentialStateChanged, async ({ payload }) => {
        switch (payload.credentialRecord.state) {
            case CredentialState.OfferReceived:
                console.log('received a credential')
                // custom logic here
                await holder.credentials.acceptOffer({ credentialRecordId: payload.credentialRecord.id })
            case CredentialState.Done:
                console.log(`Credential for credential id ${payload.credentialRecord.id} is accepted`)
                // For demo purposes we exit the program here.
                process.exit(0)
        }
    })
}



const receiveInvitation = async (holder: Agent, invitationUrl: string) => {
    const { outOfBandRecord } = await holder.oob.receiveInvitationFromUrl(invitationUrl)

    return outOfBandRecord
}


const invitationUrl = 'https://example.org?oob=eyJAdHlwZSI6Imh0dHBzOi8vZGlkY29tbS5vcmcvb3V0LW9mLWJhbmQvMS4xL2ludml0YXRpb24iLCJAaWQiOiJiZWU1Y2U4Ny1lMzNlLTQyODktOWU1MS00YmRiMjZkNTE2YTYiLCJsYWJlbCI6ImRlbW8tYWdlbnQtaXNzdWVyIiwiYWNjZXB0IjpbImRpZGNvbW0vYWlwMSIsImRpZGNvbW0vYWlwMjtlbnY9cmZjMTkiXSwiaGFuZHNoYWtlX3Byb3RvY29scyI6WyJodHRwczovL2RpZGNvbW0ub3JnL2RpZGV4Y2hhbmdlLzEuMCIsImh0dHBzOi8vZGlkY29tbS5vcmcvY29ubmVjdGlvbnMvMS4wIl0sInNlcnZpY2VzIjpbeyJpZCI6IiNpbmxpbmUtMCIsInNlcnZpY2VFbmRwb2ludCI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwMSIsInR5cGUiOiJkaWQtY29tbXVuaWNhdGlvbiIsInJlY2lwaWVudEtleXMiOlsiZGlkOmtleTp6Nk1rakdNUm9Fd2Zrb3RVMWViZk13a1F4Mkt4R2lGV25hM2F4Z1BVYmlENVMydEciXSwicm91dGluZ0tleXMiOltdfV19'

const run = async () => {
    console.log('Initializing the holder...')
    const holder = await initializeHolderAgent()
    // console.log('Initializing the issuer...')
    // const issuer = await initializeIssuerAgent()

    console.log('Initializing the credential listener...')
    setupCredentialListener(holder)

    // console.log('Initializing the connection...')
    // const { outOfBandRecord, invitationUrl } = await createNewInvitation(issuer)
    // setupConnectionListener(issuer, outOfBandRecord, flow(issuer))
    await receiveInvitation(holder, invitationUrl)
}



export const AriesConfig = {
    provide: "CONFIG_ARIES",
    useFactory: run,
};
