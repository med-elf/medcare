import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { NewAppointmentDialog } from "@/components/appointments/NewAppointmentDialog";
import { useAppointments, useTodayAppointments, useUpdateAppointmentStatus } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Video,
  Loader2,
  CheckCircle,
  XCircle,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const typeColors: Record<string, string> = {
  consultation: "bg-info border-info",
  follow_up: "bg-success border-success",
  procedure: "bg-warning border-warning",
  emergency: "bg-destructive border-destructive",
  telemedicine: "bg-primary border-primary",
};

const statusBadges: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-secondary text-secondary-foreground" },
  confirmed: { label: "Confirmed", className: "bg-success/10 text-success" },
  in_progress: { label: "In Progress", className: "bg-primary/10 text-primary" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
  no_show: { label: "No Show", className: "bg-warning/10 text-warning" },
};

export default function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<"day" | "week">("week");
  const [showNewDialog, setShowNewDialog] = useState(false);

  const { data: appointments = [], isLoading } = useAppointments();
  const { data: todayAppointments = [] } = useTodayAppointments();
  const { data: patients = [] } = usePatients();
  const updateStatus = useUpdateAppointmentStatus();

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : "Unknown";
  };

  const getWeekDates = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const weekDates = getWeekDates();

  const getAppointmentsForDateAndTime = (date: Date, time: string) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.scheduled_date);
      return isSameDay(aptDate, date) && apt.start_time.slice(0, 5) === time;
    });
  };

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled') => {
    await updateStatus.mutateAsync({ id, status });
  };

  return (
    <div className="min-h-screen">
      <Header title="Appointments" subtitle="Manage your clinic's schedule" />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Calendar View */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <h2 className="text-lg font-semibold">
                      {format(currentDate, "MMMM yyyy")}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                      Today
                    </Button>
                    <Select value={viewType} onValueChange={(v) => setViewType(v as "day" | "week")}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">Day</SelectItem>
                        <SelectItem value="week">Week</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="gap-2" onClick={() => setShowNewDialog(true)}>
                      <Plus className="w-4 h-4" />
                      New Appointment
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6">
                    <Skeleton className="h-[400px] w-full" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {/* Week Header */}
                    <div className="grid grid-cols-8 border-b border-border sticky top-0 bg-card z-10">
                      <div className="p-3 border-r border-border" />
                      {weekDates.map((date, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3 text-center border-r border-border last:border-0",
                            isToday(date) && "bg-primary/5"
                          )}
                        >
                          <p className="text-xs text-muted-foreground">{weekDays[date.getDay()]}</p>
                          <p
                            className={cn(
                              "text-lg font-semibold mt-1",
                              isToday(date) &&
                                "w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto"
                            )}
                          >
                            {date.getDate()}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Time Grid */}
                    <div className="max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
                      {timeSlots.map((time) => (
                        <div
                          key={time}
                          className="grid grid-cols-8 border-b border-border hover:bg-secondary/20 transition-colors"
                        >
                          <div className="p-2 text-xs text-muted-foreground border-r border-border flex items-start justify-center pt-3">
                            {time}
                          </div>
                          {weekDates.map((date, i) => {
                            const dayAppointments = getAppointmentsForDateAndTime(date, time);
                            return (
                              <div
                                key={i}
                                className={cn(
                                  "p-1 min-h-[60px] border-r border-border last:border-0 relative",
                                  isToday(date) && "bg-primary/5"
                                )}
                              >
                                {dayAppointments.map((apt) => (
                                  <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ scale: 1.02, zIndex: 10 }}
                                    className={cn(
                                      "absolute inset-x-1 rounded-lg p-2 cursor-pointer border-l-4",
                                      "bg-card shadow-sm hover:shadow-md transition-shadow",
                                      typeColors[apt.appointment_type] || "bg-secondary border-secondary"
                                    )}
                                    style={{ backgroundColor: `hsl(var(--card))` }}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="w-6 h-6">
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                          {getPatientName(apt.patient_id).split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">
                                          {getPatientName(apt.patient_id)}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                          {apt.start_time.slice(0, 5)} - {apt.end_time.slice(0, 5)}
                                        </p>
                                      </div>
                                      {apt.telemedicine_link && <Video className="w-3 h-3 text-info" />}
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 shrink-0 space-y-6"
          >
            {/* Appointment Types Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Appointment Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(typeColors).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-sm", color.split(" ")[0])} />
                    <span className="text-sm capitalize">{type.replace("_", " ")}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Today */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Upcoming Today</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {todayAppointments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No appointments today
                  </p>
                ) : (
                  todayAppointments.slice(0, 5).map((apt, i) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getPatientName(apt.patient_id).split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getPatientName(apt.patient_id)}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {apt.start_time.slice(0, 5)}
                        </div>
                      </div>
                      <Badge className={statusBadges[apt.status]?.className || ""}>
                        {statusBadges[apt.status]?.label || apt.status}
                      </Badge>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Today's Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Appointments</span>
                  <span className="font-semibold">{todayAppointments.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-semibold text-success">
                    {todayAppointments.filter((a) => a.status === "completed").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Cancelled</span>
                  <span className="font-semibold text-destructive">
                    {todayAppointments.filter((a) => a.status === "cancelled").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <NewAppointmentDialog
        open={showNewDialog}
        onOpenChange={setShowNewDialog}
        defaultDate={format(currentDate, "yyyy-MM-dd")}
      />
    </div>
  );
}
