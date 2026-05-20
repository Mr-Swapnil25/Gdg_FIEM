"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  fetchPendingInvites,
  revokeInviteFromFirestore,
} from "@/lib/firebase/firestore-db";
import {InviteDoc} from "@/lib/types/firestore";
import { getDisplayName } from "@/lib/utils";
import { useEffect, useState, useTransition } from "react";

const PendingInvites = ({ planId }: { planId: string }) => {
  const [invites, setInvites] = useState<InviteDoc[]>([]);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchPendingInvites(planId).then(setInvites).catch(() => setInvites([]));
  }, [planId]);

  if (!invites || invites.length == 0) return null;

  const revokeEmailInvite = async (id: string, email: string) => {
    try {
      startTransition(async () => {
        await revokeInviteFromFirestore(planId, id);
        setInvites((items) => items.filter((invite) => invite._id !== id));
      });
      toast({
        variant: "default",
        description: `Invite to ${email} has been revoked.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Unable to revoke invite.",
      });
    }
  };

  return (
    <div className="mt-5">
      <div className="mb-2 font-bold text-sm">Pending Invites</div>
      <div className="flex flex-col gap-3 max-w-lg">
        {invites.map((invite) => (
          <div
            key={invite._id}
            className="px-5 py-2 
                        border border-solid border-border 
                        shadow-sm rounded-md
                        flex gap-5 justify-between items-center"
          >
            <span className="text-sm text-muted-foreground">
              {getDisplayName(
                invite.firstName,
                invite?.lastName,
                invite?.email
              )}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => revokeEmailInvite(invite._id, invite.email)}
              disabled={isPending}
            >
              Revoke
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingInvites;
