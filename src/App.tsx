import MainRouter from "./routes/MainRouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider } from "react-helmet-async";

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <MainRouter />
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster />
    </HelmetProvider>
  );
}

export default App;
