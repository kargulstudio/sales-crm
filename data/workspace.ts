export const TRIAL_DAYS_LEFT = 14;

export const TEAM_ROLES = [
  "Admin",
  "Sales Manager",
  "Account Executive",
  "SDR",
  "Viewer",
];

export type Invite = {
  email: string;
  role: string;
  sent: string;
};

export const PENDING_INVITES: Invite[] = [
  {
    email: "priya.raman@crm.com",
    role: "Account Executive",
    sent: "Sent 2d ago",
  },
  { email: "tom.becker@crm.com", role: "SDR", sent: "Sent 5d ago" },
];

export type Plan = {
  id: string;
  name: string;
  seatPrice: number;
  summary: string;
};

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    seatPrice: 29,
    summary: "Pipeline, contacts and activity for small teams.",
  },
  {
    id: "growth",
    name: "Growth",
    seatPrice: 59,
    summary: "Forecasting, sequences and team reporting.",
  },
  {
    id: "scale",
    name: "Scale",
    seatPrice: 99,
    summary: "Multiple pipelines, roles and advanced reports.",
  },
];

export const ANNUAL_DISCOUNT = 0.2;

export const SHORTCUTS = [
  { keys: ["Ctrl", "K"], label: "Search companies" },
  { keys: ["↑", "↓"], label: "Move through results" },
  { keys: ["↵"], label: "Open the selected result" },
  { keys: ["Esc"], label: "Close a panel or dialog" },
];

export type HelpTopic = { question: string; answer: string };

export const HELP_SECTIONS: { title: string; topics: HelpTopic[] }[] = [
  {
    title: "Win chance",
    topics: [
      {
        question: "How is a deal's win chance worked out?",
        answer:
          "Every stage starts at a set number: Discovery 10%, Evaluation 25%, Proposal 50% and Procurement 75%. What happens on the deal then moves it up or down. Nobody types it in.",
      },
      {
        question: "What raises it?",
        answer:
          "A meeting booked adds 10%, a decision-maker joining adds 10%, a reply adds 5% and the proposal being opened adds 5%.",
      },
      {
        question: "What lowers it?",
        answer:
          "A pushed close date takes off 10%, an unanswered email 5% and the main contact leaving 20%. Two weeks with no activity takes off 15% and marks the deal Stale. Pushing a close date or a contact leaving doesn't count as activity.",
      },
      {
        question: "Does logging the same thing again keep raising it?",
        answer:
          "No. Each kind of activity counts twice at most in a stage, so a third reply is recorded but doesn't move the number.",
      },
      {
        question: "Why did a number change on its own?",
        answer:
          "Something was logged on the deal, or two weeks passed with no activity. Open the deal and read Why this number to see each reason.",
      },
      {
        question: "Why did it reset when I moved the deal?",
        answer:
          "Each stage starts fresh. Only activity since the deal reached its current stage counts, so old wins and warnings don't follow it forever.",
      },
      {
        question: "Can I set the number myself?",
        answer:
          "Yes. Open the deal and use Override. It shows a Manual mark so everyone knows it's a judgment call, and goes back to automatic when the stage changes.",
      },
      {
        question: "How is a company's win chance worked out?",
        answer:
          "It's the average of its open deals, with bigger deals counting more. A company with no open deals shows a dash.",
      },
      {
        question: "What about won and lost deals?",
        answer:
          "Won deals count as 100% and lost deals as 0%. They no longer move.",
      },
      {
        question: "How does Forecast use it?",
        answer:
          "Deals in Procurement or at 70% and up count as Commit. Deals in Proposal or at 40% and up count as Best Case. The rest are Pipeline. You can change a deal's category on the Forecast page.",
      },
      {
        question: "What is the Q1 Forecast report?",
        answer:
          "It covers deals closing January to March 2027. Weighted is each deal's value times its win chance, added up. Coverage is open pipeline divided by quota, and 3x is healthy. The report also shows how much more pipeline reaches 3x.",
      },
      {
        question: "What counts as a slipping deal?",
        answer:
          "An open deal that has had its close date pushed at least once, or whose close date has already passed. The Slipping Deals report lists them with how many times each slipped and how many days.",
      },
      {
        question: "What happens when I push a close date?",
        answer:
          "The win chance drops 10%. A pushed close date counts twice per stage at most, so further pushes are recorded but don't lower it again. Each push saves the old and new date.",
      },
    ],
  },
  {
    title: "Getting around",
    topics: [
      {
        question: "How do I add a company?",
        answer:
          "Use New Company in the toolbar, or search with Ctrl K and pick New Company.",
      },
      {
        question: "How do I see one rep's accounts?",
        answer:
          "Click an owner's name, then Filter table by owner in their profile.",
      },
      {
        question: "What are the pipelines?",
        answer:
          "Each pipeline is the Deals Board for one region: North America, EMEA Enterprise and APAC Expansion. Change a deal's region in its panel and it moves to that pipeline.",
      },
      {
        question: "Can I export what I see?",
        answer:
          "Export downloads what matches your current filters as a spreadsheet file.",
      },
      {
        question: "Where do a company's numbers come from?",
        answer:
          "Open deals, pipeline, win chance, last interaction and the activity trend all come from its deals on the Deals Board. Nothing is typed in.",
      },
      {
        question: "What does Needs attention show?",
        answer:
          "Open deals that are stale, deals past their close date, and deals closing within a week with nothing logged in the last 7 days.",
      },
      {
        question: "Where do contacts come from?",
        answer:
          "Each contact belongs to a company and is linked to some of its deals. Add one with New Contact, or search with Ctrl K. Last touch and engagement come from the activity logged with them on the Deals Board.",
      },
      {
        question: "How do I reach a contact?",
        answer:
          "Email, Call and LinkedIn buttons sit on the contact row and in the contact panel. They open your email app, your phone or LinkedIn. Logging the conversation is still done with Log activity.",
      },
      {
        question: "What happens when I add a decision maker?",
        answer:
          "Choose a deal when you add them with the Decision maker role. It logs Decision-maker added on that deal, which adds 10% to its win chance. Changing an existing contact to Decision maker does the same on their first open deal.",
      },
      {
        question: "Does logging an activity change win chance?",
        answer:
          "Yes. It uses the same rules as the deal panel, so the new win chance shows on the Deals Board, Companies and Forecast.",
      },
      {
        question: "Do sequences change win chance?",
        answer:
          "Only when you mark a reply or book a meeting. That logs the activity on the person's open deal, so a reply adds 5% and a meeting adds 10%. Enrolling, pausing and removing people never touch a deal.",
      },
      {
        question: "How are team numbers worked out?",
        answer:
          "Closed is the value of won deals closing in the quarter. Commit and pipeline come from the Forecast categories on those deals, and quota comes from the plan. Open pipeline, open deals, win chance and stale deals count every open deal the rep owns, in any quarter. Coverage uses only the selected quarter.",
      },
      {
        question: "What are SDRs measured on?",
        answer:
          "Meetings logged on their deals in the quarter, against a goal of 12 each. Their open pipeline is shown for context but is not part of the goal.",
      },
      {
        question: "What do open and reply rates mean?",
        answer:
          "Open rate is the share of sent emails that were opened. Reply rate is the share of enrolled people who replied or booked a meeting. Call and LinkedIn tasks are left out of the open rate.",
      },
    ],
  },
];

export const SUPPORT_EMAIL = "support@crm.com";
