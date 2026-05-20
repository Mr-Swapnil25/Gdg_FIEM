"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { cn } from "@/lib/utils";
import Image from "next/image";
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
        className="p-0"
      >
        <Image
          src="/gemini-svg.png"
          alt="GemiTrek Logo"
          width={200}
          height={50}
          priority
          className="h-9 w-auto"
        />
      </Button>
      <aside
        ref={asideRef}
        className={cn(
          "fixed left-0 top-0 z-[100] h-full min-h-[100svh] w-[50%] border-r-2 border-neutral-200 bg-background text-foreground ease-in-out duration-700",
          open ? "left-0" : "left-[-100%]",
          "flex flex-col gap-2"
        )}
      >
        <div className="flex justify-between p-2">
          <Logo className="flex flex-none md:flex" imageClassName="h-9" />
          <Button
            aria-label="close menu"
            onClick={() => setOpen(false)}
            variant="link"
            className="text-xl text-foreground"
          >
            <AiOutlineClose />
          </Button>
        </div>
      </aside>
    </>
  );
};

export default MobileMenu;
