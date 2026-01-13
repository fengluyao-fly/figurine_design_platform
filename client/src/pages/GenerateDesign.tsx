import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Box, ArrowLeft, Loader2, Sparkles, Check, Edit, ArrowRight } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function GenerateDesign() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const { data: project, isLoading: projectLoading } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: generations, refetch: refetchGenerations } = trpc.generations.getByProject.useQuery({ projectId });

  const generateImagesMutation = trpc.generations.generateThreeViews.useMutation({
    onSuccess: () => {
      toast.success("Designs generated successfully!");
      refetchGenerations();
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate designs");
      setIsGenerating(false);
    },
  });
  
  const editGroupMutation = trpc.generations.editSelectedGroup.useMutation({
    onSuccess: () => {
      toast.success("Design updated successfully!");
      refetchGenerations();
      setIsEditDialogOpen(false);
      setEditPrompt("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update design");
    },
  });

  const selectGroupMutation = trpc.generations.selectGroup.useMutation({
    onSuccess: () => {
      toast.success("Design selected! Generating 3D model...");
      setLocation(`/model/${projectId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to select design");
    },
  });

  useEffect(() => {
    // Auto-generate on first load if no generations exist
    if (project && (!generations || generations.length === 0) && !isGenerating) {
      handleGenerate();
    }
  }, [project, generations]);

  const handleGenerate = () => {
    setIsGenerating(true);
    generateImagesMutation.mutate({ projectId });
  };

  const handleSelectGroup = (groupNumber: number) => {
    setSelectedGroup(groupNumber);
  };

  const handleEditWithText = () => {
    if (!selectedGroup) {
      toast.error("Please select a design group first");
      return;
    }

    if (!editPrompt.trim()) {
      toast.error("Please enter modification instructions");
      return;
    }
    
    // Edit only the selected group (generate 1 new set of 3 views)
    editGroupMutation.mutate({
      projectId,
      groupNumber: selectedGroup,
      editPrompt: editPrompt.trim(),
    });
  };

  const handleGenerate3D = () => {
    if (!selectedGroup) {
      toast.error("Please select a design group first");
      return;
    }

    const generation = generations?.find(g => g.groupNumber === selectedGroup && g.type === "three_view");
    if (generation) {
      selectGroupMutation.mutate({ generationId: generation.id, projectId });
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Project not found</p>
            <Link href="/">
              <Button className="mt-4">Go Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const threeViewGroups = generations?.filter(g => g.type === "three_view") || [];
  
  // Group images by groupNumber
  const groupedImages: { [key: number]: string[] } = {};
  threeViewGroups.forEach(gen => {
    const groupNum = gen.groupNumber;
    if (groupNum !== null && groupNum !== undefined) {
      if (!groupedImages[groupNum]) {
        groupedImages[groupNum] = [];
      }
      const urls = JSON.parse(gen.assetUrls);
      groupedImages[groupNum] = urls;
    }
  });

  const hasGenerations = Object.keys(groupedImages).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Box className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Maker Mart
              </span>
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12 max-w-7xl">
        {/* Project Info */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Your Product Design</CardTitle>
                <CardDescription className="text-base">{project.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {project.status}
              </Badge>
            </div>
          </CardHeader>
          {project.sketchUrl && (
            <CardContent>
              <p className="text-sm font-medium mb-2">Reference Image:</p>
              <img
                src={project.sketchUrl}
                alt="Reference"
                className="max-h-48 rounded-lg border"
              />
            </CardContent>
          )}
        </Card>

        {/* Generation Status */}
        {isGenerating && (
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardContent className="py-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Generating Three-View Designs...</h3>
              <p className="text-muted-foreground">
                Our AI is creating 9 design views (3 groups × 3 views). This may take 30-90 seconds.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 9 Images Display (3 groups × 3 views) */}
        {!isGenerating && hasGenerations && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Select Your Favorite Design Group</h2>
              <p className="text-muted-foreground text-lg">
                We generated 9 views organized in 3 groups. Each group shows front, side, and back views. Select one group to proceed.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(groupNumber => {
                const imageUrls = groupedImages[groupNumber] || [];
                const isSelected = selectedGroup === groupNumber;
                
                if (imageUrls.length === 0) return null;

                return (
                  <Card
                    key={groupNumber}
                    className={`border-2 cursor-pointer transition-all hover:shadow-xl ${
                      isSelected 
                        ? "border-primary shadow-lg ring-4 ring-primary/30" 
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleSelectGroup(groupNumber)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Group {groupNumber}</CardTitle>
                        {isSelected && (
                          <Badge className="bg-primary">
                            <Check className="h-4 w-4 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {isSelected ? "Selected for 3D generation" : "Click to select this group"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {imageUrls.map((url: string, idx: number) => (
                        <div 
                          key={idx} 
                          className="relative aspect-video bg-muted rounded-lg overflow-hidden group cursor-zoom-in"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage({ 
                              url, 
                              title: `Group ${groupNumber} - ${["Front", "Side", "Back"][idx]} View` 
                            });
                          }}
                        >
                          <img
                            src={url}
                            alt={`Group ${groupNumber} - View ${idx + 1}`}
                            className="w-full h-full object-contain transition-transform group-hover:scale-105"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {["Front", "Side", "Back"][idx]} View
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-black text-xs px-3 py-1.5 rounded-full font-medium">
                              Click to enlarge
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Action Buttons */}
            {selectedGroup && (
              <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">What would you like to do next?</h3>
                      <p className="text-sm text-muted-foreground">
                        Edit the selected design with text instructions, or proceed to 3D model generation
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="lg">
                            <Edit className="mr-2 h-5 w-5" />
                            Edit with Text
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Design with Text</DialogTitle>
                            <DialogDescription>
                              Describe the modifications you'd like to make. We'll generate a new version of Group {selectedGroup || 1}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-prompt">Modification Instructions</Label>
                              <Textarea
                                id="edit-prompt"
                                placeholder="Example: Make the character taller, change the hat color to red, add more details to the base..."
                                value={editPrompt}
                                onChange={(e) => setEditPrompt(e.target.value)}
                                rows={5}
                              />
                            </div>
                            <Button onClick={handleEditWithText} className="w-full">
                              <Sparkles className="mr-2 h-5 w-5" />
                              Generate Modified Design
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button onClick={handleGenerate3D} size="lg" className="bg-gradient-to-r from-primary to-purple-600">
                        Generate 3D Model
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}


          </>
        )}
      </div>

      {/* Image Lightbox */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {lightboxImage && (
              <>
                <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-6">
                  <DialogTitle className="text-white text-xl">{lightboxImage.title}</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Click outside to close
                  </DialogDescription>
                </DialogHeader>
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="max-w-full max-h-[90vh] object-contain"
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
