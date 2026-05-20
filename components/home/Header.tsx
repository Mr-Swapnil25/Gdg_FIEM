"use client";

import { cn } from "@/lib/utils";
import Logo from "@/components/common/Logo";
import MobileMenu from "@/components/home/MobileMenu";
import Link from "next/link";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";

const Header = () => {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40",
        "bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
    >
      <nav className="mx-auto px-5 py-3 lg:px-20">
        <div className="flex w-full justify-evenly">
          <Logo />
          <div className="flex flex-1 gap-6 md:hidden">
            <MobileMenu />
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <Link href="/dashboard" className="hidden md:block">
              <InteractiveHoverButton className="border-2 border-gray-200 shadow-sm">
                GemiTrek
              </InteractiveHoverButton>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
