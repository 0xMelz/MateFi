import axios from "axios"; // Axios
import {eth} from "./eth"; // ETH state
import {toast} from "react-toastify"; // Toast notifications
import {BigNumber, ethers} from "ethers"; // Ethers
import {ERC721ABI} from "../utils/abi/erc721"; // ABI: ERC721
import {createContainer} from "unstated-next"; // State
import {FraxBankABI} from "../utils/abi/FraxBank"; // ABI: FraxBank
import {FraxContract_ADDRESS, FRAX_LOANS_CONTRACT_ADDRESS} from "../utils/ethers";
import {FraxContractABI} from "../utils/abi/FraxContract"; // Utils

/*
  TODO: fix arbitrary gas limits
*/

/**
 * Provides utility functions for use with loan management
 */
function useLoan() {
    // Collect provider from eth state
    const {provider} = eth.useContainer();

    /**
     * Generates new ERC721 contract from ERC721 token address
     * @param {string} address of ERC721 contract
     * @returns {ethers.Contract} connected to provider
     */
    async function collectERC721Contract(
        address: string
    ): Promise<ethers.Contract | undefined> {
        if (provider) {
            return new ethers.Contract(
                address,
                ERC721ABI,
                await provider.getSigner()
            );
        }
    }

    /**
     * Generates FraxBank contract
     * @returns {ethers.Contract} connected to provider
     */
    async function collectFraxBankContract(): Promise<ethers.Contract | undefined> {
        if (provider) {
            return new ethers.Contract(
                FRAX_LOANS_CONTRACT_ADDRESS,
                FraxBankABI,
                await provider.getSigner()
            );
        }
    }

    /**
     * Generates Frax contract
     * @returns {ethers.Contract} connected to provider
     */
    async function collectFraxContract(): Promise<ethers.Contract | undefined> {
        if (provider) {
            return new ethers.Contract(
                FraxContract_ADDRESS,
                FraxContractABI,
                await provider.getSigner()
            );
        }
    }

    /**
     * Allows underwriting an active loan
     * @param {number} loanId to underwrite
     * @param {number} value to underwrite with
     */
    async function underwriteLoan(loanId: number, value: number): Promise<void> {

        // Collect contract
        const FraxBank = await collectFraxBankContract();
        // Collect Frax contract
        const Frax = await collectFraxContract();

        // Force contract != undefined
        if (FraxBank && Frax) {
            // Collect loan
            const loan: any = await FraxBank.fraxLoans(loanId);

            let underWriteAmount: BigNumber;
            // If this is the first bid
            if (loan.firstBidTime == 0) {
                // Run simple calculation
                underWriteAmount = ethers.utils.parseEther(value.toString());
            } else {
                // Required repayment
                const interest = await FraxBank.calculateTotalInterest(loanId, 120);
                // Else add new value
                underWriteAmount = ethers.utils
                    .parseEther(value.toString())
                    // To a 2m buffer
                    .add(interest);
            }

            try {
                toast.warn(`for approval click on 'use default' or enter: ${ethers.utils.formatUnits(underWriteAmount, 18)} tokens`);

                await Frax.approve(FRAX_LOANS_CONTRACT_ADDRESS, underWriteAmount);
                // Send transaction and wait
                const tx = await FraxBank.underwriteLoan(loanId, underWriteAmount, {
                    gasLimit: 200000,
                });
                await tx.wait(1);
                toast.success("Successfully underwrote NFT.");
            } catch (e) {
                // If error, alert
                console.error(e);
                toast.error(`Error when attempting to underwrite NFT.`);
            }
        }
    }

    /**
     * Allows repaying a loan
     * @param {number} loanId to repay
     */
    async function repayLoan(loanId: number): Promise<void> {
        // Collect contract
        const FraxBank = await collectFraxBankContract();
        // Collect Frax contract
        const Frax = await collectFraxContract();
        // Force contract != undefined
        if (FraxBank && Frax) {
            // Calculate required payment (2m in future to account for inclusion time)
            const contractRequired = await FraxBank.calculateRequiredRepayment(
                loanId,
                120
            );

            try {
                toast.warn(`for approval click on 'use default' or enter: ${ethers.utils.formatUnits(contractRequired, 18)} tokens`);
                await Frax.approve(FRAX_LOANS_CONTRACT_ADDRESS, contractRequired);
                // Send transaction and alert success
                const tx = await FraxBank.repayLoan(loanId, {
                    gasLimit: 300000,
                });
                await tx.wait(1);
                toast.success("Successfully repaid loan.");
            } catch (e) {
                // If error, alert
                console.error(e);
                toast.error(`Error when attempting to repay loan ${loanId}.`);
            }
        }
    }

    /**
     * Allows seizing NFT collateral from an expired loan
     * @param {number} loanId to seize
     */
    async function seizeLoan(loanId: number): Promise<void> {
        // Collect contract
        const FraxBank = await collectFraxBankContract();

        // Enforce contract != undefined
        if (FraxBank) {
            try {
                // Send seize transaction and wait for success
                const tx = await FraxBank.seizeNFT(loanId, {gasLimit: 200000});
                await tx.wait(1);
                toast.success("Successfully seized NFT from loan.");
            } catch (e) {
                // If erorr, alert failure
                console.error(e);
                toast.error(`Error when attempting to seize NFT from loan ${loanId}.`);
            }
        }
    }

    /**
     * Draw loan (as owner)
     * @param {number} loanId to draw from
     */
    async function drawLoan(loanId: number): Promise<void> {
        // Collect contract
        const FraxBank = await collectFraxBankContract();

        // Enforce contract != undefined
        if (FraxBank) {
            try {
                // Send transaction and await success
                const tx = await FraxBank.drawLoan(loanId, {gasLimit: 200000});
                await tx.wait(1);
                toast.success("Successfully drew from loan.");
            } catch (e) {
                // If error, alert
                console.error(e);
                toast.error(`Error when attempting to draw from loan ${loanId}.`);
            }
        }
    }

    /**
     * Allows owner to cancel loan
     * @param {number} loanId to cancel
     */
    async function cancelLoan(loanId: number): Promise<void> {
        // Collect contract
        const FraxBank = await collectFraxBankContract();

        // Enforce contract != undefined
        if (FraxBank) {
            try {
                // Send tranaction and await success
                const tx = await FraxBank.cancelLoan(loanId, {gasLimit: 200000});
                await tx.wait(1);
                toast.success("Successfully cancelled loan.");
            } catch (e) {
                // If error, alert
                console.error(e);
                toast.error(`Error when attempting to cancel loan ${loanId}.`);
            }
        }
    }

    /**
     * Create FraxBank loan
     * @param {string} contract address for NFT
     * @param {string} id NFT id
     * @param {number} rate interest rate
     * @param {number} amount bid ceiling
     * @param {number} completion timestamp of completion
     * @param {Record<string, string>} metadata temporary redis
     * @returns {Promise<number | undefined>} loan id
     */
    async function createLoan(
        contract: string,
        id: string,
        rate: number,
        amount: number,
        completion: number,
        metadata: Record<string, string>
    ): Promise<number | undefined> {
        const nft = await collectERC721Contract(contract);
        const FraxBank = await collectFraxBankContract();

        // Ensure !undefined
        if (nft && FraxBank) {
            // post metadata to Redis
            await axios.post("/api/metadata", {
                tokenAddress: contract,
                tokenId: id,
                ...metadata,
            });

            // Force approve NFT
            const tx = await nft.approve(FRAX_LOANS_CONTRACT_ADDRESS, id, {gasLimit: 200000});
            await tx.wait(1);

            // Create loan
            const loan = await FraxBank.createLoan(
                contract,
                id,
                rate,
                ethers.utils.parseEther(amount.toString()),
                Math.round(completion / 1000),
                {gasLimit: 350000}
            );
            // Collect Loan Creation event
            const confirmed_tx = await loan.wait(1);
            const creation_event = confirmed_tx.events.filter(
                (event) => event && "event" in event && event.event === "LoanCreated"
            )[0];
            // Return loan id
            return creation_event.args[0].toString();
        }
    }

    return {
        createLoan,
        drawLoan,
        seizeLoan,
        cancelLoan,
        underwriteLoan,
        repayLoan,
    };
}

// Create unstated-next container
export const loan = createContainer(useLoan);
