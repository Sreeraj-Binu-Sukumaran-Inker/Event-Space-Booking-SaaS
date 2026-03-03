import { Request, Response, NextFunction } from "express";
import * as NotificationService from "../services/notification.service";
import { AppError } from "../utils/AppError";

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const notifications = await NotificationService.getNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const count = await NotificationService.getUnreadNotificationsCount(userId);
    res.status(200).json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { id } = req.params;
    if (typeof id !== "string") throw new AppError("Invalid ID", 400);
    await NotificationService.markAsRead(id, userId);

    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    await NotificationService.markAllAsRead(userId);

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};
