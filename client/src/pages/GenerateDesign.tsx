import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, ArrowLeft, Loader2, Sparkles, Check } from "lucide-react";
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

  const { data: project, isLoading: projectLoading } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: generations, refetch: refetchGenerations } = trpc.generations.getByProject.useQuery({ projectId });

  const generateImagesMutation = trpc.generations.generateThreeViews.useMutation({
    onSuccess: () => {
      toast.success("Three-view designs generated successfully!");
      refetchGenerations();
      setIsGenerating(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate designs");
      setIsGenerating(false);
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
    if (selectedGroup === groupNumber) {
      // Confirm selection and proceed to 3D generation
      const generation = generations?.find(g => g.groupNumber === groupNumber);
      if (generation) {
        selectGroupMutation.mutate({ generationId: generation.id, projectId });
      }
    } else {
      setSelectedGroup(groupNumber);
      toast.info("Click again to confirm and generate 3D model");
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
  const groupedGenerations = [1, 2, 3].map(groupNum => 
    threeViewGroups.filter(g => g.groupNumber === groupNum)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Box className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                FigurineForge
              </span>
            </div>
          </Link>
          <Link href="/create">
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
                <CardTitle className="text-2xl mb-2">Your Figurine Design</CardTitle>
                <CardDescription className="text-base">{project.description}</CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {project.status}
              </Badge>
            </div>
          </CardHeader>
          {project.sketchUrl && (
            <CardContent>
              <p className="text-sm font-medium mb-2">Reference Sketch:</p>
              <img
                src={project.sketchUrl}
                alt="Reference sketch"
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
                Our AI is creating 3 unique design variations for you. This may take 30-60 seconds.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Three-View Groups */}
        {!isGenerating && groupedGenerations.some(g => g.length > 0) && (
          <>
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Select Your Favorite Design</h2>
              <p className="text-muted-foreground text-lg">
                Choose one of the three design variations below. Click once to select, click again to confirm and generate 3D model.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              {groupedGenerations.map((group, groupIndex) => {
                const groupNumber = groupIndex + 1;
                const isSelected = selectedGroup === groupNumber;
                const hasImages = group.length > 0;

                if (!hasImages) return null;

                const imageUrls = JSON.parse(group[0].assetUrls);

                return (
                  <Card
                    key={groupNumber}
                    className={`border-2 cursor-pointer transition-all hover:shadow-xl ${
                      isSelected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => handleSelectGroup(groupNumber)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">Design {groupNumber}</CardTitle>
                        {isSelected && (
                          <Badge className="bg-primary">
                            <Check className="h-4 w-4 mr-1" />
                            Selected
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        {isSelected ? "Click again to confirm" : "Click to select"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {imageUrls.map((url: string, idx: number) => (
                        <div key={idx} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={url}
                            alt={`Design ${groupNumber} - View ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            View {idx + 1}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Not satisfied with these designs?</h3>
                    <p className="text-sm text-muted-foreground">
                      Generate a new set of three-view designs
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    variant="outline"
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate New Designs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
