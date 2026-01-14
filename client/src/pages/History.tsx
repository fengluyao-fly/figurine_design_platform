import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Box, ArrowLeft, Loader2, Eye, Type, Image, Images } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";

export default function History() {
  const { data: projects, isLoading } = trpc.projects.getBySession.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-12 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Projects</h1>
          <p className="text-muted-foreground text-lg">
            View and manage all your figurine design projects
          </p>
        </div>

        {!projects || projects.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating your first custom figurine design
              </p>
              <Link href="/create">
                <Button size="lg">Create New Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">Project #{project.id}</CardTitle>
                        <Badge
                          variant={
                            project.status === "completed" || project.status === "ordered"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <CardDescription className="text-base line-clamp-2">
                        {project.textPrompt || `${project.inputType.replace('_', ' ')} project`}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {format(new Date(project.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </div>
                    {project.imageUrls && project.imageUrls.length > 0 && (
                      <img
                        src={project.imageUrls[0]}
                        alt="Project preview"
                        className="w-24 h-24 object-cover rounded-lg border ml-4"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    {project.status === "draft" && (
                      <Link href="/create">
                        <Button variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Continue Editing
                        </Button>
                      </Link>
                    )}
                    {(project.status === "generating_3d" || project.status === "generating_views") && (
                      <Link href={`/project/${project.id}`}>
                        <Button variant="outline">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          View Progress
                        </Button>
                      </Link>
                    )}
                    {(project.status === "completed" || project.status === "ordered" || project.status === "views_ready") && (
                      <Link href={`/project/${project.id}`}>
                        <Button>
                          <Eye className="mr-2 h-4 w-4" />
                          View Project
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="mt-8 text-center">
            <Link href="/create">
              <Button size="lg" variant="outline">
                Create New Project
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
