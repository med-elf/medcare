import { motion } from "framer-motion";
import { Clock, MoreVertical, Video, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Appointment {
  id: string;
  patientName: string;
  patientImage?: string;
  time: string;
  duration: string;
  type: "checkup" | "follow-up" | "procedure" | "consultation" | "emergency";
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "no-show";
  isTelemedicine?: boolean;
}

interface AppointmentCardProps {
  appointment: Appointment;
  className?: string;
  onClick?: () => void;
}

const typeColors = {
  checkup: "bg-primary/10 text-primary border-primary/20",
  "follow-up": "bg-success/10 text-success border-success/20",
  procedure: "bg-warning/10 text-warning border-warning/20",
  consultation: "bg-info/10 text-info border-info/20",
  emergency: "bg-destructive/10 text-destructive border-destructive/20",
};

const statusConfig = {
  scheduled: { label: "Scheduled", color: "bg-secondary text-secondary-foreground" },
  "in-progress": { label: "In Progress", color: "bg-primary text-primary-foreground" },
  completed: { label: "Completed", color: "bg-success text-success-foreground" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
  "no-show": { label: "No Show", color: "bg-destructive/10 text-destructive" },
};

export function AppointmentCard({
  appointment,
  className,
  onClick,
}: AppointmentCardProps) {
  const status = statusConfig[appointment.status];
  const initials = appointment.patientName
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-xl bg-card border border-border",
        "hover:border-primary/30 hover:shadow-md transition-all cursor-pointer",
        appointment.status === "in-progress" && "border-l-4 border-l-primary",
        appointment.type === "emergency" && "border-l-4 border-l-destructive",
        className
      )}
    >
      {/* Time Indicator */}
      <div className="flex flex-col items-center gap-1 min-w-[60px]">
        <span className="text-lg font-semibold text-foreground">
          {appointment.time}
        </span>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {appointment.duration}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-12 bg-border" />

      {/* Patient Info */}
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="w-10 h-10 border-2 border-background shadow-sm">
          <AvatarImage src={appointment.patientImage} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {appointment.patientName}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={cn("text-xs capitalize", typeColors[appointment.type])}
            >
              {appointment.type.replace("-", " ")}
            </Badge>
            {appointment.isTelemedicine && (
              <Badge variant="outline" className="text-xs gap-1 bg-info/5 text-info border-info/20">
                <Video className="w-3 h-3" />
                Tele
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <Badge className={cn("text-xs", status.color)}>
        {status.label}
      </Badge>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View Details</DropdownMenuItem>
          <DropdownMenuItem>Start Appointment</DropdownMenuItem>
          <DropdownMenuItem>Reschedule</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
