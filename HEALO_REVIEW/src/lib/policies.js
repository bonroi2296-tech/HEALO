export const EFFECTIVE_DATE = "2026-01-24";

export const PRIVACY_SECTIONS = [
  {
    title: "Introduction",
    content: [
      "HEALO is an AI medical concierge platform that helps global patients find and connect with medical providers in Korea. We are not a medical institution and do not provide diagnosis or treatment.",
      "This Privacy Policy explains what information we collect, how we use it, and the choices you have.",
    ],
  },
  {
    title: "Information We Collect",
    content: [
      "We collect information you provide directly, such as your name, email, and contact details.",
      "If you choose to request concierge support, we may collect health-related information you voluntarily provide (e.g., symptoms, desired procedures, or records) for matching purposes.",
      "We may collect technical information such as device and usage data to improve service reliability.",
    ],
  },
  {
    title: "How We Use Information",
    content: [
      "To deliver concierge services, respond to inquiries, and match you with suitable medical providers.",
      "To communicate with you about your requests and service updates.",
      "To improve platform performance, safety, and user experience.",
    ],
  },
  {
    title: "Sharing of Information",
    content: [
      "We share personal and medical information only with your consent and only with medical providers relevant to your request.",
      "We do not sell personal information to third parties.",
      "We may share information with service providers that help us operate the platform (e.g., hosting or email delivery), under confidentiality obligations.",
    ],
  },
  {
    title: "Data Retention",
    content: [
      "We retain information only as long as necessary to provide services or meet legal obligations.",
      "You may request deletion of your account and related data, subject to legal requirements.",
    ],
  },
  {
    title: "Data Security",
    content: [
      "We apply industry-standard safeguards to protect data against unauthorized access, loss, or misuse.",
      "No system is completely secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "User Rights",
    content: [
      "You may request access to, correction of, or deletion of your personal information.",
      "You may withdraw consent for data sharing at any time, which may limit our ability to provide concierge services.",
    ],
  },
  {
    title: "Contact Information",
    content: [
      "If you have any questions about this Privacy Policy or your data, contact us at contact@healo.com.",
    ],
  },
];

export const TERMS_SECTIONS = [
  {
    title: "Service Description",
    content: [
      "HEALO provides an AI medical concierge service that helps users explore medical options and connect with medical providers. HEALO is not a medical institution.",
      "We do not provide medical diagnosis, treatment, or medical advice.",
    ],
  },
  {
    title: "User Responsibilities",
    content: [
      "You agree to provide accurate and up-to-date information when submitting inquiries.",
      "You are responsible for any decisions made based on information provided by medical providers.",
      "You must comply with applicable laws and hospital policies.",
    ],
  },
  {
    title: "Medical Disclaimer",
    content: [
      "HEALO is a platform that facilitates communication between users and medical providers.",
      "Any medical care, diagnosis, or treatment is provided solely by the medical providers, not by HEALO.",
      "You acknowledge that medical outcomes may vary and are not guaranteed by HEALO.",
    ],
  },
  {
    title: "Limitation of Liability",
    content: [
      "HEALO is not responsible for medical outcomes, side effects, or malpractice by medical providers.",
      "HEALO is not liable for disputes between users and medical providers.",
      "To the maximum extent permitted by law, HEALO disclaims liability for indirect or consequential damages.",
    ],
  },
  {
    title: "Intellectual Property",
    content: [
      "All content, branding, and software on the HEALO platform are owned by HEALO or its licensors.",
      "You may not copy, modify, or distribute our content without permission.",
    ],
  },
  {
    title: "Termination",
    content: [
      "We may suspend or terminate access to the platform if you violate these terms or misuse the service.",
      "You may discontinue use of the platform at any time.",
    ],
  },
  {
    title: "Governing Law",
    content: [
      "These terms are governed by the laws of the Republic of Korea.",
      "Any disputes shall be resolved in the Seoul Central District Court.",
    ],
  },
  {
    title: "Contact Information",
    content: [
      "If you have questions about these Terms, contact us at contact@healo.com.",
    ],
  },
];

const buildPolicyText = (sections) => {
  const lines = [`Last Updated: ${EFFECTIVE_DATE}`, ""];

  sections.forEach((section) => {
    lines.push(section.title);
    section.content.forEach((paragraph) => {
      lines.push(paragraph);
    });
    lines.push("");
  });

  return lines.join("\n").trim();
};

export const PRIVACY_POLICY = buildPolicyText(PRIVACY_SECTIONS);
export const TERMS_OF_SERVICE = buildPolicyText(TERMS_SECTIONS);
