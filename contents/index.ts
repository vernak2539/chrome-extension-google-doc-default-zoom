// import type { PlasmoContentScript } from "plasmo"

import { relay, sendViaRelay } from "@plasmohq/messaging"

// export const config: PlasmoContentScript = {
//     matches: ["http://www.plasmo.com/*"] // Only relay messages from this domain
// }

console.log("content SCRIPT")

relay(
  {
    name: "get-zoom-value"
  },
  async (payload) => {
    console.log("onMessage - Contents")
    console.log(payload)
  }
)

sendViaRelay({ name: "get-zoom-value" })
