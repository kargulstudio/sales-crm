import type { Metadata } from "next";
import { COMPANIES } from "@/data/companies";
import { SITE_NAME } from "@/lib/seo";

export { default } from "@/app/page";

export function generateStaticParams() {
  return COMPANIES.map((company) => ({ id: company.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const company = COMPANIES.find((item) => item.id === id);
  return {
    title: company ? `${company.name} · ${SITE_NAME}` : SITE_NAME,
    robots: { index: false, follow: false },
  };
}
