import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type {
  GetFeatureViewOnlyRequestBody,
  GetFeatureViewOnlyResponseBody
} from "../../types"
import { setupSentry } from "../../utils/sentry/background"

const sentryWrap = setupSentry("background")

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler<
  GetFeatureViewOnlyRequestBody,
  GetFeatureViewOnlyResponseBody
> = async (req, res) => {
  sentryWrap(() => {
    storage.get<boolean>(req.body.storageKey).then((enabled) => {
      res.send({
        enabled
      })
    })
  })
}

export default handler
