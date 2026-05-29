/**
 * RiftClaw VS Code extension message types.
 *
 * Defines the postMessage protocol between the extension host (Node.js)
 * and the RiftClaw webview (SolidJS). The extension host owns all network
 * connections (Kilo Chat HTTP + event-service WebSocket) and relays data
 * to the webview.
 *
 * SYNC: Shared types are mirrored in webview-ui/riftclaw/lib/types.ts —
 * keep both in sync.
 */

// ── Instance status (RiftClaw worker) ───────────────────────────────

export type ClawStatus = {
  // `recovering` and `restoring` are transitional states the worker reports
  // while bringing an instance back from an unexpected stop or a snapshot
  // restore (cloud: `services/riftclaw/src/index.ts`).
  status:
    | "provisioned"
    | "starting"
    | "restarting"
    | "recovering"
    | "running"
    | "stopped"
    | "destroying"
    | "restoring"
    | null
  sandboxId?: string
  flyRegion?: string
  machineSize?: { cpus: number; memory_mb: number }
  openclawVersion?: string | null
  lastStartedAt?: string | null
  lastStoppedAt?: string | null
  channelCount?: number
  secretCount?: number
  userId?: string
  botName?: string | null
}

// ── Kilo Chat token envelope (gateway response) ─────────────────────

export type ChatToken = {
  token: string
  expiresAt: string // ISO timestamp
  kiloChatUrl: string
  eventServiceUrl: string
}

// ── Kilo Chat content blocks ────────────────────────────────────────
// Mirrors `@riftcode/kilo-chat` schemas. See cloud/packages/kilo-chat/src/schemas.ts.

export type ExecApprovalDecision = "allow-once" | "allow-always" | "deny"

export type TextBlock = { type: "text"; text: string }

export type ActionItem = {
  label: string
  style: "primary" | "danger" | "secondary"
  value: ExecApprovalDecision
}

export type ActionsBlock = {
  type: "actions"
  groupId: string
  actions: ActionItem[]
  resolved?: {
    value: ExecApprovalDecision
    resolvedBy: string
    resolvedAt: number
  }
}

export type ContentBlock = TextBlock | ActionsBlock

// ── Kilo Chat reactions ─────────────────────────────────────────────

export type ReactionSummary = {
  emoji: string
  count: number
  memberIds: string[]
}

// ── Kilo Chat message ───────────────────────────────────────────────

export type Message = {
  id: string
  senderId: string
  content: ContentBlock[]
  inReplyToMessageId: string | null
  updatedAt: number | null
  clientUpdatedAt: number | null
  deleted: boolean
  deliveryFailed: boolean
  reactions: ReactionSummary[]
}

// ── Conversations ───────────────────────────────────────────────────

export type ConversationListItem = {
  conversationId: string
  title: string | null
  lastActivityAt: number | null
  lastReadAt: number | null
  joinedAt: number
}

export type ConversationMember = { id: string; kind: "user" | "bot" }

export type ConversationDetail = {
  id: string
  title: string | null
  createdBy: string
  createdAt: number
  members: ConversationMember[]
}

// ── Bot / conversation status (telemetry) ───────────────────────────

export type BotStatusRecord = {
  online: boolean
  at: number
  updatedAt: number
}

export type ConversationStatusRecord = {
  conversationId: string
  contextTokens: number
  contextWindow: number
  model: string | null
  provider: string | null
  at: number
  updatedAt: number
}

// ── Typed Kilo Chat events (server → client) ───────────────────────
// Event names mirror `@riftcode/kilo-chat/events`.

/**
 * Snapshot of the message that was replied to. Server includes this on
 * `message.created` so clients can render a reply preview without a follow-up
 * fetch. `deleted` mirrors the soft-deletion state at the time of replying.
 */
export type ReplyToSnapshot = {
  messageId: string
  senderId: string
  content: ContentBlock[]
  deleted?: boolean
}

export type MessageCreatedEvent = {
  messageId: string
  senderId: string
  content: ContentBlock[]
  inReplyToMessageId: string | null
  clientId?: string
  replyTo?: ReplyToSnapshot | null
}

export type MessageUpdatedEvent = {
  messageId: string
  content: ContentBlock[]
  clientUpdatedAt: number | null
}

export type MessageDeletedEvent = { messageId: string }
export type MessageDeliveryFailedEvent = { messageId: string }

export type TypingEvent = { memberId: string }
export type TypingStopEvent = { memberId: string }

export type ReactionAddedEvent = { messageId: string; memberId: string; emoji: string; operationId?: string }
export type ReactionRemovedEvent = { messageId: string; memberId: string; emoji: string; operationId?: string }

/**
 * Server fans out the full conversation snapshot on `conversation.created` so
 * clients can append to their list without a follow-up fetch. Older servers may
 * still send only the `conversationId`, so the snapshot is optional.
 */
export type ConversationCreatedEvent = {
  conversationId: string
  conversation?: ConversationListItem
}
export type ConversationRenamedEvent = { conversationId: string; title: string }
export type ConversationLeftEvent = { conversationId: string }
export type ConversationReadEvent = { conversationId: string; memberId: string; lastReadAt: number }
export type ConversationActivityEvent = { conversationId: string; lastActivityAt: number }

export type ActionExecutedEvent = {
  conversationId: string
  messageId: string
  groupId: string
  value: ExecApprovalDecision
  executedBy: string
}
export type ActionDeliveryFailedEvent = {
  conversationId: string
  messageId: string
  groupId: string
}

export type BotStatusEvent = { sandboxId: string; online: boolean; at: number }
export type ConversationStatusEvent = {
  conversationId: string
  contextTokens: number
  contextWindow: number
  model: string | null
  provider: string | null
  at: number
}

export type KiloChatEventMap = {
  "message.created": MessageCreatedEvent
  "message.updated": MessageUpdatedEvent
  "message.deleted": MessageDeletedEvent
  "message.delivery_failed": MessageDeliveryFailedEvent
  typing: TypingEvent
  "typing.stop": TypingStopEvent
  "reaction.added": ReactionAddedEvent
  "reaction.removed": ReactionRemovedEvent
  "conversation.created": ConversationCreatedEvent
  "conversation.renamed": ConversationRenamedEvent
  "conversation.left": ConversationLeftEvent
  "conversation.read": ConversationReadEvent
  "conversation.activity": ConversationActivityEvent
  "action.executed": ActionExecutedEvent
  "action.delivery_failed": ActionDeliveryFailedEvent
  "bot.status": BotStatusEvent
  "conversation.status": ConversationStatusEvent
}

export type KiloChatEventName = keyof KiloChatEventMap

// ── Webview ↔ extension state ───────────────────────────────────────

export type TypingMember = { memberId: string; at: number }

// Full state snapshot pushed to the webview
// Every phase carries `locale` so the webview can resolve translations immediately.
export type RiftClawState =
  | { phase: "loading"; locale: string }
  | { phase: "noInstance"; locale: string }
  | { phase: "needsUpgrade"; locale: string }
  | { phase: "error"; locale: string; error: string }
  | {
      phase: "ready"
      locale: string
      status: ClawStatus | null
      currentUserId: string
      sandboxId: string
      conversations: ConversationListItem[]
      hasMoreConversations: boolean
      activeConversationId: string | null
      messages: Message[]
      hasMoreMessages: boolean
      botStatus: BotStatusRecord | null
      conversationStatus: ConversationStatusRecord | null
      typingMembers: TypingMember[]
    }

// ── Messages: Webview → Extension Host ──────────────────────────────

export type RiftClawInMessage =
  | { type: "riftclaw.ready" }
  | { type: "riftclaw.openExternal"; url: string }
  | { type: "riftclaw.selectConversation"; conversationId: string }
  | { type: "riftclaw.createConversation"; title?: string }
  | { type: "riftclaw.renameConversation"; conversationId: string; title: string }
  | { type: "riftclaw.leaveConversation"; conversationId: string }
  | { type: "riftclaw.loadMoreConversations" }
  | {
      type: "riftclaw.sendMessage"
      conversationId: string
      content: ContentBlock[]
      inReplyToMessageId?: string
    }
  | { type: "riftclaw.editMessage"; conversationId: string; messageId: string; content: ContentBlock[] }
  | { type: "riftclaw.deleteMessage"; conversationId: string; messageId: string }
  | { type: "riftclaw.loadMoreMessages"; conversationId: string; before: string }
  | { type: "riftclaw.addReaction"; conversationId: string; messageId: string; emoji: string }
  | { type: "riftclaw.removeReaction"; conversationId: string; messageId: string; emoji: string }
  | {
      type: "riftclaw.executeAction"
      conversationId: string
      messageId: string
      groupId: string
      value: ExecApprovalDecision
    }
  | { type: "riftclaw.sendTyping"; conversationId: string }
  | { type: "riftclaw.sendTypingStop"; conversationId: string }
  | { type: "riftclaw.markRead"; conversationId: string }

// ── Messages: Extension Host → Webview ──────────────────────────────

export type RiftClawOutMessage =
  | { type: "riftclaw.state"; state: RiftClawState }
  | { type: "riftclaw.status"; data: ClawStatus | null }
  | { type: "riftclaw.locale"; locale: string }
  | { type: "riftclaw.error"; error: string }
  | { type: "riftclaw.conversations"; conversations: ConversationListItem[]; hasMore: boolean; replace: boolean }
  | { type: "riftclaw.activeConversation"; conversationId: string | null }
  | { type: "riftclaw.messages"; conversationId: string; messages: Message[]; hasMore: boolean; replace: boolean }
  | { type: "riftclaw.messageOptimistic"; conversationId: string; message: Message }
  | { type: "riftclaw.messageReplaced"; conversationId: string; pendingId: string; message: Message }
  | { type: "riftclaw.messageRemoved"; conversationId: string; messageId: string }
  | { type: "riftclaw.botStatus"; status: BotStatusRecord | null }
  | { type: "riftclaw.conversationStatus"; status: ConversationStatusRecord | null }
  | { type: "riftclaw.typing"; conversationId: string; memberId: string }
  | { type: "riftclaw.typingStop"; conversationId: string; memberId: string }
  | { type: "fontSizeChanged"; fontSize: number }
