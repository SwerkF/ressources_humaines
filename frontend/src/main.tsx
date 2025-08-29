import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "@/config/queryClient";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <AuthInitializer>
            <App />
        </AuthInitializer>
    </QueryClientProvider>,
);
