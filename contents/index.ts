import { relay, sendViaRelay } from "@plasmohq/messaging"

// create and "register" the relay
relay({
  name: "get-zoom-value"
})

// use the relay
sendViaRelay({ name: "get-zoom-value" }).then((response) => {
  console.log(response)
})
