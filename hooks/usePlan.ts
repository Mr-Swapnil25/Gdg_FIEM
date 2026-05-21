import {useEffect, useState} from "react";

import {useAuthContext} from "@/contexts/AuthContext";
import {fetchTripById} from "@/lib/firebase/firestore-db";
import {PlanDoc} from "@/lib/types/firestore";

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
        console.log("[usePlan] [1] Fetching plan", { planId, isPublic });

        // Race fetch with a 30s timeout to avoid indefinite pending state
        const fetchPromise = fetchTripById(planId, user?.uid, isPublic);
        const timeoutPromise = new Promise<null>((_res, rej) => {
          timer = setTimeout(() => rej(new Error("fetchTripById timed out")), 30000);
        });

        const trip = (await Promise.race([fetchPromise, timeoutPromise])) as PlanDoc | null;

        if (cancelled) return;
        console.log("[usePlan] [2] Fetch resolved", { planId, trip: !!trip });
        setPlan(trip);
        if (!trip) setError("Plan not found or access denied.");
      } catch (err) {
        if (cancelled) return;
        console.error("[usePlan] Fetch error:", err);
        setPlan(null);
        setError("Plan not found or access denied.");
      } finally {
        if (timer) clearTimeout(timer);
        if (cancelled) return;
        setIsFetching(false);
        console.log("[usePlan] [FINALLY] Fetch complete", { planId });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isPublic, planId, user?.uid]);

    const shouldShowAlert =
      plan?.isGeneratedUsingAI &&
      isNewPlan &&
      plan &&
      Object.values(plan.contentGenerationState).some((value) => value === false)
        ? true
        : false;

    return {
      shouldShowAlert,
      plan,
      isLoading: authLoading || isFetching,
      error,
    };
};

export default usePlan;
