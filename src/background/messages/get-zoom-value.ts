import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type { GetZoomValueRequestBody, GetZoomValueResponseBody } from "~types"

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler<
  GetZoomValueRequestBody,
  GetZoomValueResponseBody
> = async (req, res) => {
  storage.get(req.body.storageKey).then((zoomValue) => {
    res.send({
      zoomValue
    })
  })
}

export default handler
