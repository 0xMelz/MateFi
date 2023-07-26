# MateFi Smart Contract Documentation

## Overview
MateFi is a decentralized smart contract that facilitates NFT-collateralized lending on the Meter blockchain. It provides a platform where NFT owners can create loan offers by locking their NFTs as collateral, and other users (lenders) can bid on these loans with a fixed interest rate. The smart contract manages the loan lifecycle, including loan creation, bidding, loan drawing, loan repayment, loan cancellation, and NFT seizure in case of loan default.

## Contract Structure
The contract is implemented in Solidity and follows the ERC-721 and ERC-20 token standards for NFTs and token interaction. The contract is designed to be compatible with Solidity version 0.8.0 and higher. Additionally, it uses external libraries for mathematical calculations (ABDKMath64x64) and imports OpenZeppelin's ERC-721 and ERC-20 token contracts.

### Structs
1. `MateFi`: Represents an individual loan with the following attributes:
    - `tokenAddress`: The Meter address of the NFT token used as collateral.
    - `tokenOwner`: The Meter address of the NFT owner (loan initiator). It is set to 0x0 once the loan is repaid to save space.
    - `lender`: The Meter address of the current top lender/bidder.
    - `tokenId`: The ID of the NFT token used as collateral.
    - `interestRate`: The fixed interest rate for the loan in percentage.
    - `loanAmount`: The current bid amount for the loan denominated in an ERC-20 token.
    - `maxLoanAmount`: The maximum allowed bid for the loan denominated in an ERC-20 token.
    - `loanAmountDrawn`: The amount drawn by the NFT owner from the loan denominated in an ERC-20 token.
    - `firstBidTime`: Timestamp of the first bid placed on the loan.
    - `lastBidTime`: Timestamp of the last bid placed on the loan.
    - `historicInterest`: The interest paid by the top bidder thus far denominated in an ERC-20 token.
    - `loanCompleteTime`: Timestamp of the loan completion.

### Mutable Storage
1. `numLoans`: An unsigned integer representing the total number of loans issued.
2. `mateFi`: A mapping that associates a unique loan number (ID) with a `MateFi` struct, representing all the active loans.

### Events
1. `LoanCreated`: Fired when a new loan is created by an NFT owner.
2. `LoanUnderwritten`: Fired when a lender/bidder underwrites a loan by placing a bid.
3. `LoanDrawn`: Fired when the NFT owner draws the loan amount after the loan is fully funded.
4. `LoanRepayed`: Fired when a loan is repaid by the NFT owner to the lender.
5. `LoanCancelled`: Fired when the NFT owner cancels the loan before any bids are placed.
6. `LoanSeized`: Fired when a lender seizes the NFT collateral due to loan default.

### Functions
1. `createLoan`: Enables an NFT owner to create a loan offer, specifying loan parameters like interest rate, loan amount, and loan completion time. The NFT is transferred from the owner to the contract as collateral.
2. `calculateInterestAccrued`: A helper function to calculate the accrued interest for a particular lender based on the loan's interest rate and the duration the lender held the top bid.
3. `calculateTotalInterest`: A helper function to calculate the required additional capital (interest payment) to outbid the current top lender.
4. `calculateRequiredRepayment`: A helper function to calculate the required loan repayment amount, including principal and interest.
5. `underwriteLoan`: Enables a lender/bidder to underwrite a loan if it is the top bid, paying a bid amount plus interest. It also enforces that the loan must not be repaid or expired.
6. `drawLoan`: Enables the NFT owner to draw the loan amount once the loan is fully funded. The drawn amount is transferred to the NFT owner.
7. `repayLoan`: Allows anyone to repay a loan on behalf of the NFT owner, which returns the NFT collateral to the owner and pays the lender their principal and interest.
8. `cancelLoan`: Enables the NFT owner to cancel the loan offer if there are no active bids. The NFT collateral is returned to the owner.
9. `seizeNFT`: Allows anyone to seize the NFT collateral if the loan has not been repaid by the loan completion time.

## License
This smart contract is licensed under the GNU General Public License (GPL) version 3.0 or later. Please refer to the SPDX-License-Identifier in the contract for more details. Users should review and adhere to the terms specified in the license when interacting with this smart contract.
