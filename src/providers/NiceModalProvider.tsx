"use client";

import NiceModal from "@ebay/nice-modal-react";

interface NiceModalProviderProps {  
  children: React.ReactNode;
}

export const NiceModalProvider = ({ children }: NiceModalProviderProps) => {
  return <NiceModal.Provider>{children}</NiceModal.Provider>;
};

