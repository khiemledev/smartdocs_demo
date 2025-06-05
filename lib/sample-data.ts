export const sampleFiles = [
  {
    name: "Administrative Order #001.pdf",
    path: "/samples/administrative-order-001.pdf",
    description: "Official administrative order regarding new policies",
    size: "245 KB",
    pages: 3,
  },
  {
    name: "Meeting Minutes - Board.pdf",
    path: "/samples/meeting-minutes-board.pdf",
    description: "Board meeting minutes from quarterly review",
    size: "189 KB",
    pages: 5,
  },
  {
    name: "Policy Document v2.1.pdf",
    path: "/samples/policy-document-v2.pdf",
    description: "Updated organizational policy document",
    size: "312 KB",
    pages: 8,
  },
  {
    name: "Budget Report Q3.pdf",
    path: "/samples/budget-report-q3.pdf",
    description: "Third quarter financial budget report",
    size: "156 KB",
    pages: 4,
  },
  {
    name: "Staff Memo - Updates.pdf",
    path: "/samples/staff-memo-updates.pdf",
    description: "Internal staff communication memo",
    size: "98 KB",
    pages: 2,
  },
  {
    name: "Project Proposal Draft.pdf",
    path: "/samples/project-proposal-draft.pdf",
    description: "Draft proposal for new project initiative",
    size: "278 KB",
    pages: 6,
  },
]

export const extractionResults = {
  "Issuing Authority": "Ministry of Education",
  "Document Number": "MOE-2024-001",
  "Date of Issue": "March 15, 2024",
  "Document Type": "Administrative Order",
  Summary: "Guidelines for implementing new educational standards across all institutions",
  "Signatory's Position": "Director General",
  "Signatory Name": "Dr. Sarah Johnson",
  Recipients: "All Educational Institutions",
  "Confidentiality Level": "Public",
  "Urgency Level": "Medium",
}

export type SampleFile = typeof sampleFiles[0] 