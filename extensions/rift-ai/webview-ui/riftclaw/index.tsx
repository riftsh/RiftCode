// RiftClaw SolidJS webview entry point

import { render } from "solid-js/web"
import "@riftcode/kilo-ui/styles"
import "./riftclaw.css"
import { RiftClawApp } from "./RiftClawApp"

const root = document.getElementById("root")
if (root) {
  render(() => <RiftClawApp />, root)
}
