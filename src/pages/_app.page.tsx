import '../lib/dayjs'

import type { AppProps } from 'next/app'
import { globalStyles } from 'styles/global'
import { SessionProvider } from 'next-auth/react'

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from 'lib/react-query'

globalStyles()

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <Component {...pageProps} />
      </SessionProvider>
    </QueryClientProvider>
  )
}

export default MyApp
