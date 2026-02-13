export enum Permission {
  // --- Contacts ---
  CREATE_CONTACT = 'create_contact',
  UPDATE_CONTACT = 'update_contact',
  DELETE_CONTACT = 'delete_contact',
  VIEW_CONTACT = 'view_contact',

  // --- Workspace ---
  MANAGE_WORKSPACE = 'manage_workspace',
  DELETE_WORKSPACE = 'delete_workspace',
  INVITE_USERS = 'invite_users',
  REMOVE_USERS = 'remove_users',

  // --- Billing ---
  MANAGE_BILLING = 'manage_billing',
}
