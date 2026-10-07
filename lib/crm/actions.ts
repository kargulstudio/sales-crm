"use server";

import type { Company } from "@/data/companies";
import { runCrmOperation } from "./operations";

type CompanyPage = { revision: number; total: number; companies: Company[] };

export async function loadCrmRevision() {
  const { revision } = (await runCrmOperation("get_revision", {}, { actor: "ui" })) as {
    revision: number;
  };
  return revision;
}

export async function loadCrmCompanies() {
  const companies: Company[] = [];
  let page: CompanyPage;
  do {
    page = (await runCrmOperation(
      "list_companies",
      { detail: "full", limit: 1000, offset: companies.length },
      { actor: "ui" },
    )) as CompanyPage;
    companies.push(...page.companies);
  } while (companies.length < page.total && page.companies.length > 0);
  return { revision: page.revision, companies };
}

export async function createCrmCompany(company: Company) {
  await runCrmOperation(
    "create_company",
    {
      id: company.id,
      name: company.name,
      owner: company.owner,
      tags: company.tags,
      openDeals: company.openDeals,
      pipelineValue: company.pipelineValue,
      winProbability: company.winProbability,
      lastInteraction: company.lastInteraction,
      logo: company.logo,
      trend: company.trend,
    },
    { actor: "ui" },
  );
}
