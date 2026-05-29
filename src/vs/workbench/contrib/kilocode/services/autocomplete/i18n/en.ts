// English runtime translations for autocomplete (riftcode:autocomplete.* namespace)
// Source: src/i18n/locales/en/riftcode.json → "autocomplete" section

export const dict = {
  "riftcode:autocomplete.statusBar.enabled": "$(kilo-logo) Autocomplete",
  "riftcode:autocomplete.statusBar.snoozed": "snoozed",
  "riftcode:autocomplete.statusBar.warning": "$(warning) Autocomplete",
  "riftcode:autocomplete.statusBar.tooltip.basic": "RiftAI Autocomplete",
  "riftcode:autocomplete.statusBar.tooltip.disabled": "RiftAI Autocomplete (disabled)",
  "riftcode:autocomplete.statusBar.tooltip.noUsableProvider":
    "**No autocomplete model configured**\n\nTo enable autocomplete, add a profile with one of these supported providers: {{providers}}.\n\n[Open Settings]({{command}})",
  "riftcode:autocomplete.statusBar.tooltip.sessionTotal": "Session total cost:",
  "riftcode:autocomplete.statusBar.tooltip.provider": "Provider:",
  "riftcode:autocomplete.statusBar.tooltip.model": "Model:",
  "riftcode:autocomplete.statusBar.tooltip.profile": "Profile: ",
  "riftcode:autocomplete.statusBar.tooltip.defaultProfile": "Default",
  "riftcode:autocomplete.statusBar.tooltip.completionSummary":
    "Performed {{count}} completions between {{startTime}} and {{endTime}}, for a total cost of {{cost}}.",
  "riftcode:autocomplete.statusBar.tooltip.providerInfo": "Autocompletions provided by {{model}} via {{provider}}.",
  "riftcode:autocomplete.statusBar.cost.zero": "$0.00",
  "riftcode:autocomplete.statusBar.cost.lessThanCent": "<$0.01",
  "riftcode:autocomplete.toggleMessage": "RiftAI Autocomplete {{status}}",
  "riftcode:autocomplete.progress.title": "RiftAI",
  "riftcode:autocomplete.progress.analyzing": "Analyzing your code...",
  "riftcode:autocomplete.progress.generating": "Generating suggested edits...",
  "riftcode:autocomplete.progress.processing": "Processing suggested edits...",
  "riftcode:autocomplete.progress.showing": "Displaying suggested edits...",
  "riftcode:autocomplete.input.title": "RiftAI: Quick Task",
  "riftcode:autocomplete.input.placeholder": "e.g., 'refactor this function to be more efficient'",
  "riftcode:autocomplete.commands.generateSuggestions": "RiftAI: Generate Suggested Edits",
  "riftcode:autocomplete.commands.displaySuggestions": "Display Suggested Edits",
  "riftcode:autocomplete.commands.cancelSuggestions": "Cancel Suggested Edits",
  "riftcode:autocomplete.commands.applyCurrentSuggestion": "Apply Current Suggested Edit",
  "riftcode:autocomplete.commands.applyAllSuggestions": "Apply All Suggested Edits",
  "riftcode:autocomplete.commands.category": "RiftAI",
  "riftcode:autocomplete.codeAction.title": "RiftAI: Suggested Edits",
  "riftcode:autocomplete.chatParticipant.fullName": "RiftAI Agent",
  "riftcode:autocomplete.chatParticipant.name": "Agent",
  "riftcode:autocomplete.chatParticipant.description": "I can help you with quick tasks and suggested edits.",
  "riftcode:autocomplete.incompatibilityExtensionPopup.message":
    "The RiftAI Autocomplete is being blocked by a conflict with GitHub Copilot. To fix this, you must disable Copilot's inline suggestions.",
  "riftcode:autocomplete.incompatibilityExtensionPopup.disableCopilot": "Disable Copilot",
  "riftcode:autocomplete.incompatibilityExtensionPopup.disableInlineAssist": "Disable Autocomplete",
  "riftcode:autocomplete.creditsExhausted.message":
    "RiftAI Autocomplete has been paused because your account has no remaining credits. Add credits to resume autocomplete.",
  "riftcode:autocomplete.creditsExhausted.addCredits": "Add Credits",
  "riftcode:autocomplete.authError.message":
    "RiftAI Autocomplete has been paused due to an authentication error. Please sign in again.",
}
