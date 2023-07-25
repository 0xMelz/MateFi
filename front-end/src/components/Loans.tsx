import React, {useEffect, useState} from "react"; // React
import {useRouter} from "next/dist/client/router"; // Router
import axios from "axios"; // Axios
import {LoanWithMetadata} from "../utils/types";
import {Button} from "./Button";
import NFTCard from "./NFTCard";

export function Loans() {
    // Navigation
    const router = useRouter();
    // Loan loading status
    const [loading, setLoading] = useState<boolean>(true);
    // Individual loans retrieved from chain
    const [loans, setLoans] = useState<LoanWithMetadata[]>([]);

    /**
     * Collect loans from chain
     */
    async function collectLoans(): Promise<void> {
        setLoading(true); // Toggle loading

        // Update data
        const {data} = await axios.get("/api/loans");
        setLoans(data);

        setLoading(false); // Toggle loading
    }

    // --> Lifecycle: collect loans on mount
    useEffect(() => {
        collectLoans();
    }, []);


    // @ts-ignore
    return (
        <section
            id="loans"
            aria-label="list of loans"
            className="bg-slate-50 py-20 sm:py-32 mb-16"
        >


            {/* Feature section of open loans */}
            <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>

                <div className="mx-auto max-w-2xl md:text-center pb-20">
                    <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
                        Loans
                    </h2>
                    <p className="mt-4 text-lg tracking-tight text-slate-700">
                        Choose the loan to bid based on provided details
                    </p>
                </div>

                {loading ? (
                    // If loading, show loading state


                    <div className="text-center my-20">

                        <div
                            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                            role="status">
  <span
      className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
  >Loading...</span
  >
                        </div>

                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Loading loans...</h3>
                        <p className="mt-1 text-sm text-gray-500">Please wait as we collect the loans from chain.</p>

                    </div>


                ) : loans.length == 0 ? (
                    // If no loans, show no loans found
                    <div className="mt-4 text-lg tracking-tight text-center text-slate-700">

                        <h3 className="mt-2 text-sm font-semibold text-gray-900">No Loans Found</h3>
                        <p className="mt-1 text-sm text-gray-500">Be the first to create a loan!</p>

                        <div className="mt-10 flex justify-center gap-x-6">
                            <Button href="/borrow" color="blue" variant="outline" className={''}>
                                <b>Create loan</b>
                            </Button>
                        </div>

                    </div>

                ) : (
                    // If loans are found, render clickable, active loaans
                    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {loans.map((loan, i) => (
                            <li
                                key={i}
                                className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
                            >
                                <NFTCard
                                    actionTitle="View"
                                    key={i}
                                    name={loan.name}
                                    selected={false}
                                    description={loan.description}
                                    contractAddress={loan.tokenAddress}
                                    imageURL={loan.imageURL}
                                    tokenId={loan.tokenId.toString()}
                                    onClickHandler={() => router.push(`/loan/${loan.loanId}`)}
                                    loanDetails={{
                                        interest: loan.interestRate,
                                        amount: loan.loanAmount,
                                        max: loan.maxLoanAmount,
                                    }}
                                />
                            </li>))}
                    </ul>)}


            </div>

        </section>
    )
}
