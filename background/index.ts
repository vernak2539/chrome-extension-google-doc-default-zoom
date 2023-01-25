import type { PlasmoMessaging } from "@plasmohq/messaging"

export const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // eventually do something here to trigger the zoom change
  console.log(req.body)
}
