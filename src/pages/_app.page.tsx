import type { AppProps } from 'next/app'
import { global } from '../styles/global'

global()
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
