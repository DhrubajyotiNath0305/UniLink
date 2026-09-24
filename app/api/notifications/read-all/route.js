import { requireUser } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/response";
import { markAllNotificationsAsRead } from "@/services/notification.service";

export async function POST() {
  try {
    const { userId } = await requireUser();
    await markAllNotificationsAsRead(userId);
    return ok({ marked: true });
  } catch (err) {
    return handleApiError(err);
  }
}