import type { PlasmoMessaging } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import type {
  GetFeatureClassroomSupportRequestBody,
  GetFeatureClassroomSupportResponseBody
} from "src/types";

const handler: PlasmoMessaging.MessageHandler<
  GetFeatureClassroomSupportRequestBody,
  GetFeatureClassroomSupportResponseBody
> = async (req, res) => {
  const storage = new Storage();
  const { storageKey } = req.body;

  const enabled = await storage.get<boolean>(storageKey);
  res.send({
    enabled: Boolean(enabled)
  });
};

export default handler;
