"use client";

import { Loading } from "@/components/shared/Loading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/components/ui/use-toast";
import { ShieldX } from "lucide-react";
import {useAuthContext} from "@/contexts/AuthContext";
import {saveInviteToFirestore} from "@/lib/firebase/firestore-db";

const formSchema = z.object({
  email: z.string().min(2).max(50),
});

const InviteForm = ({ planId }: { planId: string }) => {
  const [sendingInvite, setSendingInvite] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const { toast } = useToast();
  const { user } = useAuthContext();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setSendingInvite(true);
    const email = user?.email;

    if (email && email === values.email) {
      toast({
        variant: "destructive",
        description: (
          <div className="font-sans flex justify-start items-center gap-1">
            <ShieldX className="h-5 w-5 text-white" />
            You can not invite yourself to join this Plan
          </div>
        ),
      });
      form.reset();
      setSendingInvite(false);
      return;
    }

    if (!planId || planId.length == 0) {
      setSendingInvite(false);
      return;
    }

    try {
      await saveInviteToFirestore(planId, values.email);
      toast({
        description: (
          <div className="font-sans flex justify-start items-center gap-1">
            Email Invite sent successfully!
          </div>
        ),
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Unable to save this invite.",
        variant: "destructive",
      });
    }
    form.reset();
    setSendingInvite(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 pt-5 max-w-xl"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">Email</FormLabel>
              <FormControl>
                <Input
                  disabled={sendingInvite}
                  type="email"
                  placeholder="your-co-worker@example.com"
                  {...field}
                  onChange={field.onChange}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={sendingInvite}
          className={cn(
            "text-white hover:text-white bg-blue-500 hover:bg-blue-700"
          )}
        >
          {sendingInvite ? (
            <div className="flex justify-center items-center gap-2">
              <Loading className="w-4 h-4" /> Sending Invite...
            </div>
          ) : (
            "Invite"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default InviteForm;
