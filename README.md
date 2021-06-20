# Chainbridge UI

A Chainbridge UI for Edgeware, configured for bridging Polygon assets
to Edgeware.

This document includes instructions for setting up an ERC20 asset
bridge between Edgeware and Polygon. It is based on instructions at
https://chainbridge.chainsafe.io/live-evm-bridge/ and code from
https://github.com/ChainSafe/chainbridge-ui.

See also https://github.com/dtradeorg/edg-bridge, another implementation
of an ETH to EDG bridge by the dTrade team.

---

## Funding your accounts

You will need a new Metamask account, connected to both Polygon and
Edgeware. You should use a fresh account, as you'll be exporting the
private key and providing it to the Chainbridge relayers in this
tutorial. (Using an existing account risks your funds and to the bridge.)

Add these networks to Metamask:

```
Polygon
https://rpc-mainnet.matic.network
137
MATIC
https://polygonscan.com/
```

```
Beresheet
http://beresheet1.edgewa.re:9933
2022
testEDG
https://beresheet.edgscan.com/
```

Send some MATIC to the address from an exchange (a few MATIC is enough).

Go to https://edgewa.re/keygen and use the bottom tool to convert your
EVM address into a mainnet address. Go to polkadot-js at
https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fberesheet1.edgewa.re#/
and send some EDG to that address (a few EDG is enough).

Check Metamask to make sure you've received your balances on both chains.

---

Download and install the chainbridge CLI. Note that we are working off commit hash `5bd78d4`, which has support for customizing decimals in bridged contracts:

```
git clone https://github.com/ChainSafe/chainbridge-deploy \
&& cd chainbridge-deploy/cb-sol-cli \
&& git checkout 5bd78d4 \
&& npm install \
&& make install
```

You should set up some environment variables before proceeding.

```
export SRC_ADDR=<Your public key on Goerli>
export SRC_PK=<Your private key on Goerli>
export DST_ADDR=<Your public key on Rinkeby>
export DST_PK=<Your private key on Rinkeby>

export SRC_GATEWAY=https://rpc-mainnet.matic.network
export DST_GATEWAY=http://beresheet1.edgewa.re:9933
```

You will also need to set up each token being bridged over from
Polygon to Edgeware separately. As an example, the token address for
USDC on Polygon is 0x2791bca1f2de4661ed88a30c99a7a9449aa84174

The resource ID can be any unique hex identifier, with the last 31 bytes
available

```
export SRC_TOKEN=<Matic contract address of the asset to bridge>
export RESOURCE_ID=0x000000000000000000000000000000c76ebe4a02bbc34786d860b355f5a5ce00
```

Deploy our chainbridge contracts on Polygon:

```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK --gasPrice 10000000000 deploy \
    --bridge --erc20Handler \
    --relayers $SRC_ADDR \
    --relayerThreshold 1\
    --chainId 0
```

Take note of the output of the above command, and assign them to the following variables:

```
export SRC_BRIDGE=<Bridge address>
export SRC_HANDLER=<Erc20 Handler address>
```

Register the asset we are bridging over:

```
cb-sol-cli --url $SRC_GATEWAY --privateKey $SRC_PK \
    --gasPrice 10000000000 \
    bridge register-resource \
    --bridge $SRC_BRIDGE \
    --handler $SRC_HANDLER \
    --resourceId $RESOURCE_ID \
    --targetContract $SRC_TOKEN
```

Deploy the bridged USDC contracts on the destination side.
Note that this is done with 6 decimal points:

```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 deploy\
    --bridge --erc20 --erc20Decimals 6 --erc20Handler \
    --relayers $DST_ADDR \
    --relayerThreshold 1 \
    --chainId 1
```

Take note of the output of the above command and assign them to the following variables (for the Bridge, Erc20 handler, and bridged Erc20 asset address):

```
export DST_BRIDGE=<Dest bridge address>
export DST_HANDLER=<Dest Erc20 Handler>
export DST_TOKEN=<Dest Erc20 address>
```

Register the bridged contract on the bridge:

```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 bridge register-resource \
    --bridge $DST_BRIDGE \
    --handler $DST_HANDLER \
    --resourceId $RESOURCE_ID \
    --targetContract $DST_TOKEN
```

Configure the token as mintable/burnable:

```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 bridge set-burn \
    --bridge $DST_BRIDGE \
    --handler $DST_HANDLER \
    --tokenContract $DST_TOKEN
```

Allow minting new bridged USDC:

```
cb-sol-cli --url $DST_GATEWAY --privateKey $DST_PK --gasPrice 10000000000 erc20 add-minter \
    --minter $DST_HANDLER \
    --erc20Address $DST_TOKEN
```

---

At this point the bridge has been set up, and we should now set up relayers.

```
git clone -b v1.1.1 --depth 1 https://github.com/ChainSafe/chainbridge \
&& cd chainbridge \
&& make build
```

Configure the relayer:

```
echo "{
  \"chains\": [
    {
      \"name\": \"Polygon\",
      \"type\": \"ethereum\",
      \"id\": \"0\",
      \"endpoint\": \"wss://rpc-mainnet.matic.quiknode.pro\",
      \"from\": \"$SRC_ADDR\",
      \"opts\": {
        \"bridge\": \"$SRC_BRIDGE\",
        \"erc20Handler\": \"$SRC_HANDLER\",
        \"genericHandler\": \"$SRC_HANDLER\",
        \"gasLimit\": \"1000000\",
        \"maxGasPrice\": \"10000000000\"
      }
    },
    {
      \"name\": \"Beresheet\",
      \"type\": \"ethereum\",
      \"id\": \"1\",
      \"endpoint\": \"ws://beresheet1.edgewa.re:9944\",
      \"from\": \"$DST_ADDR\",
      \"opts\": {
        \"bridge\": \"$DST_BRIDGE\",
        \"erc20Handler\": \"$DST_HANDLER\",
        \"genericHandler\": \"$DST_HANDLER\",
        \"gasLimit\": \"1000000\",
        \"maxGasPrice\": \"10000000000\"
      }
    }
  ]
}" > config.json
```

Set up the relayer's keystore with private keys. You will be asked
for a password, which you will have to re-enter when starting the
relayer.

```
./build/chainbridge accounts import --privateKey $SRC_PK
./build/chainbridge accounts import --privateKey $DST_PK
```

Start the relayer:

```
./build/chainbridge --config config.json --verbosity trace --latest
```

You may follow the instructions at
https://chainbridge.chainsafe.io/live-evm-bridge/ to use the CLI
interface to transfer tokens (note that you will need some Matic USDC
for the instructions to work.

Otherwise, continue to set up the chainbridge UI.

---

Setting up the Chainbridge UI:

```
git clone git@github.com:ChainSafe/chainbridge-ui.git
cd chainbridge-ui
yarn
cp .env.example .env
```

Update the .env file
Go to src/chainbridgeConfig.ts and update `chainbridgeConfig` to
include these parameters. You will need to change the second
default chain from a Substrate to an Ethereum chain:

- chainId: 0
- networkId: 137
- name: Polygon
- type: Ethereum
- bridgeAddress: \$SRC_BRIDGE
- erc20HandlerAddress: \$SRC_HANDLER
- rpcUrl: https://rpc-mainnet.matic.network
- nativeTokenSymbol: MATIC
- tokens:
  - address: \$SRC_TOKEN
  - imageUri: USDCIcon
  - resourceId: \$RESOURCE_ID

And for the destination chain:

- chainId: 1
- networkId: 2022
- name: Beresheet
- type: Ethereum
- bridgeAddress: \$DST_BRIDGE
- erc20HandlerAddress: \$DST_HANDLER
- rpcUrl: http://beresheet1.edgewa.re:9933
- nativeTokenSymbol: testEDG
- tokens:
  - address: \$DST_TOKEN
  - imageUri: USDCIcon
  - resourceId: \$RESOURCE_ID

Once this is done, you can create and run the chainbridge UI:

```
yarn start
```

You may need to go to a DEX to obtain some USDC:

- https://app.sushi.com/swap
- https://quickswap.exchange/#/swap
- https://exchange.dfyn.network/

You can now use Chainbridge to send funds to and from the bridge.

To build the chainbridge UI:

```
yarn build
```

We recommend using Vercel to automatically build the chainbridge UI
whenever a new version is pushed to `main`. See the Vercel docs for
details: https://vercel.com/docs/platform/deployments
