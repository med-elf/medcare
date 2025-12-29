import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import {
  useShowcasePortfolio,
  useShowcaseTestimonials,
  useTeamMembers,
  useUpdateTestimonialStatus,
} from "@/hooks/useShowcase";
import { ImageIcon, Star, Users, Plus, Eye, Edit, CheckCircle, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Showcase() {
  const { data: portfolioItems = [], isLoading: portfolioLoading } = useShowcasePortfolio();
  const { data: testimonials = [], isLoading: testimonialsLoading } = useShowcaseTestimonials();
  const { data: teamMembers = [], isLoading: teamLoading } = useTeamMembers();
  const updateTestimonial = useUpdateTestimonialStatus();

  const handleApprove = async (id: string) => {
    await updateTestimonial.mutateAsync({ id, is_approved: true, is_published: true });
  };

  const handleReject = async (id: string) => {
    await updateTestimonial.mutateAsync({ id, is_approved: false });
  };

  return (
    <div className="min-h-screen">
      <Header title="Clinic Showcase" subtitle="Manage your portfolio, testimonials, and team profiles" />

      <div className="p-6">
        <Tabs defaultValue="portfolio">
          <TabsList className="mb-6">
            <TabsTrigger value="portfolio" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Portfolio
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="gap-2">
              <Star className="w-4 h-4" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Team
            </TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Before & After Gallery</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Case
              </Button>
            </div>
            {portfolioLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : portfolioItems.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No portfolio items yet. Add your first case!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="overflow-hidden group">
                      <div className="relative aspect-video bg-secondary">
                        {item.after_image_url ? (
                          <img
                            src={item.after_image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-12 h-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="secondary">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant={item.is_published ? "default" : "secondary"}>
                            {item.is_published ? "Published" : "Draft"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="testimonials">
            {testimonialsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : testimonials.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <Star className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No testimonials yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6 flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={t.patient_photo_url || undefined} />
                          <AvatarFallback>{t.patient_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{t.patient_name}</span>
                            <div className="flex">
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                              ))}
                            </div>
                          </div>
                          <p className="text-muted-foreground">{t.content}</p>
                          {t.treatment_type && (
                            <p className="text-sm text-primary mt-2">{t.treatment_type}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant={t.is_approved ? "default" : "secondary"}>
                            {t.is_approved ? "Approved" : "Pending"}
                          </Badge>
                          {!t.is_approved && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success"
                                onClick={() => handleApprove(t.id)}
                                disabled={updateTestimonial.isPending}
                              >
                                {updateTestimonial.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                                onClick={() => handleReject(t.id)}
                                disabled={updateTestimonial.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Member
              </Button>
            </div>
            {teamLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : teamMembers.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No team members yet. Add your first team member!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((member, i) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="text-center">
                      <CardContent className="pt-6">
                        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary/20">
                          <AvatarImage src={member.photo_url || undefined} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-primary">{member.title}</p>
                        {member.specialization && (
                          <p className="text-sm text-muted-foreground mt-1">{member.specialization}</p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
