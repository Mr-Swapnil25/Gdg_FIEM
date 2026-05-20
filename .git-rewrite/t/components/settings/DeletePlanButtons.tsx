"use client";

import {Loading} from "@/components/shared/Loading";
import {AlertDialogAction, AlertDialogCancel} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import {deleteTripFromFirestore} from "@/lib/firebase/firestore-db";
import {useRouter} from "next/navigation";
import {useState} from "react";

export default function DeletePlanButtons({planId}: {planId: string}) {
  const router = useRouter();
  const {toast} = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const hanleDeletePlan = async () => {
    try {
      setIsDeleting(true);
      const {id, dismiss} = toast({
        title: "Deleting Plan",
        description: "You plan is being deleted. Please wait...",
      });
      await deleteTripFromFirestore(planId);
      dismiss();

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      toast({
        title: "Not Allowed",
        variant: "destructive",
        description: "Unable to delete this plan.",
      });
    }
  };

  return (
    <>
      <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
      <AlertDialogAction asChild className="destructive">
        <Button
          variant="destructive"
          className="bg-red-500 text-white hover:text-white hover:bg-red-700
                    flex gap-2 justify-center items-center"
          disabled={isDeleting}
          onClick={hanleDeletePlan}
        >
          {isDeleting && <Loading className="h-4 w-4 text-white" />}
          <span>{isDeleting ? "Deleting..." : "Delete"}</span>
        </Button>
      </AlertDialogAction>
    </>
  );
}
