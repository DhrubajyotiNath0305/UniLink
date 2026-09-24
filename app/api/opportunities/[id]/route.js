import { requireUser } from "@/lib/auth";
import { fail, handleApiError, ok } from "@/lib/response";
import { validate } from "@/lib/validation";
import {
  deleteOpportunity,
  getPublicOpportunityById,
  updateOpportunity,
} from "@/services/opportunity.service";
import {
  opportunityParamsSchema,
  updateOpportunitySchema,
} from "@/validators/opportunity";

export async function GET(request, { params }) {
  try {
    await requireUser();
    const { id } = validate(opportunityParamsSchema, await params);
    const opportunity = await getPublicOpportunityById(id);
    return ok({ opportunity });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { id } = validate(opportunityParamsSchema, await params);

    let body;
    try {
      body = await request.json();
    } catch {
      return fail(400, "Invalid JSON body", "INVALID_JSON");
    }

    const data = validate(updateOpportunitySchema, body);
    const opportunity = await updateOpportunity(id, userId, data);
    return ok({ opportunity });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await requireUser();
    const { id } = validate(opportunityParamsSchema, await params);
    await deleteOpportunity(id, userId);
    return ok({ deleted: true });
  } catch (err) {
    return handleApiError(err);
  }
}