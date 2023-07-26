import dayjs from "dayjs"; // Dates
import axios from "axios"; // Requests
import {eth} from "../../state/eth"; // State container
import {collectSingleLoan} from "../api/loan"; // Collection
import {ReactElement, useState} from "react"; // React
import {loan as loanProvider} from "../../state/loan"; // State container
import type {LoanWithMetadata} from "../../utils/types"; // Types
import Head from 'next/head'
import {Footer} from '../../components/Footer'
import {Header} from '../../components/Header'
import {LockClosedIcon, WalletIcon} from "@heroicons/react/24/solid";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

// Zero Address constant
const ZERO_ADDRESS: string = "0x0000000000000000000000000000000000000000";

/**
 * Loan page
 * @param {LoanWithMetadata} loan to pre-populate page (SSR)
 * @returns {ReactElement}
 */
export default function Loan({
                                 loan: defaultLoan,
                             }: {
    loan: LoanWithMetadata;
}) {


    // Collect individual action functions
    const {cancelLoan, drawLoan, seizeLoan, underwriteLoan, repayLoan} =
        loanProvider.useContainer();
    // Collect authentication
    const {address, unlock}: { address: string | null; unlock: Function } =
        eth.useContainer();

    // Current page details
    const [loan, setLoan] = useState<LoanWithMetadata>(defaultLoan);
    // Enterred bid amount
    const [bid, setBid] = useState<any>(0);
    // Button loading status
    const [loading, setLoading] = useState<boolean>(false);

    /**
     * Refresh loan data by hitting back-end
     */
    async function refreshLoan(): Promise<void> {
        const {data} = await axios.get(`/api/loan?id=${loan.loanId}`);
        setLoan(data);
    }


    /**
     * Runs a provided function w/ loading and data refresh
     * @param {Function} call to encapsulate
     */
    async function runWithLoading(call: Function): Promise<void> {
        setLoading(true); // Toggle loading
        await call(); // Call function
        await refreshLoan(); // Refresh page data
        setLoading(false); // Toggle loading
    }

    return (


        <>
            <Head>
                <title>MateFi - loan {loan.name}</title>
            </Head>
            <Header/>
            <main>

                <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 mb-6'>
                    <div className="relative bg-white">

                        <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
                            <div
                                className="px-6 pb-24 pt-16 lg:col-start-1 lg:px-8 bg-gray-100 ">
                                <div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
                                    <h2 className="text-xl font-bold leading-8">Loan Details</h2>
                                    <LoanDetails {...loan}/>
                                </div>
                            </div>
                            <div className="px-6 pb-24 pt-16 lg:col-start-2 lg:px-8 ">
                                <div className="mx-auto max-w-2xl lg:mr-0 lg:max-w-lg">
                                    <h2 className="text-xl font-bold leading-8">Actions</h2>

                                    {/* Loan NFT content */}
                                    {/* Right: actions */}

                                    {address ? (
                                        // Ensure user is authenticated
                                        <>
                                            {/* Underwrite loan */}

                                            <div className="mt-4 ">

                                                <h3 id="draw-btn"
                                                    className="text-base font-semibold leading-7 text-indigo-600">
                                                    Underwrite loan
                                                </h3>

                                                <p className="mt-1 text-base leading-7 text-gray-600">A lender
                                                    can underwrite an unpaid loan (and become the top
                                                    bidder) so long as the loan has available capacity (is
                                                    under bid ceiling).</p>
                                                {loan.tokenOwner !== ZERO_ADDRESS &&
                                                loan.loanCompleteTime >
                                                Math.round(new Date().getTime() / 1000) &&
                                                loan.loanAmount !== loan.maxLoanAmount ? (
                                                    <>

                                                        <div className="mt-2">
                                                            <label htmlFor="bid-amount"
                                                                   className="block text-sm font-medium leading-6 text-gray-900">Bid
                                                                Value ($MTR)</label>
                                                            <input id="bid-amount" value={bid} name="bid-amount"
                                                                   type="number" required
                                                                   onChange={(e) => setBid(e.target.value)}
                                                                   min={loan.loanAmount}
                                                                   max={loan.maxLoanAmount}
                                                                   step="0.000001"
                                                                   className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
                                                        </div>

                                                        <button type="button"
                                                                onClick={() =>
                                                                    runWithLoading(() => underwriteLoan(loan.loanId, bid))
                                                                }
                                                                disabled={
                                                                    loading ||
                                                                    bid === 0 ||
                                                                    bid <= loan.loanAmount ||
                                                                    bid > loan.maxLoanAmount
                                                                }
                                                                className={classNames(!(loading ||
                                                                        bid === 0 ||
                                                                        bid <= loan.loanAmount ||
                                                                        bid > loan.maxLoanAmount)
                                                                        ? 'bg-indigo-600 text-white shadow hover:bg-indigo-500 '
                                                                        : 'cursor-not-allowed text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                                                                    'mt-3 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                                )}
                                                        >
                                                            {loading
                                                                ? "Loading..."
                                                                : bid == 0
                                                                    ? "Bid cannot be 0"
                                                                    : bid < loan.loanAmount
                                                                        ? "Bid under top bid"
                                                                        : bid > loan.maxLoanAmount
                                                                            ? "Bid too large"
                                                                            : "Underwrite loan"}
                                                        </button>
                                                    </>) : <span>Loan cannot be underwritten.</span>}
                                            </div>


                                            {/* Draw loan */}
                                            <div className="mt-4 pt-6 border-t">

                                                <h3 id="draw-btn"
                                                    className="text-base font-semibold leading-7 text-indigo-600">
                                                    Draw loan
                                                </h3>

                                                <p className="mt-1 text-base leading-7 text-gray-600">The loan
                                                    owner can draw capital as it becomes available
                                                    with new bids, until repayment.</p>

                                                <button type="button"
                                                        onClick={() =>
                                                            runWithLoading(() => drawLoan(loan.loanId))
                                                        }
                                                        disabled={loading || loan.loanAmountDrawn === loan.loanAmount ||
                                                        address !== loan.tokenOwner
                                                        }
                                                        className={classNames(!(
                                                                loading ||
                                                                loan.loanAmountDrawn === loan.loanAmount ||
                                                                address !== loan.tokenOwner)
                                                                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-500 '
                                                                : 'cursor-not-allowed text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                                                            'mt-3 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        )}
                                                >
                                                    {loading
                                                        ? "Loading..."
                                                        : loan.loanAmountDrawn === loan.loanAmount
                                                            ? "No capacity to draw"
                                                            : address !== loan.tokenOwner
                                                                ? "Not owner"
                                                                : "Draw capital"}
                                                </button>
                                            </div>

                                            {/* Repay loan */}

                                            <div className="mt-4 pt-6 border-t">

                                                <h3 id="draw-btn"
                                                    className="text-base font-semibold leading-7 text-indigo-600">
                                                    Repay loan
                                                </h3>

                                                <p className="mt-1 text-base leading-7 text-gray-600">Anyone can
                                                    repay a loan, as long as it is unpaid, not
                                                    expired, and has at least 1 bid.</p>

                                                <button type="button"
                                                        onClick={() =>
                                                            runWithLoading(() => repayLoan(loan.loanId))
                                                        }
                                                        disabled={
                                                            loading ||
                                                            loan.tokenOwner === ZERO_ADDRESS ||
                                                            loan.firstBidTime === 0 ||
                                                            loan.loanCompleteTime <=
                                                            Math.round(new Date().getTime() / 1000)
                                                        }
                                                        className={classNames(!(
                                                                loading ||
                                                                loan.tokenOwner === ZERO_ADDRESS ||
                                                                loan.firstBidTime === 0 ||
                                                                loan.loanCompleteTime <=
                                                                Math.round(new Date().getTime() / 1000))
                                                                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-500 '
                                                                : 'cursor-not-allowed text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                                                            'mt-3 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        )}
                                                >
                                                    {loading
                                                        ? "Loading..."
                                                        : loan.tokenOwner === ZERO_ADDRESS
                                                            ? "Loan is already repaid"
                                                            : loan.firstBidTime === 0
                                                                ? "Loan has no bids to repay"
                                                                : loan.loanCompleteTime <=
                                                                Math.round(new Date().getTime() / 1000)
                                                                    ? "Loan has expired"
                                                                    : "Repay loan"}
                                                </button>
                                            </div>


                                            {/* Cancel loan */}

                                            <div className="mt-4 pt-6 border-t">

                                                <h3 id="draw-btn"
                                                    className="text-base font-semibold leading-7 text-indigo-600">
                                                    Cancel loan
                                                </h3>

                                                <p className="mt-1 text-base leading-7 text-gray-600">The loan
                                                    owner can cancel the loan and recollect their NFT
                                                    until the first bid has been placed.</p>

                                                <button type="button"
                                                        onClick={() =>
                                                            runWithLoading(() => cancelLoan(loan.loanId))
                                                        }
                                                        disabled={
                                                            loading ||
                                                            loan.loanAmount > 0 ||
                                                            address !== loan.tokenOwner
                                                        }
                                                        className={classNames(!(
                                                                loading ||
                                                                loan.loanAmount > 0 ||
                                                                address !== loan.tokenOwner)
                                                                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-500 '
                                                                : 'cursor-not-allowed text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                                                            'mt-3 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        )}
                                                >
                                                    {loading
                                                        ? "Loading..."
                                                        : loan.loanAmount > 0
                                                            ? "Cannot cancel with bids"
                                                            : address !== loan.tokenOwner
                                                                ? "Not owner"
                                                                : "Cancel loan"}
                                                </button>
                                            </div>

                                            {/* Seize loan */}

                                            <div className="mt-4 pt-6 border-t">

                                                <h3 id="draw-btn"
                                                    className="text-base font-semibold leading-7 text-indigo-600">
                                                    Seize loan
                                                </h3>

                                                <p className="mt-1 text-base leading-7 text-gray-600">Anyone can
                                                    call seize loan on behalf of the lender if the
                                                    owner defaults on their terms.</p>

                                                <button type="button"
                                                        onClick={() =>
                                                            runWithLoading(() => seizeLoan(loan.loanId))
                                                        }
                                                        disabled={
                                                            loading ||
                                                            loan.tokenOwner === ZERO_ADDRESS ||
                                                            loan.loanCompleteTime >
                                                            Math.round(new Date().getTime() / 1000)
                                                        }
                                                        className={classNames(!(loading ||
                                                                loan.tokenOwner === ZERO_ADDRESS ||
                                                                loan.loanCompleteTime >
                                                                Math.round(new Date().getTime() / 1000))
                                                                ? 'bg-indigo-600 text-white shadow hover:bg-indigo-500 '
                                                                : 'cursor-not-allowed text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300',
                                                            'mt-3 block rounded-md py-2.5 px-3.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        )}
                                                >
                                                    {loading
                                                        ? "Loading..."
                                                        : loan.tokenOwner === ZERO_ADDRESS
                                                            ? "Loan is already repaid"
                                                            : loan.loanCompleteTime >
                                                            Math.round(new Date().getTime() / 1000)
                                                                ? "Loan has not expired"
                                                                : "Seize loan"}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        // If unauthenticated, return authentication prompt
                                        <div className="text-center">

                                            <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400"
                                                            aria-hidden="true"/>

                                            <h3 className="mt-2 text-sm font-semibold text-gray-900">Unauthenticated</h3>
                                            <p className="mt-1 text-sm text-gray-500">Please connect with your wallet to
                                                take actions.</p>
                                            <div className="mt-6">
                                                <button onClick={() => unlock()}
                                                        type="button"
                                                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    <WalletIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true"/>
                                                    Connect Wallet
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </main>
            <Footer/>
        </>


    );
}

/**
 * Left side: general loan and NFT details
 * @param {LoanWithMetadata} loan details
 * @returns {ReactElement}
 */
function LoanDetails(loan: LoanWithMetadata): ReactElement {

    {/* NFT details */
    }

    return (
        <div>
            {loan.imageURL ? (<div className="py-2">
                <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                    Preview
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                    <img className=" max-h-full max-w-full mx-auto"
                         src={loan.imageURL ? loan.imageURL : "/sample-nft.jpg"}
                         alt=""
                    />
                </dd>
            </div>) : null}
            <div className="py-2">
                <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                    Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                    <b>{loan.name}</b>
                </dd>
            </div>
            <div className="py-2">
                <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                    Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                    <span className="font-semibold">{loan.description}</span>
                </dd>
            </div>


            {/* Loan details */}
            {loan.tokenOwner === ZERO_ADDRESS ? (
                // If token owner = 0x0 force repaid status
                <div className="py-2">
                    <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                        Loan Status
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                        This loan has been repaid.
                    </dd>
                </div>
            ) : (
                // Else, show data
                <>
                    <div className="py-2">
                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                            Owner
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                            This NFT is currently owned and lent out by{" "} <b><a className="underline"
                                                                                   href={`https://scan-warringstakes.meter.io/address/${loan.tokenOwner}`}
                                                                                   target="_blank"
                                                                                   rel="noopener noreferrer"
                        >
                            {loan.tokenOwner}</a></b></dd>
                    </div>
                    <div className="py-2">
                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                            Interest Rate
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                            The owner is paying <b>{loan.interestRate}% fixed interest</b> until{" "}
                            <b>{dayjs(loan.loanCompleteTime * 1000).format("MMMM D, YYYY h:mm A")}{" "}</b>
                            to facilitate a bid ceiling of <b>{loan.maxLoanAmount} $MTR</b>.
                        </dd>
                    </div>

                    {loan.lender !== ZERO_ADDRESS ? (
                        <div className="py-2">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Lenders
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                The current top lender is{" "}
                                <b><a className="underline"
                                      href={`https://scan-warringstakes.meter.io/address/${loan.lender}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                >
                                    {loan.lender}
                                </a>{" "}</b>
                                with a <b>bid of {loan.loanAmount} $MTR</b> (of which the owner has&nbsp;
                                <b>drawn {loan.loanAmountDrawn} $MTR</b>).
                            </dd>
                        </div>
                    ) : (
                        <div className="py-2">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Lenders
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                There are currently no active bids.
                            </dd>
                        </div>
                    )}
                    <div className="py-2">
                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                            token ID
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                            <b>{loan.tokenId}</b> of contract{" "}
                            <b><a className="underline"
                                  href={`https://scan-warringstakes.meter.io/address/${loan.tokenAddress}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                            >
                                {loan.tokenAddress}
                            </a></b>
                        </dd>
                    </div>
                </>
            )}
        </div>
    );
}

// Run on page load
export async function getServerSideProps({
                                             params: {id},
                                         }: {
    params: { id: string };
}) {
    // Collect loan
    const loan = await collectSingleLoan(Number(id));

    // Else, return retrieved loan
    return {
        // As prop
        props: {
            loan,
        },
    };
}
