import { IUser } from "../api/interfaces/models";

/**
 * Check if a user has admin privileges
 * @param user User object to check
 * @returns Boolean indicating if the user is an admin
 */
export const isAdmin = (user: IUser | any): boolean => {
  if (!user) return false;
  return user.role === "admin";
};

/**
 * Check if a user has manager privileges
 */
export const isManager = (user: IUser | any): boolean => {
  if (!user) return false;
  return user.role === "manager";
};

/**
 * Check if a user has admin or manager privileges
 */
export const isAdminOrManager = (user: IUser | any): boolean => {
  if (!user) return false;
  return user.role === "admin" || user.role === "manager";
};

/**
 * Check if the current user can access or modify the target user
 * @param currentUser The user making the request
 * @param targetUserId The ID of the user being accessed/modified
 * @returns Boolean indicating if access is allowed
 */
export const canAccessUser = (
  currentUser: IUser | any,
  targetUserId: string
): boolean => {
  if (!currentUser) return false;
  if (isAdmin(currentUser)) return true;
  return currentUser._id === targetUserId;
};
