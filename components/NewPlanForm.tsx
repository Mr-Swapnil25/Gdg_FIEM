"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, MessageSquarePlus, Wand2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { generatePlanAction } from "@/lib/actions/generateplanAction";
import PlacesAutoComplete from "@/components/PlacesAutoComplete";

import { generateEmptyPlanAction } from "@/lib/actions/generateEmptyPlanAction";
import { useToast } from "@/components/ui/use-toast";
import CompanionControl from "@/components/plan/CompanionControl";
import ActivityPreferences from "@/components/plan/ActivityPreferences";
import DateRangeSelector from "@/components/common/DateRangeSelector";
import {useAuthContext} from "@/contexts/AuthContext";
import {useGoogleMapsApi} from "@/contexts/MapProvider";

const formSchema = z.object({
  placeName: z
    .string({ required_error: "Please select a place" })
    .min(3, "Place name should be at least 3 character long"),
  datesOfTravel: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data) => data.to >= data.from, {
      message: "End date cannot be before start date",
      path: ["to"], // Associates the error with the 'to' field
    }),
  activityPreferences: z.array(z.string()),
  companion: z.optional(z.string()),
});

export type formSchemaType = z.infer<typeof formSchema>;

const NewPlanForm = ({
  closeModal,
}: {
  closeModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const { user } = useAuthContext();
  const userId = user?.uid ?? "";
  const googleMapsApi = useGoogleMapsApi();
  const isGoogleMapsLoaded = googleMapsApi?.isLoaded ?? false;

  const [isLoadingEmptyPlan, setIsLoadingEmptyPlan] = useState(false);
  const [isLoadingAIPlan, setIsLoadingAIPlan] = useState(false);

  const [selectedFromList, setSelectedFromList] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<formSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activityPreferences: [],
      companion: undefined,
      placeName: "",
      datesOfTravel: {
        from: undefined,
        to: undefined,
      },
    },
  });

  if (!userId) return null;

  async function onSubmitEmptyPlan(values: z.infer<typeof formSchema>) {
    if (typeof window === "undefined" || !window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded yet. Please wait.");
      toast({
        title: "Maps loading",
        description: "Google Maps API is not loaded yet. Please wait.",
        variant: "destructive",
      });
      setIsLoadingEmptyPlan(false);
      return;
    }

    if (!selectedFromList) {
      form.setError("placeName", {
        message: "Place should be selected from the list",
        type: "custom",
      });
      return;
    }

    setIsLoadingEmptyPlan(true);
    try {
      const planId = await generateEmptyPlanAction(values, userId);
      closeModal(false);
      if (planId) {
        router.push(`/plans/${planId}/plan?isNewPlan=true`);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate empty plan.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in onSubmitEmptyPlan:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmptyPlan(false);
    }
  }

  async function onSubmitAIPlan(values: z.infer<typeof formSchema>) {
    if (typeof window === "undefined" || !window.google || !window.google.maps) {
      console.error("Google Maps API is not loaded yet. Please wait.");
      toast({
        title: "Maps loading",
        description: "Google Maps API is not loaded yet. Please wait.",
        variant: "destructive",
      });
      setIsLoadingAIPlan(false);
      return;
    }

    if (!selectedFromList) {
      form.setError("placeName", {
        message: "Place should be selected from the list",
        type: "custom",
      });
      return;
    }

    setIsLoadingAIPlan(true);
    try {
      const planId = await generatePlanAction(values, userId);
      closeModal(false);
      if (planId) {
        router.push(`/plans/${planId}/plan?isNewPlan=true`);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate AI travel plan. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in onSubmitAIPlan:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating your plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAIPlan(false);
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="placeName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search for your destination city</FormLabel>
              <FormControl>
                {isGoogleMapsLoaded ? (
                  <PlacesAutoComplete
                    field={field}
                    form={form}
                    selectedFromList={selectedFromList}
                    setSelectedFromList={setSelectedFromList}
                  />
                ) : (
                  <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    Loading Google Maps search...
                  </div>
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="datesOfTravel"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select Dates</FormLabel>
              <DateRangeSelector
                value={field.value}
                onChange={field.onChange}
                forGeneratePlan={true}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="activityPreferences"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Select the kind of activities you want to do
                <span className="font-medium ml-1">(Optional)</span>
              </FormLabel>
              <FormControl>
                <ActivityPreferences
                  values={field.value}
                  onChange={(e) => field.onChange(e)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Who are you travelling with
                <span className="font-medium ml-1">(Optional)</span>
              </FormLabel>
              <FormControl>
                <CompanionControl
                  value={field.value}
                  onChange={(id: string) => field.onChange(id)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-between gap-1">
          <Button
            onClick={() => form.handleSubmit(onSubmitEmptyPlan)()}
            aria-label="generate plan"
            type="submit"
            disabled={
              isLoadingEmptyPlan || isLoadingAIPlan || !form.formState.isValid
            }
            className="bg-blue-500 text-white hover:bg-blue-600 w-full"
          >
            {isLoadingEmptyPlan ? (
              <div className="flex gap-1 justify-center items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Generating Travel Plan...</span>
              </div>
            ) : (
              <div className="flex gap-1 justify-center items-center">
                <MessageSquarePlus className="h-4 w-4" />
                <span>Create Your Plan</span>
              </div>
            )}
          </Button>

          <Button
            onClick={() => form.handleSubmit(onSubmitAIPlan)()}
            aria-label="generate AI plan"
            type="submit"
            disabled={
              isLoadingAIPlan || isLoadingEmptyPlan || !form.formState.isValid
            }
            className="bg-indigo-500 text-white hover:bg-indigo-600 w-full group"
          >
            {isLoadingAIPlan ? (
              <div className="flex gap-1 justify-center items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Generating AI Travel Plan...</span>
              </div>
            ) : (
              <div className="flex gap-1 justify-center items-center ">
                <Wand2 className="h-4 w-4 group-hover:animate-pulse" />
                <span>Generate AI Plan</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewPlanForm;
