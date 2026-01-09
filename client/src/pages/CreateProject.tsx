import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Box, Upload, Loader2, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function CreateProject() {
  const [, setLocation] = useLocation();
  const [description, setDescription] = useState("");
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);

  const createProjectMutation = trpc.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success("Project created successfully!");
      setLocation(`/generate/${data.projectId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create project");
    },
  });

  const handleSketchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setSketchFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSketchPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Please provide a description of your figurine");
      return;
    }

    if (description.trim().length < 20) {
      toast.error("Please provide a more detailed description (at least 20 characters)");
      return;
    }

    let sketchBase64: string | undefined;
    if (sketchFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        sketchBase64 = reader.result as string;
        createProjectMutation.mutate({
          description: description.trim(),
          sketchBase64,
        });
      };
      reader.readAsDataURL(sketchFile);
    } else {
      createProjectMutation.mutate({
        description: description.trim(),
      });
    }
  };

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
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Create Your Figurine</h1>
          <p className="text-xl text-muted-foreground">
            Describe your vision or upload a sketch to get started with AI-generated designs
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            {/* Description Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Describe Your Figurine</CardTitle>
                <CardDescription className="text-base">
                  Provide a detailed description of the figurine you want to create. Include details about appearance,
                  pose, clothing, accessories, style, and any specific features.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base">
                    Description <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Example: A heroic warrior character in dynamic battle pose, wearing futuristic armor with glowing blue accents. The character should have a confident expression, holding a high-tech sword. Style: anime-inspired with detailed mechanical elements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                    className="resize-none text-base"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    {description.length} characters (minimum 20 required)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sketch Upload Card */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Upload Reference Sketch (Optional)</CardTitle>
                <CardDescription className="text-base">
                  Upload a hand-drawn sketch or reference image to help guide the AI generation. Supports JPG, PNG, WebP (max 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="sketch" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                        <Upload className="h-5 w-5" />
                        <span>Choose File</span>
                      </div>
                    </Label>
                    <Input
                      id="sketch"
                      type="file"
                      accept="image/*"
                      onChange={handleSketchChange}
                      className="hidden"
                    />
                    {sketchFile && (
                      <span className="text-sm text-muted-foreground">
                        {sketchFile.name} ({(sketchFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    )}
                  </div>

                  {sketchPreview && (
                    <div className="relative border-2 rounded-lg overflow-hidden bg-muted/30">
                      <img
                        src={sketchPreview}
                        alt="Sketch preview"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSketchFile(null);
                          setSketchPreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Ready to Generate?</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI will create 3 unique three-view design sets for you to choose from
                    </p>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createProjectMutation.isPending}
                    className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 px-8"
                  >
                    {createProjectMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Generate Designs"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
