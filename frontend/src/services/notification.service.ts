import api from "./api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "WARNING" | "INFO" | "ERROR";
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await api.get("/notifications");
  return response.data;
};

export const getUnreadNotificationsCount = async (): Promise<{ unreadCount: number }> => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

export const markAsRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};
