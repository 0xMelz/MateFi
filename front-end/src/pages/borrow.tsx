import {eth} from "../state/eth"; // State: ETH
import {loan} from "../state/loan"; // State: Loans
import {toast} from "react-toastify"; // Toast notifications
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React, {ReactElement, useEffect, useState} from "react"; // State management
import {NextRouter, useRouter} from "next/dist/client/router"; // Next router
import {Alchemy, Network} from "alchemy-sdk";
import Head from "next/head";
import {Header} from "../components/Header";
import {Footer} from "../components/Footer";
import NFTCard from "../components/NFTCard";
import styles from "../styles/create.module.scss"; // Component styles
import {CheckIcon, LockClosedIcon, WalletIcon} from '@heroicons/react/24/solid'


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

/**
 * Selection states
 */
enum State {
    selectNFT = 0,
    setTerms = 1,
}

export default function Borrow() {
    // Page navigation router
    const router: NextRouter = useRouter();

    // Global state
    const {address, unlock}: { address: string | null; unlock: Function } =
        eth.useContainer();
    const {createLoan}: { createLoan: Function } = loan.useContainer();

    // Current page state (Select / Set)
    const [state, setState] = useState<any>(State.selectNFT);
    // Number of retrieved NFTs (used for pagination)
    const [numOSNFTs, setNumOSNFTs] = useState<number>(0);
    // List of ERC721 NFTs
    const [NFTList, setNFTList] = useState<any[]>([]);
    // Loading status (for retrieval and buttons)
    const [loading, setLoading] = useState<boolean>(false);
    // Currently selected NFT details
    const [selected, setSelected] = useState<any>(null);
    // Parameter: Interest to pay
    const [interest, setInterest] = useState<any>(5);
    // Parameter: Maximum amount to loan (bid ceiling)
    const [maxAmount, setMaxAmount] = useState<any>(3);
    // Parameter: Timestamp of loan completion
    const [loanCompleted, setLoanCompleted] = useState<number>(
        new Date().setDate(new Date().getDate() + 7)
    );

    function handleSelected(new_select_value) {
        setSelected(new_select_value);
        setState(State.setTerms);
    }

    let steps = [
        {
            id: '01', name: 'Select NFT', description: 'select an NFT as collateral', href: '#', status:
                state == State.selectNFT ? 'current' : 'complete'
        },
        {
            id: '02', name: 'Set Terms', description: 'Enter loan amount and interest rate', href: '#', status:
                state == State.setTerms ? 'current' : 'upcoming'
        },
    ]

    /**
     * Renders button based on current state
     * @returns {ReactElement} button
     */
    function renderActionButton() {
        if (!address) {
            // Not authenticated
            return <button onClick={() => unlock()}>Unlock</button>;
        } else if (state === State.selectNFT && selected) {
            // NFT selected
            return (
                <a
                    href="#" onClick={() => setState(State.setTerms)}
                    className="flex w-full justify-center gap-3 rounded-md bg-indigo-600 px-3 py-2.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                >

                    <span className="text-sm font-semibold leading-6">Craft terms</span>
                </a>
            );
        } else if (state === State.selectNFT) {
            //Do nothing
        } else if (
            state === State.setTerms &&
            (!interest || !maxAmount || !loanCompleted)
        ) {
            // Missing terms
            return <button disabled>Must enter terms</button>;
        } else if (state === State.setTerms && !loading) {
            // Ready to create loan
            return <>
                <div className="mt-6 grid grid-cols-2 gap-4">

                    <button
                        onClick={() => setState(State.selectNFT)}
                        className="flex w-full justify-center gap-3 rounded-md bg-slate-400 px-3 py-2.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#24292F]"
                    >

                        <span className="text-sm font-semibold leading-6">Back</span>
                    </button>
                    <button
                        onClick={() => createLoanWithLoading()}
                        className="flex w-full justify-center gap-3 rounded-md bg-indigo-600 px-3 py-2.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D9BF0]"
                    >
                        <span className="text-sm font-semibold leading-6">Create loan</span>
                    </button>

                </div>

            </>;
        } else if (state === State.setTerms) {
            // Pending loan creation
            return <div className="text-center my-10">

                <div
                    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status">
  <span
      className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
  >Creating...</span
  >
                </div>

                <h3 className="mt-2 text-sm font-semibold text-gray-900">Creating loan...</h3>

            </div>
        }
    }

    /**
     * Filters array of all NFTs to only ERC721 schema qualifiers
     * @param {Array<any>} assets all NFTs
     * @returns {Array<any>} filtered ERC721 assets
     */
    function filter721(assets: Array<any>): Array<any> {
        return assets.filter(
            // Match for schema_name === "ERC721" #todo check contract types
            (asset) => asset.asset_contract.schema_name === "ERC721" || asset.asset_contract.schema_name === "ERC1155"
        );
    }

    async function getNFTList(address: any) {
        try {
            // Setup: npm install alchemy-sdk
            const config = {
                apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
                network: Network.ETH_SEPOLIA,
            };
            const alchemy = new Alchemy(config);
            // Get all NFTs
            const nfts = await alchemy.nft.getNftsForOwner(address);

            // Initialize an empty array
            let itemsArray: any = [];

// Assuming you have a loop, you can add items to the array with fields under the selected variable
            nfts.ownedNfts.forEach((nft) => {
                let new_nft = {
                    token_id: nft.tokenId,
                    asset_contract: {address: nft.contract.address, schema_name: nft.tokenType},
                    image_preview_url: nft.media && nft.media.length > 0 ? nft.media[0].raw : '',
                    name: nft.title ?? "Untitled",
                    description: nft.description ?? "No Description",
                };
                // Add the selected object to the array
                itemsArray.push(new_nft);
            })

// The itemsArray will contain all the items with fields under the selected variable
            return itemsArray;
        } catch (error) {
            console.log(error);
        }

    }

    /**
     * Collects NFTs
     */
    async function collectNFTs(): Promise<void> {
        setLoading(true); // Toggle loading
        try {
            let nfts = await getNFTList(address);
            setNumOSNFTs(nfts.length); // Update number of retrieved NFTs
            // Update ERC721 nfts
            setNFTList([...NFTList, ...filter721(nfts)]);
        } catch {
            // Toast error if retrieval fails
            toast.error("Error when collecting wallet NFT's.");
        }

        setLoading(false); // Toggle loading
    }

    /**
     * Creates a loan, with toggled loading
     */
    async function createLoanWithLoading(): Promise<void> {
        setLoading(true); // Toggle loading

        try {
            // Create loan
            const loanId = await createLoan(
                selected.asset_contract.address,
                selected.token_id,
                interest,
                maxAmount,
                loanCompleted,
                {
                    imageURL: selected.image_preview_url ?? "",
                    name: selected.name ?? "Untitled",
                    description: selected.description ?? "No Description",
                }
            );
            // Prompt success
            toast.success("Successfully created loan! Redirecting...");
            // Reroute to loan page
            router.push(`/loan/${loanId}`);
        } catch (ex) {
            console.log("Error when attempting to create loan:", ex)
            // On error, prompt
            toast.error("Error when attempting to create loan.");
        }

        setLoading(false); // Toggle loading
    }


    // -> Lifecycle: on address update
    useEffect(() => {
        // Collect NFTs if authenticated
        if (address) collectNFTs();
    }, [address]);

    return (
        <>
            <Head>
                <title>Frax.loans - lend</title>
            </Head>
            <Header/>
            <main>
                <section
                    id="create-loan"
                    aria-label="create loan"
                    className="bg-slate-50 py-20 sm:py-32 mb-16"
                >

                    <div className='mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8 border border-gray-200 rounded-md'>
                        {address ? (
                            // Ensure user is authenticated
                            <>

                                <div className="mx-auto max-w-2xl md:text-center pb-20">
                                    <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                                        Create loan
                                    </h2>
                                    <p className="mt-4 text-lg tracking-tight text-slate-700">
                                        Select an NFT and choose your terms.
                                    </p>
                                </div>

                                <div>
                                    <nav className="mx-auto max-w-7xl" aria-label="Progress">
                                        <ol
                                            role="list"
                                            className="overflow-hidden rounded-md lg:flex lg:rounded-none"
                                        >
                                            {steps.map((step, stepIdx) => (
                                                <li key={step.id}
                                                    className="relative overflow-hidden lg:flex-1">
                                                    <div
                                                        className={classNames(
                                                            stepIdx === 0 ? 'rounded-t-md border-b-0' : '',
                                                            stepIdx === steps.length - 1 ? 'rounded-b-md border-t-0' : '',
                                                            'overflow-hidden border border-gray-200 lg:border-0'
                                                        )}
                                                    >
                                                        {step.status === 'complete' ? (
                                                            <a href={step.href} className="group">
                    <span
                        className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                        aria-hidden="true"
                    />
                                                                <span
                                                                    className={classNames(
                                                                        stepIdx !== 0 ? 'lg:pl-9' : '',
                                                                        'flex items-start px-6 py-5 text-sm font-medium'
                                                                    )}
                                                                >
                      <span className="flex-shrink-0">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600">
                          <CheckIcon className="h-6 w-6 text-white" aria-hidden="true"/>
                        </span>
                      </span>
                      <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                        <span className="text-sm font-medium">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                                                            </a>
                                                        ) : step.status === 'current' ? (
                                                            <a href={step.href} aria-current="step">
                    <span
                        className="absolute left-0 top-0 h-full w-1 bg-indigo-600 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                        aria-hidden="true"
                    />
                                                                <span
                                                                    className={classNames(
                                                                        stepIdx !== 0 ? 'lg:pl-9' : '',
                                                                        'flex items-start px-6 py-5 text-sm font-medium'
                                                                    )}
                                                                >
                      <span className="flex-shrink-0">
                        <span
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-indigo-600">
                          <span className="text-indigo-600">{step.id}</span>
                        </span>
                      </span>
                      <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-indigo-600">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                                                            </a>
                                                        ) : (
                                                            <a href={step.href} className="group">
                    <span
                        className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-gray-200 lg:bottom-0 lg:top-auto lg:h-1 lg:w-full"
                        aria-hidden="true"
                    />
                                                                <span
                                                                    className={classNames(
                                                                        stepIdx !== 0 ? 'lg:pl-9' : '',
                                                                        'flex items-start px-6 py-5 text-sm font-medium'
                                                                    )}
                                                                >
                      <span className="flex-shrink-0">
                        <span
                            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300">
                          <span className="text-gray-500">{step.id}</span>
                        </span>
                      </span>
                      <span className="ml-4 mt-0.5 flex min-w-0 flex-col">
                        <span className="text-sm font-medium text-gray-500">{step.name}</span>
                        <span className="text-sm font-medium text-gray-500">{step.description}</span>
                      </span>
                    </span>
                                                            </a>
                                                        )}

                                                        {stepIdx !== 0 ? (
                                                            <>
                                                                {/* Separator */}
                                                                <div
                                                                    className="absolute inset-0 left-0 top-0 hidden w-3 lg:block"
                                                                    aria-hidden="true">
                                                                    <svg
                                                                        className="h-full w-full text-gray-300"
                                                                        viewBox="0 0 12 82"
                                                                        fill="none"
                                                                        preserveAspectRatio="none"
                                                                    >
                                                                        <path d="M0.5 0V31L10.5 41L0.5 51V82"
                                                                              stroke="currentcolor"
                                                                              vectorEffect="non-scaling-stroke"/>
                                                                    </svg>
                                                                </div>
                                                            </>
                                                        ) : null}
                                                    </div>
                                                </li>
                                            ))}
                                        </ol>
                                    </nav>
                                </div>


                                <div className={styles.create}>
                                    {/* Create page title */}
                                    <div className={styles.create__action}>

                                        {/* Action card content */}
                                        <div>
                                            {
                                                // If user is authenticated
                                                state === State.selectNFT ? (
                                                    // If the current state is NFT selection
                                                    <div>
                                                        {NFTList.length > 0 ? (
                                                            // If > 0 NFTs exist in user wallet
                                                            <>
                                                                <ul role="list"
                                                                    className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                                                    {NFTList.map((nft, i) => {
                                                                        // Render each NFT
                                                                        return (
                                                                            <li
                                                                                key={i}
                                                                                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
                                                                            >
                                                                                <NFTCard
                                                                                    actionTitle="select"
                                                                                    key={i}
                                                                                    onClickHandler={() => handleSelected(nft)}
                                                                                    selected={
                                                                                        selected?.token_id === nft.token_id &&
                                                                                        selected?.asset_contract?.address ===
                                                                                        nft.asset_contract.address
                                                                                    }
                                                                                    imageURL={nft.image_preview_url}
                                                                                    name={nft.name ?? "Untitled"}
                                                                                    description={
                                                                                        nft.description ?? "No description"
                                                                                    }
                                                                                    contractAddress={nft.asset_contract.address}
                                                                                    tokenId={nft.token_id}
                                                                                /></li>
                                                                        );
                                                                    })}
                                                                </ul>

                                                            </>
                                                        ) : (
                                                            // If user does not own NFTs
                                                            <NoOwnedNFTs/>
                                                        )}
                                                        {loading ? (
                                                            // If user NFTs are being loaded
                                                            <CreateLoadingNFTs/>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    // Enable user input of terms
                                                    <div className={styles.create__action_terms}>
                                                        {/* Prefilled NFT Contract Address */}
                                                        <div>
                                                            <h3>NFT Contract Address</h3>
                                                            <p>Contract address for ERC721-compliant NFT.</p>
                                                            <input
                                                                type="text"
                                                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                value={selected.asset_contract.address}
                                                                disabled
                                                            />
                                                        </div>

                                                        {/* Prefilled NFT ID */}
                                                        <div>
                                                            <h3>NFT ID</h3>
                                                            <p>Unique identifier for your NFT.</p>
                                                            <input type="text" value={selected.token_id}
                                                                   className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                   disabled/>
                                                        </div>

                                                        {/* User input: Interest Rate */}
                                                        <div>
                                                            <h3>Interest Rate</h3>
                                                            <p>
                                                                Maximum interest rate you are willing to pay for these
                                                                terms.
                                                            </p>
                                                            <input
                                                                type="number"
                                                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                step="0.01"
                                                                placeholder="5"
                                                                min="0.01"
                                                                value={interest}
                                                                onChange={(e) => setInterest(e.target.value)}
                                                            />
                                                        </div>

                                                        {/* User input: max loan amount */}
                                                        <div>
                                                            <h3>Max Loan Amount</h3>
                                                            <p>
                                                                Maximum loaned Ether you are willing to pay interest
                                                                for.
                                                            </p>
                                                            <input
                                                                type="number"
                                                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                placeholder="3"
                                                                step="0.01"
                                                                min="0"
                                                                value={maxAmount}
                                                                onChange={(e) => setMaxAmount(e.target.value)}
                                                            />
                                                        </div>

                                                        {/* User input: Loan termination date */}
                                                        <div>
                                                            <h3>Loan Completion Date</h3>
                                                            <p>Date of loan termination.</p>
                                                            <DatePicker
                                                                className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                                selected={loanCompleted}
                                                                onChange={(date) => setLoanCompleted(date)}
                                                                showTimeSelect
                                                                minDate={new Date()}
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* Render action buttons */}
                                    <div className="pt-10">{renderActionButton()}</div>
                                </div>
                            </>) : (
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

                </section>
            </main>
            <Footer/>
        </>
    );
}

/**
 * State when user has not authenticated
 * @returns {ReactElement}
 */

/**
 * State when user's NFTs are loading
 * @returns {ReactElement}
 */
function CreateLoadingNFTs(): ReactElement {
    return (
        <div className="text-center my-20">

            <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                role="status">
  <span
      className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
  >Loading...</span
  >
            </div>

            <h3 className="mt-2 text-sm font-semibold text-gray-900">Loading NFTs...</h3>

        </div>
    );
}

/**
 * State when user does not own any ERC721 NFTs
 * @returns {ReactElement}
 */
function NoOwnedNFTs(): ReactElement {
    return (

        <div className="mt-4 text-lg tracking-tight text-slate-700">

            <h3 className="mt-2 text-sm font-semibold text-gray-900">No NFTs in wallet.</h3>
            <p className="mt-1 text-sm text-gray-500">Please mint NFTs before trying to create loan!</p>


        </div>
    );
}
