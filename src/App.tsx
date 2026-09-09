import { useAppStore } from "./store/useAppStore";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { Home } from "./components/home/Home";
import { ModalRoot } from "./components/home/ModalRoot";
import { AgentFab } from "./components/agent/AgentFab";
import { VantaAgentDrawer } from "./components/agent/VantaAgentDrawer";
import { PlaceholderPage } from "./pages/PlaceholderPage";

const NAV_TITLES: Record<string, string> = {
  tests: "Tests",
  documents: "Documents",
  policies: "Policies",
  risk: "Risk assessment",
  compliance: "Compliance",
  trust: "Trust Report",
  people: "People",
  computers: "Computers",
  checklists: "Checklists",
  access: "Access",
  inventory: "Inventory",
  vulnerabilities: "Vulnerabilities",
  vendors: "Vendors",
  integrations: "Integrations",
  help: "Help",
  account: "Account",
};

export default function App() {
  const currentNav = useAppStore((s) => s.currentNav);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f6f4f0]">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto thin-scroll">
          {currentNav === "home" ? (
            <Home />
          ) : (
            <PlaceholderPage title={NAV_TITLES[currentNav] ?? "Vanta"} />
          )}
        </main>
      </div>
      <ModalRoot />
      <AgentFab />
      <VantaAgentDrawer />
    </div>
  );
}
