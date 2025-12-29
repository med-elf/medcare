import { motion } from "framer-motion";
import { AlertTriangle, Phone, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AllergyAlertProps {
  allergies: string[];
  onDismiss?: () => void;
  className?: string;
}

export function AllergyAlert({ allergies, onDismiss, className }: AllergyAlertProps) {
  if (allergies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-lg bg-destructive/10 border-2 border-destructive p-4",
        className
      )}
    >
      {/* Animated Border Pulse */}
      <motion.div
        className="absolute inset-0 rounded-lg border-2 border-destructive"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive-foreground" />
        </div>
        
        <div className="flex-1">
          <h4 className="font-semibold text-destructive flex items-center gap-2">
            ⚠️ Allergy Alert
          </h4>
          <p className="text-sm text-destructive/80 mt-1">
            Patient has known allergies to:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {allergies.map((allergy, i) => (
              <span
                key={i}
                className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-medium"
              >
                {allergy}
              </span>
            ))}
          </div>
        </div>

        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="text-destructive hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

interface EmergencyContactProps {
  name: string;
  relationship: string;
  phone: string;
  className?: string;
}

export function EmergencyContact({
  name,
  relationship,
  phone,
  className,
}: EmergencyContactProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl bg-card border border-border",
        "hover:border-primary/30 transition-all",
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <User className="w-6 h-6 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{relationship}</p>
      </div>
      <Button size="sm" className="gap-2 bg-success hover:bg-success/90">
        <Phone className="w-4 h-4" />
        Call
      </Button>
    </motion.div>
  );
}
