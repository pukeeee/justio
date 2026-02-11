import { eventDispatcher } from "./event-dispatcher";
// import { ClientCreatedEvent } from "@/backend/domain/events/client.events";
import { logClientCreationHandler } from "@/backend/application/event-handlers/log-activity.handler";

let isInitialized = false;

export function setupSubscribers() {
  if (isInitialized) return;

  eventDispatcher.register(
    "ContactCreated", // Або краще брати з ClientCreatedEvent.eventName, якщо зробиш static
    logClientCreationHandler,
  );

  isInitialized = true;
  console.log("[System] Event subscribers initialized");
}
