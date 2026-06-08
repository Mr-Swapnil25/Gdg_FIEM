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

      try {
        console.log("[1] Starting fetch flow for usePlan...");
        const fetchPromise = fetchTripById(planId, user?.uid, isPublic);
        const timeoutPromise = new Promise<null>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Request Timed Out")), PLAN_FETCH_TIMEOUT_MS);
        });

        console.log("[2] Awaiting fetch or timeout...");
        const trip = (await Promise.race([fetchPromise, timeoutPromise])) as PlanDoc | null;
        console.log("[3] Fetch resolved successfully.");
        if (cancelled) return;

        setPlan(trip);
        if (!trip) {
          setError("Plan not found or access denied.");
        }
        console.log("[4] State updated successfully.");
      } catch (err: any) {
        if (cancelled) return;
        console.error("CRITICAL FETCH ERROR:", err?.message, err?.stack);
        setPlan(null);
        setError("Plan not found or access denied.");
      } finally {
        if (timer) clearTimeout(timer);
        if (cancelled) return;
        setIsFetching(false);
        console.log("[5] Fetch flow complete, loading state reset.");
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
