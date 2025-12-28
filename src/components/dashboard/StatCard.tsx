import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  color?: "primary" | "success" | "warning" | "destructive" | "info";
  className?: string;
}

const colorVariants = {
  primary: {
    icon: "bg-primary/10 text-primary",
    iconBg: "bg-gradient-to-br from-primary/20 to-primary/5",
  },
  success: {
    icon: "bg-success/10 text-success",
    iconBg: "bg-gradient-to-br from-success/20 to-success/5",
  },
  warning: {
    icon: "bg-warning/10 text-warning",
    iconBg: "bg-gradient-to-br from-warning/20 to-warning/5",
  },
  destructive: {
    icon: "bg-destructive/10 text-destructive",
    iconBg: "bg-gradient-to-br from-destructive/20 to-destructive/5",
  },
  info: {
    icon: "bg-info/10 text-info",
    iconBg: "bg-gradient-to-br from-info/20 to-info/5",
  },
};

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = "stable",
  color = "primary",
  className,
}: StatCardProps) {
  const colors = colorVariants[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border p-5",
        "shadow-card hover:shadow-lg transition-shadow",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-2">
              {trend === "up" && (
                <TrendingUp className="w-3.5 h-3.5 text-success" />
              )}
              {trend === "down" && (
                <TrendingDown className="w-3.5 h-3.5 text-destructive" />
              )}
              {trend === "stable" && (
                <Minus className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === "up" && "text-success",
                  trend === "down" && "text-destructive",
                  trend === "stable" && "text-muted-foreground"
                )}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          colors.iconBg
        )}>
          <Icon className={cn("w-6 h-6", colors.icon.split(" ")[1])} />
        </div>
      </div>
    </motion.div>
  );
}
