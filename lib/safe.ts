import Safe from '@safe-global/protocol-kit'
import { parseEther, encodeFunctionData, SendTransactionParameters } from 'viem'

import { rpcUrl, bundlerClient, PermissionlessClient } from './permissionless'
import { sepolia } from 'viem/chains'

// Fetches onchain data about the safe (owners and whether it was deployed)
export const getSafeData = async (
  safeAddress: string
): Promise<{ isDeployed: boolean; owners: string[] }> => {
  const protocolKit = await Safe.init({
    provider: rpcUrl,
    // @ts-ignore
    signer: window.ethereum.account,
    safeAddress
  }).catch(err => {
    console.warn(err)
  })

  if (!protocolKit) return { isDeployed: false, owners: [] }
  const isDeployed = await protocolKit.isSafeDeployed()
  const owners = await protocolKit.getOwners()
  return { isDeployed, owners }
}

const NFT_ADDRESS = '0xBb9ebb7b8Ee75CDBf64e5cE124731A89c2BC4A07'

// Deploys a Safe by sending a dummy transaction
export const deploySafe = async (
  permissionlessClient: PermissionlessClient
) => {
  // To deploy the Safe we will simply send a dummy transaction.
  // Her we mint an NFT, but any transaction would work:
  const nftTransaction = {
    to: NFT_ADDRESS,
    value: parseEther('0'),
    data: encodeFunctionData({
      abi: [
        {
          constant: false,
          inputs: [
            {
              name: 'to',
              type: 'address'
            },
            {
              name: 'tokenId',
              type: 'uint256'
            }
          ],
          name: 'safeMint',
          payable: false,
          stateMutability: 'nonpayable',
          type: 'function'
        }
      ],
      functionName: 'safeMint',
      args: [permissionlessClient.account.address, getRandomUint256()]
    })
  }

  const txHash = await permissionlessClient
    .sendTransaction(nftTransaction as SendTransactionParameters)
    .catch((err: string) => {
      console.error(err)
    })

  if (!txHash) return
  console.info(
    'Safe is being deployed: https://jiffyscan.xyz/userOpHash/' + txHash
  )
  return await bundlerClient.waitForUserOperationReceipt({
    hash: txHash,
    timeout: 120000
  })
}

// Generates a random number to be used as an NFT token ID
function getRandomUint256 (): bigint {
  const dest = new Uint8Array(32) // Create a typed array capable of storing 32 bytes or 256 bits

  crypto.getRandomValues(dest) // Fill the typed array with cryptographically secure random values

  let result = 0n
  for (let i = 0; i < dest.length; i++) {
    result |= BigInt(dest[i]) << BigInt(8 * i) // Combine individual bytes into one bigint
  }

  return result
}
