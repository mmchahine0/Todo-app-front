import MainRouter from "./routes/MainRouter";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>        
      <MainRouter />
      <Toaster />
    </>
  );
}

export default App;
