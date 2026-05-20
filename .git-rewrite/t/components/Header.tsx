"use client";

import Link from "next/link";

import MobileMenu from "@/components/MobileMenu";
import PlanComboBox from "@/components/plan/PlanComboBox";
import { navlinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import useAuth from "@/hooks/useAuth";
import { ThemeDropdown } from "@/components/ThemeDropdown";
import FeedbackSheet from "@/components/common/FeedbackSheet";
import { CreditsDrawerWithDialog } from "@/components/shared/DrawerWithDialogGeneric";
import Logo from "@/components/common/Logo";
import AuthControls from "@/components/common/AuthControls";

const Header = () => {
  const { isCurrentPathDashboard, isCurrentPathHome, isAuthenticated } =
    useAuth();

  return (
    <header
      className={cn(
        "w-full border-b bottom-2 z-50 sticky top-0",
        "bg-white text-black shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/95",
        isCurrentPathHome && "sticky top-0"
      )}
    >
      <nav className="lg:px-20 px-5 py-3 mx-auto">
        <div className="flex justify-evenly w-full">
          <Logo />
          <div className="hidden md:flex items-center flex-1 justify-center">
            <ul className="flex gap-8 items-center text-sm">
              {isCurrentPathHome && (
                <>
                  {navlinks.map((link) => (
                    <li
                      key={link.id}
                      className="hover:underline cursor-pointer"
                    >
                      <Link href={`/#${link.id}`}>{link.text}</Link>
                    </li>
                  ))}
                  <li className="hover:underline cursor-pointer">
                    <Link href="dashboard" scroll>
                      Dashboard
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          <div className="md:hidden flex gap-6 flex-1">
            <MobileMenu
              isCurrentPathHome={isCurrentPathHome}
              isCurrentPathDashboard={isCurrentPathDashboard}
              isAuthenticated={isAuthenticated}
            />
          </div>
          <div className="flex gap-4 justify-end items-center flex-1">
            {!isAuthenticated ? (
              <>
                <ThemeDropdown />
                <AuthControls />
              </>
            ) : (
              <div className="flex justify-center items-center gap-2">
                {!isCurrentPathDashboard && !isCurrentPathHome && (
                  <PlanComboBox />
                )}
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
