import { NavLink } from "react-router";

export default function NavBar() {
  return (
    <nav className=" flex flex-row gap-10 align-center justify-center w-full h-auto py-4">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/books">Books</NavLink>
      <NavLink to="/profile">Profile</NavLink>
    </nav>
  );
}
