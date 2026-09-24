import { requireUser } from "@/lib/auth";
import { fail, handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import { createOpportunity, listOpportunities } from "@/services/opportunity.service";
import {
  createOpportunitySchema,
  opportunityListQuerySchema,
} from "@/validators/opportunity";

export async function GET(request) {
  try {
    await requireUser();
    const query = validate(
      opportunityListQuerySchema,
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    const result = await listOpportunities(query);
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

    const data = validate(createOpportunitySchema, body);
    const opportunity = await createOpportunity(userId, data);
    return ok({ opportunity }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}