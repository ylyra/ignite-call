import { SessionProvider } from 'next-auth/react'

import type { AppProps } from 'next/app'
import Head from 'next/head'

import { global } from '../styles/global'

global()

export default function App({
  Component,

  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Ignite Call - Agende suas reuniões</title>
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
