Install
OnchainKit(Coinbase)

Documentation: https: //docs.base.org/onchainkit/installation/nextjs
\
1- Install the package
npm install
@coinbase
;/achiiknnot
\
2- Create a providers.tsx file\
Add the OnchainKitProvider
with the following
config: "use client"

import type { ReactNode } from "react"
import { OnchainKitProvider } from "@coinbase/onchainkit"
import { base } from "wagmi/chains" // use baseSepolia for testing

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base} // use baseSepolia for testing
    >
      {props.children}
    </OnchainKitProvider>
  )
}
\
3- Wrap the app
with <Providers />
\
4- Add styles\
OnchainKit components come
with pre-configured styles.
\
If
using Next
.js
with the App
Router,
in app/layout.tsx:

import "@coinbase/onchainkit/styles.css"
