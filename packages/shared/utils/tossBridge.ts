/**
 * 토스 인앱 환경 감지 및 브릿지 유틸리티
 */

export const isTossApp = (): boolean => {
  if (typeof window === "undefined") return false;
  return /Toss/i.test(navigator.userAgent);
};

export const isStandaloneMode = (): boolean => {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("app") || params.get("standalone") === "true";
};

export const getInitialAppFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const appParam = params.get("app");
  if (appParam) return appParam;

  const path = window.location.pathname.replace(/^\//, "").toLowerCase();
  const pathMap: Record<string, string> = {
    lotto: "lotto-filter",
    salary: "salary-hero",
    fortune: "fortune-tarot",
    tarot: "fortune-tarot",
    subsidy: "subsidy-finder",
    bargain: "bargain-radar",
    dividend: "dividend-planner",
    chart: "chart-doctor",
    match: "money-match",
    receipt: "spending-receipt",
    pc: "make-my-pc",
    face: "face-fit",
    facefit: "face-fit",
  };

  return pathMap[path] || null;
};

export const setAppUrl = (appId: string | null) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (appId && appId !== "portal") {
    url.searchParams.set("app", appId);
  } else {
    url.searchParams.delete("app");
  }
  window.history.pushState({}, "", url.toString());
};
