export const SEQUENCE_STATUSES = ["Active", "Paused", "Draft"] as const;

export type SequenceStatus = (typeof SEQUENCE_STATUSES)[number];

export const SEQUENCE_CHANNELS = [
  "Email",
  "Call task",
  "LinkedIn task",
] as const;

export type SequenceChannel = (typeof SEQUENCE_CHANNELS)[number];

export const ENROLLMENT_STATUSES = [
  "Active",
  "Replied",
  "Meeting booked",
  "Finished",
  "Bounced",
  "Unsubscribed",
] as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export type SequenceStep = {
  id: string;
  day: number;
  channel: SequenceChannel;
  subject: string;
  preview: string;
  sent: number;
  opened: number;
  replied: number;
};

export type Enrollment = {
  id: string;
  contactId: string;
  dealId?: string;
  enrolledAt: string;
  currentStep: number;
  status: EnrollmentStatus;
  lastStepAt?: string;
};

export type Sequence = {
  id: string;
  name: string;
  owner: string;
  status: SequenceStatus;
  createdAt: string;
  steps: SequenceStep[];
  enrollments: Enrollment[];
};

type StepRow = [
  day: number,
  channel: SequenceChannel,
  subject: string,
  preview: string,
  sent: number,
  opened: number,
  replied: number,
];

type EnrollmentRow = [
  contactId: string,
  dealId: string,
  status: EnrollmentStatus,
  currentStep: number,
  enrolledAt: string,
  lastStepAt: string,
];

function steps(sequenceId: string, rows: StepRow[]): SequenceStep[] {
  return rows.map(
    ([day, channel, subject, preview, sent, opened, replied], index) => ({
      id: `${sequenceId}-s${index + 1}`,
      day,
      channel,
      subject,
      preview,
      sent,
      opened,
      replied,
    }),
  );
}

function enrollments(sequenceId: string, rows: EnrollmentRow[]): Enrollment[] {
  return rows.map(
    (
      [contactId, dealId, status, currentStep, enrolledAt, lastStepAt],
      index,
    ) => ({
      id: `${sequenceId}-e${index + 1}`,
      contactId,
      ...(dealId ? { dealId } : {}),
      enrolledAt,
      currentStep,
      status,
      lastStepAt,
    }),
  );
}

export const SEQUENCES: Sequence[] = [
  {
    id: "enterprise-cold-outreach",
    name: "Enterprise cold outreach",
    owner: "Sarah Nguyen",
    status: "Active",
    createdAt: "2026-06-02",
    steps: steps("enterprise-cold-outreach", [
      [
        0,
        "Email",
        "A quick idea for your pipeline reviews",
        "Teams your size usually lose a week a quarter to manual forecast prep. Here is how three of them got it back.",
        20,
        14,
        3,
      ],
      [
        3,
        "LinkedIn task",
        "Connect with a short note",
        "Mention the pipeline review idea and ask if it is a priority this quarter.",
        17,
        9,
        1,
      ],
      [
        5,
        "Email",
        "How peers cut ramp time in half",
        "A two-minute read on how a similar account shortened onboarding for new reps.",
        11,
        7,
        2,
      ],
      [
        9,
        "Call task",
        "Intro call attempt",
        "Call, then leave a voicemail that points back to the earlier email.",
        6,
        3,
        1,
      ],
      [
        14,
        "Email",
        "Closing the loop",
        "A last, friendly note that leaves the door open for later in the year.",
        2,
        1,
        0,
      ],
    ]),
    enrollments: enrollments("enterprise-cold-outreach", [
      ["lvmh-c1", "deal-40", "Active", 3, "2026-09-07", "2026-09-12"],
      ["lvmh-c4", "deal-40", "Active", 2, "2026-09-09", "2026-09-12"],
      ["disney-c1", "deal-64", "Replied", 2, "2026-09-02", "2026-09-05"],
      ["disney-c4", "deal-63", "Active", 4, "2026-09-03", "2026-09-12"],
      ["paypal-c1", "deal-13", "Meeting booked", 3, "2026-08-28", "2026-09-02"],
      ["paypal-c6", "deal-92", "Bounced", 1, "2026-09-10", "2026-09-10"],
      [
        "united-airlines-c1",
        "deal-17",
        "Active",
        1,
        "2026-09-13",
        "2026-09-13",
      ],
      [
        "united-airlines-c4",
        "deal-54",
        "Finished",
        5,
        "2026-08-24",
        "2026-09-07",
      ],
      ["apple-c1", "deal-12", "Replied", 3, "2026-09-01", "2026-09-06"],
      ["apple-c6", "deal-81", "Unsubscribed", 2, "2026-09-04", "2026-09-07"],
      [
        "microsoft-c1",
        "deal-11",
        "Meeting booked",
        4,
        "2026-08-30",
        "2026-09-08",
      ],
      ["microsoft-c6", "deal-45", "Active", 3, "2026-09-08", "2026-09-13"],
      ["airbnb-c1", "deal-03", "Active", 2, "2026-09-10", "2026-09-13"],
      ["airbnb-c4", "deal-88", "Finished", 5, "2026-08-26", "2026-09-09"],
      ["google-c1", "deal-06", "Replied", 2, "2026-09-06", "2026-09-09"],
      ["google-c4", "deal-58", "Active", 4, "2026-09-02", "2026-09-11"],
      [
        "netflix-c1",
        "deal-05",
        "Meeting booked",
        3,
        "2026-08-31",
        "2026-09-05",
      ],
      ["netflix-c4", "", "Bounced", 1, "2026-09-11", "2026-09-11"],
      ["spotify-c1", "deal-02", "Active", 2, "2026-09-10", "2026-09-13"],
      ["stripe-c1", "deal-07", "Replied", 4, "2026-08-29", "2026-09-07"],
    ]),
  },
  {
    id: "post-demo-follow-up",
    name: "Post-demo follow-up",
    owner: "James Taylor",
    status: "Active",
    createdAt: "2026-05-18",
    steps: steps("post-demo-follow-up", [
      [
        0,
        "Email",
        "Thanks for your time today",
        "A short recap of what we showed, the questions that came up and the agreed next step.",
        14,
        10,
        2,
      ],
      [
        2,
        "Email",
        "The ROI sheet and two customer stories",
        "A one-page ROI sheet plus two stories from teams with a similar setup.",
        11,
        7,
        1,
      ],
      [
        5,
        "Call task",
        "Check in on internal questions",
        "Ask who else needs to see the demo and what is blocking a decision.",
        6,
        3,
        1,
      ],
      [
        9,
        "Email",
        "Next steps and a rough timeline",
        "Lay out a simple path from here to a signed order form.",
        3,
        2,
        0,
      ],
    ]),
    enrollments: enrollments("post-demo-follow-up", [
      ["lvmh-c1", "deal-38", "Active", 3, "2026-09-09", "2026-09-14"],
      ["lvmh-c3", "deal-39", "Replied", 1, "2026-09-04", "2026-09-04"],
      ["disney-c3", "deal-64", "Meeting booked", 2, "2026-09-01", "2026-09-03"],
      ["disney-c5", "deal-65", "Active", 2, "2026-09-12", "2026-09-14"],
      ["paypal-c3", "deal-92", "Finished", 4, "2026-08-28", "2026-09-06"],
      ["paypal-c5", "deal-94", "Active", 4, "2026-09-04", "2026-09-13"],
      [
        "united-airlines-c3",
        "deal-52",
        "Replied",
        2,
        "2026-09-02",
        "2026-09-04",
      ],
      ["apple-c3", "deal-84", "Meeting booked", 3, "2026-08-29", "2026-09-03"],
      ["microsoft-c3", "deal-46", "Active", 1, "2026-09-14", "2026-09-14"],
      ["airbnb-c3", "deal-87", "Finished", 4, "2026-08-26", "2026-09-04"],
      ["google-c3", "deal-59", "Bounced", 1, "2026-09-08", "2026-09-08"],
      ["netflix-c3", "deal-69", "Unsubscribed", 2, "2026-09-03", "2026-09-05"],
      ["stripe-c3", "deal-98", "Active", 3, "2026-09-08", "2026-09-13"],
      ["snowflake-c3", "deal-78", "Active", 2, "2026-09-11", "2026-09-13"],
    ]),
  },
  {
    id: "proposal-nudge",
    name: "Proposal nudge",
    owner: "Maria Keller",
    status: "Active",
    createdAt: "2026-07-06",
    steps: steps("proposal-nudge", [
      [
        0,
        "Email",
        "Your proposal, in two minutes",
        "A short walkthrough of the proposal with the three numbers that matter most.",
        9,
        7,
        1,
      ],
      [
        3,
        "Email",
        "Is anything blocking sign-off?",
        "Ask plainly what is left to approve and who needs to weigh in.",
        7,
        5,
        2,
      ],
      [
        7,
        "Call task",
        "Call to unblock the order form",
        "Offer a 15-minute call to walk legal and finance through the open points.",
        3,
        2,
        0,
      ],
    ]),
    enrollments: enrollments("proposal-nudge", [
      ["lvmh-c1", "deal-39", "Active", 2, "2026-09-10", "2026-09-13"],
      ["disney-c1", "deal-66", "Replied", 1, "2026-09-09", "2026-09-09"],
      ["paypal-c1", "deal-93", "Meeting booked", 2, "2026-09-04", "2026-09-07"],
      [
        "united-airlines-c1",
        "deal-53",
        "Finished",
        3,
        "2026-09-01",
        "2026-09-08",
      ],
      ["apple-c1", "deal-83", "Active", 3, "2026-09-07", "2026-09-14"],
      ["microsoft-c1", "deal-47", "Replied", 2, "2026-09-05", "2026-09-08"],
      ["airbnb-c1", "deal-89", "Active", 1, "2026-09-14", "2026-09-14"],
      ["google-c1", "deal-59", "Unsubscribed", 2, "2026-09-06", "2026-09-09"],
      ["hubspot-c1", "deal-129", "Finished", 3, "2026-08-31", "2026-09-07"],
    ]),
  },
  {
    id: "re-engage-stalled-deals",
    name: "Re-engage stalled deals",
    owner: "Nia Jameson",
    status: "Paused",
    createdAt: "2026-07-21",
    steps: steps("re-engage-stalled-deals", [
      [
        0,
        "Email",
        "Still a priority this quarter?",
        "A direct check on whether the project is still on the roadmap and who owns it now.",
        11,
        7,
        1,
      ],
      [
        4,
        "LinkedIn task",
        "Engage with a recent post",
        "Comment on something they shared recently before sending a message.",
        9,
        4,
        1,
      ],
      [
        8,
        "Email",
        "What changed since we last spoke",
        "Share two product updates that address the concerns raised last time.",
        5,
        3,
        1,
      ],
      [
        14,
        "Call task",
        "Final call before closing the file",
        "Call to agree on a restart date or close the opportunity out cleanly.",
        1,
        1,
        0,
      ],
    ]),
    enrollments: enrollments("re-engage-stalled-deals", [
      ["lvmh-c3", "deal-41", "Active", 2, "2026-08-30", "2026-09-03"],
      ["disney-c3", "deal-66", "Active", 3, "2026-08-25", "2026-09-02"],
      ["apple-c5", "deal-83", "Active", 1, "2026-09-02", "2026-09-02"],
      ["microsoft-c5", "deal-47", "Finished", 4, "2026-08-12", "2026-08-26"],
      ["airbnb-c5", "", "Replied", 3, "2026-08-18", "2026-08-26"],
      ["intercom-c3", "deal-122", "Active", 2, "2026-09-01", "2026-09-05"],
      ["attio-c3", "deal-133", "Bounced", 1, "2026-08-20", "2026-08-20"],
      ["google-c5", "deal-59", "Meeting booked", 3, "2026-08-17", "2026-08-25"],
      ["netflix-c5", "deal-70", "Unsubscribed", 2, "2026-08-22", "2026-08-26"],
      ["spotify-c5", "deal-104", "Active", 3, "2026-08-27", "2026-09-04"],
      ["shopify-c4", "deal-108", "Replied", 2, "2026-08-24", "2026-08-28"],
    ]),
  },
  {
    id: "renewal-check-in",
    name: "Renewal check-in",
    owner: "Alex Santos",
    status: "Active",
    createdAt: "2026-04-14",
    steps: steps("renewal-check-in", [
      [
        0,
        "Email",
        "Planning your renewal early",
        "Share usage highlights and ask who should be part of the renewal conversation.",
        8,
        6,
        1,
      ],
      [
        7,
        "Call task",
        "Renewal planning call",
        "Walk through adoption, open requests and any changes to the team.",
        5,
        3,
        1,
      ],
      [
        14,
        "Email",
        "Your renewal options",
        "Outline the renewal terms and the expansion options that fit their usage.",
        3,
        2,
        1,
      ],
      [
        21,
        "Email",
        "Locking in your renewal date",
        "Confirm the date, the signer and the paperwork needed.",
        1,
        1,
        0,
      ],
    ]),
    enrollments: enrollments("renewal-check-in", [
      ["stripe-c1", "deal-98", "Active", 2, "2026-09-07", "2026-09-14"],
      ["slack-c1", "deal-119", "Active", 1, "2026-09-13", "2026-09-13"],
      ["zoom-c1", "deal-112", "Meeting booked", 2, "2026-09-01", "2026-09-08"],
      ["hubspot-c1", "deal-127", "Finished", 4, "2026-08-17", "2026-09-07"],
      ["shopify-c1", "deal-107", "Replied", 3, "2026-08-24", "2026-09-07"],
      ["snowflake-c1", "deal-75", "Active", 3, "2026-08-31", "2026-09-14"],
      ["intercom-c1", "deal-123", "Bounced", 1, "2026-09-02", "2026-09-02"],
      ["attio-c1", "deal-132", "Replied", 1, "2026-09-12", "2026-09-12"],
    ]),
  },
  {
    id: "champion-onboarding",
    name: "Champion onboarding",
    owner: "Mark Darnalds",
    status: "Active",
    createdAt: "2026-05-05",
    steps: steps("champion-onboarding", [
      [
        0,
        "Email",
        "Welcome, and what to expect",
        "Introduce the team, the plan for the next month and the first thing we need from you.",
        12,
        9,
        1,
      ],
      [
        1,
        "LinkedIn task",
        "Connect and say hello",
        "Send a connection request that mentions the shared project.",
        9,
        5,
        1,
      ],
      [
        3,
        "Email",
        "Building your internal case",
        "A short template for the business case, with the numbers already filled in.",
        8,
        6,
        1,
      ],
      [
        6,
        "Call task",
        "Working session on the business case",
        "Book 30 minutes to refine the case and agree who else to bring in.",
        5,
        3,
        0,
      ],
      [
        10,
        "Email",
        "Sharing this with your decision maker",
        "A one-page summary written to be forwarded to the person who signs.",
        4,
        3,
        0,
      ],
      [
        14,
        "Email",
        "Two weeks in, how is it going?",
        "Check progress, collect feedback and line up the next milestone.",
        2,
        2,
        0,
      ],
    ]),
    enrollments: enrollments("champion-onboarding", [
      ["lvmh-c3", "deal-38", "Active", 4, "2026-09-08", "2026-09-14"],
      ["disney-c3", "deal-64", "Active", 2, "2026-09-13", "2026-09-14"],
      ["paypal-c3", "deal-93", "Replied", 3, "2026-09-05", "2026-09-08"],
      [
        "united-airlines-c3",
        "deal-52",
        "Meeting booked",
        5,
        "2026-08-30",
        "2026-09-09",
      ],
      ["apple-c3", "deal-81", "Finished", 6, "2026-08-25", "2026-09-08"],
      ["microsoft-c3", "deal-48", "Active", 5, "2026-09-04", "2026-09-14"],
      ["airbnb-c3", "deal-35", "Replied", 1, "2026-09-10", "2026-09-10"],
      ["google-c3", "deal-19", "Active", 3, "2026-09-11", "2026-09-14"],
      ["netflix-c3", "deal-71", "Unsubscribed", 3, "2026-09-02", "2026-09-05"],
      ["spotify-c3", "deal-103", "Active", 1, "2026-09-14", "2026-09-14"],
      ["hubspot-c3", "deal-128", "Finished", 6, "2026-08-24", "2026-09-07"],
      ["stripe-c3", "deal-97", "Bounced", 1, "2026-09-06", "2026-09-06"],
    ]),
  },
  {
    id: "event-follow-up",
    name: "Event follow-up",
    owner: "Drew Nash",
    status: "Active",
    createdAt: "2026-08-19",
    steps: steps("event-follow-up", [
      [
        0,
        "Email",
        "Great to meet you at the summit",
        "Thank them for stopping by the booth and recap the one thing they asked about.",
        16,
        11,
        2,
      ],
      [
        2,
        "LinkedIn task",
        "Connect with a note from the event",
        "Reference something from the conversation so the request does not read as a template.",
        12,
        7,
        2,
      ],
      [
        6,
        "Email",
        "Worth a deeper conversation?",
        "Suggest a 20-minute call and include two times that work this week.",
        7,
        5,
        1,
      ],
    ]),
    enrollments: enrollments("event-follow-up", [
      ["lvmh-c1", "deal-40", "Finished", 3, "2026-09-02", "2026-09-08"],
      ["lvmh-c6", "", "Unsubscribed", 1, "2026-09-03", "2026-09-03"],
      ["disney-c6", "deal-63", "Active", 2, "2026-09-12", "2026-09-14"],
      ["paypal-c4", "", "Active", 3, "2026-09-07", "2026-09-13"],
      ["united-airlines-c5", "", "Finished", 3, "2026-09-01", "2026-09-07"],
      ["apple-c4", "", "Replied", 2, "2026-09-09", "2026-09-11"],
      ["microsoft-c4", "", "Active", 1, "2026-09-14", "2026-09-14"],
      ["airbnb-c6", "", "Bounced", 1, "2026-09-08", "2026-09-08"],
      [
        "intercom-c6",
        "deal-123",
        "Meeting booked",
        3,
        "2026-09-04",
        "2026-09-10",
      ],
      ["attio-c4", "deal-18", "Active", 2, "2026-09-10", "2026-09-12"],
      ["google-c6", "", "Replied", 1, "2026-09-10", "2026-09-10"],
      ["netflix-c6", "deal-37", "Finished", 3, "2026-08-29", "2026-09-04"],
      ["spotify-c6", "deal-102", "Active", 2, "2026-09-11", "2026-09-13"],
      ["shopify-c7", "deal-108", "Active", 3, "2026-09-08", "2026-09-14"],
      ["zoom-c6", "deal-112", "Replied", 3, "2026-09-04", "2026-09-10"],
      ["slack-c4", "deal-117", "Meeting booked", 2, "2026-09-06", "2026-09-08"],
    ]),
  },
  {
    id: "inbound-fast-lane",
    name: "Inbound fast lane",
    owner: "Lina Wong",
    status: "Draft",
    createdAt: "2026-09-10",
    steps: steps("inbound-fast-lane", [
      [
        0,
        "Email",
        "Thanks for reaching out",
        "Confirm we got the request and offer two times for a first call.",
        0,
        0,
        0,
      ],
      [
        1,
        "Call task",
        "Call within 24 hours",
        "Call the lead the next business day and log the outcome on the deal.",
        0,
        0,
        0,
      ],
      [
        3,
        "Email",
        "Still want a walkthrough?",
        "A friendly nudge with a link to book a time directly.",
        0,
        0,
        0,
      ],
    ]),
    enrollments: [],
  },
];
