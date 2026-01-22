import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Mail, Phone, MessageCircle } from "lucide-react";
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
                Have questions about our 3D model manufacturing services? We're here to help! 
                Reach out to us through any of the following channels.
              </p>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <Mail className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <a href="mailto:makermartart@gmail.com" className="text-primary hover:underline">
                      makermartart@gmail.com
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <Phone className="h-6 w-6 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <a href="tel:+8613701902181" className="text-primary hover:underline">
                      +86 137 0190 2181
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <MessageCircle className="h-6 w-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">WhatsApp</h3>
                    <a href="https://wa.me/8613701902181" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      +86 137 0190 2181
                    </a>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click to chat directly
                    </p>
                  </div>
                </div>

                {/* WeChat */}
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <svg className="h-6 w-6 text-green-500 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.004-.27-.018-.407-.032zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z"/>
                  </svg>
                  <div>
                    <h3 className="font-semibold">WeChat</h3>
                    <p className="text-foreground">
                      +86 137 0190 2181
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Search by phone number to add
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  Based in China, serving customers worldwide.
                </p>
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
