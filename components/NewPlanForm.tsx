"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Loader2, MessageSquarePlus, Wand2} from "lucide-react";
import {useRouter} from "next/navigation";
import {Dispatch, SetStateAction, useState} from "react";
import {useForm} from "react-hook-form";
import * as z from "zod";

import PlacesAutoComplete from "@/components/PlacesAutoComplete";
import DateRangeSelector from "@/components/common/DateRangeSelector";
import ActivityPreferences from "@/components/plan/ActivityPreferences";
import CompanionControl from "@/components/plan/CompanionControl";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {useToast} from "@/components/ui/use-toast";
import {useAuthContext} from "@/contexts/AuthContext";
import {useGoogleMapsApi} from "@/contexts/MapProvider";
import {
  generatePlanAction,
  type GeneratePlanActionResult,
} from "@/lib/actions/generateplanAction";
import {generateEmptyPlanAction} from "@/lib/actions/generateEmptyPlanAction";

const formSchema = z.object({
  placeName: z
    .string({required_error: "Please select a place"})
    .min(3, "Place name should be at least 3 character long"),
  datesOfTravel: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .refine((data) => data.to >= data.from, {
      message: "End date cannot be before start date",
      path: ["to"],
    }),
  activityPreferences: z.array(z.string()),
  companion: z.optional(z.string()),
});

export type formSchemaType = z.infer<typeof formSchema>;

const NewPlanForm = ({closeModal}: {closeModal: Dispatch<SetStateAction<boolean>>}) => {
  const {user} = useAuthContext();
  const userId = user?.uid ?? "";
  const googleMapsApi = useGoogleMapsApi();
  const router = useRouter();
  const {toast} = useToast();

  const [isLoadingEmptyPlan, setIsLoadingEmptyPlan] = useState(false);
  const [isLoadingAIPlan, setIsLoadingAIPlan] = useState(false);
  const [selectedFromList, setSelectedFromList] = useState(false);

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

  const shouldRequireAutocompleteSelection = Boolean(
    googleMapsApi?.isLoaded &&
      !googleMapsApi?.isKeyMissing &&
      !googleMapsApi?.loadError &&
      !googleMapsApi?.isTimedOut
  );

  function validatePlaceSelection() {
    if (!shouldRequireAutocompleteSelection || selectedFromList) return true;

    form.setError("placeName", {
      message: "Place should be selected from the list",
      type: "custom",
    });
    return false;
  }

  function resolvePlanError(result: Extract<GeneratePlanActionResult, {ok: false}>) {
    switch (result.errorCode) {
      case "MISSING_GEMINI_API_KEY":
        return "Missing NEXT_PUBLIC_GEMINI_API_KEY.";
      case "GEMINI_TIMEOUT":
        return "Gemini request timed out after 30 seconds.";
      case "PARSE_ERROR":
        return "AI returned unexpected format. Please retry.";
      case "GEMINI_INVALID_RESPONSE":
        return "Gemini returned malformed itinerary data.";
      case "GEMINI_REQUEST_FAILED":
        return "Gemini request failed.";
      case "PLAN_SAVE_FAILED":
        return "Generated plan could not be saved to Firebase.";
      default:
        return result.errorMessage;
    }
  }

  async function onSubmitEmptyPlan(values: formSchemaType) {
    if (!validatePlaceSelection()) {
      return;
    }

    setIsLoadingEmptyPlan(true);
    try {
      console.log("[1] Starting generation flow... Generating empty plan...");
      const planId = await generateEmptyPlanAction(values, userId);
      if (!planId) {
        toast({
          title: "Error",
          description: "Failed to generate empty plan.",
          variant: "destructive",
        });
        return;
      }

      console.log("[2] API responded successfully! Empty plan generated.");
      closeModal(false);
      console.log("[3] UI state updated.");
      router.push(`/plans/${planId}/plan?isNewPlan=true`);
    } catch (error: any) {
      console.error("CRITICAL FETCH ERROR:", error?.message, error?.stack);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating your plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEmptyPlan(false);
    }
  }

  async function onSubmitAIPlan(values: formSchemaType) {
    if (!validatePlaceSelection()) {
      return;
    }

    setIsLoadingAIPlan(true);
    try {
      console.log("[1] Starting generation flow... Generating AI plan...");
      const result = await generatePlanAction(values, userId);
      if (!result.ok) {
        toast({
          title: "Failed to generate AI travel plan",
          description: resolvePlanError(result),
          variant: "destructive",
        });
        return;
      }

      console.log("[2] API responded successfully! AI plan generated.");
      closeModal(false);
      console.log("[3] UI state updated.");
      router.push(`/plans/${result.planId}/plan?isNewPlan=true`);
    } catch (error: any) {
      console.error("CRITICAL FETCH ERROR:", error?.message, error?.stack);
      toast({
        title: "Error",
        description: "An unexpected error occurred while generating your plan.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAIPlan(false);
    }
  }

  if (!userId) return null;

  return (
    <Form {...form}>
      <form className="space-y-4">
        <FormField
          control={form.control}
          name="placeName"
          render={({field}) => (
            <FormItem>
              <FormLabel>Search for your destination city</FormLabel>
              <FormControl>
                <PlacesAutoComplete
                  field={field}
                  form={form}
                  selectedFromList={selectedFromList}
                  setSelectedFromList={setSelectedFromList}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="datesOfTravel"
          render={({field}) => (
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
          render={({field}) => (
            <FormItem>
              <FormLabel>
                Select the kind of activities you want to do
                <span className="ml-1 font-medium">(Optional)</span>
              </FormLabel>
              <FormControl>
                <ActivityPreferences values={field.value} onChange={(value) => field.onChange(value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="companion"
          render={({field}) => (
            <FormItem>
              <FormLabel>
                Who are you travelling with
                <span className="ml-1 font-medium">(Optional)</span>
              </FormLabel>
              <FormControl>
                <CompanionControl value={field.value} onChange={(id: string) => field.onChange(id)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex w-full justify-between gap-1">
          <Button
            aria-label="generate plan"
            type="button"
            disabled={isLoadingEmptyPlan || isLoadingAIPlan || !form.formState.isValid}
            onClick={() => form.handleSubmit(onSubmitEmptyPlan)()}
            className="w-full bg-blue-500 text-white hover:bg-blue-600"
          >
            {isLoadingEmptyPlan ? (
              <div className="flex items-center justify-center gap-1">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Generating Travel Plan...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
                <MessageSquarePlus className="h-4 w-4" />
                <span>Create Your Plan</span>
              </div>
            )}
          </Button>

          <Button
            aria-label="generate AI plan"
            type="button"
            disabled={isLoadingAIPlan || isLoadingEmptyPlan || !form.formState.isValid}
            onClick={() => form.handleSubmit(onSubmitAIPlan)()}
            className="group w-full bg-indigo-500 text-white hover:bg-indigo-600"
          >
            {isLoadingAIPlan ? (
              <div className="flex items-center justify-center gap-1">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Generating AI Travel Plan...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1">
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
