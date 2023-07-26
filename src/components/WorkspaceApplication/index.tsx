import { useCallback } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import type { WorkspaceApp } from "../../types"
import WorkspaceApplicationComponent from "./component"

type Props = Omit<WorkspaceApp, "isEnabled">

const NOT_READY = "__NOT_READY__INTERNAL_DONT_USE__"

const WorkspaceApplication = ({
  name,
  zoomValues,
  defaultZoom,
  storageKey,
  features
}: Props) => {
  const [zoom, setZoom] = useStorage(storageKey, (storedZoom, isHydrating) => {
    // Helpful post https://discord.com/channels/946290204443025438/1080875092667551824/1080875092667551824
    if (storedZoom) {
      return storedZoom
    }
    if (isHydrating === undefined) {
      return NOT_READY
    }
    if (storedZoom === undefined) {
      return defaultZoom
    }
  })

  const [viewOnly, setViewOnly] = useStorage(
    `${storageKey}:viewOnly`,
    (storedViewOnly, isHydrating) => {
      // Helpful post https://discord.com/channels/946290204443025438/1080875092667551824/1080875092667551824
      if (storedViewOnly) {
        return storedViewOnly
      }
      if (isHydrating === undefined) {
        return NOT_READY
      }
      if (storedViewOnly === undefined) {
        return false
      }
    }
  )

  const updateZoomValue = useCallback(
    (value) => {
      if (value) {
        setZoom(value)
      } else {
        setZoom(defaultZoom)
      }
    },
    [setZoom]
  )

  const updateViewOnlyValue = useCallback(
    (value) => {
      if (value) {
        setViewOnly(value)
      } else {
        setViewOnly(false)
      }
    },
    [setZoom]
  )

  const isCustomZoom = zoom && !zoomValues.includes(zoom)

  // we have not fetched the zoom value from storage, so we're not ready to render yet
  // if (zoom === NOT_READY || viewOnly === NOT_READY) {
  //   return
  // }

  return (
    <WorkspaceApplicationComponent
      applicationName={name}
      isCustomZoomLevel={isCustomZoom}
      updateZoomLevel={updateZoomValue}
      zoomLevel={zoom || defaultZoom}
      zoomLevelCustom={zoom}
      zoomValues={zoomValues}
      features={features}
    />
  )
}

export default WorkspaceApplication
