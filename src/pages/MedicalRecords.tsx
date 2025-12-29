import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { usePatients } from "@/hooks/usePatients";
import { useMedicalRecords, useCreateMedicalRecord } from "@/hooks/useMedicalRecords";
import {
  Search,
  Plus,
  FileText,
  User,
  Calendar,
  Stethoscope,
  ClipboardList,
  X,
  Save,
  Loader2,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const medicalRecordSchema = z.object({
  patient_id: z.string().min(1, "Please select a patient"),
  record_date: z.string().min(1, "Date is required"),
  chief_complaint: z.string().min(1, "Chief complaint is required"),
  history_of_complaint: z.string().optional(),
  dental_history: z.string().optional(),
  medical_history: z.string().optional(),
  family_history: z.string().optional(),
  current_medications: z.string().optional(),
  allergies: z.string().optional(),
  extra_oral_examination: z.string().optional(),
  intra_oral_examination: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment_plan: z.string().optional(),
  notes: z.string().optional(),
});

type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>;

export default function MedicalRecords() {
  const { data: patients = [], isLoading: patientsLoading } = usePatients();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);

  const { data: records = [], isLoading: recordsLoading } = useMedicalRecords(selectedPatientId);
  const createRecord = useCreateMedicalRecord();

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  );

  const filteredPatients = useMemo(
    () =>
      patients.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone?.includes(searchQuery)
      ),
    [patients, searchQuery]
  );

  const form = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patient_id: "",
      record_date: new Date().toISOString().split("T")[0],
      chief_complaint: "",
      history_of_complaint: "",
      dental_history: "",
      medical_history: "",
      family_history: "",
      current_medications: "",
      allergies: "",
      extra_oral_examination: "",
      intra_oral_examination: "",
      diagnosis: "",
      treatment_plan: "",
      notes: "",
    },
  });

  const onSubmit = async (data: MedicalRecordFormData) => {
    await createRecord.mutateAsync({
      patient_id: data.patient_id,
      record_date: data.record_date,
      chief_complaint: data.chief_complaint,
      history_of_complaint: data.history_of_complaint || null,
      dental_history: data.dental_history || null,
      medical_history: data.medical_history || null,
      family_history: data.family_history || null,
      current_medications: data.current_medications || null,
      allergies: data.allergies || null,
      extra_oral_examination: data.extra_oral_examination || null,
      intra_oral_examination: data.intra_oral_examination || null,
      diagnosis: data.diagnosis || null,
      treatment_plan: data.treatment_plan || null,
      notes: data.notes || null,
    });
    setShowNewRecordDialog(false);
    form.reset();
  };

  return (
    <div className="min-h-screen">
      <Header title="Medical Records" subtitle="Patient clinical documentation" />

      <div className="p-6">
        <div className="flex gap-6">
          {/* Patient List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-[320px] shrink-0"
          >
            <Card className="h-[calc(100vh-160px)]">
              <CardHeader className="pb-4 space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Patients</CardTitle>
                  <Badge variant="secondary">{patients.length}</Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search patients..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto h-[calc(100%-140px)] scrollbar-thin p-0 px-4">
                {patientsLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patients found
                  </div>
                ) : (
                  <div className="space-y-2 pb-4">
                    {filteredPatients.map((patient) => (
                      <motion.div
                        key={patient.id}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedPatientId(patient.id)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all",
                          "hover:bg-secondary/50",
                          selectedPatientId === patient.id &&
                            "bg-primary/10 border border-primary/20"
                        )}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={patient.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {patient.first_name[0]}{patient.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient.phone || "No phone"}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Records View */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1"
          >
            {!selectedPatientId ? (
              <Card className="h-[calc(100vh-160px)] flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Select a Patient</h3>
                  <p className="text-muted-foreground">
                    Choose a patient from the list to view their medical records
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="h-[calc(100vh-160px)] overflow-hidden">
                {/* Patient Header */}
                <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14 border-2 border-background shadow-lg">
                        <AvatarImage src={selectedPatient?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {selectedPatient?.first_name[0]}{selectedPatient?.last_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-bold">
                          {selectedPatient?.first_name} {selectedPatient?.last_name}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {selectedPatient?.gender} • {selectedPatient?.blood_type || "N/A"}
                        </p>
                      </div>
                    </div>
                    <Dialog open={showNewRecordDialog} onOpenChange={setShowNewRecordDialog}>
                      <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => {
                          form.setValue("patient_id", selectedPatientId);
                        }}>
                          <Plus className="w-4 h-4" />
                          New Record
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>New Medical Record</DialogTitle>
                          <DialogDescription>
                            Create a new clinical record for {selectedPatient?.first_name} {selectedPatient?.last_name}
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <input type="hidden" {...form.register("patient_id")} value={selectedPatientId} />
                            
                            <FormField
                              control={form.control}
                              name="record_date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Record Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Accordion type="multiple" defaultValue={["complaint", "history", "examination"]} className="w-full">
                              <AccordionItem value="complaint">
                                <AccordionTrigger className="text-base font-semibold">
                                  <div className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4" />
                                    Chief Complaint
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                  <FormField
                                    control={form.control}
                                    name="chief_complaint"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Chief Complaint *</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="Patient's main complaint..." rows={3} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="history_of_complaint"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>History of Present Illness</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="Duration, onset, progression..." rows={3} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="history">
                                <AccordionTrigger className="text-base font-semibold">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Medical History
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="dental_history"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Dental History</FormLabel>
                                          <FormControl>
                                            <Textarea placeholder="Previous dental treatments..." rows={3} {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="medical_history"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Medical History</FormLabel>
                                          <FormControl>
                                            <Textarea placeholder="Systemic conditions, past surgeries..." rows={3} {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="current_medications"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Current Medications</FormLabel>
                                          <FormControl>
                                            <Textarea placeholder="List current medications..." rows={2} {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="allergies"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Allergies</FormLabel>
                                          <FormControl>
                                            <Textarea placeholder="Drug allergies, materials..." rows={2} {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <FormField
                                    control={form.control}
                                    name="family_history"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Family History</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="Relevant family medical history..." rows={2} {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </AccordionContent>
                              </AccordionItem>

                              <AccordionItem value="examination">
                                <AccordionTrigger className="text-base font-semibold">
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4" />
                                    Clinical Examination
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                      control={form.control}
                                      name="extra_oral_examination"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Extra-Oral Examination</FormLabel>
                                          <FormControl>
                                            <Textarea placeholder="Facial symmetry, TMJ, lymph nodes..." rows={3} {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="intra_oral_examination"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>Intra-Oral Examination</FormLabel>
                                          <FormControl>
                                            <Textarea placeholder="Soft tissues, hard tissues, occlusion..." rows={3} {...field} />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                  <FormField
                                    control={form.control}
                                    name="diagnosis"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Diagnosis</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="Clinical diagnosis..." rows={2} {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="treatment_plan"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Treatment Plan</FormLabel>
                                        <FormControl>
                                          <Textarea placeholder="Proposed treatment..." rows={2} {...field} />
                                        </FormControl>
                                      </FormItem>
                                    )}
                                  />
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>

                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Additional Notes</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Any additional notes..." rows={2} {...field} />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="flex justify-end gap-3 pt-4">
                              <Button type="button" variant="outline" onClick={() => setShowNewRecordDialog(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={createRecord.isPending}>
                                {createRecord.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                Save Record
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Records List */}
                <ScrollArea className="h-[calc(100%-100px)] p-6">
                  {recordsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                      ))}
                    </div>
                  ) : records.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Records Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Create the first medical record for this patient
                      </p>
                      <Button onClick={() => {
                        form.setValue("patient_id", selectedPatientId);
                        setShowNewRecordDialog(true);
                      }}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Record
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {records.map((record, index) => (
                        <motion.div
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-primary" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base">
                                      {format(new Date(record.record_date), "MMMM d, yyyy")}
                                    </CardTitle>
                                    <CardDescription>
                                      Created {format(new Date(record.created_at), "h:mm a")}
                                    </CardDescription>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm">
                                  View Details
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Chief Complaint</p>
                                  <p className="text-sm">{record.chief_complaint}</p>
                                </div>
                                {record.diagnosis && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                                    <p className="text-sm">{record.diagnosis}</p>
                                  </div>
                                )}
                                {record.treatment_plan && (
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">Treatment Plan</p>
                                    <p className="text-sm">{record.treatment_plan}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}