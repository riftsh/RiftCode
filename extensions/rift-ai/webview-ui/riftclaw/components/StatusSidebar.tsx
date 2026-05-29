// RiftClaw status sidebar — mirrors the CLI sidebar structure:
// conversation title at top, then Bot Status, Context, Instance, Details.
//
// Ref: packages/opencode/src/riftcode/claw/sidebar.tsx

import { Show, createMemo, createSignal } from "solid-js"
import { useClaw } from "../context/claw"
import { useRiftClawLanguage } from "../context/language"

function dot(status: string | null | undefined): string {
  if (!status) return "riftclaw-dot-offline"
  if (status === "running") return "riftclaw-dot-online"
  if (status === "starting" || status === "restarting") return "riftclaw-dot-warning"
  if (status === "destroying") return "riftclaw-dot-error"
  return "riftclaw-dot-offline"
}

function uptime(started: string | null | undefined): string {
  if (!started) return "\u2014"
  const ms = Date.now() - new Date(started).getTime()
  if (ms < 0) return "\u2014"
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

function capitalize(s: string | null | undefined, fallback: string): string {
  if (!s) return fallback
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

export function StatusSidebar() {
  const claw = useClaw()
  const { t } = useRiftClawLanguage()
  const status = createMemo(() => claw.status())
  const ctx = createMemo(() => claw.conversationStatus())

  const [isRenamingTitle, setIsRenamingTitle] = createSignal(false)
  const [renameTitleText, setRenameTitleText] = createSignal("")

  const activeConversation = createMemo(() => {
    const id = claw.activeConversationId()
    if (!id) return null
    return claw.conversations().find((c) => c.conversationId === id) ?? null
  })

  const conversationTitle = createMemo(() => {
    const conv = activeConversation()
    if (!conv) return t("kiloClaw.conversations.new")
    return conv.title ?? t("kiloClaw.conversations.untitled")
  })

  const handleTitleClick = () => {
    if (!activeConversation()) return
    setRenameTitleText(conversationTitle())
    setIsRenamingTitle(true)
  }

  const commitTitleRename = () => {
    const next = renameTitleText().trim()
    const conv = activeConversation()
    if (conv && next && next !== conversationTitle()) {
      claw.renameConversation(conv.conversationId, next)
    }
    setIsRenamingTitle(false)
  }

  const onTitleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      commitTitleRename()
    } else if (e.key === "Escape") {
      setRenameTitleText("")
      setIsRenamingTitle(false)
    }
  }

  return (
    <div class="riftclaw-sidebar">
      {/* Conversation title (top, like the session route title) */}
      <Show when={claw.activeConversationId()}>
        <div class="riftclaw-sidebar-section">
          <Show
            when={!isRenamingTitle()}
            fallback={
              <input
                autofocus
                class="riftclaw-sidebar-titleinput"
                value={renameTitleText()}
                onInput={(e) => setRenameTitleText(e.currentTarget.value)}
                onKeyDown={onTitleKeyDown}
                onBlur={commitTitleRename}
                maxLength={200}
              />
            }
          >
            <button
              type="button"
              class="riftclaw-sidebar-titlebtn"
              onClick={handleTitleClick}
              title={t("kiloClaw.conversations.rename")}
            >
              {conversationTitle()}
            </button>
          </Show>
        </div>
      </Show>

      {/* Bot Status */}
      <Show when={claw.activeConversationId()}>
        <div class="riftclaw-sidebar-section">
          <div class="riftclaw-sidebar-label">{t("kiloClaw.sidebar.botStatus")}</div>
          <div class="riftclaw-sidebar-row">
            <span class={`riftclaw-dot ${claw.botStatus()?.online ? "riftclaw-dot-online" : "riftclaw-dot-offline"}`} />
            <span>{claw.botStatus()?.online ? t("kiloClaw.chat.online") : t("kiloClaw.chat.offline")}</span>
          </div>
        </div>
      </Show>

      {/* Context window usage */}
      <Show when={ctx()}>
        {(c) => (
          <div class="riftclaw-sidebar-section">
            <div class="riftclaw-sidebar-label">{t("kiloClaw.sidebar.context")}</div>
            <Show when={c().contextWindow > 0}>
              <div class="riftclaw-sidebar-detail">
                <span class="riftclaw-sidebar-muted">{t("kiloClaw.sidebar.used")}</span>
                <span>{Math.min(100, Math.round((c().contextTokens / c().contextWindow) * 100))}%</span>
              </div>
            </Show>
            <div class="riftclaw-sidebar-detail">
              <span class="riftclaw-sidebar-muted">{t("kiloClaw.sidebar.tokens")}</span>
              <span>
                {formatTokens(c().contextTokens)} / {formatTokens(c().contextWindow)}
              </span>
            </div>
            <Show when={c().model}>
              <div class="riftclaw-sidebar-detail">
                <span class="riftclaw-sidebar-muted">{t("kiloClaw.sidebar.model")}</span>
                <span class="riftclaw-sidebar-value-truncate">{c().model}</span>
              </div>
            </Show>
            <Show when={c().provider}>
              <div class="riftclaw-sidebar-detail">
                <span class="riftclaw-sidebar-muted">{t("kiloClaw.sidebar.provider")}</span>
                <span class="riftclaw-sidebar-value-truncate">{c().provider}</span>
              </div>
            </Show>
          </div>
        )}
      </Show>

      {/* Instance status */}
      <Show when={status()}>
        <div class="riftclaw-sidebar-section">
          <div class="riftclaw-sidebar-label">{t("kiloClaw.sidebar.instance")}</div>
          <div class="riftclaw-sidebar-row">
            <span class={`riftclaw-dot ${dot(status()!.status)}`} />
            <span>
              {capitalize(status()!.status, t("kiloClaw.sidebar.unknown"))}
              <Show when={status()!.status === "running"}>
                <span class="riftclaw-sidebar-muted"> {uptime(status()!.lastStartedAt)}</span>
              </Show>
            </span>
          </div>
        </div>

        {/* Details */}
        <div class="riftclaw-sidebar-section">
          <div class="riftclaw-sidebar-label">{t("kiloClaw.sidebar.details")}</div>
          <div class="riftclaw-sidebar-detail">
            <span class="riftclaw-sidebar-muted">{t("kiloClaw.sidebar.region")}</span>
            <span>{status()!.flyRegion?.toUpperCase() ?? "\u2014"}</span>
          </div>
          <div class="riftclaw-sidebar-detail">
            <span class="riftclaw-sidebar-muted">{t("kiloClaw.sidebar.version")}</span>
            <span>{status()!.openclawVersion ?? "\u2014"}</span>
          </div>
          <Show
            when={
              status()!.channelCount !== null &&
              status()!.channelCount !== undefined &&
              (status()!.channelCount ?? 0) >= 1
            }
          >
            <div class="riftclaw-sidebar-detail">
              <span class="riftclaw-sidebar-muted">{t("kiloClaw.sidebar.channels")}</span>
              <span>{status()!.channelCount}</span>
            </div>
          </Show>
        </div>
      </Show>

      <Show when={!status()}>
        <div class="riftclaw-sidebar-section">
          <span class="riftclaw-sidebar-muted">{t("kiloClaw.sidebar.noData")}</span>
        </div>
      </Show>
    </div>
  )
}
