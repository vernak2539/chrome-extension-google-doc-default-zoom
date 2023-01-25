import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import { IS_ACTIVE_STORAGE_KEY } from "~constants"

const storage = new Storage()

export const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const currentUrl = new URL(req.body.url)
  const isActive = currentUrl.host === "docs.google.com"

  storage.set(IS_ACTIVE_STORAGE_KEY, isActive).then(() => {
    res.send({
      isActive
    })
  })
}
