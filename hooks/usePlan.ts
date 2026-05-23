import {useEffect, useState} from "react";

import {useAuthContext} from "@/contexts/AuthContext";
import {fetchTripById} from "@/lib/firebase/firestore-db";
import {PlanDoc} from "@/lib/types/firestore";

const PLAN_FETCH_TIMEOUT_MS = 30_000;

const usePlan = (planId: string, isNewPlan: boolean, isPublic: boolean) => {
  const {user, loading: authLoading} = useAuthContext();
  const [plan, setPlan] = useState<PlanDoc | null | undefined>(undefined);
  const [error, setError] = useState<string | undefined>();
  const [isFetching, setIsFetching] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function load() {
      if (authLoading) return;

      setIsFetching(true);
      setPlan(undefined);
      setError(undefined);
      console.log("[1] Starting generation flow... (fetch plan)");

      try {
        const fetchPromise = fetchTripById(planId, user?.uid, isPublic);
        const timeoutPromise = new Promise<null>((_, reject) => {
          timer = setTimeout(() => reject(new Error("fetchTripById timed out")), PLAN_FETCH_TIMEOUT_MS);
        });

        const trip = (await Promise.race([fetchPromise, timeoutPromise])) as PlanDoc | null;
        if (cancelled) return;

        console.log("[2] API responded successfully! (fetch plan)");

        setPlan(trip);
        if (!trip) {
          setError("Plan not found or access denied.");
        }
        console.log("[3] UI state updated. (fetch plan)");
      } catch (err: any) {
        if (cancelled) return;
        console.error("CRITICAL FETCH ERROR:", err?.message, err?.stack);
        setPlan(null);
        setError("Plan not found or access denied.");
      } finally {
        if (timer) clearTimeout(timer);
        if (cancelled) return;
        setIsFetching(false);
      }
    }

    load();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [authLoading, isPublic, planId, user?.uid]);

  const shouldShowAlert =
    Boolean(
      plan?.isGeneratedUsingAI &&
        isNewPlan &&
        plan &&
        Object.values(plan.contentGenerationState).some((value) => value === false)
    ) ?? false;

  return {
    shouldShowAlert,
    plan,
    isLoading: authLoading || isFetching,
    error,
  };
};

export default usePlan;
