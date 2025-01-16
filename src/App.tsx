import MainRouter from "./routes/MainRouter";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const queryClient = new QueryClient();

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
