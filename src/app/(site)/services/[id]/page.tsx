import type { Metadata } from "next";
import { api } from "@/lib/api";
import { ServiceDetail } from "./service-detail";

export async function generateMetadata({
  params,
}: PageProps<"/services/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const { service } = await api.services.get(id);
    return {
      title: service.title,
      description: service.description.slice(0, 160),
      openGraph: {
        title: service.title,
        description: service.description.slice(0, 160),
        images: service.image ? [{ url: service.image }] : undefined,
      },
    };
  } catch {
    return {
      title: "Service not available",
      description:
        "This service may have been removed or is awaiting approval on FixMate.",
    };
  }
}

export default async function ServiceDetailPage({
  params,
}: PageProps<"/services/[id]">) {
  const { id } = await params;
  return <ServiceDetail id={id} />;
}
