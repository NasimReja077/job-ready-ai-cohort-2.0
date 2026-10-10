import { useEffect, useId, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { Button } from "@/components/ui/button";

export default function InstallPrompt({ compact = false }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(
    () =>
      window.matchMedia("(display-mode: standalone)").matches ||
      navigator.standalone === true
  );
  const instructionsId = useId();

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowInstructions(false);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const install = async () => {
    if (!installPrompt) {
      setShowInstructions((visible) => !visible);
      return;
    }

    const prompt = installPrompt;
    setInstallPrompt(null);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    else setShowInstructions(true);
  };

  return compact ? (
    <div className="relative">
      <Button
        size="sm"
        variant="secondary"
        onClick={install}
        aria-expanded={showInstructions}
        aria-controls={instructionsId}
      >
        <FiDownload /> Install
      </Button>
      {showInstructions && (
        <p
          id={instructionsId}
          role="status"
          className="glass absolute right-0 top-12 z-50 w-64 rounded-xl p-3 text-xs leading-relaxed text-muted-foreground shadow-xl"
        >
          Open your browser menu and choose <span className="font-semibold text-foreground">Install app</span> or <span className="font-semibold text-foreground">Add to Home Screen</span>. Then launch TaskFlow from your home screen or app list.
        </p>
      )}
    </div>
  ) : (
    <div className="glass rounded-2xl p-4">
      <p className="text-sm font-semibold">Install TaskFlow</p>
      <p className="mb-3 mt-0.5 text-xs text-muted-foreground">Works offline, opens instantly.</p>
      <Button
        size="sm"
        className="w-full"
        onClick={install}
        aria-expanded={showInstructions}
        aria-controls={instructionsId}
      >
        <FiDownload /> Install app
      </Button>
      {showInstructions && (
        <p id={instructionsId} role="status" className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Open your browser menu and choose <span className="font-semibold text-foreground">Install app</span> or <span className="font-semibold text-foreground">Add to Home Screen</span>. Then launch TaskFlow from your home screen or app list.
        </p>
      )}
    </div>
  );
}
