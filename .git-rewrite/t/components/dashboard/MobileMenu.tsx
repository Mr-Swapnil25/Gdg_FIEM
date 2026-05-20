"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/common/Logo";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (asideRef.current && !asideRef.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <Button
        aria-label="open side menu"
        onClick={() => setOpen(!open)}
        variant="link"
        className="text-xl text-white"
      >
        <AiOutlineMenu />
      </Button>
      <aside
        ref={asideRef}
        className={cn(
          "fixed top-0 left-0 z-[100] bg-slate-900 text-white w-[50%] border-r-2 border-slate-800 h-full ease-in-out duration-700",
          open ? "left-0" : "left-[-100%]",
          "flex flex-col gap-2 min-h-[100svh]"
        )}
      >
        <div className="flex justify-between p-2">
          <Logo className="flex md:flex flex-none" imageClassName="h-9" />
          <Button
            aria-label="close menu"
            onClick={() => setOpen(false)}
            variant="link"
            className="text-xl text-white"
          >
            <AiOutlineClose />
          </Button>
        </div>
        <ul
          className="w-full flex flex-col gap-7 justify-center items-start
                      p-5  text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <li className="cursor-pointer hover:underline">
            <Link
              href="/community-plans"
              className="flex gap-1 justify-end items-center group"
            >
              <span>Community Plans</span>
            </Link>
          </li>
        </ul>
      </aside>
    </>
  );
};

export default MobileMenu;
