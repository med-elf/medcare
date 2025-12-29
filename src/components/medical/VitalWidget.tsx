import { motion } from "framer-motion";
import { Heart, Thermometer, Activity, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface VitalWidgetProps {
  type: "heart-rate" | "blood-pressure" | "temperature" | "respiratory";
  value: string;
  unit: string;
  status?: "normal" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
  className?: string;
}

const vitalConfig = {
  "heart-rate": {
    icon: Heart,
    label: "Heart Rate",
    gradient: "from-rose-500 to-pink-500",
    bgGradient: "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
  },
  "blood-pressure": {
    icon: Activity,
    label: "Blood Pressure",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
  },
  temperature: {
    icon: Thermometer,
    label: "Temperature",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
  },
  respiratory: {
    icon: Wind,
    label: "Respiratory Rate",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
  },
};

const statusColors = {
  normal: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
};

export function VitalWidget({
  type,
  value,
  unit,
  status = "normal",
  trend,
  className,
}: VitalWidgetProps) {
  const config = vitalConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br",
        config.bgGradient,
        "border border-border/50",
        className
      )}
    >
      {/* Background Icon */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Icon className="w-24 h-24" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn(
            "w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
            config.gradient
          )}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {config.label}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-3xl font-bold",
            statusColors[status]
          )}>
            {value}
          </span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>

        {status !== "normal" && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "mt-2 text-xs font-medium",
              status === "warning" && "text-warning",
              status === "critical" && "text-destructive"
            )}
          >
            {status === "warning" && "⚠️ Slightly elevated"}
            {status === "critical" && "🚨 Requires attention"}
          </motion.div>
        )}
      </div>

      {/* Pulse Animation for Critical */}
      {status === "critical" && (
        <motion.div
          className="absolute inset-0 border-2 border-destructive rounded-2xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
