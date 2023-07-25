import Head from 'next/head'
import {Footer} from '../components/Footer'
import {Header} from '../components/Header'
import {Loans} from "../components/Loans";

export default function Home() {
    return (
        <>
            <Head>
                <title>Frax.loans - lend</title>
            </Head>
            <Header/>
            <main>
                <Loans/>
            </main>
            <Footer/>
        </>
    )
}
