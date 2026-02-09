import { ClientCreatedEvent } from "@/backend/domain/events/client.events";
// import { ActivityRepository } from "@/backend/domain/repositories/activity.repository";

export const logClientCreationHandler = async (event: ClientCreatedEvent) => {
  console.log(`[Audit] Recording activity for client ${event.clientId}`);

  // Тут логіка запису в таблицю activities
  // await activityRepo.create({
  //   type: 'Client_CREATED',
  //   entityId: event.clientId,
  //   userId: event.createdBy,
  //   details: `Created client of type ${event.clientType}`
  // });
};
