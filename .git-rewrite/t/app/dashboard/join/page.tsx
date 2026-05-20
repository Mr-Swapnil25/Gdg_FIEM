"use client";

import Image from "next/image";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, Suspense} from "react";

import {useToast} from "@/components/ui/use-toast";
import {useAuthContext} from "@/contexts/AuthContext";
import joinNow from "@/public/join-now.svg";

const JoinPageContent = () => {
  const {user, loading, loginWithGoogle} = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const {toast} = useToast();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      loginWithGoogle();
      return;
    }

    if (!token) {
      router.push("/dashboard");
      return;
    }

    toast({
      title: "Invite received",
      description: "Firebase invite redemption is now stored in Firestore. Ask the owner to share the plan link directly.",
    });
    router.push("/dashboard");
  }, [loading, loginWithGoogle, router, toast, token, user]);

  return (
    <div className="w-full h-full flex flex-1 justify-center items-center">
      <div className="flex flex-col justify-center items-center gap-5 bg-muted rounded-full p-10 shadow-">
        <Image
          alt="Joining the plan image"
          src={joinNow}
          width={300}
          height={300}
          className="bg-contain"
        />
        <h2 className="text-foreground animate-pulse font-bold text-lg">
          Joining the Plan...
        </h2>
      </div>
    </div>
  );
};

const Join = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JoinPageContent />
    </Suspense>
  );
};

export default Join;
