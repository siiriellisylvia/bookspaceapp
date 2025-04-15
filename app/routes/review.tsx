import { getAuthUser } from "~/services/auth.server";
import Review from "~/models/Review";
import type { Route } from "../+types/root";

export async function action({ request }: Route.ActionArgs) {
  // This route no longer handles createReview, updateReview, or deleteReview
  // Those have been moved to dedicated routes
  
  // Get the full user object instead of just the ID
  const currentUser = await getAuthUser(request);
  if (!currentUser) {
    throw new Response("Unauthorized", { status: 401 });
  }

  // Handle unknown action type
  return Response.json(
    { success: false, error: "Invalid action" },
    { status: 400 }
  );
}

// This route doesn't need to render anything as it's only an API endpoint
export default function ReviewRoute() {
  return null;
}
