import {useEffect, useState} from "react";

import {useAuthContext} from "@/contexts/AuthContext";
import {fetchTripById} from "@/lib/firebase/firestore-db";
import {PlanDoc} from "@/lib/types/firestore";

const usePlan = (planId: string, isNewPlan: boolean, isPublic: boolean) => {
  const {user, loading: authLoading} = useAuthContext();
  const [plan, setPlan] = useState<PlanDoc | null | undefined>(undefined);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;

    if (authLoading) return;

    setPlan(undefined);
    setError(undefined);

    async function loadPlan() {
      console.log("[1] Starting fetching flow for trip by ID...");
      try {
        const trip = await fetchTripById(planId, user?.uid, isPublic);
        if (cancelled) return;
        console.log("[2] Trip by ID API responded successfully!");
        setPlan(trip);
        if (!trip) {
          setError("Plan not found or access denied.");
        }
        console.log("[3] UI state updated with trip by ID.");
      } catch (err: any) {
        if (cancelled) return;
        console.error("CRITICAL FETCH ERROR:", err?.message, err?.stack);
        setPlan(null);
        setError("Plan not found or access denied.");
      } finally {
        if (!cancelled) {
           console.log("[4] Trip by ID load flow finished.");
        }
      }
    }

    loadPlan();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isPublic, planId, user?.uid]);

    const shouldShowAlert =
      plan?.isGeneratedUsingAI &&
      isNewPlan &&
      plan &&
      Object.values(plan.contentGenerationState).some(
        (value) => value === false
      )
        ? true
        : false;

    return {
      shouldShowAlert,
      plan,
      isLoading: authLoading || plan === undefined,
      error,
    };
};

export default usePlan;
