"use client";

import ItineraryDayHeader from "@/components/ItineraryDayHeader";
import { Doc } from "@/lib/types/firestore";
import { Sun, Sunrise, Sunset } from "lucide-react";
import { ReactNode } from "react";
import { motion } from "framer-motion";

type TimelineProps = {
  itinerary: Doc<"plan">["itinerary"] | undefined;
  planId: string;
  allowEdit: boolean;
};

const Timeline = ({ itinerary, planId, allowEdit }: TimelineProps) => {
  if (itinerary && itinerary.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        Click + Add a day to plan an itinerary
      </div>
    );
  }

  const filteredItinerary = itinerary?.filter((day) => {
    const isMorningEmpty = day.activities.morning.length === 0;
    const isAfternoonEmpty = day.activities.afternoon.length === 0;
    const isEveningEmpty = day.activities.evening.length === 0;
    return !(isMorningEmpty && isAfternoonEmpty && isEveningEmpty);
  });

  return (
    <ol className="relative ml-10 mt-5 border-s border-gray-200 dark:border-foreground/40">
      {filteredItinerary?.map((day, dayIndex) => (
        <motion.li
          className="mb-10 ms-6"
          key={day.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, delay: dayIndex * 0.08 }}
        >
          <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white dark:bg-blue-900 dark:ring-gray-900">
            <svg
              className="h-2.5 w-2.5 text-blue-800 dark:text-blue-300"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </span>
          <ItineraryDayHeader planId={planId} title={day.title} allowEdit={allowEdit} />
          <div className="flex flex-col gap-5">
            <Activity
              activity={day.activities.morning}
              heading="Morning"
              icon={<Sunrise className="h-4 w-4 text-blue-500" />}
            />
            <Activity
              activity={day.activities.afternoon}
              heading="Afternoon"
              icon={<Sun className="h-4 w-4 text-yellow-500" />}
            />
            <Activity
              activity={day.activities.evening}
              heading="Evening"
              icon={<Sunset className="h-4 w-4 text-gray-600 dark:text-white" />}
            />
          </div>
        </motion.li>
      ))}
    </ol>
  );
};

const Activity = ({
  activity,
  heading,
  icon,
}: {
  activity: { itineraryItem: string; briefDescription: string }[];
  heading: string;
  icon: ReactNode;
}) => {
  if (activity.length === 0) return null;

  return (
    <motion.div
      className="flex flex-col gap-2 rounded-sm bg-muted p-2 shadow-md transition-all duration-300"
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <h3 className="flex w-max items-center justify-center gap-2 p-2 text-sm font-semibold leading-none text-gray-600 capitalize">
        {icon}
        <div className="text-foreground">{heading}</div>
      </h3>
      <ul className="space-y-1 pl-2 text-muted-foreground">
        {activity.map((act, index) => (
          <li key={index}>
            <div className="w-full overflow-hidden p-1">
              <span className="font-semibold text-foreground">{act.itineraryItem}</span>
              <p className="max-w-md whitespace-pre-line text-wrap md:max-w-full">
                {act.briefDescription}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default Timeline;
