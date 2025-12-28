import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FileText, Pill, Stethoscope, TestTube, Calendar, ChevronRight } from "lucide-react";

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: "visit" | "prescription" | "lab" | "procedure" | "note";
  provider?: string;
}

interface PatientTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const eventConfig = {
  visit: {
    icon: Stethoscope,
    color: "bg-primary text-primary-foreground",
    bgColor: "bg-primary/10",
  },
  prescription: {
    icon: Pill,
    color: "bg-success text-success-foreground",
    bgColor: "bg-success/10",
  },
  lab: {
    icon: TestTube,
    color: "bg-warning text-warning-foreground",
    bgColor: "bg-warning/10",
  },
  procedure: {
    icon: Calendar,
    color: "bg-info text-info-foreground",
    bgColor: "bg-info/10",
  },
  note: {
    icon: FileText,
    color: "bg-secondary text-secondary-foreground",
    bgColor: "bg-secondary/10",
  },
};

export function PatientTimeline({ events, className }: PatientTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Vertical Line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

      <AnimatePresence>
        {events.map((event, index) => {
          const config = eventConfig[event.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-12 pb-6 last:pb-0"
            >
              {/* Icon */}
              <div
                className={cn(
                  "absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center",
                  "border-4 border-background shadow-sm",
                  config.color
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content Card */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={cn(
                  "p-4 rounded-xl border border-border bg-card",
                  "hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                {event.provider && (
                  <p className="text-xs text-primary mt-2">By {event.provider}</p>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
