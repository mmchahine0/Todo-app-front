import MainRouter from "./routes/MainRouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { Helmet, HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Helmet defaultTitle="Todo App" titleTemplate="%s | Todo App">
          <html lang="en" />
          <meta
            name="description"
            content="A modern task management application"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#16C47F" />
        </Helmet>
        <MainRouter />
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster />
    </HelmetProvider>
  );
}

export default App;
