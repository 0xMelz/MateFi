import {useEffect, useState} from 'react'
import Image from 'next/image'

import {Container} from './Container'
import backgroundImage from '../images/background-call-to-action.jpg'

import {
    ArrowPathRoundedSquareIcon,
    ArrowRightOnRectangleIcon,
    ArrowUpTrayIcon,
    InboxArrowDownIcon,
    NoSymbolIcon,
    XCircleIcon,
} from '@heroicons/react/20/solid'

const features = [
    {
        name: 'Borrow',
        description:
            "Create a loan by using your NFT as collateral and define Interest rate, Period for payout and Maximum liquidity you need.",
        icon: InboxArrowDownIcon,
    },
    {
        name: 'Lend',
        description:
            "Select a loan from the list based on the NFT and Interest rate that catch your eye. offer your bid and make money.",
        icon: ArrowUpTrayIcon,
    },
    {
        name: 'Draw',
        description:
            "The loan owner can draw capital as it becomes available with new bids, until repayment.",
        icon: ArrowRightOnRectangleIcon,
    },
    {
        name: 'Repay',
        description:
            'Anyone can repay a loan, as long as it is unpaid, not expired, and has at least 1 bid.',
        icon: ArrowPathRoundedSquareIcon,
    },
    {
        name: 'Cancel',
        description:
            'The loan owner can cancel the loan and recollect their NFT until the first bid has been placed.',
        icon: XCircleIcon,
    },
    {
        name: 'Seize',
        description:
            'Anyone can call seize loan on behalf of the lender if the owner defaults on their terms.',
        icon: NoSymbolIcon,
    },
]

export function Features() {
    let [tabOrientation, setTabOrientation] = useState('horizontal')

    useEffect(() => {
        let lgMediaQuery = window.matchMedia('(min-width: 1024px)')

        function onMediaQueryChange({matches}) {
            setTabOrientation(matches ? 'vertical' : 'horizontal')
        }

        onMediaQueryChange(lgMediaQuery)
        lgMediaQuery.addEventListener('change', onMediaQueryChange)

        return () => {
            lgMediaQuery.removeEventListener('change', onMediaQueryChange)
        }
    }, [])

    return (
        <section
            id="features"
            aria-label="Frax.laon primary features"
            className="relative overflow-hidden bg-blue-600 pb-28 pt-20 sm:py-32"
        >
            <Image
                className="absolute left-1/2 top-1/2 max-w-none translate-x-[-44%] translate-y-[-42%]"
                src={backgroundImage}
                alt=""
                width={2245}
                height={1636}
                unoptimized
            />
            <Container className="relative">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl sm:text-center">
                        <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Primary
                            Features</p>
                        <p className="mt-6 text-lg leading-8 text-gray-100">
                            Frax.loans is a hybrid auction and lending platform for your NFTs. Borrow against
                            your
                            collection or earn fixed rewards.
                        </p>
                    </div>
                </div>
                <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8">
                    <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
                        {features.map((feature) => (
                            <div key={feature.name} className="relative pl-9">
                                <dt className="inline font-semibold text-white">
                                    <feature.icon className="absolute left-1 top-1 h-5 w-5 text-white"
                                                  aria-hidden="true"/>
                                    {feature.name}
                                </dt>
                                {' '}
                                <dd className="inline text-gray-100">{feature.description}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </Container>
        </section>
    )
}
