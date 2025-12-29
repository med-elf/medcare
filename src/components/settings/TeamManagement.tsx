import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useTeamMembers, useAssignRole, useRemoveRole } from "@/hooks/useTeamManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Trash2, Shield, Loader2 } from "lucide-react";

const roleLabels: Record<string, string> = {
  clinic_admin: "Clinic Admin",
  provider: "Provider",
  reception: "Reception",
  patient: "Patient",
};

const roleColors: Record<string, string> = {
  clinic_admin: "bg-primary/10 text-primary",
  provider: "bg-success/10 text-success",
  reception: "bg-info/10 text-info",
  patient: "bg-secondary text-secondary-foreground",
};

export function TeamManagement() {
  const { profile, roles: currentUserRoles } = useAuth();
  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const isAdmin = currentUserRoles.some((r) => r.role === "clinic_admin");

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Team Management
          </CardTitle>
          <CardDescription>
            You need admin privileges to manage team members.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Team Management
            </CardTitle>
            <CardDescription>
              Manage team members and their roles
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No team members found. Invite members to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex gap-1 flex-wrap">
                    {member.roles?.map((role) => (
                      <Badge
                        key={role.id}
                        className={roleColors[role.role] || roleColors.patient}
                      >
                        {roleLabels[role.role] || role.role}
                      </Badge>
                    ))}
                    {(!member.roles || member.roles.length === 0) && (
                      <Badge variant="outline">No Role</Badge>
                    )}
                  </div>

                  {member.user_id !== profile?.user_id && (
                    <Select
                      onValueChange={(role) => {
                        assignRole.mutate({
                          userId: member.user_id,
                          role: role as any,
                        });
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Add role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="provider">Provider</SelectItem>
                        <SelectItem value="reception">Reception</SelectItem>
                        <SelectItem value="clinic_admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}