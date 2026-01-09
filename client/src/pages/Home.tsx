import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Image, Box, CreditCard } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FigurineForge
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/history">
              <Button variant="ghost">My Projects</Button>
            </Link>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
                Start Creating
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                AI-Powered Custom Figurines
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Transform Your Ideas Into{" "}
              <span className="bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                Stunning Figurines
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              From concept to creation in minutes. Our AI-powered platform generates professional three-view designs
              and 3D models, connecting you directly with expert manufacturers for small-batch production (1,000-20,000 units).
            </p>
            <div className="flex gap-4">
              <Link href="/create">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-lg px-8">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Create Your Figurine
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Examples
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border-2 border-primary/10 shadow-2xl">
              <div className="aspect-square bg-gradient-to-br from-purple-100 to-amber-100 rounded-2xl flex items-center justify-center">
                <Box className="h-32 w-32 text-primary/40" strokeWidth={1} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-20 bg-gradient-to-b from-transparent to-muted/30">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps from your imagination to a production-ready figurine design
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Sparkles,
              title: "Describe Your Vision",
              description: "Share your figurine concept through text description or upload a hand-drawn sketch",
              step: "01"
            },
            {
              icon: Image,
              title: "AI Generates Designs",
              description: "Our AI creates 3 unique three-view design sets (9 images total) for you to choose from",
              step: "02"
            },
            {
              icon: Box,
              title: "View 3D Model",
              description: "Selected design is automatically converted into a detailed 3D model preview",
              step: "03"
            },
            {
              icon: CreditCard,
              title: "Secure & Finalize",
              description: "Pay $20 deposit and our designers will refine your model within 24 hours",
              step: "04"
            }
          ].map((item, index) => (
            <Card key={index} className="relative overflow-hidden border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
              <div className="absolute top-0 right-0 text-8xl font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                {item.step}
              </div>
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Perfect for Small Batches",
              description: "Ideal for 1,000-20,000 unit production runs. Too large for 3D printing, too small for traditional factory MOQs.",
            },
            {
              title: "Expert Design Support",
              description: "Professional designers review and refine your 3D model based on your feedback within 24 hours.",
            },
            {
              title: "Factory Direct Connection",
              description: "We connect you with trusted manufacturers, handling the entire production coordination process.",
            }
          ].map((feature, index) => (
            <Card key={index} className="border-2 hover:border-secondary/50 transition-all bg-gradient-to-br from-card to-purple-50/20">
              <CardHeader>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-purple-50/50 to-secondary/5 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-50"></div>
          <CardContent className="relative py-16 text-center space-y-6">
            <h2 className="text-4xl font-bold">Ready to Bring Your Figurine to Life?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join creators worldwide who trust FigurineForge for their custom figurine production needs
            </p>
            <Link href="/create">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-lg px-12">
                <Sparkles className="mr-2 h-5 w-5" />
                Start Your Project Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-20">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Box className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">FigurineForge</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered custom figurine design and manufacturing platform
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 FigurineForge. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
