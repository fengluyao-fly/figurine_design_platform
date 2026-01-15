import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Project from "./pages/Project";
import History from "./pages/History";
import OrderSuccess from "./pages/OrderSuccess";
import Contact from "./pages/Contact";
import UploadModel from "./pages/UploadModel";
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/project/:id" component={Project} />
      <Route path="/history" component={History} />
      <Route path="/order-success" component={OrderSuccess} />
      <Route path="/contact" component={Contact} />
      <Route path="/upload-model" component={UploadModel} />
      <Route path="/about" component={About} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
