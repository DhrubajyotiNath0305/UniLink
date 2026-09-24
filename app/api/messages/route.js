import { requireUser } from "@/lib/auth";
import { fail, handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import { listConversations, sendMessage } from "@/services/message.service";
import {
  messageListQuerySchema,
  sendMessageSchema,
} from "@/validators/message";

export async function GET(request) {
  try {
    const { userId } = await requireUser();
    const query = validate(
      messageListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const result = await listConversations(userId, query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request) {
  try {
    const { userId } = await requireUser();

    let body;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body", "INVALID_JSON");
    }

    const data = validate(sendMessageSchema, body);
    const message = await sendMessage({
      senderId: userId,
      receiverId: data.userId,
      text: data.text,
    });
    return ok({ message }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}