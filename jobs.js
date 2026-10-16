/*
  Crystron careers — job postings shown at www.crystrontech.com/#careers

  To post a role: copy a role below, fill it in, and set `open: true`.
  To take a role down: set `open: false` (or delete it).
  Each role gets its own shareable link: www.crystrontech.com/#careers/<id>

  Fields
    id                lowercase-with-dashes, unique; used in the role's link
    open              true = listed on the site, false = hidden
    title, team, location, type    shown on the role card
    posted            "YYYY-MM-DD"
    summary           one or two sentences for the careers page list
    compensation      optional, e.g. "$110,000 – $135,000 + equity"
    description       optional list of paragraphs shown when the role is opened
    responsibilities, qualifications, niceToHave   optional bullet lists
    sections          optional bullet lists with your own headings, shown in order:
                      [{ heading: "What we offer", items: ["...", "..."] }]

  Applications are emailed (with the resume attached) to the addresses in the
  CAREERS_TO environment variable on Vercel — see api/apply.mjs.
*/
window.CRYSTRON_JOBS = [
  {
    id: "laboratory-associate",
    open: true,
    // "Li‑Ion" uses a non-breaking hyphen so the heading never wraps between "Li-" and "Ion".
    title: "Laboratory Associate, Inorganic Materials & Li‑Ion Coin Cells",
    team: "R&D",
    location: "Wilmington, DE",
    type: "Full-time, entry-level",
    posted: "2026-10-15",
    summary:
      "Support hands-on lab work in inorganic material synthesis and lithium-ion coin cell fabrication and testing.",
    description: [
      "We are seeking a Laboratory Associate to support hands-on laboratory activities related to inorganic material synthesis and lithium-ion coin cell fabrication and testing. This role is ideal for professionals interested in materials science, electrochemistry, or battery technology. The position emphasizes careful lab execution, accurate data recording, and strict adherence to safety and standard operating procedures (SOPs).",
      "This role reports to a Senior Scientist.",
    ],
    sections: [
      {
        heading: "Inorganic materials preparation",
        items: [
          "Carry out and report synthesis of inorganic powders and compounds (weighing, mixing, drying, calcination).",
          "Operate basic laboratory equipment including furnaces, ovens, ball mills, mixers, hot plates, and stirrers.",
          "Prepare precursor solutions and solid mixtures according to written protocols.",
          "Label, store, and track raw materials and samples.",
        ],
      },
      {
        heading: "Li-ion coin cell assembly and testing",
        items: [
          "Assist with lithium-ion cell fabrication.",
          "Perform electrode cutting, weighing, stacking, and cell crimping under supervision.",
          "Support electrolyte handling and glovebox operations (training provided).",
          "Conduct basic electrochemical testing such as charge–discharge cycling and capacity measurements.",
          "Record and organize test data accurately.",
        ],
      },
      {
        heading: "Laboratory operations and safety",
        items: [
          "Maintain a clean, organized, and safe laboratory workspace.",
          "Follow SOPs and safety protocols at all times.",
          "Assist with inventory management and consumables restocking.",
          "Maintain lab notebooks or electronic records.",
        ],
      },
      {
        heading: "Required qualifications",
        items: [
          "Bachelor's degree (or in progress) in Chemistry, Materials Science, Chemical Engineering, Physics, or a related field.",
          "Basic laboratory experience through coursework or internships.",
          "Strong attention to detail and ability to follow procedures.",
          "Willingness to learn hands-on laboratory techniques.",
        ],
      },
      {
        heading: "Preferred qualifications",
        items: [
          "Coursework or exposure to inorganic chemistry, electrochemistry, or battery materials.",
          "Familiarity with coin cell assembly, glovebox operation, or electrochemical testing.",
          "Experience in an R&D or pilot-scale lab environment.",
        ],
      },
      {
        heading: "Physical and work requirements",
        items: [
          "Ability to stand for extended periods and work in a laboratory environment.",
          "Ability to lift up to approximately 25 lbs.",
          "Comfortable wearing PPE and handling laboratory chemicals.",
          "Ability to perform repetitive tasks with consistency.",
        ],
      },
      {
        heading: "What we offer",
        items: [
          "Hands-on experience in battery materials and lithium-ion cell testing.",
          "On-the-job training and skill development.",
          "Opportunity for growth into advanced R&D or process roles.",
          "Collaborative, research-driven work environment.",
        ],
      },
    ],
  },
];
