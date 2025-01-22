import MainRouter from "./routes/MainRouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MainRouter />
        <ReactQueryDevtools />
      </QueryClientProvider>
      <Toaster />
    </>
  );
}

export default App;
