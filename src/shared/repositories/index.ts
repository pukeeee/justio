/**
 * Barrel file для експорту всіх репозиторіїв.
 * Забезпечує зручний імпорт репозиторіїв у сервісах та екшенах.
 * 
 * @example
 * import * as ContactRepository from '@/shared/repositories';
 * const contact = await ContactRepository.getById('contact-id');
 * 
 * @example
 * import { ContactRepository, DealRepository } from '@/shared/repositories';
 * const contact = await ContactRepository.getById('contact-id');
 * const deal = await DealRepository.getById('deal-id');
 */

// Core CRM Entities
export * as WorkspaceRepository from './workspace.repository';
export * as ContactRepository from "./contact.repository";
export * as CompanyRepository from "./company.repository";
export * as DealRepository from "./deal.repository";

// Additional Entities
export * as TaskRepository from "./task.repository";
export * as ActivityRepository from "./activity.repository";

// Billing & Usage
export * as SubscriptionRepository from "./subscription.repository";
export * as QuotaRepository from "./quota.repository";

// NOTE: NoteRepository видалено - використовуйте ActivityRepository
// з activity_type = 'note' для роботи з примітками.
// NOTE: PipelineRepository поки що не реалізовано як окремий репозиторій.
