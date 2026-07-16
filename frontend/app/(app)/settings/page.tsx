"use client";

import { useQuery } from "@tanstack/react-query";
import { getSettings } from "@/lib/api";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Container } from "@/components/layout/Container";
import { Spinner } from "@/components/ui/Spinner";
import { ThresholdSettings, ExclusionManager } from "@/components/features/settings/SettingsPanel";

export default function SettingsPage() {
  const { data: settings, isLoading } = useQuery({ queryKey: ["settings"], queryFn: getSettings });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="mr-2" />
        <p className="text-muted">Memuat pengaturan...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <p className="text-xl text-muted mb-4">Pengaturan tidak tersedia</p>
        <Link href="/" className="text-primary hover:underline text-sm">
          Kembali ke halaman utama
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <PageHeader title="Pengaturan" backHref="/" />
      <Container className="max-w-3xl py-8">
        <div className="space-y-8">
          <ThresholdSettings />
          <ExclusionManager />
        </div>
      </Container>
    </div>
  );
}
