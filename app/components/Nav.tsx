import { NavLink } from "react-router";
import { LibraryBig, House, SquareUserRound, ChartBarIcon } from "lucide-react";
import logo from "~/assets/logo-beige.svg";

export default function NavBar() {
  return (
    <nav className="flex flex-row gap-50 items-center w-full h-auto py-2 px-20">
      <img src={logo} alt="logo" className="w-20 h-auto" />
      <div className="flex flex-row gap-10 items-center justify-center">
        <NavLink to="/home" className={({ isActive }) => 
          isActive ? "font-bold text-primary-burgundy dark:text-primary-beige" : ""
        } end>Home</NavLink>
        <NavLink to="/books" className={({ isActive }) => 
          isActive ? "font-bold text-primary-burgundy dark:text-primary-beige" : ""
        }>Books</NavLink>
        <NavLink to="/insights" className={({ isActive }) => 
          isActive ? "font-bold text-primary-burgundy dark:text-primary-beige" : ""
        }>Insights</NavLink>
        <NavLink to="/profile" className={({ isActive }) => 
          isActive ? "font-bold text-primary-burgundy dark:text-primary-beige" : ""
        }>Profile</NavLink>
      </div>
    </nav>
  );
}

export function MobileNav() {
  return (
    <nav className="fixed bg-white dark:bg-primary-dark bottom-0 left-0 flex flex-row gap-10 align-center justify-center w-full h-auto py-4 text-xs z-10">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 ${isActive ? "text-primary-burgundy dark:text-primary-beige" : "text-gray-500 dark:text-primary-beige-70"}`
        }
        end
      >
        {({ isActive }) => (
          <>
            <House size={20} strokeWidth={isActive ? 2 : 1.5} />
            HOME
          </>
        )}
      </NavLink>
      <NavLink
        to="/books"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 ${isActive ? "text-primary-burgundy dark:text-primary-beige" : "text-gray-500 dark:text-primary-beige-70"}`
        }
      >
        {({ isActive }) => (
          <>
            <LibraryBig size={20} strokeWidth={isActive ? 2 : 1.5} />
            BOOKS
          </>
        )}
      </NavLink>
      <NavLink
        to="/insights"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 ${isActive ? "text-primary-burgundy dark:text-primary-beige" : "text-gray-500 dark:text-primary-beige-70"}`
        }
      >
        {({ isActive }) => (
          <>
            <ChartBarIcon size={20} strokeWidth={isActive ? 2 : 1.5} />
            INSIGHTS
          </>
        )}
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 ${isActive ? "text-primary-burgundy dark:text-primary-beige" : "text-gray-500 dark:text-primary-beige-70"}`
        }
      >
        {({ isActive }) => (
          <>
            <SquareUserRound size={20} strokeWidth={isActive ? 2 : 1.5} />
            PROFILE
          </>
        )}
      </NavLink>
    </nav>
  );
}
