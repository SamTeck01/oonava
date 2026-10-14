"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Ad landing pages (/lp/*) hide the site navigation and footer so visitors have one action.
export default function Chrome({ children }: { children: ReactNode }) {
  return usePathname().startsWith("/lp") ? null : <>{children}</>;
}
