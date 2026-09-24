import { requireUser } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import { listConversation, markConversationAsRead } from "@/services/message.service";
import {
  messageListQuerySchema,
  messageParamsSchema,
} from "@/validators/message";

export async function GET(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { userId: otherUserId } = validate(messageParamsSchema, await params);
    const query = validate(
      messageListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const result = await listConversation(userId, otherUserId, query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { userId: otherUserId } = validate(messageParamsSchema, await params);
    await markConversationAsRead(userId, otherUserId);
    return ok({ marked: true });
  } catch (err) {
    return handleApiError(err);
  }
}