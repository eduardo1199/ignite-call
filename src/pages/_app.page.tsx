import type { AppProps } from 'next/app'
import { globalStyles } from 'styles/global'
import { SessionProvider } from 'next-auth/react'

globalStyles()

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
