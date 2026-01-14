import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Box, Loader2, Download, RefreshCw, ArrowLeft, Send, CheckCircle } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useEffect, useRef, useState, Suspense } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, Center } from "@react-three/drei";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ModelViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Center>
            <Model url={modelUrl} />
          </Center>
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}

export default function Project() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id || "0");
  const [, setLocation] = useLocation();
  
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [designFeedback, setDesignFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: project, isLoading, refetch } = trpc.projects.getById.useQuery(
    { id: projectId },
    { enabled: projectId > 0, refetchInterval: 3000 }
  );
  
  const { data: generationStatus, refetch: refetchStatus } = trpc.generate.getStatus.useQuery(
    { projectId },
    { enabled: projectId > 0, refetchInterval: 3000 }
  );

  const startGenerationMutation = trpc.generate.start3DGeneration.useMutation();
  const createOrderMutation = trpc.orders.create.useMutation();
  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();

  // Auto-start generation for new projects
  useEffect(() => {
    if (project && project.status === "draft" && !generationStatus?.tripoTaskStatus) {
      handleStartGeneration();
    }
  }, [project?.id]);

  const handleStartGeneration = async () => {
    try {
      await startGenerationMutation.mutateAsync({ projectId });
      toast.success("3D generation started!");
      refetch();
      refetchStatus();
    } catch (error: any) {
      toast.error(error.message || "Failed to start generation");
    }
  };

  const handleRegenerate = async () => {
    if (!generationStatus?.canRegenerate) {
      toast.error("Maximum regeneration limit reached");
      return;
    }
    
    try {
      await startGenerationMutation.mutateAsync({ projectId });
      toast.success("Regenerating 3D model...");
      refetch();
      refetchStatus();
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate");
    }
  };

  const handleDownload = () => {
    if (project?.modelUrl) {
      const link = document.createElement('a');
      link.href = project.modelUrl;
      link.download = `figurine-${projectId}.glb`;
      link.click();
      toast.success("Download started!");
    }
  };

  const handleSubmitOrder = async () => {
    if (!contactEmail) {
      toast.error("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create order
      const orderResult = await createOrderMutation.mutateAsync({
        projectId,
        contactEmail,
        contactPhone: contactPhone || undefined,
        designFeedback: designFeedback || "No specific feedback",
      });

      // Create checkout session
      const checkoutResult = await createCheckoutMutation.mutateAsync({
        projectId,
        orderId: orderResult.orderId,
        contactEmail,
      });

      if (checkoutResult.sessionUrl) {
        toast.success("Redirecting to payment...");
        window.open(checkoutResult.sessionUrl, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Project not found</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const isGenerating = project.status === "generating_3d" || 
    generationStatus?.tripoTaskStatus === "queued" || 
    generationStatus?.tripoTaskStatus === "running";
  
  const isCompleted = project.status === "completed" && project.modelUrl;
  const isOrdered = project.status === "ordered";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20">
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

      <main className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: 3D Model Viewer */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>3D Model Preview</span>
                  {isCompleted && (
                    <div className="flex gap-2">
                      {generationStatus?.canRegenerate && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRegenerate}
                          disabled={isGenerating}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Regenerate
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-1" />
                        Download GLB
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="w-full h-[400px] flex flex-col items-center justify-center bg-muted/50 rounded-lg">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium">Generating 3D Model...</p>
                    <p className="text-sm text-muted-foreground">This may take 2-5 minutes</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Status: {generationStatus?.tripoTaskStatus || "Starting..."}
                    </p>
                  </div>
                ) : isCompleted && project.modelUrl ? (
                  <ModelViewer modelUrl={project.modelUrl} />
                ) : (
                  <div className="w-full h-[400px] flex flex-col items-center justify-center bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground mb-4">No model generated yet</p>
                    <Button onClick={handleStartGeneration}>
                      Start Generation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Input Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Input</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Type:</span> {project.inputType.replace('_', ' ')}</p>
                  {project.textPrompt && (
                    <p><span className="text-muted-foreground">Description:</span> {project.textPrompt}</p>
                  )}
                  {project.imageUrls && project.imageUrls.length > 0 && (
                    <div>
                      <span className="text-muted-foreground">Images:</span>
                      <div className="flex gap-2 mt-2">
                        {project.imageUrls.map((url: string, i: number) => (
                          <img key={i} src={url} alt={`Input ${i+1}`} className="w-16 h-16 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Form */}
          <div className="space-y-4">
            {isOrdered ? (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    <h3 className="text-xl font-semibold">Order Submitted!</h3>
                    <p className="text-muted-foreground">
                      Thank you for your order. Our team will review your design and contact you within 24 hours.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : isCompleted ? (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Happy with your 3D model? Submit your order and our expert team will review and refine it for manufacturing.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Modification Requests</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Tell us what you'd like to change or improve about the 3D model..."
                      value={designFeedback}
                      onChange={(e) => setDesignFeedback(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Our designers will review your feedback and make adjustments before manufacturing.
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Design Deposit</span>
                      <span className="font-semibold">$20.00</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Deposit covers expert design review and refinement. Manufacturing costs quoted separately.
                    </p>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleSubmitOrder}
                    disabled={isSubmitting || !contactEmail}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Pay Deposit & Submit Order
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <h3 className="text-lg font-medium">Generating Your 3D Model</h3>
                    <p className="text-sm text-muted-foreground">
                      Please wait while we create your 3D model. This usually takes 2-5 minutes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Regeneration Info */}
            {isCompleted && generationStatus && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Regenerations used:</span>
                    <span>{generationStatus.regenerationCount} / 2</span>
                  </div>
                  {!generationStatus.canRegenerate && (
                    <p className="text-xs text-muted-foreground mt-2">
                      You've reached the maximum number of regenerations. Submit your order and our team can make further adjustments.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
