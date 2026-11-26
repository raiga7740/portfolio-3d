export interface ProjectItem {
  id: string;
  number: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  image?: string;
  liveDemoUrl: string;
  githubUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  width: number;
  height: number;
}

export const PORTFOLIO_DATA = {
  brand: "RAIGA",
  cvUrl: "/cv/CV_Gayuh_Raiguna.pdf",
  navLinks: [
    { label: "Projects", href: "#projects" },
    { label: "Gallery", href: "#gallery" },
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
    cvCta: {
      label: "Download CV",
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
      image: "/images/projects/project-4.webp",
      liveDemoUrl: "https://finora.gt.tc/",
      githubUrl: "https://github.com/raiga7740",
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
      image: "/images/projects/jplearn.webp",
      liveDemoUrl: "https://jplearn.ct.ws/",
      githubUrl: "https://github.com/raiga7740",
    },
    {
      id: "saung-sunda",
      number: "03",
      category: "Culinary & Hospitality Web",
      title: "Saung Sunda",
      subtitle: "Traditional Sundanese Restaurant & Reservation Web",
      description:
        "Website profil dan katalog menu restoran Sunda dengan tata letak hangat, informasi paket keluarga, dan navigasi reservasi yang responsif.",
      tags: ["HTML5", "Tailwind CSS", "JavaScript"],
      image: "/images/projects/saungsunda.webp",
      liveDemoUrl: "https://saungsunda.gt.tc/",
      githubUrl: "https://github.com/raiga7740",
    },
    {
      id: "slekbew",
      number: "04",
      category: "Community Web Experience",
      title: "Slekbew",
      subtitle: "Late-Night Digital Hangout & Community Landing Page",
      description:
        "Landing page komunitas digital modern dengan atmosfer interaktif untuk berkumpul, mengobrol santai, dan menghubungkan anggota baru.",
      tags: ["JavaScript", "Tailwind CSS", "UI/UX Design"],
      image: "/images/projects/slekbew.webp",
      liveDemoUrl: "https://www.4kslebew.my.id/",
      githubUrl: "https://github.com/raiga7740",
    },
    {
      id: "discord-community-hub",
      number: "05",
      category: "Real-Time Portal",
      title: "Discord Community Hub",
      subtitle: "Real-time Community & Member Management",
      description:
        "Website komunitas yang terintegrasi dengan bot Node.js untuk menampilkan daftar anggota dan hierarki role secara real-time.",
      tags: ["Node.js", "JavaScript", "Discord API"],
      liveDemoUrl: "https://github.com/raiga7740",
      githubUrl: "https://github.com/raiga7740",
    },
  ] satisfies ProjectItem[],
  gallerySection: {
    eyebrow: "02 / Pameran Karya Visual",
    title: "Visual & Design Gallery",
    subtitle:
      "Eksplorasi desain poster, ilustrasi karakter, dan materi visual promosi dalam ruang pameran 3D interaktif.",
  },
  galleryItems: [
    {
      id: "poster-musik",
      title: "Sistem Promosi & Poster Musik Event",
      category: "Poster Design",
      description:
        "Perancangan poster promosi event musik dengan tipografi dinamis, perpaduan warna atraktif, dan hierarki informasi terstruktur.",
      image: "/images/gallery/poster-musik.webp",
      width: 1200,
      height: 1697,
    },
    {
      id: "wuthering-waves-changli",
      title: "Visual Artwork — Changli",
      category: "Visual Art",
      description:
        "Eksplorasi komposisi grafis karakter game Changli dengan harmonisasi warna hangat, framing sinematik, dan estetika tipografi.",
      image: "/images/gallery/wuthering-waves-changli.webp",
      width: 1080,
      height: 1350,
    },
    {
      id: "ive",
      title: "Character Illustration & Typography — Ive",
      category: "Illustration",
      description:
        "Eksplorasi artwork karakter dengan sentuhan warna lembut, integrasi elemen tipografi modern, dan mood visual yang tenang.",
      image: "/images/gallery/ive.webp",
      width: 1080,
      height: 1350,
    },
    {
      id: "artboard-2",
      title: "Katalog Konten & Media Sosial Gaming",
      category: "Social Media Design",
      description:
        "Desain feed promosi media sosial untuk layanan gaming dengan palet kontras modern dan Call-To-Action yang jelas.",
      image: "/images/gallery/artboard-2.webp",
      width: 1090,
      height: 1352,
    },
    {
      id: "final-1",
      title: "Automotive Commercial Poster Series",
      category: "Poster Design",
      description:
        "Karya poster komersial otomotif dengan lighting effects dinamis, tekstur aspal realistis, dan ketelitian detail kendaraan.",
      image: "/images/gallery/final-1.webp",
      width: 1080,
      height: 1350,
    },
    {
      id: "final-2",
      title: "Automotive YouTube Thumbnail — Vol. 01",
      category: "Thumbnail Design",
      description:
        "Desain cover video dengan rasio kontras tinggi, ekspresi subjek menonjol, dan tipografi punchy untuk memaksimalkan CTR.",
      image: "/images/gallery/final-2.webp",
      width: 1200,
      height: 675,
    },
    {
      id: "final-3",
      title: "Automotive YouTube Thumbnail — Vol. 02",
      category: "Thumbnail Design",
      description:
        "Kelanjutan seri thumbnail video otomotif dengan penataan visual aksi berkendara dan color grading sinematik.",
      image: "/images/gallery/final-3.webp",
      width: 1200,
      height: 675,
    },
    {
      id: "artwork-2",
      title: "Gaming Service Promotional Banner",
      category: "Social Media Design",
      description:
        "Materi promosi komersial untuk layanan game dengan penyampaian daftar harga, benefit, dan struktur visual yang ringkas.",
      image: "/images/gallery/artwork-2.webp",
      width: 1200,
      height: 675,
    },
  ] satisfies GalleryItem[],
  about: {
    eyebrow: "03 / Tentang Saya",
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
    cvLabel: "Download CV",
  },
  contact: {
    eyebrow: "04 / Kontak",
    headline: "Punya ide proyek atau butuh aplikasi web untuk bisnismu?",
    subtext:
      "Terbuka untuk proyek freelance, pembuatan MVP, maupun kolaborasi pengembangan web.",
    primaryButton: {
      label: "Kirim Email",
      href: "mailto:gayuhraiiguna@gmail.com",
    },
    socials: [
      { label: "GitHub", href: "https://github.com/raiga7740" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/gayuh-raiguna-0a2a112aa/" },
    ],
  },
  footer: "© 2026 Raiga. Built with Next.js & Three.js.",
} as const;
