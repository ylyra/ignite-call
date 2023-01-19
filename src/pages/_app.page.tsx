import { SessionProvider } from "next-auth/react";
import "../lib/dayjs";

import type { AppProps } from "next/app";

import { QueryClientProvider } from "@tanstack/react-query";
import { DefaultSeo } from "next-seo";
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
        <DefaultSeo
          openGraph={{
            type: "website",
            locale: "pt_BR",
            url: "https://ignitecall.yanlyra.dev",
            siteName: "Ignite Call",
          }}
          titleTemplate="%s | Ignite Call"
          title="Ignite Call"
          defaultTitle="Ignite Call"
        />
        <Component {...pageProps} />
      </SessionProvider>
    </QueryClientProvider>
  );
}
