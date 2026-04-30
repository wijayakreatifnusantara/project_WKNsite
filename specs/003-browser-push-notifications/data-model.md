# Data Model: Browser Push Notifications

## Local Storage

The feature uses `localStorage` to persist user preferences across sessions.

| Key | Type | Description |
|-----|------|-------------|
| `wkn_notifications_enabled` | `boolean` | User's explicit choice to enable/disable notifications within the app. |
| `wkn_last_notification_tag` | `string` | The tag of the last notification sent to avoid duplicates on refresh. |

## Notification Object Structure

When triggering a notification, the following structure is used:

```javascript
{
  title: "WKN Alert",
  body: "Kontrak karyawan [Nama] akan berakhir dalam 7 hari.",
  tag: "contract-expiry-[id]",
  icon: "/assets/logo.png",
  requireInteraction: true
}
```

## State Transitions (Permissions)

1. **Default**: Permission not yet requested. UI shows "Enable Notifications".
2. **Granted**: Permission allowed. UI shows "Notifications Active".
3. **Denied**: Permission blocked. UI shows "Notifications Blocked (Reset in Browser Settings)".
