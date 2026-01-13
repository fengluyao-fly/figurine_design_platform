import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Sparkles, Box, ArrowRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const [, setLocation] = useLocation();
  const [description, setDescription] = useState("");
  const [sketchFile, setSketchFile] = useState<File | null>(null);
  const [sketchPreview, setSketchPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProjectMutation = trpc.projects.create.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
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
    
    if (!description.trim() && !sketchFile) {
      toast.error("Please provide a description or upload a reference image");
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert file to base64 if provided
      let sketchBase64: string | undefined;
      if (sketchFile) {
        const reader = new FileReader();
        sketchBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(sketchFile);
        });
      }

      // Create project
      const result = await createProjectMutation.mutateAsync({
        description: description.trim() || "Custom manufactured product",
        sketchBase64,
      });

      toast.success("Project created! Generating designs...");

      // Navigate to generation page
      setLocation(`/generate/${result.projectId}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Box className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Maker Mart
            </span>
          </Link>
          <Link href="/history">
            <Button variant="ghost">My Projects</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section with Integrated Form */}
      <section className="flex-1 flex items-center justify-center py-12 md:py-20 px-4">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                AI-Powered Manufacturing Design
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Transform Your Ideas Into{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">
                  Manufactured Products
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From concept to creation in minutes. Our AI-powered platform generates professional design specifications and 3D models, connecting you directly with expert manufacturers for small-batch production (1,000-20,000 units).
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Design Views</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">3D</div>
                  <div className="text-sm text-muted-foreground">Model Preview</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">24h</div>
                  <div className="text-sm text-muted-foreground">Expert Review</div>
                </div>
              </div>
            </div>

            {/* Right: Input Form */}
            <Card className="p-6 md:p-8 bg-card/50 backdrop-blur border-2 border-border/50 shadow-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Upload Reference Image
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/50 rounded-lg p-6 md:p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                  >
                    {sketchPreview ? (
                      <div className="space-y-2">
                        <img
                          src={sketchPreview}
                          alt="Reference preview"
                          className="max-h-40 mx-auto rounded"
                        />
                        <p className="text-sm text-muted-foreground">
                          {sketchFile?.name}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSketchFile(null);
                            setSketchPreview(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-sm font-medium">Click to upload sketch or photo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Image-to-image generation produces more accurate results. Add text description below to refine the design.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-base font-semibold">
                    Describe Your Product <span className="text-muted-foreground font-normal">(Optional)</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Example: Make it taller, change the color to blue, add more details to the base..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    If you provide both image and text, we'll use your description to modify the reference image.
                  </p>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || (!description.trim() && !sketchFile)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Designs
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 px-4 bg-muted/30">
        <div className="container max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">
                1
              </div>
              <h3 className="font-semibold">Describe</h3>
              <p className="text-sm text-muted-foreground">
                Tell us about your product idea with text or upload a sketch
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold">Review</h3>
              <p className="text-sm text-muted-foreground">
                Get 12 design views instantly, choose your favorite set
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold">Refine</h3>
              <p className="text-sm text-muted-foreground">
                Preview 3D model and request modifications
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">
                4
              </div>
              <h3 className="font-semibold">Produce</h3>
              <p className="text-sm text-muted-foreground">
                Pay deposit, get expert design review in 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 bg-background/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Maker Mart. Transforming ideas into manufactured products.</p>
        </div>
      </footer>
    </div>
  );
}
