import { requireUser } from "@/lib/auth";
import { fail, handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import { createComment, listComments } from "@/services/post.service";
import {
  commentListQuerySchema,
  createCommentSchema,
  postParamsSchema,
} from "@/validators/post";

export async function GET(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { id } = validate(postParamsSchema, await params);
    const query = validate(
      commentListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const result = await listComments(id, query);
    return ok(result);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { id } = validate(postParamsSchema, await params);

    let body;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body", "INVALID_JSON");
    }

    const { content } = validate(createCommentSchema, body);
    const comment = await createComment(id, userId, content);
    return ok({ comment }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}