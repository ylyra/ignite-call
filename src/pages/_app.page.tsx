import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'

import { global } from '../styles/global'

global()

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
