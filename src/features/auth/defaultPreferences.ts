import type { UserPreferences } from "@/types/domain";

export const defaultUserPreferences: UserPreferences = {
  emailNotifications: true,
  joinRequestNotifications: true,
  roomActivityNotifications: true,
  showEmailToRoomMembers: false,
  wishlistUpdateNotifications: true,
};
