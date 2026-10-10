import React, { useState, useEffect } from "react";
import { PortalHub, AppId } from "@apps/portal/PortalHub";
import { LottoFilterApp } from "@apps/lotto-filter/LottoFilterApp";
import { SalaryHeroApp } from "@apps/salary-hero/SalaryHeroApp";
import { FortuneTarotApp } from "@apps/my-fortune-tarot/FortuneTarotApp";
import { SubsidyCalcApp } from "@apps/subsidy-calc/SubsidyCalcApp";
import { BargainRadarApp } from "@apps/bargain-radar/BargainRadarApp";
import { DividendPlannerApp } from "@apps/dividend-planner/DividendPlannerApp";
import { ChartDoctorApp } from "@apps/chart-doctor/ChartDoctorApp";
import { MoneyMatchApp } from "@apps/money-match/MoneyMatchApp";
import { SpendingReceiptApp } from "@apps/spending-receipt/SpendingReceiptApp";
import { getInitialAppFromUrl, isStandaloneMode, setAppUrl, isTossApp } from "@shared/index";
import { Smartphone, Monitor, Home } from "lucide-react";

export const App: React.FC = () => {
  const initialApp = (getInitialAppFromUrl() as AppId | null) || "portal";
  const [currentApp, setCurrentApp] = useState<AppId | "portal">(initialApp);
  const [standalone, setStandalone] = useState<boolean>(isStandaloneMode() || isTossApp());
  const [deviceFrame, setDeviceFrame] = useState<boolean>(!isTossApp() && !isStandaloneMode());

  useEffect(() => {
    // Listen to browser popstate (back/forward buttons)
    const handlePopState = () => {
      const app = (getInitialAppFromUrl() as AppId | null) || "portal";
      setCurrentApp(app);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleSelectApp = (appId: AppId) => {
    setCurrentApp(appId);
    setAppUrl(appId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToPortal = () => {
    setCurrentApp("portal");
    setAppUrl(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderActiveApp = () => {
    switch (currentApp) {
      case "lotto-filter":
        return <LottoFilterApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "salary-hero":
        return <SalaryHeroApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "my-fortune-tarot":
        return <FortuneTarotApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "subsidy-calc":
      case "subsidy-finder" as any:
        return <SubsidyCalcApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "bargain-radar":
        return <BargainRadarApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "dividend-planner":
        return <DividendPlannerApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "chart-doctor":
        return <ChartDoctorApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "money-match":
        return <MoneyMatchApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "spending-receipt":
        return <SpendingReceiptApp onBack={standalone ? undefined : handleBackToPortal} />;
      case "portal":
      default:
        return <PortalHub onSelectApp={handleSelectApp} />;
    }
  };

  // 1. Toss In-App Live Webview Mode or Clean Standalone Mode
  if (standalone) {
    return (
      <main className="w-full min-h-screen bg-toss-bg max-w-md mx-auto">
        {renderActiveApp()}
      </main>
    );
  }

  // 2. Developer Testbed & Mockup View Mode
  return (
    <div className="min-h-screen bg-slate-900 text-toss-text flex flex-col items-center justify-start p-0 md:p-6">
      {/* Top Controller Bar for Developer */}
      <header className="w-full max-w-md hidden md:flex items-center justify-between py-2.5 px-4 mb-3 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 text-white text-xs shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-gray-200">
            {currentApp === "portal" ? "토스 앱인앱 테스트베드" : `실행 중: ${currentApp}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {currentApp !== "portal" && (
            <button
              onClick={handleBackToPortal}
              className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-white font-medium transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>포털</span>
            </button>
          )}
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-gray-200 transition"
          >
            {deviceFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>전체 화면</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>모바일 프레임</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div
        className={`w-full transition-all duration-300 ${
          deviceFrame
            ? "max-w-[430px] rounded-none md:rounded-[40px] shadow-2xl overflow-hidden border-0 md:border-[10px] md:border-slate-800 bg-white min-h-screen md:min-h-[880px]"
            : "max-w-md bg-white shadow-xl min-h-screen"
        }`}
      >
        {renderActiveApp()}
      </div>
    </div>
  );
};
