"use client"

import { useAuth } from "../AuthProvider";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
import Link from "next/link";

export const NavMenu = (props: NavigationMenuProps) => {
  const { session } = useAuth();

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="/">Home</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
        {session && (
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="#">Your Quizzes</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        )}
        {/* <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="#">How To Use</Link>
          </NavigationMenuLink>
        </NavigationMenuItem> */}
        {/* <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href="#">Contact Us</Link>
          </NavigationMenuLink>
        </NavigationMenuItem> */}
      </NavigationMenuList>
    </NavigationMenu>
  );
};