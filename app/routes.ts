import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("layouts/protected.tsx", [
    route("", "routes/home.tsx"),
    route("profile", "routes/profile.tsx"),
    route("books", "routes/books.tsx"),
    route("books/:id", "routes/bookdetail.tsx"),
    route("books/:id/bookmark", "routes/bookmark.tsx"),
    route("books/:id/review", "routes/review.tsx"),
    route("books/:id/read", "routes/read.tsx"),
    route(
      "books/:bookId/finish-reading-session",
      "routes/finish-reading-session.tsx",
    ),
    route("reading-goals", "routes/reading-goals.tsx"),
  ]),
  route("signup", "routes/signup.tsx"),
  route("signin", "routes/signin.tsx"),
] satisfies RouteConfig;
