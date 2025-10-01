import { ReactNode } from "react";

import { TabModeContext, useTabModeProvider } from "@/hooks/use-tab-mode";

interface TabModeProviderProps {
  children: ReactNode;
}

export function TabModeProvider({ children }: TabModeProviderProps) {
  const tabModeState = useTabModeProvider();

  return <TabModeContext.Provider value={tabModeState}>{children}</TabModeContext.Provider>;
}
