import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./navigation-sheet";
import Link from "next/link";
import { SunIcon } from "lucide-react";

const Navbar = () => {
  return (
      <nav className="h-16 border-b sticky z-50 top-0 bg-white">
        <div className="h-full flex items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Logo />
            {/* Desktop Menu */}
            <NavMenu className="hidden md:block" />
          </div>

          <div className="flex items-center gap-3">
            <Link href={"/auth"}>
              <Button variant="default" className="hidden sm:inline-flex">
                Login / Sign up
              </Button>
            </Link>
            
            <Button size="icon" variant="outline">
              <SunIcon />
            </Button>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <NavigationSheet />
            </div>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;
