import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json() as {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, string>;
    actions?: Array<{ action: string; title: string; icon?: string }>;
  };

  const options: NotificationOptions = {
    body: data.body,
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-192.png",
    tag: data.tag,
    data: data.data,
    actions: data.actions || [],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data as Record<string, string> | undefined;
  const baseUrl = notificationData?.url || "/dashboard";

  if (action === "approve" && notificationData?.assignmentId) {
    event.waitUntil(
      fetch(`/api/assignments/${notificationData.assignmentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      }).then(() => {
        return self.clients.matchAll({ type: "window" }).then((clients) => {
          if (clients.length > 0) {
            return clients[0].focus();
          }
          return self.clients.openWindow(baseUrl);
        });
      })
    );
    return;
  }

  if (action === "start_now" && notificationData?.assignmentId) {
    event.waitUntil(
      fetch(`/api/assignments/${notificationData.assignmentId}/start`, {
        method: "POST",
      }).then(() => {
        return self.clients.openWindow(`/assignments/${notificationData.assignmentId}`);
      })
    );
    return;
  }

  if (action === "postpone" && notificationData?.assignmentId) {
    event.waitUntil(
      self.clients.openWindow(`/assignments/${notificationData.assignmentId}?action=snooze`)
    );
    return;
  }

  if (action === "approve_snooze" && notificationData?.snoozeRequestId) {
    event.waitUntil(
      fetch(`/api/snooze-requests/${notificationData.snoozeRequestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      }).then(() => {
        return self.clients.matchAll({ type: "window" }).then((clients) => {
          if (clients.length > 0) return clients[0].focus();
          return self.clients.openWindow("/dashboard");
        });
      })
    );
    return;
  }

  if (action === "deny_snooze" && notificationData?.snoozeRequestId) {
    event.waitUntil(
      fetch(`/api/snooze-requests/${notificationData.snoozeRequestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "denied" }),
      }).then(() => {
        return self.clients.matchAll({ type: "window" }).then((clients) => {
          if (clients.length > 0) return clients[0].focus();
          return self.clients.openWindow("/dashboard");
        });
      })
    );
    return;
  }

  if (action === "vote_now" && notificationData?.pollId) {
    event.waitUntil(self.clients.openWindow(`/dashboard?poll=${notificationData.pollId}`));
    return;
  }

  // Default: open the URL from notification data
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      if (clients.length > 0) {
        clients[0].navigate(baseUrl);
        return clients[0].focus();
      }
      return self.clients.openWindow(baseUrl);
    })
  );
});

// Web Share Target handler
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname === "/share-intake" && event.request.method === "POST") {
    event.respondWith(
      (async () => {
        const formData = await event.request.formData();
        const title = formData.get("title") as string;
        const text = formData.get("text") as string;
        const shareUrl = formData.get("url") as string;
        const photos = formData.getAll("photos") as File[];

        // Cache the shared data for the page to pick up
        const cache = await caches.open("share-target");
        const shareData = JSON.stringify({
          title,
          text,
          url: shareUrl,
          hasPhotos: photos.length > 0,
          timestamp: Date.now(),
        });
        await cache.put(
          new Request("/share-intake-data"),
          new Response(shareData)
        );

        // Store photos if any
        if (photos.length > 0) {
          for (let i = 0; i < photos.length; i++) {
            await cache.put(
              new Request(`/share-intake-photo-${i}`),
              new Response(photos[i])
            );
          }
        }

        return Response.redirect("/share-intake?shared=true", 303);
      })()
    );
  }
});

serwist.addEventListeners();
