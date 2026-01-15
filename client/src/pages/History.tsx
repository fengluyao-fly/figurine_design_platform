import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Loader2, Eye, Save, LogIn, User } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function History() {
  const { isAuthenticated, user } = useAuth();
  
  // Session-based projects (trial/anonymous)
  const { data: sessionProjects, isLoading: isLoadingSession } = trpc.projects.getBySession.useQuery();
  
  // Saved projects (logged-in user)
  const { data: savedProjects, isLoading: isLoadingSaved } = trpc.projects.getSavedProjects.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const isLoading = isLoadingSession || (isAuthenticated && isLoadingSaved);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter session projects to only show unsaved ones
  const unsavedSessionProjects = sessionProjects?.filter(p => !p.isSaved) || [];
  const allSavedProjects = savedProjects || [];

  const ProjectCard = ({ project, showSaveStatus = false }: { project: any; showSaveStatus?: boolean }) => (
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
              {showSaveStatus && project.isSaved && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Save className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}
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
            <Link href={`/project/${project.id}`}>
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Continue
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
  );

  const EmptyState = ({ message, showLogin = false }: { message: string; showLogin?: boolean }) => (
    <Card className="border-2">
      <CardContent className="py-12 text-center">
        <Box className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button size="lg">Create New Project</Button>
          </Link>
          {showLogin && !isAuthenticated && (
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

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
              <Button variant="outline" size="sm" className="text-primary">
                <User className="h-4 w-4 mr-1" />
                {user?.name || "My Account"}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = getLoginUrl()}
              >
                Sign Up
              </Button>
            )}
          </nav>
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

        {isAuthenticated ? (
          <Tabs defaultValue="saved" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="saved" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Saved ({allSavedProjects.length})
              </TabsTrigger>
              <TabsTrigger value="session" className="flex items-center gap-2">
                <Box className="h-4 w-4" />
                This Session ({unsavedSessionProjects.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="saved">
              {allSavedProjects.length === 0 ? (
                <EmptyState message="No saved projects yet. Create a project and save it to your account." />
              ) : (
                <div className="grid gap-6">
                  {allSavedProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="session">
              {unsavedSessionProjects.length === 0 ? (
                <EmptyState message="No unsaved projects in this session." />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    These projects are only available in this browser session. Save them to your account to access them later.
                  </p>
                  <div className="grid gap-6">
                    {unsavedSessionProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} showSaveStatus />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          // Not logged in - show session projects with login prompt
          <div className="space-y-6">
            {/* Login prompt */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Login to Save Your Projects</h3>
                    <p className="text-sm text-muted-foreground">
                      Create an account to save your projects and access them from any device
                    </p>
                  </div>
                  <Button onClick={() => window.location.href = getLoginUrl()}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login / Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Session projects */}
            {unsavedSessionProjects.length === 0 ? (
              <EmptyState 
                message="Start creating your first custom figurine design" 
                showLogin 
              />
            ) : (
              <div className="grid gap-6">
                {unsavedSessionProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} showSaveStatus />
                ))}
              </div>
            )}
          </div>
        )}

        {(allSavedProjects.length > 0 || unsavedSessionProjects.length > 0) && (
          <div className="mt-8 text-center">
            <Link href="/">
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
