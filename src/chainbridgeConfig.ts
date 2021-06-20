import USDCIcon from "./media/tokens/usdc.svg";

export type TokenConfig = {
  address: string;
  name?: string;
  symbol?: string;
  imageUri?: string;
  resourceId: string;
  isNativeWrappedToken?: boolean;
};

export type ChainType = "Ethereum" | "Substrate";

export type BridgeConfig = {
  networkId?: number;
  chainId: number;
  name: string;
  rpcUrl: string;
  type: ChainType;
  tokens: TokenConfig[];
  nativeTokenSymbol: string;
  decimals: number;
};

export type EvmBridgeConfig = BridgeConfig & {
  bridgeAddress: string;
  erc20HandlerAddress: string;
  type: "Ethereum";
  //This should be the full path to display a tx hash, without the trailing slash, ie. https://etherscan.io/tx
  blockExplorer?: string;
  defaultGasPrice?: number;
  deployedBlockNumber?: number;
};

export type SubstrateBridgeConfig = BridgeConfig & {
  type: "Substrate";
  chainbridgePalletName: string;
  transferPalletName: string;
  transferFunctionName: string;
  typesFileName: string;
};

export type ChainbridgeConfig = {
  chains: Array<EvmBridgeConfig | SubstrateBridgeConfig>;
};

export const chainbridgeConfig: ChainbridgeConfig = {
  chains: [
    {
      chainId: 0,
      networkId: 137,
      name: "Polygon",
      decimals: 18,
      bridgeAddress: "0x05df5B40D6806f4c9A933e77b390AD7Bd373aDd4",
      erc20HandlerAddress: "0x1aD9dE2c6F91302489f3e6b562d844D05441C1B4",
      rpcUrl: "https://rpc-mainnet.matic.network",
      type: "Ethereum",
      nativeTokenSymbol: "ETH",
      tokens: [
        {
          address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
          imageUri: USDCIcon,
          resourceId:
            "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        },
      ],
    },
    {
      chainId: 1,
      networkId: 2022,
      name: "Beresheet",
      decimals: 18,
      bridgeAddress: "0xF811AB52f26FF9B68b890f36a6BabB0C47e924df",
      erc20HandlerAddress: "0x2fE6E7BCd8369CADD9B6b7619934B37b7D616852",
      rpcUrl: "http://beresheet1.edgewa.re:9933",
      type: "Ethereum",
      nativeTokenSymbol: "testEDG",
      tokens: [
        {
          address: "0x6E885aBda5567F3e8b1D8Dc9BbD1Bdf73b85FE6D",
          name: "USDC Coin (bridged)",
          symbol: "USDC",
          imageUri: USDCIcon,
          resourceId:
            "0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00",
        },
      ],
    },
  ],
};
