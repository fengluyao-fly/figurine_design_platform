import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Sparkles, Box, ArrowRight, Loader2, Type, Image, Images, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type InputType = "text" | "single_image" | "multi_view";

export default function Home() {
  const [, setLocation] = useLocation();
  const [inputType, setInputType] = useState<InputType>("single_image");
  const [textPrompt, setTextPrompt] = useState("");
  const [singleImage, setSingleImage] = useState<{ file: File; preview: string } | null>(null);
  const [multiViewImages, setMultiViewImages] = useState<Array<{ file: File; preview: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProjectMutation = trpc.projects.create.useMutation();

  const handleSingleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSingleImage({ file, preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultiFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (multiViewImages.length + files.length > 4) {
      toast.error("Maximum 4 images allowed (front, left, back, right)");
      return;
    }
    
    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMultiViewImages(prev => [...prev, { file, preview: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMultiImage = (index: number) => {
    setMultiViewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (inputType === "text" && !textPrompt.trim()) {
      toast.error("Please enter a description");
      return;
    }
    if (inputType === "single_image" && !singleImage) {
      toast.error("Please upload an image");
      return;
    }
    if (inputType === "multi_view" && multiViewImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProjectMutation.mutateAsync({
        inputType,
        textPrompt: textPrompt.trim() || undefined,
        imageBase64: inputType === "single_image" && singleImage ? singleImage.preview : undefined,
        imageBase64Array: inputType === "multi_view" ? multiViewImages.map(img => img.preview) : undefined,
      });

      toast.success("Project created! Starting 3D generation...");
      setLocation(`/project/${result.projectId}`);
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project. Please try again.");
      setIsSubmitting(false);
    }
  };

  const viewLabels = ["Front", "Left", "Back", "Right"];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Box className="h-6 w-6 text-primary" />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Figurine Studio
            </span>
          </Link>
          <Link href="/history">
            <Button variant="ghost">My Projects</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-12 md:py-20 px-4">
        <div className="container max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                AI-Powered 3D Generation
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Create Custom{" "}
                <span className="bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">
                  3D Figurines
                </span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Transform your ideas into 3D models in minutes. Upload images or describe your concept, and our AI will generate a detailed 3D model ready for manufacturing.
              </p>

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">3D</div>
                  <div className="text-sm text-muted-foreground">Model Preview</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">GLB</div>
                  <div className="text-sm text-muted-foreground">Download</div>
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
                <Tabs value={inputType} onValueChange={(v) => setInputType(v as InputType)}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      <span className="hidden sm:inline">Text</span>
                    </TabsTrigger>
                    <TabsTrigger value="single_image" className="flex items-center gap-2">
                      <Image className="h-4 w-4" />
                      <span className="hidden sm:inline">Image</span>
                    </TabsTrigger>
                    <TabsTrigger value="multi_view" className="flex items-center gap-2">
                      <Images className="h-4 w-4" />
                      <span className="hidden sm:inline">Multi-View</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Text Input */}
                  <TabsContent value="text" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Describe Your Figurine</Label>
                      <Textarea
                        placeholder="Example: A cute cartoon cat figurine with big eyes, sitting pose, wearing a red scarf..."
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        rows={6}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Be specific about pose, style, colors, and details for best results.
                      </p>
                    </div>
                  </TabsContent>

                  {/* Single Image Input */}
                  <TabsContent value="single_image" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Upload Reference Image</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                      >
                        {singleImage ? (
                          <div className="space-y-2">
                            <img
                              src={singleImage.preview}
                              alt="Reference preview"
                              className="max-h-40 mx-auto rounded"
                            />
                            <p className="text-sm text-muted-foreground">{singleImage.file.name}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSingleImage(null);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                            <p className="text-sm font-medium">Click to upload image</p>
                            <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSingleFileSelect}
                        className="hidden"
                      />
                    </div>
                    
                    {/* Optional text prompt for single image */}
                    <div className="space-y-2">
                      <Label className="text-sm">Additional Description (Optional)</Label>
                      <Textarea
                        placeholder="Add details or modifications..."
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                  </TabsContent>

                  {/* Multi-View Input */}
                  <TabsContent value="multi_view" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">
                        Upload Multi-View Images (1-4)
                      </Label>
                      <p className="text-xs text-muted-foreground mb-2">
                        Upload images in order: Front (required), Left, Back, Right. 
                        Left/Right are from the character's perspective.
                      </p>
                      
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 1, 2, 3].map((index) => (
                          <div
                            key={index}
                            className={`aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors ${
                              index === 0 ? 'border-primary/50' : 'border-border/50'
                            }`}
                            onClick={() => multiFileInputRef.current?.click()}
                          >
                            {multiViewImages[index] ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={multiViewImages[index].preview}
                                  alt={viewLabels[index]}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMultiImage(index);
                                  }}
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <span className="absolute bottom-1 left-1 text-xs bg-black/50 text-white px-1 rounded">
                                  {viewLabels[index]}
                                </span>
                              </div>
                            ) : (
                              <div className="text-center p-2">
                                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">
                                  {viewLabels[index]}
                                  {index === 0 && <span className="text-primary">*</span>}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      <input
                        ref={multiFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultiFileSelect}
                        className="hidden"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting || (
                    (inputType === "text" && !textPrompt.trim()) ||
                    (inputType === "single_image" && !singleImage) ||
                    (inputType === "multi_view" && multiViewImages.length === 0)
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate 3D Model
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
              <h3 className="font-semibold">Upload</h3>
              <p className="text-sm text-muted-foreground">
                Provide text description or upload reference images
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">
                2
              </div>
              <h3 className="font-semibold">Generate</h3>
              <p className="text-sm text-muted-foreground">
                AI creates a detailed 3D model in minutes
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">
                3
              </div>
              <h3 className="font-semibold">Preview</h3>
              <p className="text-sm text-muted-foreground">
                View and rotate 3D model, download GLB file
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">
                4
              </div>
              <h3 className="font-semibold">Order</h3>
              <p className="text-sm text-muted-foreground">
                Submit for expert review and manufacturing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 bg-background/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Figurine Studio. AI-powered 3D model generation.</p>
        </div>
      </footer>
    </div>
  );
}
