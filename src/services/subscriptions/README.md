Subscription helpers: use `realtimeSubscriptionManager.js` to create feature subscriptions.

Example:

import { subscribeToCourseChanges } from './courseSubscription';
const cleanup = subscribeToCourseChanges({ onDataChange: () => fetchCourses() });

Call `cleanup()` on unmount.
