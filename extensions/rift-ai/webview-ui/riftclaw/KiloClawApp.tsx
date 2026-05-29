// RiftClaw root component

import { Switch, Match } from "solid-js"
import { ThemeProvider } from "@riftcode/kilo-ui/theme"
import { MarkedProvider } from "@riftcode/kilo-ui/context/marked"
import { Button } from "@riftcode/kilo-ui/button"
import { Spinner } from "@riftcode/kilo-ui/spinner"
import { Toast } from "@riftcode/kilo-ui/toast"
import { ClawProvider, useClaw } from "./context/claw"
import { RiftClawLanguageProvider, useRiftClawLanguage } from "./context/language"
import { ConversationList } from "./components/ConversationList"
import { MessageArea } from "./components/MessageArea"
import { StatusSidebar } from "./components/StatusSidebar"
import { SetupView } from "./components/SetupView"
import { UpgradeView } from "./components/UpgradeView"

function Content() {
  const claw = useClaw()
  const { t } = useRiftClawLanguage()

  return (
    <div class="riftclaw-root">
      <Switch>
        <Match when={claw.phase() === "loading"}>
          <div class="riftclaw-center">
            <div class="riftclaw-loading">
              <Spinner />
              <span>{t("kiloClaw.loading")}</span>
            </div>
          </div>
        </Match>
        <Match when={claw.phase() === "noInstance"}>
          <SetupView />
        </Match>
        <Match when={claw.phase() === "needsUpgrade"}>
          <UpgradeView />
        </Match>
        <Match when={claw.phase() === "error"}>
          <div class="riftclaw-center">
            <div class="riftclaw-error-view">
              <span class="riftclaw-error-text">{claw.error()}</span>
              <Button variant="primary" onClick={() => claw.retry()}>
                {t("kiloClaw.error.retry")}
              </Button>
            </div>
          </div>
        </Match>
        <Match when={claw.phase() === "ready"}>
          <div class="riftclaw-layout">
            <ConversationList />
            <MessageArea />
            <StatusSidebar />
          </div>
        </Match>
      </Switch>
      <Toast.Region />
    </div>
  )
}

export function RiftClawApp() {
  return (
    <ThemeProvider defaultTheme="kilo-vscode">
      <ClawProvider>
        <LanguageBridge>
          <MarkedProvider>
            <Content />
          </MarkedProvider>
        </LanguageBridge>
      </ClawProvider>
    </ThemeProvider>
  )
}

/** Bridges the claw context locale into the language provider. Must be below ClawProvider. */
function LanguageBridge(props: { children: any }) {
  const claw = useClaw()
  return <RiftClawLanguageProvider locale={claw.locale}>{props.children}</RiftClawLanguageProvider>
}
