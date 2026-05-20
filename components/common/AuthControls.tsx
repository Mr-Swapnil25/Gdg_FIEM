"use client";

import {LogOut} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useAuthContext} from "@/contexts/AuthContext";
import {Loading} from "@/components/shared/Loading";

export default function AuthControls() {
  const {user, loading, loginWithGoogle, logout} = useAuthContext();

  if (loading) {
    return <Loading className="h-5 w-5" />;
  }

  if (!user) {
    return (
      <Button
        size="default"
        variant="ghost"
        onClick={loginWithGoogle}
        className="h-9 rounded-md border border-current/20 px-4 text-sm font-medium hover:bg-white/10"
      >
        Sign in
      </Button>
    );
  }

  const displayName = user.displayName?.trim() || user.email || user.uid;
  const initial = (displayName[0] ?? "U").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 w-9 rounded-full border border-current/20 p-0"
          aria-label="Open profile menu"
        >
          <span className="text-sm font-semibold">{initial}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
