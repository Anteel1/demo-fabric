import { Inject } from '@nestjs/common';
import { FabricConfig } from './fabric.type';

export class FabricService {
  constructor(@Inject('FABRIC_CONFIG') private readonly fabric: any,
  ) { }

  getContract(classContractName: string) {
    return this.fabric.network.getContract(
      process.env.USE_K8S ? process.env.FABRIC_CHAINCODE_NAME : FabricConfig.devChaincodeId,
      classContractName
    );
  }
  async getAll() {

    const resultBytes = await this.fabric.contract.evaluateTransaction('GetAllAssets');
    const utf8Decoder = new TextDecoder
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    return result
  }
}
