import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  // Public routes - accessible without authentication
  index("routes/welcome.tsx"), // Welcome page as the index route (/)
  route("signup", "routes/signup.tsx"),
  route("signin", "routes/signin.tsx"),
  
  // Protected routes - require authentication
  layout("layouts/protected.tsx", [
    route("/home", "routes/home.tsx"),
    route("profile", "routes/profile.tsx"),
    route("books", "routes/books.tsx"),
    route("books/:id", "routes/bookdetail.tsx"),
    route("books/:id/bookmark", "routes/bookmark.tsx"),
    route("books/:id/review", "routes/reviews/create.tsx"),
    route("books/:id/edit-review", "routes/reviews/update.tsx"),
    route("books/:id/delete-review", "routes/reviews/delete.tsx"),
    route("books/:id/read", "routes/read.tsx"),
    route(
      "books/:bookId/finish-reading-session",
      "routes/finish-reading-session.tsx",
    ),
    route("reading-goals", "routes/reading-goals.tsx"),
    route("insights", "routes/insights.tsx"),
  ]),
] satisfies RouteConfig;
