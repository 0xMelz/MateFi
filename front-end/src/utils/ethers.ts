import { ethers } from "ethers";
import {FraxBankABI} from "./abi/FraxBank"; // Ethers

// Constant: Frax Bank deployed address
export const FRAX_LOANS_CONTRACT_ADDRESS: string =
  process.env.NEXT_PUBLIC_FRAX_LOANS_CONTRACT_ADDRESS;

// Constant: Frax Contract ADDRESS address
export const FraxContract_ADDRESS: string =
  process.env.NEXT_PUBLIC_FRAX_TOKEN_CONTRACT_ADDRESS;

// Export FraxBank contract w/ RPC
export const FraxBankRPC = new ethers.Contract(
  FRAX_LOANS_CONTRACT_ADDRESS,
  FraxBankABI,
  new ethers.providers.JsonRpcProvider(
    `${process.env.NEXT_PUBLIC_ALCHEMY_RPC}`,
    11155111
  )
);

/**
 * Converts BigNumber Ether value to number
 * @param {ethers.BigNumber} num bignumber ether value
 * @returns {number} formatted ether as number
 */
export function parseEther(num: ethers.BigNumber): number {
  return Number(ethers.utils.formatEther(num.toString()));
}
