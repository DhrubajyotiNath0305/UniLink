import { requireUser } from "@/lib/auth";
import { fail, handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import { createStory, listStories } from "@/services/story.service";
import {
  createStorySchema,
  storyListQuerySchema,
} from "@/validators/story";

export async function GET(request) {
  try {
    await requireUser();
    const query = validate(
      storyListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const result = await listStories(query);
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

    const { image } = validate(createStorySchema, body);
    const story = await createStory(userId, image);
    return ok({ story }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}