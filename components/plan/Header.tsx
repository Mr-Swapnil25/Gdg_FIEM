"use client";

import PlanComboBox from "@/components/plan/PlanComboBox";
import { cn } from "@/lib/utils";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import FeedbackSheet from "@/components/common/FeedbackSheet";
import Logo from "@/components/common/Logo";
import MobileMenu from "@/components/plan/MobileMenu";
import { CreditsDrawerWithDialog } from "@/components/shared/DrawerWithDialogGeneric";
import Link from "next/link";
import AuthControls from "@/components/common/AuthControls";
import {useAuthContext} from "@/contexts/AuthContext";

const Header = ({ isPublic }: { isPublic: boolean }) => {
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
          <div className="flex gap-8 justify-center items-center">
            <Logo />
            <ul className="gap-4 text-sm hidden lg:flex items-center justify-center">
              {user && (
                <li
                  className="hover:underline hover:underline-offset-4 transition-all duration-300 cursor-pointer 
          text-foreground"
                >
                  <Link
                    href="/dashboard"
                    className="hidden md:block hover:underline cursor-pointer hover:underline-offset-4 text-black/80 text-sm"
                    scroll
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              <li
                className="hover:underline hover:underline-offset-4 transition-all duration-300 cursor-pointer 
          text-foreground"
              >
                <Link
                  href="/community-plans"
                  className="hidden md:block hover:underline cursor-pointer hover:underline-offset-4 text-black/80 text-sm"
                  scroll
                >
                  Community Plans
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:hidden flex gap-6 flex-1">
            <MobileMenu isPublic={isPublic} />
          </div>

          <div className="flex gap-4 justify-end items-center flex-1">
            {!user ? (
              <>
                <ThemeDropdown />
                <AuthControls />
              </>
            ) : (
              <div className="flex justify-center items-center gap-2">
                <PlanComboBox />

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
