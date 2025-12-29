import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { User, Calendar, FileText, Settings, Search } from "lucide-react";

interface GlobalSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const navigate = useNavigate();
  const { data: patients = [] } = usePatients();
  const { data: appointments = [] } = useAppointments();
  const [search, setSearch] = useState("");

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = useCallback((type: string, id?: string) => {
    onOpenChange(false);
    setSearch("");
    switch (type) {
      case "patient":
        navigate(`/patients?id=${id}`);
        break;
      case "appointment":
        navigate(`/appointments?id=${id}`);
        break;
      case "patients":
        navigate("/patients");
        break;
      case "appointments":
        navigate("/appointments");
        break;
      case "billing":
        navigate("/billing");
        break;
      case "inventory":
        navigate("/inventory");
        break;
      case "settings":
        navigate("/settings");
        break;
      case "reports":
        navigate("/reports");
        break;
    }
  }, [navigate, onOpenChange]);

  const filteredPatients = patients.filter(
    (p) =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase()) ||
      p.phone?.includes(search)
  ).slice(0, 5);

  const filteredAppointments = appointments.filter(
    (a) => a.title.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search patients, appointments, or navigate..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {search.length > 0 && filteredPatients.length > 0 && (
          <CommandGroup heading="Patients">
            {filteredPatients.map((patient) => (
              <CommandItem
                key={patient.id}
                value={`patient-${patient.id}`}
                onSelect={() => handleSelect("patient", patient.id)}
              >
                <User className="mr-2 h-4 w-4" />
                <span>{patient.first_name} {patient.last_name}</span>
                {patient.phone && (
                  <span className="ml-2 text-sm text-muted-foreground">{patient.phone}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {search.length > 0 && filteredAppointments.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Appointments">
              {filteredAppointments.map((apt) => (
                <CommandItem
                  key={apt.id}
                  value={`appointment-${apt.id}`}
                  onSelect={() => handleSelect("appointment", apt.id)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{apt.title}</span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {apt.scheduled_date}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Quick Navigation">
          <CommandItem onSelect={() => handleSelect("patients")}>
            <User className="mr-2 h-4 w-4" />
            <span>Patients</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("appointments")}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Appointments</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("billing")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("inventory")}>
            <Search className="mr-2 h-4 w-4" />
            <span>Inventory</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("reports")}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect("settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
