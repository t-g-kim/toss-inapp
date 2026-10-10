import React, { useState } from "react";
import { PortalHub, AppId } from "@apps/portal/PortalHub";
import { LottoFilterApp } from "@apps/lotto-filter/LottoFilterApp";
import { SalaryHeroApp } from "@apps/salary-hero/SalaryHeroApp";
import { FortuneTarotApp } from "@apps/fortune-tarot/FortuneTarotApp";
import { SubsidyFinderApp } from "@apps/subsidy-finder/SubsidyFinderApp";
import { BargainRadarApp } from "@apps/bargain-radar/BargainRadarApp";
import { DividendPlannerApp } from "@apps/dividend-planner/DividendPlannerApp";
import { ChartDoctorApp } from "@apps/chart-doctor/ChartDoctorApp";
import { MoneyMatchApp } from "@apps/money-match/MoneyMatchApp";
import { SpendingReceiptApp } from "@apps/spending-receipt/SpendingReceiptApp";
import { Smartphone, Monitor } from "lucide-react";

export const App: React.FC = () => {
  const [currentApp, setCurrentApp] = useState<AppId | "portal">("portal");
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);

  const handleBackToPortal = () => {
    setCurrentApp("portal");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderActiveApp = () => {
    switch (currentApp) {
      case "lotto-filter":
        return <LottoFilterApp onBack={handleBackToPortal} />;
      case "salary-hero":
        return <SalaryHeroApp onBack={handleBackToPortal} />;
      case "fortune-tarot":
        return <FortuneTarotApp onBack={handleBackToPortal} />;
      case "subsidy-finder":
        return <SubsidyFinderApp onBack={handleBackToPortal} />;
      case "bargain-radar":
        return <BargainRadarApp onBack={handleBackToPortal} />;
      case "dividend-planner":
        return <DividendPlannerApp onBack={handleBackToPortal} />;
      case "chart-doctor":
        return <ChartDoctorApp onBack={handleBackToPortal} />;
      case "money-match":
        return <MoneyMatchApp onBack={handleBackToPortal} />;
      case "spending-receipt":
        return <SpendingReceiptApp onBack={handleBackToPortal} />;
      case "portal":
      default:
        return <PortalHub onSelectApp={(id) => setCurrentApp(id)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-toss-text flex flex-col items-center justify-start p-0 md:p-6">
      {/* Top Controller Bar for Developer */}
      <header className="w-full max-w-md hidden md:flex items-center justify-between py-3 px-4 mb-3 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 text-white text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-gray-200">토스 앱인앱 테스트베드</span>
        </div>
        <div className="flex items-center gap-2">
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
            : "max-w-2xl bg-white shadow-xl min-h-screen"
        }`}
      >
        {renderActiveApp()}
      </div>
    </div>
  );
};
