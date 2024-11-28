import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./global.css";
import { AuthProvider } from "./lib/Context.tsx";
import { SocketProvider } from "./lib/SocketContext.tsx";

createRoot(document.getElementById("root")!).render(
  <>
    <video
      src="/video2.mp4"
      autoPlay
      muted
      loop
      preload="auto"
      className="fixed h-screen w-screen object-cover z-[-1] vid"
    />
    <main className="px-8 md:px-12 lg:px-24 py-10 md:py-16 ">
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </main>
  </>
);
