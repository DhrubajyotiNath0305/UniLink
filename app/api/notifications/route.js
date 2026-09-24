import { requireUser } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import { clearNotifications, listNotifications } from "@/services/notification.service";
import { notificationListQuerySchema } from "@/validators/notification";

export async function GET(request) {
  try {
    const { userId } = await requireUser();
    const query = validate(
      notificationListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const result = await listNotifications(userId, query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE() {
  try {
    const { userId } = await requireUser();
    await clearNotifications(userId);
    return ok({ cleared: true });
  } catch (err) {
    return handleApiError(err);
  }
}