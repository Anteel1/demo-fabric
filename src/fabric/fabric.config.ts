import * as grpc from '@grpc/grpc-js';
import * as crypto from 'crypto';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import { promises as fs } from "fs";
// import { TextDecoder } from 'util';
import * as path from 'path';
const channelName = 'mychannel';
const chaincodeName = 'basic'
const mspId = 'Org1MSP'

// // Path to crypto materials.
const cryptoPath = path.resolve(__dirname, '..', '..', '..', 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com')

// // Path to user private key directory.
const keyDirectoryPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore')

// // Path to user certificate.
const certPath = path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'cert.pem');

// Path to peer tls certificate.
const tlsCertPath = path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt');

// Gateway peer endpoint.
const peerEndpoint = 'localhost:7051';

const peerHostAlias = 'peer0.org1.example.com'

const utf8Decoder = new TextDecoder();

async function devFactory(): Promise<any> {
  const client = await newGrpcConnection();
  const gateway = connect({
    client,
    identity: await newIdentity(),
    signer: await newSigner(),
    // Default timeouts for different gRPC calls
    evaluateOptions: () => {
      return { deadline: Date.now() + 5000 }; // 5 seconds
    },
    endorseOptions: () => {
      return { deadline: Date.now() + 15000 }; // 15 seconds
    },
    submitOptions: () => {
      return { deadline: Date.now() + 5000 }; // 5 seconds
    },
    commitStatusOptions: () => {
      return { deadline: Date.now() + 60000 }; // 1 minute
    },
  });
  try {
    // Get a network instance representing the channel where the smart contract is deployed.
    const network = gateway.getNetwork(channelName);

    // Get the smart contract from the network.
    const contract = network.getContract(chaincodeName);

    // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
    await initLedger(contract);
    return { contract }
    // Return all the current assets on the ledger.
    // await getAllAssets(contract);
  } finally {
    // gateway.close();
    // client.close();
    console.log('Done !')
  }
}

devFactory().catch(error => {
  console.error('******** FAILED to run the application:', error);
  process.exitCode = 1;
});

async function newGrpcConnection(): Promise<grpc.Client> {
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(peerEndpoint, tlsCredentials, {
    'grpc.ssl_target_name_override': peerHostAlias,
  });
}

async function newIdentity(): Promise<Identity> {
  const credentials = await fs.readFile(certPath);
  return { mspId, credentials };
}

async function newSigner(): Promise<Signer> {
  const files = await fs.readdir(keyDirectoryPath);
  const keyPath = path.resolve(keyDirectoryPath, files[0]);
  const privateKeyPem = await fs.readFile(keyPath);
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

/**
* This type of transaction would typically only be run once by an application the first time it was started after its
* initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
*/
async function initLedger(contract: Contract): Promise<void> {
  console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');

  await contract.submitTransaction('InitLedger');

  console.log('*** Transaction committed successfully');
}

/**
* Evaluate a transaction to query ledger state.
*/
// async function getAllAssets(contract: Contract): Promise<void> {
//   console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current assets on the ledger');

//   const resultBytes = await contract.evaluateTransaction('GetAllAssets');

//   const resultJson = utf8Decoder.decode(resultBytes);
//   const result = JSON.parse(resultJson);
//   console.log('*** Result:', result);
// }

/**
* Submit a transaction synchronously, blocking until it has been committed to the ledger.
*/
// async function createAsset(contract: Contract): Promise<void> {
//   console.log('\n--> Submit Transaction: CreateAsset, creates new asset with ID, Color, Size, Owner and AppraisedValue arguments');

//   await contract.submitTransaction(
//     'CreateAsset',
//     assetId,
//     'yellow',
//     '5',
//     'Tom',
//     '1300',
//   );

//   console.log('*** Transaction committed successfully');
// }



export const FabricFactory = {
  provide: "FABRIC_CONFIG",
  useFactory: devFactory,
};