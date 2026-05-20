"use client";

import { cn } from "@/lib/utils";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import FeedbackSheet from "@/components/common/FeedbackSheet";
import Logo from "@/components/common/Logo";
import { CreditsDrawerWithDialog } from "@/components/shared/DrawerWithDialogGeneric";
import Link from "next/link";
import MobileMenu from "@/app/community-plans/MobileMenu";
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
          <ul className="hidden md:flex gap-6 items-center text-sm">
            <li className="hover:underline hover:underline-offset-4 cursor-pointer">
              <Link href="/">Home</Link>
            </li>
            {user && (
              <li className="hover:underline hover:underline-offset-4 cursor-pointer">
                <Link href="/dashboard">Dashboard</Link>
              </li>
            )}
          </ul>
          <div className="flex gap-2 justify-end items-center flex-1">
            {!user ? (
              <>
                <ThemeDropdown />
                <AuthControls />
              </>
            ) : (
              <div className="flex justify-center items-center gap-2">
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
