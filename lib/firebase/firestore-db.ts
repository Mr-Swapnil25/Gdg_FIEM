import {User} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

import {db} from "@/lib/firebase/config";
import {
  AccessDoc,
  Doc,
  ExpenseDoc,
  FeedbackDoc,
  InviteDoc,
  PlanDoc,
  UserDoc,
  defaultContentGenerationState,
} from "@/lib/types/firestore";

function cleanUndefined<T extends Record<string, any>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}

function withId<T>(id: string, data: Record<string, any>) {
  return {_id: id, ...data} as T;
}

function userTripRef(userId: string, tripId: string) {
  return doc(db, "users", userId, "trips", tripId);
}

function tripRef(tripId: string) {
  return doc(db, "trips", tripId);
}

async function mirrorTrip(tripId: string, userId: string, data: Partial<PlanDoc>) {
  const payload = cleanUndefined({...data, updatedAt: serverTimestamp()});
  await Promise.all([
    setDoc(tripRef(tripId), payload, {merge: true}),
    setDoc(userTripRef(userId, tripId), payload, {merge: true}),
  ]);
}

export async function ensureUserProfile(user: User): Promise<UserDoc> {
  const nameParts = (user.displayName ?? "").split(" ").filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const profile = {
    _id: user.uid,
    userId: user.uid,
    email: user.email ?? "",
    firstName,
    lastName,
    displayName: user.displayName ?? user.email ?? "GemiTrek User",
    photoURL: user.photoURL,
    credits: snap.exists() ? ((snap.data().credits as number | undefined) ?? 0) : 0,
    freeCredits: snap.exists() ? ((snap.data().freeCredits as number | undefined) ?? 5) : 5,
    createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  } as any;

  await setDoc(ref, cleanUndefined(profile), {merge: true});
  return profile;
}

export async function fetchCurrentUserProfile(userId: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? withId<UserDoc>(snap.id, snap.data()) : null;
}

export async function updateUserProfile(
  userId: string,
  data: Pick<UserDoc, "firstName" | "lastName">
) {
  await setDoc(doc(db, "users", userId), cleanUndefined({...data, updatedAt: serverTimestamp()}), {
    merge: true,
  });
}

export async function saveTripToFirestore(
  userId: string,
  tripData: Partial<PlanDoc>
): Promise<string> {
  const payload: Omit<PlanDoc, "_id"> = {
    userId,
    nameoftheplace: tripData.nameoftheplace ?? "Untitled Indian Trip",
    userPrompt: tripData.userPrompt ?? tripData.nameoftheplace ?? "",
    noOfDays: tripData.noOfDays,
    imageUrl: tripData.imageUrl ?? null,
    isSharedPlan: false,
    isGeneratedUsingAI: tripData.isGeneratedUsingAI ?? false,
    isPublished: tripData.isPublished ?? false,
    fromDate: tripData.fromDate,
    toDate: tripData.toDate,
    companion: tripData.companion,
    activityPreferences: tripData.activityPreferences ?? [],
    preferredCurrency: "INR",
    budgetCurrency: "INR",
    distanceUnit: "km",
    regionalContext: "IN",
    abouttheplace: tripData.abouttheplace ?? "",
    besttimetovisit: tripData.besttimetovisit ?? "",
    adventuresactivitiestodo: tripData.adventuresactivitiestodo ?? [],
    localcuisinerecommendations: tripData.localcuisinerecommendations ?? [],
    packingchecklist: tripData.packingchecklist ?? [],
    itinerary: tripData.itinerary ?? [],
    topplacestovisit: tripData.topplacestovisit ?? [],
    contentGenerationState: tripData.contentGenerationState ?? defaultContentGenerationState,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  const userTripsRef = collection(db, "users", userId, "trips");
  const tripDoc = await addDoc(userTripsRef, cleanUndefined(payload));
  await setDoc(tripRef(tripDoc.id), cleanUndefined({...payload, _id: tripDoc.id}));
  return tripDoc.id;
}

export async function fetchUserTrips(userId: string): Promise<PlanDoc[]> {
  const tripsQuery = query(
    collection(db, "users", userId, "trips"),
    orderBy("updatedAt", "desc")
  );
  const snapshot = await getDocs(tripsQuery);
  return snapshot.docs.map((trip) => withId<PlanDoc>(trip.id, trip.data()));
}

export async function fetchPublicTrips(pageSize = 24): Promise<PlanDoc[]> {
  const tripsQuery = query(
    collection(db, "trips"),
    where("isPublished", "==", true),
    orderBy("updatedAt", "desc"),
    limit(pageSize)
  );
  const snapshot = await getDocs(tripsQuery);
  return snapshot.docs.map((trip) => withId<PlanDoc>(trip.id, trip.data()));
}

export async function fetchTripById(
  tripId: string,
  userId?: string,
  isPublic = false
): Promise<PlanDoc | null> {
  if (userId) {
    const ownedSnap = await getDoc(userTripRef(userId, tripId));
    if (ownedSnap.exists()) {
      return withId<PlanDoc>(ownedSnap.id, ownedSnap.data());
    }
  }

  const publicSnap = await getDoc(tripRef(tripId));
  if (!publicSnap.exists()) return null;

  const trip = withId<PlanDoc>(publicSnap.id, publicSnap.data());
  if (isPublic || trip.isPublished || trip.userId === userId) return trip;
  return null;
}

export async function updateTripInFirestore(
  tripId: string,
  data: Partial<PlanDoc>,
  userId?: string
) {
  const existing = await fetchTripById(tripId, userId, true);
  const ownerId = userId ?? existing?.userId;
  const payload = cleanUndefined({...data, updatedAt: serverTimestamp()});

  if (ownerId) {
    await mirrorTrip(tripId, ownerId, payload);
    return;
  }

  await setDoc(tripRef(tripId), payload, {merge: true});
}

export async function updateTripSection(
  tripId: string,
  key: keyof PlanDoc,
  data: PlanDoc[keyof PlanDoc],
  userId?: string
) {
  const trip = await fetchTripById(tripId, userId, true);
  await updateTripInFirestore(
    tripId,
    {
      [key]: data,
      contentGenerationState: {
        ...(trip?.contentGenerationState ?? defaultContentGenerationState),
        [String(key).toLowerCase()]: true,
      },
    } as Partial<PlanDoc>,
    userId ?? trip?.userId
  );
}

export async function addItineraryDayToTrip(
  tripId: string,
  itineraryDay: NonNullable<PlanDoc["itinerary"]>[number],
  userId?: string
) {
  const trip = await fetchTripById(tripId, userId, true);
  const itinerary = [...(trip?.itinerary ?? []), itineraryDay];
  await updateTripInFirestore(tripId, {itinerary}, userId ?? trip?.userId);
}

export async function deleteItineraryDayFromTrip(
  tripId: string,
  dayName: string,
  userId?: string
) {
  const trip = await fetchTripById(tripId, userId, true);
  const itinerary = (trip?.itinerary ?? []).filter((day) => day.title !== dayName);
  await updateTripInFirestore(tripId, {itinerary}, userId ?? trip?.userId);
}

export async function updatePlaceToVisit(
  tripId: string,
  place: {placeName: string; lat: number; lng: number},
  userId?: string
) {
  const trip = await fetchTripById(tripId, userId, true);
  const topplacestovisit = [
    ...(trip?.topplacestovisit ?? []),
    {name: place.placeName, coordinates: {lat: place.lat, lng: place.lng}},
  ];
  await updateTripInFirestore(tripId, {topplacestovisit}, userId ?? trip?.userId);
}

export async function deleteTripFromFirestore(tripId: string, userId?: string) {
  const trip = await fetchTripById(tripId, userId, true);
  const ownerId = userId ?? trip?.userId;
  const batch = writeBatch(db);
  batch.delete(tripRef(tripId));
  if (ownerId) batch.delete(userTripRef(ownerId, tripId));
  await batch.commit();
}

export async function fetchPreferredCurrency(tripId: string): Promise<string> {
  const trip = await fetchTripById(tripId, undefined, true);
  return trip?.preferredCurrency ?? "INR";
}

export async function updatePreferredCurrency(tripId: string, currencyCode: string) {
  await updateTripInFirestore(tripId, {preferredCurrency: currencyCode || "INR"});
}

export async function addExpenseToTrip(
  tripId: string,
  expense: Omit<ExpenseDoc, "_id" | "planId" | "currency" | "createdAt" | "updatedAt">
): Promise<string> {
  const payload = cleanUndefined({
    ...expense,
    planId: tripId,
    currency: "INR" as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const expenseDoc = await addDoc(collection(db, "trips", tripId, "expenses"), payload);
  const trip = await fetchTripById(tripId, undefined, true);
  const ownerId = trip?.userId;
  const budgetUpdate = {
    preferredCurrency: "INR",
    budgetCurrency: "INR" as const,
    expenseSummary: {
      currency: "INR",
      updatedAt: serverTimestamp(),
    },
    totalExpensesInINR: increment(expense.amount),
    updatedAt: serverTimestamp(),
  };

  await updateDoc(tripRef(tripId), budgetUpdate);
  if (ownerId) {
    await updateDoc(userTripRef(ownerId, tripId), budgetUpdate);
  }

  return expenseDoc.id;
}

export async function fetchTripExpenses(tripId: string): Promise<(ExpenseDoc & {whoSpent: string})[]> {
  const expensesQuery = query(
    collection(db, "trips", tripId, "expenses"),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(expensesQuery);
  return snapshot.docs.map((expense) => {
    const data = withId<ExpenseDoc>(expense.id, expense.data());
    return {...data, whoSpent: data.whoSpent ?? "You"};
  });
}

export async function updateExpenseInTrip(
  expenseId: string,
  expense: Partial<ExpenseDoc> & {planId: string}
) {
  await setDoc(
    doc(db, "trips", expense.planId, "expenses", expenseId),
    cleanUndefined({...expense, currency: "INR", updatedAt: serverTimestamp()}),
    {merge: true}
  );
}

export async function deleteExpenseFromTrip(tripId: string, expenseId: string) {
  await deleteDoc(doc(db, "trips", tripId, "expenses", expenseId));
}

export async function deleteMultipleExpensesFromTrip(tripId: string, expenseIds: string[]) {
  const batch = writeBatch(db);
  expenseIds.forEach((expenseId) => {
    batch.delete(doc(db, "trips", tripId, "expenses", expenseId));
  });
  await batch.commit();
}

export async function saveFeedbackToFirestore(
  feedback: Omit<FeedbackDoc, "_id" | "createdAt">
) {
  await addDoc(collection(db, "feedback"), cleanUndefined({...feedback, createdAt: serverTimestamp()}));
}

export async function fetchTripUsers(tripId: string, currentUser?: UserDoc | null): Promise<UserDoc[]> {
  const trip = await fetchTripById(tripId, currentUser?.userId, true);
  const owner = trip?.userId ? await fetchCurrentUserProfile(trip.userId) : null;
  const users = [owner, currentUser].filter(Boolean) as UserDoc[];
  const uniqueUsers = new Map(users.map((user) => [user.userId, user]));
  return Array.from(uniqueUsers.values()).map((user) => ({
    ...user,
    IsCurrentUser: user.userId === currentUser?.userId,
  }));
}

export async function saveInviteToFirestore(planId: string, email: string) {
  await addDoc(collection(db, "trips", planId, "invites"), {
    planId,
    email,
    createdAt: serverTimestamp(),
  });
}

export async function fetchPendingInvites(planId: string): Promise<InviteDoc[]> {
  const snapshot = await getDocs(collection(db, "trips", planId, "invites"));
  return snapshot.docs.map((invite) => withId<InviteDoc>(invite.id, invite.data()));
}

export async function revokeInviteFromFirestore(planId: string, inviteId: string) {
  await deleteDoc(doc(db, "trips", planId, "invites", inviteId));
}

export async function fetchAccessRecords(planId: string): Promise<AccessDoc[]> {
  const snapshot = await getDocs(collection(db, "trips", planId, "access"));
  return snapshot.docs.map((record) => withId<AccessDoc>(record.id, record.data()));
}

export async function revokeAccessFromFirestore(planId: string, accessId: string) {
  await deleteDoc(doc(db, "trips", planId, "access", accessId));
}
