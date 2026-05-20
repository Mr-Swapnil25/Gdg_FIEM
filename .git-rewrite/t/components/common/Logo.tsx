"use client";

import Image from "next/image";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {useAuthContext} from "@/contexts/AuthContext";

type LogoProps = {
  className?: string;
  imageClassName?: string;
};

export default function Logo({className, imageClassName}: LogoProps) {
  const {user} = useAuthContext();

  return (
    <div
      className={cn(
        "hidden md:flex gap-10 items-center justify-start flex-1",
        className
      )}
    >
      <Link href={user ? "/dashboard" : "/"} aria-label="GemiTrek home">
        <Image
          src="/gemini-svg.png"
          alt="GemiTrek Logo"
          width={200}
          height={50}
          priority
          className={cn("h-10 w-auto", imageClassName)}
        />
      </Link>
    </div>
  );
}
