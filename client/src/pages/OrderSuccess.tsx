import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Box, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-amber-50/20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Box className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Maker Mart
              </span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Success Content */}
      <div className="container py-20 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="max-w-2xl w-full border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
            <CardDescription className="text-lg">
              Your order has been submitted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">What Happens Next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Email Confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a confirmation email with your order details and project information.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Designer Review (Within 24 Hours)</p>
                    <p className="text-sm text-muted-foreground">
                      Our expert designers will review your 3D model and implement your requested modifications.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Video Consultation</p>
                    <p className="text-sm text-muted-foreground">
                      We'll schedule a real-time video call to review the refined model and make any final adjustments.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">4</span>
                  </div>
                  <div>
                    <p className="font-medium">Factory Production</p>
                    <p className="text-sm text-muted-foreground">
                      Once approved, we'll connect you with our manufacturing partners to begin production.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/history" className="flex-1">
                <Button variant="outline" className="w-full" size="lg">
                  View My Projects
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full" size="lg">
                  Back to Home
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Questions? Contact us at{" "}
                <a href="mailto:contact@makermart.com" className="text-primary hover:underline">
                  contact@makermart.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
