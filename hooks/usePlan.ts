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

      console.log("[1] Starting trip fetch flow in usePlan...", { planId, isPublic });

      try {
        const fetchPromise = fetchTripById(planId, user?.uid, isPublic);
        const timeoutPromise = new Promise<null>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Request Timed Out")), PLAN_FETCH_TIMEOUT_MS);
        });

        const trip = (await Promise.race([fetchPromise, timeoutPromise])) as PlanDoc | null;

        console.log("[2] API responded successfully in usePlan.");

        if (!cancelled) {
          setPlan(trip);
          if (!trip) {
            setError("Plan not found or access denied.");
          }
          console.log("[3] UI state updated in usePlan.");
        }
      } catch (err: any) {
        console.error("CRITICAL FETCH ERROR:", err?.message, err?.stack);
        if (!cancelled) {
          setPlan(null);
          setError("Plan not found or access denied.");
        }
      } finally {
        if (timer) clearTimeout(timer);
        // CRITICAL: Always set fetching to false regardless of component unmount
        // to prevent infinite loops, particularly in React 18 Strict Mode
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
