"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Hides the public site's header/footer/motion inside the admin dashboard.
export default function SiteChrome({ children }: { children: ReactNode }) {
  return usePathname().startsWith("/admin") ? null : <>{children}</>;
}
