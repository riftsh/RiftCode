# KiloCode - Built-in Workbench Integration

## Overview

KiloCode (formerly RiftAI) is now integrated directly into RiftCode's workbench as a **first-class built-in contribution**, not an external extension.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RiftCode Workbench                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Workbench Core                            │   │
│  │  ┌────────────────────────────────────────────────────┐   │   │
│  │  │        KiloCode Workbench Contribution             │   │   │
│  │  │  ┌──────────────┐  ┌──────────────────────────┐  │   │   │
│  │  │  │  kilocode.  │  │ kilocode.contribution.ts │  │   │   │
│  │  │  │ workbench.ts│  │ (View Container, Views)   │  │   │   │
│  │  │  └──────────────┘  └──────────────────────────┘  │   │   │
│  │  └────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    KiloCode Core (src/)                        │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐     │   │
│  │  │RiftProvider│ │ AgentMgr   │ │ RiftBrowserService │     │   │
│  │  │ (Chat UI) │ │ (Agents)   │ │ (Browser Panel)   │     │   │
│  │  └────────────┘ └────────────┘ └────────────────────┘     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## File Structure

```
src/vs/workbench/contrib/kilocode/
├── kilocode.workbench.ts     # Main workbench contribution
├── kilocode.contribution.ts  # View container & views registration
├── package.json              # Manifest (built-in, not extension)
├── src/                     # KiloCode core source
│   ├── extension.ts        # Main extension entry
│   ├── RiftProvider.ts     # Chat UI provider
│   ├── agent-manager/       # Agent management
│   ├── services/            # Services (CLI, autocomplete, etc.)
│   └── ...
└── README.md
```

## Key Differences from Extension

| Aspect | External Extension | Built-in (This) |
|--------|-------------------|-----------------|
| Activation | On extension activate | On workbench startup |
| Distribution | VSIX/Marketplace | Built into binary |
| Updates | Via marketplace | Via RiftCode updates |
| API Access | Limited to public API | Full workbench API |
| Performance | Requires activation | Immediately available |

## Integration Points

### 1. View Container
KiloCode registers a view container in the sidebar:
- ID: `kilocode.sidebar`
- Icon: Robot icon in activity bar
- Views: Chat, Agent Manager, Settings

### 2. Commands
Registered via workbench action system:
- `kilocode.open` - Open KiloCode sidebar
- `kilocode.toggle` - Toggle visibility
- `kilocode.newSession` - New chat session

### 3. Keybindings
- `Ctrl+Shift+I` - Open KiloCode (replaces Ctrl+Alt+I)

### 4. Configuration
Settings registered in workbench config:
- `kilocode.enabled`
- `kilocode.defaultProvider`
- `kilocode.defaultModel`
- etc.

### 5. Services Integration
- Uses workbench's instantiation service for DI
- Registers with activity bar service
- Integrates with editor, terminal, git services

## How It Works

1. **Startup**: Workbench starts → KiloCode contribution initialized
2. **Activation**: No lazy activation - KiloCode is immediately available
3. **View Creation**: User clicks icon → View container creates views
4. **Service Connection**: Views connect to CLI backend via KiloConnectionService
5. **AI Interaction**: User chats → Messages sent to CLI → AI response → UI update

## Benefits

### For Users
- 🚀 **Instant availability** - No waiting for extension activation
- 🔄 **Seamless updates** - Part of RiftCode itself
- 💾 **Lower memory** - No extension host overhead
- 🎯 **Deeper integration** - Built into workbench architecture

### For Developers
- 📦 **Full API access** - Use private workbench APIs
- 🔧 **Better debugging** - Direct workbench integration
- 🚀 **Faster iteration** - No need for extension reloading
- 📊 **Better telemetry** - Workbench-level telemetry

## Migration Notes

If you previously used KiloCode as an extension:

1. The extension can still be installed for development
2. In production builds, the built-in version is used
3. Settings are compatible between both
4. No user-facing changes - UI remains the same

## Future Enhancements

- [ ] Remove extension dependency entirely
- [ ] Share services between built-in and extension
- [ ] Unified settings UI
- [ ] Deeper workbench integration (status bar, etc.)

## Testing

```bash
# Build with KiloCode built-in
npm run build

# Start with KiloCode available immediately
npm start

# Run tests
npm test
```

## Troubleshooting

### KiloCode not showing?
Check that:
1. `kilocode.enabled` setting is true
2. View container is registered in workbench
3. Activity bar icon is enabled

### KiloCode not responding?
1. Check CLI backend is running
2. Verify connection service is initialized
3. Check workbench console for errors

---

*Built-in KiloCode v1.0.0 - Part of RiftCode 2026*