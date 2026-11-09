import {useEffect} from 'react';
import {useRouter} from 'next/router';
import {captureAttribution} from '../lib/attribution.mjs';
import '../styles/sales.css';
import Analytics from '../components/Analytics';
export default function App({Component,pageProps}){const router=useRouter();useEffect(()=>{captureAttribution(window.location.search);},[router.asPath]);return <><Analytics/><Component {...pageProps}/></>;}
