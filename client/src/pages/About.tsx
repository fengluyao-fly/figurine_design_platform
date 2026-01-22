import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Box, ArrowRight, Factory, Lightbulb, Package, Users, Zap, Target } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function About() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Maker Mart" className="h-10" />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/about">
              <Button variant="ghost" size="sm" className="text-primary">About Us</Button>
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

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-amber-500 bg-clip-text text-transparent">
              Maker Mart
            </span>
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            We are an AI-in-manufacture company based in China, dedicated to helping innovators 
            bring their product ideas to life.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="container max-w-4xl mx-auto">
          <Card className="p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We dedicate ourselves to assist all those who have wonderful product ideas but find it hard to manufacture. 
                  We help you design your product and find the best factory to produce it.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">The Gap We Bridge</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-red-600">&lt;100</span>
              </div>
              <h3 className="font-semibold mb-2">Small Quantity</h3>
              <p className="text-sm text-muted-foreground">
                If you produce fewer than 100 units, you might just go with 3D printing.
              </p>
            </Card>
            
            <Card className="p-6 text-center border-2 border-primary">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-bold text-primary">100-20K</span>
              </div>
              <h3 className="font-semibold mb-2 text-primary">The Sweet Spot</h3>
              <p className="text-sm text-muted-foreground">
                What if you want to produce a batch first to test the market? 
                <strong className="text-primary"> This is where Maker Mart helps you.</strong>
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">&gt;20K</span>
              </div>
              <h3 className="font-semibold mb-2">Large Scale</h3>
              <p className="text-sm text-muted-foreground">
                If you produce more than 20,000 units, you might fly to factories directly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mx-auto mb-4">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">AI Design</h3>
              <p className="text-sm text-muted-foreground">
                Transform your ideas into 3D models with our AI-powered design tools
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mx-auto mb-4">
                <Factory className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Factory Matching</h3>
              <p className="text-sm text-muted-foreground">
                We connect you with the best manufacturers for your specific needs
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mx-auto mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Small Batch</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for market testing with quantities from 100 to 20,000 units
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="p-3 rounded-lg bg-primary/10 text-primary w-fit mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Fast Turnaround</h3>
              <p className="text-sm text-muted-foreground">
                Quick prototyping and production to help you move fast
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Bring Your Idea to Life?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start designing your product today with our AI-powered tools.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              Make Your Product
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 bg-background/50 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 Maker Mart. AI-powered design and manufacturing solutions.</p>
        </div>
      </footer>
    </div>
  );
}
