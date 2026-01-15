import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Box, Upload, Loader2, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UploadModel() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [modelFile, setModelFile] = useState<{ file: File; name: string } | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadModelMutation = trpc.projects.uploadExistingModel.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (50MB max for 3D models)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      
      // Check file extension
      const validExtensions = ['.glb', '.gltf', '.stl', '.obj', '.fbx', '.3ds'];
      const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!validExtensions.includes(ext)) {
        toast.error("Please upload a valid 3D model file (GLB, STL, OBJ, FBX, 3DS)");
        return;
      }
      
      setModelFile({ file, name: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modelFile) {
      toast.error("Please upload a 3D model file");
      return;
    }
    
    if (!contactEmail) {
      toast.error("Please enter your email");
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        await uploadModelMutation.mutateAsync({
          modelBase64: base64,
          fileName: modelFile.name,
          contactEmail,
          contactPhone: contactPhone || undefined,
          notes: notes || undefined,
        });

        setIsSubmitted(true);
        toast.success("Model uploaded successfully! We'll contact you soon.");
      };
      reader.readAsDataURL(modelFile.file);
    } catch (error) {
      console.error("Failed to upload model:", error);
      toast.error("Failed to upload model. Please try again.");
      setIsUploading(false);
    }
  };

  if (isSubmitted) {
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
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link href="/about">
                <Button variant="ghost" size="sm">About Us</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" size="sm">Make Your Product</Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" size="sm">Contact Us</Button>
              </Link>
              {isAuthenticated ? (
                <Link href="/history">
                  <Button variant="outline" size="sm">My Account</Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button variant="outline" size="sm">Sign Up</Button>
                </a>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-8 text-center space-y-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Model Submitted!</h2>
              <p className="text-muted-foreground">
                Thank you for uploading your 3D model. Our team will review it and contact you within 24 hours to discuss manufacturing options.
              </p>
              <div className="pt-4">
                <Link href="/">
                  <Button>Back to Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/about">
              <Button variant="ghost" size="sm">About Us</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm">Make Your Product</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm">Contact Us</Button>
            </Link>
            {isAuthenticated ? (
              <Link href="/history">
                <Button variant="outline" size="sm">My Account</Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="outline" size="sm">Sign Up</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">Upload Your 3D Model</h1>
          <p className="text-muted-foreground text-center mb-8">
            Already have a 3D model? Upload it directly and we'll help you manufacture it.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Model Upload & Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">3D Model File *</Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/50 transition-colors"
                  >
                    {modelFile ? (
                      <div className="space-y-2">
                        <Box className="h-12 w-12 mx-auto text-primary" />
                        <p className="font-medium">{modelFile.name}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModelFile(null);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="font-medium">Click to upload 3D model</p>
                        <p className="text-sm text-muted-foreground">
                          GLB, STL, OBJ, FBX, 3DS (up to 50MB)
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".glb,.gltf,.stl,.obj,.fbx,.3ds"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Contact Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Contact Phone */}
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

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Tell us about your manufacturing requirements, quantity, materials, etc."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Info Box */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">What happens next?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Our team will review your 3D model</li>
                    <li>• We'll contact you within 24 hours</li>
                    <li>• Discuss manufacturing options and pricing</li>
                    <li>• Get your figurines produced!</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={isUploading || !modelFile || !contactEmail}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Submit Model
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 bg-background/50">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Maker Mart. AI-powered 3D model generation for manufacturing.</p>
        </div>
      </footer>
    </div>
  );
}
