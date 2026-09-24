import { requireUser } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import { deleteNotification, markNotificationAsRead } from "@/services/notification.service";
import { notificationParamsSchema } from "@/validators/notification";

export async function PATCH(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { id } = validate(notificationParamsSchema, await params);
    const notification = await markNotificationAsRead(userId, id);
    return ok({ notification });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { id } = validate(notificationParamsSchema, await params);
    await deleteNotification(userId, id);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}