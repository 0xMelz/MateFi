import type {ReactElement} from "react"; // Types
import {EyeIcon} from "@heroicons/react/24/solid";

/**
 * Loan NFT rendering component
 * @param {string} actionTitle the card button title
 * @param {string} imageURL to render
 * @param {string} name NFT metadata
 * @param {string} description NFT metadata
 * @param {string} contractAddress NFT contract
 * @param {string} tokenId NFT token id
 * @param {boolean} selected toggled border
 * @param {Function} onClickHandler on card click
 * @param {Record<string, number>} loanDetails optional loan details
 * @returns {ReactElement}
 */
export default function NFTCard({
                                    actionTitle = "View",
                                    imageURL,
                                    name,
                                    description,
                                    contractAddress,
                                    tokenId,
                                    selected = false,
                                    onClickHandler,
                                    loanDetails,
                                    ...props
                                }: {
    actionTitle: string;
    imageURL: string;
    name: string;
    description: string;
    contractAddress: string;
    tokenId: string;
    selected: boolean;
    onClickHandler: Function;
    loanDetails?: Record<string, number>;
}): ReactElement {
    return (
        <div
            className={selected ? `border-2 rounded border-indigo-500/100 ` : 'rounded'}       {...props}>
            <div className="flex flex-1 flex-col p-8">
                <a
                    onClick={() => onClickHandler()}>
                    <img className="mx-auto h-32 w-32 flex-shrink-0"
                         src={imageURL ? imageURL : "/sample-nft.jpg"}
                         alt=""/></a>
                <h3 className="mt-6 text-sm font-medium text-gray-900  h-5 ">{name}</h3>
                <dl className="mt-1 flex flex-grow flex-col justify-between">
                    <dt className="sr-only">Description</dt>
                    <dd className="text-sm text-gray-500  h-10">{description}</dd>
                    <dt className="sr-only">Token Address</dt>
                    <dd className="mt-3">
                        <a href={`https://scan-warringstakes.meter.io/address/${contractAddress}`} target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            {contractAddress.substr(0, 6) +
                            "..." +
                            contractAddress.slice(contractAddress.length - 4)}{" "}
                            : {tokenId}
                        </a>
                    </dd>
                </dl>
            </div>
            <div>
                {loanDetails && loanDetails.interest ? (
                    <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">

                        <div className="flex justify-between gap-x-4 py-3">
                            <dt className="text-gray-500">Interest</dt>
                            <dd className="text-gray-700">
                                <div
                                    className='rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset'
                                >{loanDetails.interest}%
                                </div>
                            </dd>
                        </div>
                        <div className="flex justify-between gap-x-4 py-3">
                            <dt className="text-gray-500">Raised</dt>
                            <dd className="flex items-start gap-x-2">
                                <div
                                    className='rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset'
                                >
                                    {loanDetails.amount.toFixed(2)} / {loanDetails.max.toFixed(2)}
                                </div>
                            </dd>
                        </div>
                    </dl>) : null}
                <div
                    className="-mt-px flex divide-x divide-gray-200 border-gray-200 border-solid border-t">
                    <div className="flex w-0 flex-1">
                        <a
                            onClick={() => onClickHandler()}
                            className="relative flex  flex-1  items-center justify-center rounded-b-lg border border-transparent bg-gray-100 px-8 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                        >
                            <EyeIcon className="h-5 w-5 text-gray-400" aria-hidden="true"/>
                            &nbsp; {actionTitle} &nbsp;
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
        ;
}
