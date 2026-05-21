"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import empty_cart from "@/public/empty_cart.svg";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import NewPlanForm from "@/components/NewPlanForm";
import { Backpack, LockIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {useAuthContext} from "@/contexts/AuthContext";

export const CreditsDrawerWithDialog = () => {
  const {user} = useAuthContext();
  const boughtCredits = 0;
  const freeCredits = user ? 5 : 0;
  const totalCredits = freeCredits + boughtCredits;

  const dialogTriggerBtn = (
    <Button
      aria-label={`open dialog button for Credits ${totalCredits ?? 0}`}
      variant="link"
      className="text-foreground"
    >
      Credits {totalCredits}
    </Button>
  );

  return (
    <DrawerWithDialog dialogTriggerBtn={dialogTriggerBtn}>
      <CreditContent
        boughtCredits={boughtCredits}
        freeCredits={freeCredits}
        email={user?.email ?? undefined}
      />
    </DrawerWithDialog>
  );
};

export const GeneratePlanDrawerWithDialog = () => {
  const {user, loginWithGoogle} = useAuthContext();
  const boughtCredits = 0;
  const freeCredits = user ? 5 : 0;
  const totalCredits = freeCredits + boughtCredits;
  const dialogTriggerBtn = (
    <Button
      aria-label={`open dialog button for Create Travel Plan`}
      className="bg-blue-500  hover:bg-blue-600 text-white flex gap-1 justify-center items-center"
    >
      <Backpack className="h-4 w-4" />
      <span>Create Travel Plan</span>
    </Button>
  );
  return (
    <DrawerWithDialog dialogTriggerBtn={dialogTriggerBtn}>
      {({ setOpen }) => (
        <>
          {!user ? (
            <div className="flex flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Sign in to create a travel plan</DialogTitle>
              </DialogHeader>
              <Button
                onClick={loginWithGoogle}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Continue with Google
              </Button>
            </div>
          ) : totalCredits > 0 ? (
            <>
              <DialogHeader>
                <DialogTitle>Create Travel Plan</DialogTitle>
              </DialogHeader>
              <NewPlanForm closeModal={setOpen} />
            </>
          ) : (
            <CreditContent
              boughtCredits={boughtCredits}
              freeCredits={freeCredits}
              email={user?.email ?? undefined}
            />
          )}
        </>
      )}
    </DrawerWithDialog>
  );
};

const DrawerWithDialog = ({
  dialogTriggerBtn,
  children,
}: {
  dialogTriggerBtn: ReactNode;
  children:
    | React.ReactNode
    | ((props: {
        setOpen: Dispatch<SetStateAction<boolean>>;
      }) => React.ReactNode);
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const renderContent = () => {
    if (typeof children === "function") {
      return children({ setOpen });
    }
    return children;
  };

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{dialogTriggerBtn}</DialogTrigger>
          <DialogContent className="max-w-xl" aria-describedby={undefined}>
            {renderContent()}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{dialogTriggerBtn}</DrawerTrigger>
      <DrawerContent className="flex flex-col gap-10 p-5">
        {renderContent()}
      </DrawerContent>
    </Drawer>
  );
};

const CreditContent = ({
  boughtCredits,
  freeCredits,
  email,
}: {
  boughtCredits: number;
  freeCredits: number;
  email: string | undefined;
}) => {
  return (
    <div>
      {boughtCredits > 0 || freeCredits > 0 ? (
        <div className="flex gap-2 justify-between items-center p-2">
          <div className="flex flex-col gap-1 justify-center items-center p-10 rounded-lg border-2 flex-1">
            <span>Free Credits</span>
            <span className="font-bold text-7xl">{freeCredits}</span>
          </div>
          <div className="flex flex-col gap-1 justify-center items-center p-10 rounded-lg border-2 flex-1">
            <span>Bought Credits</span>
            <span className="font-bold text-7xl">{boughtCredits}</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-10 justify-center items-center">
          <h1 className="font-bold text-xl">You are out of credits!</h1>
          <Image
            alt="Empty Cart"
            src={empty_cart}
            width={300}
            height={300}
            className="bg-contain"
          />
        </div>
      )}

      <Link
        className={cn(
          buttonVariants({ variant: "default" }),
          "bg-blue-500 text-white hover:bg-blue-700",
          "flex gap-1 justify-center items-center mt-2 mb-1"
        )}
        href={`${process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_URL}${
          email ? `/?email=${email} ` : ``
        }`}
      >
        <LockIcon className="w-4 h-4" />
        <span>Purchase Credits</span>
      </Link>
      <div className="flex gap-1 justify-end">
        <svg
          width="12"
          height="12"
          viewBox="0 0 18 20"
          fill="#3b82f6"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.077 6.476l-.988 3.569 5.65-3.589-3.695 13.54 3.752.004 5.457-20L7.077 6.476z"
            fill="#3b82f6"
          ></path>
          <path
            d="M1.455 14.308L0 20h7.202L10.149 8.42l-8.694 5.887z"
            fill="#072654"
          ></path>
        </svg>
        <span className="text-[10px]">Secured by Razorpay</span>
      </div>
    </div>
  );
};

export default DrawerWithDialog;
