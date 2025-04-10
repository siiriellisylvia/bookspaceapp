import { NavLink } from "react-router";
import { LibraryBig, House, SquareUserRound } from "lucide-react";
import logo from "~/assets/logo-beige.svg";

export default function NavBar() {
  return (
    <nav className="flex flex-row gap-50 items-center w-full h-auto py-2 px-20">
      <img src={logo} alt="logo" className="w-20 h-auto" />
      <div className="flex flex-row gap-10 items-center justify-center">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/books">Books</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </div>
    </nav>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed bg-primary-dark bottom-0 left-0 flex flex-row gap-10 align-center justify-center w-full h-auto py-4 text-xs z-10">
      <NavLink
        to="/"
        className="flex flex-col items-center justify-center gap-1"
      >
        <House size={20} strokeWidth={1.5} />
        HOME
      </NavLink>
      <NavLink
        to="/books"
        className="flex flex-col items-center justify-center gap-1"
      >
        <LibraryBig size={20} strokeWidth={1.5} />
        BOOKS
      </NavLink>
      <NavLink
        to="/profile"
        className="flex flex-col items-center justify-center gap-1"
      >
        <SquareUserRound size={20} strokeWidth={1.5} />
        PROFILE
      </NavLink>
    </nav>
  );
}
