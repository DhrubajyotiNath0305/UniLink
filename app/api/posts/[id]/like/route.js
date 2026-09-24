import { requireUser } from "@/lib/auth";
import { fail, handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import { togglePostLike } from "@/services/post.service";
import { postParamsSchema } from "@/validators/post";

export async function POST(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { id } = validate(postParamsSchema, await params);
    const result = await togglePostLike(id, userId);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}