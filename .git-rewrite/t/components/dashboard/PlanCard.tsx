"use client";

import { motion } from "framer-motion";
import navigationSvg from "@/public/card-navigation.svg";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { CalendarDaysIcon } from "lucide-react";
import { TooltipContainer } from "@/components/shared/Toolip";
import { getFormattedDateRange } from "@/lib/utils";
import { PlanDoc } from "@/lib/types/firestore";

type PlanCardProps = {
  plan: PlanDoc;
  isPublic?: boolean;
};

const PlanCard = ({ plan, isPublic = false }: PlanCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="flex items-center justify-center"
    >
      <Link
        role="article"
        href={isPublic ? `/plans/${plan._id}/community-plan` : `/plans/${plan._id}/plan`}
        className="flex items-center justify-center shadow-lg transition-all duration-300 hover:shadow-xl"
      >
        <Card className="group/card h-[250px] w-64 flex-1 cursor-pointer overflow-hidden rounded-lg hover:shadow-md md:w-72">
          <CardContent className="flex h-full w-full flex-col gap-4 overflow-hidden">
            <div className="relative h-full w-full">
              <Image
                role="figure"
                alt="travelpic"
                src={plan.imageUrl ?? navigationSvg}
                fill={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="relative -z-1 w-full rounded-t-lg object-cover transition ease-in-out duration-500 group-hover/card:scale-105"
                priority={plan.imageUrl ? false : true}
              />
              {plan.isSharedPlan && (
                <TooltipContainer text="This plan had been shared to you">
                  <div className="absolute right-1 top-1 rounded-lg bg-white p-1 text-sm text-gray-600 shadow-lg">
                    Shared
                  </div>
                </TooltipContainer>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{plan.nameoftheplace}</h3>
                    {plan.fromDate && plan.toDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>
                          {getFormattedDateRange(
                            new Date(plan.fromDate),
                            new Date(plan.toDate),
                            "PP"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};

export default PlanCard;
