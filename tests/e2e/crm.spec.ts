import { test, expect } from "@playwright/test";
test("company, contact, interaction, task and opportunity survive refresh", async ({
  page,
}) => {
  const name = `Browser smoke ${Date.now()}`;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await page.getByRole("button", { name: "New Company", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Company name", exact: true })
    .fill(name);
  await page.getByLabel("Pipeline value", { exact: true }).fill("1200");
  await page
    .getByRole("button", { name: "Create Company", exact: true })
    .click();
  await expect(
    page.getByRole("cell").filter({ hasText: name }).first(),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("cell").filter({ hasText: name }).first().click();
  await page.getByLabel("Website", { exact: true }).fill("https://example.com");
  await page.getByRole("button", { name: "Save company", exact: true }).click();
  await page.getByRole("button", { name: "Add contact", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("Sarah Smoke");
  await page.getByLabel("Email", { exact: true }).fill("sarah@example.com");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Sarah Smoke", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add interaction", exact: true })
    .click();
  await page.getByLabel("Type", { exact: true }).selectOption("meeting");
  await page
    .getByRole("textbox", { name: "Subject", exact: true })
    .fill("Intro meeting");
  await page
    .getByLabel("Contact (optional)", { exact: true })
    .selectOption({ label: "Sarah Smoke" });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Intro meeting", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Task", exact: true })
    .fill("Follow up with Sarah next Tuesday");
  await page.getByLabel("Due at", { exact: true }).fill("2026-10-13T10:00");
  await page
    .getByLabel("Contact (optional)", { exact: true })
    .selectOption({ label: "Sarah Smoke" });
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByLabel("Complete Follow up with Sarah next Tuesday"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Add opportunity", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Opportunity name", exact: true })
    .fill("Expansion pilot");
  await page
    .getByRole("spinbutton", { name: "Value ($)", exact: true })
    .fill("800");
  await page
    .getByRole("spinbutton", { name: "Probability (%)", exact: true })
    .fill("75");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Expansion pilot", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("cell").filter({ hasText: name }).first().click();
  await expect(page.getByLabel("Website", { exact: true })).toHaveValue(
    "https://example.com",
  );
  await expect(
    page.getByRole("heading", { name: "Sarah Smoke", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Intro meeting", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Expansion pilot", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Complete Follow up with Sarah next Tuesday").click();
  await expect(
    page.getByLabel("Complete Follow up with Sarah next Tuesday"),
  ).toBeChecked();
  await page
    .getByRole("button", { name: "Close details", exact: true })
    .click();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.getByPlaceholder("Search companies, owners, stages…").fill(name);
  await expect(page.getByText(name, { exact: true }).last()).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("cell").filter({ hasText: name }).first().click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Archive company", exact: true })
    .click();
  await expect(
    page.getByRole("cell").filter({ hasText: name }).first(),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Archived companies", exact: true })
    .click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
  const article = page.locator("article").filter({ hasText: name });
  await article.getByRole("button", { name: "Restore" }).click();
  await page.getByRole("button", { name: /^Companies\s*\d*$/ }).click();
  await expect(
    page.getByRole("cell").filter({ hasText: name }).first(),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/desktop.png", fullPage: true });
  expect(errors).toEqual([]);
});
test("mobile navigation and company drawer remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "New Company", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("button", { name: "Contacts", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Contacts", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Contacts", exact: true }).first(),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/mobile.png", fullPage: true });
});
