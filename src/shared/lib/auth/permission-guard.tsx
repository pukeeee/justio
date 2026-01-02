/**
 * Permission-based UI components
 * Conditionally render UI based on user permissions
 */

"use client";

import React from "react";
import {
  usePermission,
  usePermissions,
  useAnyPermission,
} from "@/shared/lib/hooks/use-auth";
import { type Permission } from "@/shared/lib/auth/permissions";

// ============================================================================
// CAN COMPONENT (single permission)
// ============================================================================

interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render children only if user has the specified permission
 *
 * @example
 * <Can permission="delete_contact">
 *   <DeleteButton />
 * </Can>
 */
export function Can({ permission, children, fallback = null }: CanProps) {
  const hasPermission = usePermission(permission);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// CAN ALL COMPONENT (multiple permissions - all required)
// ============================================================================

interface CanAllProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render children only if user has ALL specified permissions
 *
 * @example
 * <CanAll permissions={['create_contact', 'update_contact']}>
 *   <ContactForm />
 * </CanAll>
 */
export function CanAll({
  permissions,
  children,
  fallback = null,
}: CanAllProps) {
  const hasAllPermissions = usePermissions(permissions);

  if (!hasAllPermissions) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// CAN ANY COMPONENT (multiple permissions - any required)
// ============================================================================

interface CanAnyProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render children if user has ANY of the specified permissions
 *
 * @example
 * <CanAny permissions={['view_all_contacts', 'view_own_contacts']}>
 *   <ContactList />
 * </CanAny>
 */
export function CanAny({
  permissions,
  children,
  fallback = null,
}: CanAnyProps) {
  const hasAnyPermission = useAnyPermission(permissions);

  if (!hasAnyPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// ROLE-BASED COMPONENTS
// ============================================================================

interface RequireRoleProps {
  roles: ("owner" | "admin" | "manager" | "user" | "guest")[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render children only if user has one of the specified roles
 *
 * @example
 * <RequireRole roles={['owner', 'admin']}>
 *   <AdminPanel />
 * </RequireRole>
 */
export function RequireRole({
  roles,
  children,
  fallback = null,
}: RequireRoleProps) {
  const { useWorkspace } = require("@/shared/lib/hooks/use-auth");
  const { role } = useWorkspace();

  if (!role || !roles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// FEATURE-BASED COMPONENTS
// ============================================================================

interface RequireFeatureProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Render children only if feature is enabled for current subscription
 *
 * @example
 * <RequireFeature feature="automation">
 *   <AutomationPanel />
 * </RequireFeature>
 */
export function RequireFeature({
  feature,
  children,
  fallback = null,
}: RequireFeatureProps) {
  const { useFeatureAccess } = require("@/lib/hooks/use-auth");
  const hasAccess = useFeatureAccess(feature);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface ShowWhenAuthenticatedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Show children only when user is authenticated
 */
export function ShowWhenAuthenticated({
  children,
  fallback = null,
}: ShowWhenAuthenticatedProps) {
  const { useAuth } = require("@/lib/hooks/use-auth");
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Show children only when user is NOT authenticated
 */
export function ShowWhenGuest({
  children,
  fallback = null,
}: ShowWhenAuthenticatedProps) {
  const { useAuth } = require("@/lib/hooks/use-auth");
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
