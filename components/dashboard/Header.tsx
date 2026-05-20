"use client";

import { cn } from "@/lib/utils";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import FeedbackSheet from "@/components/common/FeedbackSheet";
import Logo from "@/components/common/Logo";
import MobileMenu from "@/components/dashboard/MobileMenu";
import { CreditsDrawerWithDialog } from "@/components/shared/DrawerWithDialogGeneric";
import Link from "next/link";
import AuthControls from "@/components/common/AuthControls";
import {useAuthContext} from "@/contexts/AuthContext";

const Header = () => {
  const {user} = useAuthContext();

  return (
    <header
      className={cn(
        "w-full border-b bottom-2 z-50 sticky top-0",
        "bg-white text-black shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/95"
      )}
    >
      <nav className="lg:px-20 px-5 py-3 mx-auto">
        <div className="flex justify-evenly w-full">
          <Logo />
          <div className="md:hidden flex gap-6 flex-1">
            <MobileMenu />
          </div>
          <div className="flex gap-4 justify-end items-center flex-1">
            {!user ? (
              <>
                <ThemeDropdown />
                <AuthControls />
              </>
            ) : (
              <div className="flex justify-center items-center gap-2">
                <Link
                  href="community-plans"
                  className="whitespace-nowrap hidden md:block hover:underline cursor-pointer hover:underline-offset-4 text-black/80 text-sm"
                  scroll
                >
                  Community Plans
                </Link>

                <CreditsDrawerWithDialog />
                <FeedbackSheet />
              <ThemeDropdown />
                <AuthControls />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
