import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { PatientTimeline, TimelineEvent } from "@/components/patients/PatientTimeline";
import { AllergyAlert, EmergencyContact } from "@/components/patients/PatientAlerts";
import { VitalWidget } from "@/components/medical/VitalWidget";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { usePatients, usePatientAllergies, usePatientMedications } from "@/hooks/usePatients";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Pill,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Patients() {
  const { data: patients = [], isLoading } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  const { data: allergies = [] } = usePatientAllergies(selectedPatientId);
  const { data: medications = [] } = usePatientMedications(selectedPatientId);

  const filteredPatients = useMemo(
    () =>
      patients.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone?.includes(searchQuery)
      ),
    [patients, searchQuery]
  );

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="min-h-screen">
      <Header title="Patients" subtitle={`${patients.length} registered patients`} />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Patient List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "transition-all duration-300",
              showDetail ? "w-[380px] shrink-0" : "flex-1"
            )}
          >
            <Card className="h-[calc(100vh-160px)]">
              <CardHeader className="pb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Patient Directory</CardTitle>
                  <Button size="sm" className="gap-2" onClick={() => setShowAddDialog(true)}>
                    <Plus className="w-4 h-4" />
                    Add Patient
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto h-[calc(100%-140px)] scrollbar-thin">
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    {searchQuery ? "No patients found" : "No patients yet. Add your first patient!"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredPatients.map((patient, index) => {
                        const age = calculateAge(patient.date_of_birth);
                        return (
                          <motion.div
                            key={patient.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => {
                              setSelectedPatientId(patient.id);
                              setShowDetail(true);
                            }}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                              "hover:bg-secondary/50",
                              selectedPatientId === patient.id &&
                                "bg-primary/5 border border-primary/20"
                            )}
                          >
                            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                              <AvatarImage src={patient.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {patient.first_name[0]}{patient.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {patient.first_name} {patient.last_name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {age ? `${age}y` : "N/A"} • {patient.gender || "N/A"} • {patient.blood_type || "N/A"}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="text-xs">
                                Active
                              </Badge>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Patient Detail */}
          <AnimatePresence>
            {showDetail && selectedPatient && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1"
              >
                <Card className="h-[calc(100vh-160px)] overflow-hidden">
                  {/* Patient Header */}
                  <div className="relative p-6 bg-gradient-to-r from-primary/5 to-primary/10 border-b">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4"
                      onClick={() => setShowDetail(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    <div className="flex items-start gap-4">
                      <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                        <AvatarImage src={selectedPatient.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold">
                          {selectedPatient.first_name} {selectedPatient.last_name}
                        </h2>
                        <p className="text-muted-foreground">
                          {calculateAge(selectedPatient.date_of_birth) || "N/A"} years old • {selectedPatient.gender || "N/A"} •{" "}
                          {selectedPatient.blood_type || "N/A"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Phone className="w-4 h-4" />
                            Call
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabs Content */}
                  <div className="p-6 overflow-y-auto h-[calc(100%-200px)] scrollbar-thin">
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="vitals">Vitals</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6">
                        {/* Allergy Alert */}
                        {allergies.length > 0 && (
                          <AllergyAlert allergies={allergies.map((a) => a.allergy_name)} />
                        )}

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              Contact Information
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{selectedPatient.phone || "No phone"}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{selectedPatient.email || "No email"}</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{selectedPatient.address || "No address"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Emergency Contact */}
                        {selectedPatient.emergency_contact_name && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              Emergency Contact
                            </h3>
                            <EmergencyContact
                              name={selectedPatient.emergency_contact_name}
                              relationship={selectedPatient.emergency_contact_relation || "N/A"}
                              phone={selectedPatient.emergency_contact_phone || "N/A"}
                            />
                          </div>
                        )}

                        {/* Current Medications */}
                        {medications.length > 0 && (
                          <div className="space-y-3">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                              Current Medications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {medications.map((med) => (
                                <motion.div
                                  key={med.id}
                                  whileHover={{ scale: 1.01 }}
                                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border"
                                >
                                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                                    <Pill className="w-5 h-5 text-success" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{med.medication_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {med.dosage} • {med.frequency}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="vitals">
                        <div className="grid grid-cols-2 gap-4">
                          <VitalWidget type="heart-rate" value="--" unit="bpm" status="normal" />
                          <VitalWidget type="blood-pressure" value="--/--" unit="mmHg" status="normal" />
                        </div>
                        <p className="text-center text-muted-foreground mt-8">
                          No vitals recorded yet.
                        </p>
                      </TabsContent>
                    </Tabs>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AddPatientDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
}
