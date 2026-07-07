import type { Metadata } from "next";
import { VerifyGatePage } from "@/components/pages/VerifyGatePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "التحقق من الزائر | سيريدو 2026",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const params = await searchParams;
  const registrationId = typeof params.id === "string" ? params.id.trim() : "";

  return <VerifyGatePage registrationId={registrationId} />;
}
