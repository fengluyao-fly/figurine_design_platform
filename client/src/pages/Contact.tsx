import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Mail, Phone, MapPin } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";

export default function Contact() {
  const { isAuthenticated } = useAuth();

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
              <Button variant="ghost" size="sm" className="text-primary">Contact Us</Button>
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Have questions about our 3D figurine manufacturing services? We're here to help! 
                Reach out to us through any of the following channels.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <Mail className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <a href="mailto:contact@makermart.com" className="text-primary hover:underline">
                      contact@makermart.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <Phone className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <a href="tel:+1-800-MAKER-MT" className="text-primary hover:underline">
                      +1-800-MAKER-MT
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monday - Friday, 9:00 AM - 6:00 PM (EST)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <MapPin className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Office</h3>
                    <p className="text-foreground">
                      Maker Mart Inc.<br />
                      123 Manufacturing Way<br />
                      San Francisco, CA 94102
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      By appointment only
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Monday - Friday:</span>
                  <span>9:00 AM - 6:00 PM (EST)</span>
                  <span className="text-muted-foreground">Saturday:</span>
                  <span>10:00 AM - 4:00 PM (EST)</span>
                  <span className="text-muted-foreground">Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
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
