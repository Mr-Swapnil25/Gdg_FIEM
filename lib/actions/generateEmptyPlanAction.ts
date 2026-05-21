"use server";

import {differenceInDays} from "date-fns";

import type {formSchemaType} from "@/components/NewPlanForm";
import {saveTripToFirestore} from "@/lib/firebase/firestore-db";

export async function generateEmptyPlanAction(
  formData: formSchemaType,
  userId: string
): Promise<string | null> {
  const {placeName, activityPreferences, datesOfTravel, companion} = formData;

  try {
    const planId = await saveTripToFirestore(userId, {
      nameoftheplace: placeName,
      userPrompt: `${placeName}, India`,
      noOfDays: (differenceInDays(datesOfTravel.to, datesOfTravel.from) + 1).toString(),
      activityPreferences,
      fromDate: datesOfTravel.from.getTime(),
      toDate: datesOfTravel.to.getTime(),
      companion,
      isGeneratedUsingAI: false,
      preferredCurrency: "INR",
      budgetCurrency: "INR",
      distanceUnit: "km",
      regionalContext: "IN",
    });

    return planId;
  } catch (error) {
    console.error("Error generating empty plan:", error);
    return null;
  }
}
