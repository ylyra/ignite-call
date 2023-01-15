import { SessionProvider } from "next-auth/react";
import "../lib/dayjs";

import type { AppProps } from "next/app";
import Head from "next/head";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/react-query";
import { global } from "../styles/global";

global();

export default function App({
  Component,

  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <Head>
          <title>Ignite Call - Agende suas reuniões</title>
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </QueryClientProvider>
  );
}
