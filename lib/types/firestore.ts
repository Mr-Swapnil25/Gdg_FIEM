export type Id<T extends string = string> = string;

export type ContentGenerationState = {
  imagination: boolean;
  abouttheplace: boolean;
  adventuresactivitiestodo: boolean;
  topplacestovisit: boolean;
  itinerary: boolean;
  localcuisinerecommendations: boolean;
  packingchecklist: boolean;
  besttimetovisit: boolean;
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export type TopPlace = {
  name: string;
  coordinates: Coordinates;
};

export type ItineraryItem = {
  itineraryItem: string;
  briefDescription: string;
};

export type ItineraryDay = {
  title: string;
  activities: {
    morning: ItineraryItem[];
    afternoon: ItineraryItem[];
    evening: ItineraryItem[];
  };
};

export type PlanDoc = {
  _id: string;
  userId: string;
  userPrompt?: string;
  nameoftheplace: string;
  noOfDays?: string;
  imageUrl?: string | null;
  isSharedPlan?: boolean;
  isGeneratedUsingAI?: boolean;
  isPublished?: boolean;
  fromDate?: number;
  toDate?: number;
  companion?: string;
  activityPreferences?: string[];
  preferredCurrency?: string;
  budgetCurrency?: "INR";
  distanceUnit?: "km";
  regionalContext?: "IN";
  abouttheplace?: string;
  besttimetovisit?: string;
  adventuresactivitiestodo?: string[];
  localcuisinerecommendations?: string[];
  packingchecklist?: string[];
  itinerary?: ItineraryDay[];
  topplacestovisit?: TopPlace[];
  contentGenerationState: ContentGenerationState;
  createdAt?: number | any;
  updatedAt?: number | any;
};

export type ExpenseDoc = {
  _id: string;
  planId: string;
  userId: string;
  amount: number;
  currency: "INR";
  category: "commute" | "food" | "shopping" | "gifts" | "accomodations" | "others";
  purpose: string;
  date: string;
  whoSpent?: string;
  createdAt?: number | any;
  updatedAt?: number | any;
};

export type UserDoc = {
  _id: string;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  photoURL?: string | null;
  credits?: number;
  freeCredits?: number;
  IsCurrentUser?: boolean;
  createdAt?: number | any;
  updatedAt?: number | any;
};

export type FeedbackDoc = {
  _id: string;
  planId?: string;
  label: "issue" | "idea" | "question" | "complaint" | "featurerequest" | "other";
  message: string;
  userId?: string;
  createdAt?: number | any;
};

export type InviteDoc = {
  _id: string;
  planId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: number | any;
};

export type AccessDoc = {
  _id: string;
  planId: string;
  userId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: number | any;
};

export type Doc<T extends string> = T extends "plan"
  ? PlanDoc
  : T extends "expenses"
    ? ExpenseDoc
    : T extends "users"
      ? UserDoc
      : T extends "feedback"
        ? FeedbackDoc
        : T extends "invites"
          ? InviteDoc
          : T extends "access"
            ? AccessDoc
            : Record<string, unknown> & {_id: string};

export const defaultContentGenerationState: ContentGenerationState = {
  imagination: true,
  abouttheplace: false,
  adventuresactivitiestodo: false,
  topplacestovisit: false,
  itinerary: false,
  localcuisinerecommendations: false,
  packingchecklist: false,
  besttimetovisit: false,
};
