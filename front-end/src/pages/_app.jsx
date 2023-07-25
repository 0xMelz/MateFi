import 'focus-visible'
import {eth} from "../state/eth"
import {loan} from "../state/loan"; // Loan functions state provider

import '../styles/tailwind.css'
import NextNProgress from 'nextjs-progressbar';
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
export default function App({Component, pageProps}) {
    return (
        // Wrap in global state provider
        <eth.Provider>
            <loan.Provider>
                <NextNProgress
                    color="#2562eb"
                    startPosition={0.3}
                    stopDelayMs={200}
                    height={3}
                    options={{
                        showSpinner: false,
                    }}
                />
                <ToastContainer/>
                <Component {...pageProps} />
            </loan.Provider>
        </eth.Provider>
    );
}
