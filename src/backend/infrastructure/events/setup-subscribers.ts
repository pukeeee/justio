import { eventDispatcher } from "./event-dispatcher";
// import { ContactCreatedEvent } from "@/backend/domain/events/contact.events";
import { logContactCreationHandler } from "@/backend/application/event-handlers/log-activity.handler";

let isInitialized = false;

export function setupSubscribers() {
  if (isInitialized) return;

  eventDispatcher.register(
    "ContactCreated", // Або краще брати з ContactCreatedEvent.eventName, якщо зробиш static
    logContactCreationHandler,
  );

  isInitialized = true;
  console.log("[System] Event subscribers initialized");
}
