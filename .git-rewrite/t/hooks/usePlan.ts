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

    fetchTripById(planId, user?.uid, isPublic)
      .then((trip) => {
        if (cancelled) return;
        setPlan(trip);
        if (!trip) setError("Plan not found or access denied.");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error(err);
        setPlan(null);
        setError("Plan not found or access denied.");
      });

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
