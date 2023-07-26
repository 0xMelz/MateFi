import Head from 'next/head'
import {Footer} from '../components/Footer'
import {Header} from '../components/Header'
import {Hero} from '../components/Hero'
import {Features} from "../components/Features";

export default function Home() {
    return (
        <>
            <Head>
                <title>MateFi - Borrow and lend with MateFi</title>
            </Head>
            <Header/>
            <main>
                <Hero/>
                <Features/>
            </main>
            <Footer/>
        </>
    )
}
