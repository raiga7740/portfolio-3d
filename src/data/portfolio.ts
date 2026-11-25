export interface ProjectItem {
  id: string;
  number: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  liveDemoUrl: string;
  githubUrl: string;
}

export const PORTFOLIO_DATA = {
  brand: "RAIGA",
  navLinks: [
    { label: "Projects", href: "#projects" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    status: "Tersedia untuk Proyek Baru",
    headline: "Membangun Aplikasi Web yang Rapi, Cepat, dan Siap Pakai.",
    subheadline:
      "Full-Stack Web Developer yang merancang sistem web fungsional—mulai dari aplikasi pembukuan bisnis hingga platform belajar interaktif.",
    primaryCta: {
      label: "Lihat Proyek",
      href: "#projects",
    },
    secondaryCta: {
      label: "Hubungi Saya",
      href: "#contact",
    },
  },
  projectsSection: {
    eyebrow: "01 / Portofolio Terpilih",
    title: "Selected Projects",
    subtitle:
      "Sistem web fungsional yang dibangun dengan fokus pada kejelasan arsitektur, kecepatan, dan pengalaman pengguna.",
  },
  projects: [
    {
      id: "labaku",
      number: "01",
      category: "Web Application",
      title: "LabaKu",
      subtitle: "Financial & Bookkeeping Web Application",
      description:
        "Aplikasi pembukuan dan pelacakan arus kas berbasis web untuk UMKM agar pengelolaan pemasukan dan profit lebih praktis.",
      tags: ["Laravel", "MySQL", "Tailwind CSS"],
      liveDemoUrl: "[URL DEMO LABAKU]",
      githubUrl: "[URL REPO LABAKU]",
    },
    {
      id: "jplearn",
      number: "02",
      category: "Educational Platform",
      title: "JPLearn",
      subtitle: "Interactive Japanese Language Learning Platform",
      description:
        "Platform belajar bahasa Jepang interaktif dengan flashcard SRS, sistem XP/streak, dan audio pelafalan otomatis.",
      tags: ["Laravel", "JavaScript", "Web Speech API"],
      liveDemoUrl: "[URL DEMO JPLEARN]",
      githubUrl: "[URL REPO JPLEARN]",
    },
    {
      id: "discord-community-hub",
      number: "03",
      category: "Real-Time Portal",
      title: "Discord Community Hub",
      subtitle: "Real-time Community & Member Management",
      description:
        "Website komunitas yang terintegrasi dengan bot Node.js untuk menampilkan daftar anggota dan hierarki role secara real-time.",
      tags: ["Node.js", "JavaScript", "Discord API"],
      liveDemoUrl: "[URL DEMO DISCORD]",
      githubUrl: "[URL REPO DISCORD]",
    },
  ] satisfies ProjectItem[],
  about: {
    eyebrow: "02 / Tentang Saya",
    title: "Pendekatan Praktis untuk Solusi Digital.",
    bio: "Saya Raiga, Full-Stack Web Developer yang membangun aplikasi web dari nol hingga siap produksi. Fokus pada struktur kode yang rapi, performa ringan, dan antarmuka yang mudah digunakan.",
    stackTitle: "Tech Stack",
    techStack: [
      "Laravel",
      "JavaScript",
      "Node.js",
      "Next.js",
      "Tailwind CSS",
      "MySQL",
      "Three.js",
      "Git",
    ],
  },
  contact: {
    eyebrow: "03 / Kontak",
    headline: "Punya ide proyek atau butuh aplikasi web untuk bisnismu?",
    subtext:
      "Terbuka untuk proyek freelance, pembuatan MVP, maupun kolaborasi pengembangan web.",
    primaryButton: {
      label: "Kirim Email",
      href: "mailto:[EMAIL KAMU]",
    },
    socials: [
      { label: "GitHub", href: "[URL GITHUB]" },
      { label: "LinkedIn", href: "[URL LINKEDIN]" },
    ],
  },
  footer: "© 2026 Raiga. Built with Next.js & Three.js.",
} as const;

