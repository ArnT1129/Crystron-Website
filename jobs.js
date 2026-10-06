/*
  Crystron careers — job postings shown at crystronmat.com/#careers

  To post a role: copy the example below, fill it in, and set `open: true`.
  To take a role down: set `open: false` (or delete it).
  Each role gets its own shareable link: crystronmat.com/#careers/<id>

  Fields
    id                lowercase-with-dashes, unique; used in the role's link
    open              true = listed on the site, false = hidden
    title, team, location, type    shown on the role card
    posted            "YYYY-MM-DD"
    summary           one or two sentences for the careers page list
    compensation      optional, e.g. "$110,000 – $135,000 + equity"
    description       optional list of paragraphs shown when the role is opened
    responsibilities, qualifications, niceToHave   optional bullet lists

  Applications are emailed (with the resume attached) to the addresses in the
  CAREERS_TO environment variable on Vercel — see api/apply.mjs.
*/
window.CRYSTRON_JOBS = [
  {
    // SAMPLE POSTING for previewing the page. Before this goes live on crystronmat.com,
    // replace it with a real role or set `open: false`.
    id: "sample-process-engineer",
    open: true,
    title: "Process Engineer, Cathode Materials",
    team: "Engineering",
    location: "Wilmington, DE",
    type: "Full-time",
    posted: "2026-10-06",
    summary:
      "Help take Crystron's cathode synthesis process from the bench to pilot scale, and shape how our material gets made.",
    compensation: "$100,000 – $130,000 + equity",
    description: [
      "You'll work with our R&D team in Wilmington to turn lab-scale synthesis into a repeatable pilot process, partnering closely with our materials scientists.",
      "This is a hands-on role: you'll design experiments, run equipment, and write the process documentation that future production will follow.",
    ],
    responsibilities: [
      "Design and run scale-up experiments for cathode active material synthesis",
      "Build process documentation, SOPs, and data tracking for pilot runs",
      "Connect process changes to material performance with the characterization team",
    ],
    qualifications: [
      "B.S. or M.S. in Chemical Engineering, Materials Science, or a related field",
      "2+ years of experience in process development or scale-up",
      "Comfortable working hands-on in a lab and on pilot equipment",
    ],
    niceToHave: ["Experience with battery materials or powder processing"],
  },
];
