import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type { GetZoomValueRequestBody, GetZoomValueResponseBody } from "~types"
import { setupSentry } from "~utils/sentry-background"

const sentryWrap = setupSentry("background")

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler<
  GetZoomValueRequestBody,
  GetZoomValueResponseBody
> = async (req, res) => {
  sentryWrap(() => {
    storage.get(req.body.storageKey).then((zoomValue) => {
      res.send({
        zoomValue
      })
    })
  })
}

export default handler
