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
      bridgeAddress: "0xc8C19D5f0Ee80F17d061151c449191aF7276C488",
      erc20HandlerAddress: "0x1D25882b57984efAFa512dE97d03016410Cc1914",
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
      bridgeAddress: "0x833D943BdBA24829B02dB1314665f0A089DefB5e",
      erc20HandlerAddress: "0x86034B064Afef0CD768eeaEaBDbB5CF5b7cDAf49",
      rpcUrl: "http://beresheet1.edgewa.re:9933",
      type: "Ethereum",
      nativeTokenSymbol: "testEDG",
      defaultGasPrice: 1,
      tokens: [
        {
          address: "0xd63C798b612bD08Ec26aB019B52538016240f0F8",
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
