/**
 * Portfolio does not use a service worker. This file exists only so legacy
 * registrations stop 404ing. On activate it unregisters itself.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(self.registration.unregister());
});
