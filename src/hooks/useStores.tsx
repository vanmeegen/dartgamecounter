/**
 * React context and hook for accessing MobX stores
 */

import { createContext, useContext, type ReactNode } from "react";
import { RootStore } from "../stores/RootStore";

// Create a singleton instance
const rootStore = new RootStore();

// Create context
const StoreContext = createContext<RootStore | null>(null);

// Provider component
interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps): ReactNode {
  return <StoreContext.Provider value={rootStore}>{children}</StoreContext.Provider>;
}

// Hook to access stores
export function useStores(): RootStore {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStores must be used within a StoreProvider");
  }
  return context;
}

// Convenience hooks for individual stores
export function usePlayerSetupStore(): RootStore["playerSetupStore"] {
  return useStores().playerSetupStore;
}

export function useGameStore(): RootStore["gameStore"] {
  return useStores().gameStore;
}

export function useUIStore(): RootStore["uiStore"] {
  return useStores().uiStore;
}
