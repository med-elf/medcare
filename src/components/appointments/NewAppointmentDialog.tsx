import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { usePatients } from "@/hooks/usePatients";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { Loader2 } from "lucide-react";

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "Patient is required"),
  title: z.string().min(1, "Title is required"),
  scheduled_date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  appointment_type: z.enum(["consultation", "follow_up", "procedure", "emergency", "telemedicine"]),
  description: z.string().optional(),
  is_telemedicine: z.boolean().default(false),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
}

export function NewAppointmentDialog({ open, onOpenChange, defaultDate }: NewAppointmentDialogProps) {
  const { data: patients = [] } = usePatients();
  const createAppointment = useCreateAppointment();
  const [isTelemedicine, setIsTelemedicine] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      scheduled_date: defaultDate || new Date().toISOString().split("T")[0],
      appointment_type: "consultation",
      is_telemedicine: false,
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    await createAppointment.mutateAsync({
      patient_id: data.patient_id,
      title: data.title,
      scheduled_date: data.scheduled_date,
      start_time: data.start_time,
      end_time: data.end_time,
      appointment_type: data.appointment_type,
      description: data.description || null,
      telemedicine_link: isTelemedicine ? `https://meet.clinic.app/${Date.now()}` : null,
      status: "scheduled",
      notes: null,
      provider_id: null,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
          <DialogDescription>
            Schedule a new appointment for a patient.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Patient *</Label>
            <Select onValueChange={(v) => setValue("patient_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.patient_id && (
              <p className="text-sm text-destructive">{errors.patient_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="e.g., General Checkup" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Date *</Label>
              <Input id="scheduled_date" type="date" {...register("scheduled_date")} />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select 
                defaultValue="consultation" 
                onValueChange={(v) => setValue("appointment_type", v as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                  <SelectItem value="telemedicine">Telemedicine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input id="start_time" type="time" {...register("start_time")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input id="end_time" type="time" {...register("end_time")} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
            <div>
              <Label htmlFor="telemedicine">Telemedicine</Label>
              <p className="text-sm text-muted-foreground">Generate video call link</p>
            </div>
            <Switch
              id="telemedicine"
              checked={isTelemedicine}
              onCheckedChange={setIsTelemedicine}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={3} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAppointment.isPending}>
              {createAppointment.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
