import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "15mb" } },
  // Ship the Supabase email templates with the admin Email setup page.
  outputFileTracingIncludes: { "/admin/team/emails": ["./docs/email-templates/*.html"] },
};

export default nextConfig;
