import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Box, ArrowLeft, Loader2, Download, CreditCard } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import "@google/model-viewer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Model3D() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const [, setLocation] = useLocation();
  
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: project, isLoading: projectLoading } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: model3d, refetch: refetchModel, isLoading: modelLoading } = trpc.model3d.getByProject.useQuery({ projectId });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: async (data) => {
      // Create Stripe checkout session
      const checkoutResult = await createCheckoutMutation.mutateAsync({
        projectId,
        orderId: data.orderId,
        contactEmail,
        contactName: contactEmail.split('@')[0],
      });
      
      if (checkoutResult.sessionUrl) {
        toast.success("Redirecting to payment...");
        window.open(checkoutResult.sessionUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create order");
      setIsSubmitting(false);
    },
  });

  const createCheckoutMutation = trpc.payment.createCheckoutSession.useMutation();

  // Poll for model completion
  useEffect(() => {
    if (!model3d) return;
    
    const metadata = model3d.metadata ? JSON.parse(model3d.metadata) : {};
    if (metadata.status === "processing") {
      const interval = setInterval(() => {
        refetchModel();
      }, 5000); // Poll every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [model3d, refetchModel]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactEmail || !feedback) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    createOrderMutation.mutate({
      projectId,
      contactEmail,
      contactPhone: contactPhone || undefined,
      designFeedback: feedback,
    });
  };

  if (projectLoading || modelLoading) {
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

  const metadata = model3d?.metadata ? JSON.parse(model3d.metadata) : {};
  const modelStatus = metadata.status || "processing";
  const modelUrls = model3d?.assetUrls ? JSON.parse(model3d.assetUrls) : [];
  const modelUrl = modelUrls[0];

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
          <Link href={`/generate/${projectId}`}>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Designs
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12 max-w-6xl">
        {/* Project Info */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">3D Model Preview</CardTitle>
                <CardDescription className="text-base">{project.description}</CardDescription>
              </div>
              <Badge variant={modelStatus === "completed" ? "default" : "secondary"}>
                {modelStatus}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* 3D Model Viewer */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>3D Model</CardTitle>
              <CardDescription>
                {modelStatus === "processing" && "Generating your 3D model... This may take 2-5 minutes."}
                {modelStatus === "completed" && "Your 3D model is ready!"}
                {modelStatus === "failed" && "Generation failed. Please try again."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modelStatus === "processing" && (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Generating 3D model...</p>
                    <p className="text-xs text-muted-foreground mt-2">This page will auto-update when ready</p>
                  </div>
                </div>
              )}
              
              {modelStatus === "completed" && modelUrl && (
                <div className="space-y-4">
                  <div className="aspect-square bg-gradient-to-br from-purple-100 to-amber-100 rounded-lg overflow-hidden">
                    {/* @ts-ignore - model-viewer is a custom element */}
                    <model-viewer
                      src={modelUrl}
                      alt="3D Figurine Model"
                      auto-rotate
                      camera-controls
                      shadow-intensity="1"
                      exposure="1"
                      shadow-softness="0.5"
                      style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '400px',
                      }}
                      loading="eager"
                    >
                      <div slot="progress-bar" style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                      }}>
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                      {/* @ts-ignore */}
                    </model-viewer>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" asChild>
                      <a href={modelUrl} download>
                        <Download className="mr-2 h-4 w-4" />
                        Download GLB
                      </a>
                    </Button>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Tip:</strong> Click and drag to rotate • Scroll to zoom • Right-click and drag to pan
                    </p>
                  </div>
                </div>
              )}
              
              {modelStatus === "failed" && (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Generation failed</p>
                    <Button className="mt-4" onClick={() => setLocation(`/generate/${projectId}`)}>
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Form */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Submit Your Order</CardTitle>
              <CardDescription>
                Pay $20 deposit and our designers will refine your model within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="feedback">Design Feedback & Modifications *</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Describe any changes or improvements you'd like to the 3D model..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Be as specific as possible. Our designers will contact you within 24 hours.
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Deposit Amount</span>
                    <span className="text-2xl font-bold">$20.00</span>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting || modelStatus !== "completed"}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay Deposit & Submit Order
                      </>
                    )}
                  </Button>
                  {modelStatus !== "completed" && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Please wait for 3D model to complete before submitting order
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
