# Research: Browser Push Notifications

## Decision: Client-Side Web Notifications API

We will use the **Web Notifications API** (`new Notification()`) implemented directly in the main JavaScript thread. 

### Rationale
- **Low Complexity**: Does not require a Service Worker or backend push server infrastructure for the initial version.
- **Suitability**: Since the dashboard is a local tool (WKNsite) and usually kept open in a tab, client-side notifications are sufficient to alert the user when they are working in another tab or have the browser minimized.
- **Direct Access**: Easier integration with existing app state and logic in `main.js`.

### Alternatives Considered
- **Push API (Service Workers)**: Rejected for v1 due to higher complexity (requires a public server for VAPID keys and push service). May be considered later if notifications are needed when the browser/tab is completely closed.
- **In-App Alerts (Modals/Toast)**: Already partially exists but fails the "tab tidak fokus" requirement.

## Implementation Details

### 1. Permission Workflow
- Check `Notification.permission` on app load.
- If `default`, show a subtle UI element (e.g., "Enable Alerts" button) rather than prompting immediately.
- Trigger `Notification.requestPermission()` only on user click.

### 2. Triggering Notifications
- Use a helper function `showNotification(title, body, options)`.
- Use the `tag` property to prevent duplicate alerts for the same event.
- Use `icon` to show the WKN logo.

### 3. Handling Interaction
- Use the `onclick` event handler to focus the browser tab.
- `window.focus()` will be called to bring the dashboard to the front.

### 4. Constraints
- **Security Context**: Only works on `localhost` or `https`.
- **Browser Support**: Broad support in modern desktop browsers (Chrome, Edge, Firefox).

## References
- [MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web.dev: Notification Best Practices](https://web.dev/articles/notification-best-practices)
