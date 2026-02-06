import { ContactCreatedEvent } from "@/backend/domain/events/contact.events";
// import { ActivityRepository } from "@/backend/domain/repositories/activity.repository";

export const logContactCreationHandler = async (event: ContactCreatedEvent) => {
  console.log(`[Audit] Recording activity for contact ${event.contactId}`);

  // Тут логіка запису в таблицю activities
  // await activityRepo.create({
  //   type: 'CONTACT_CREATED',
  //   entityId: event.contactId,
  //   userId: event.createdBy,
  //   details: `Created contact of type ${event.contactType}`
  // });
};
