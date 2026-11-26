export type Language = "id" | "en";

export interface BilingualText {
  id: string;
  en: string;
}

export interface ProjectItem {
  id: string;
  number: string;
  category: BilingualText;
  title: string;
  subtitle: BilingualText;
  description: BilingualText;
  tags: string[];
  image?: string;
  liveDemoUrl: string;
  githubUrl: string;
}

export interface GalleryItem {
  id: string;
  title: BilingualText;
  category: BilingualText;
  description: BilingualText;
  image: string;
  width: number;
  height: number;
}

export const PORTFOLIO_DATA = {
  brand: "RAIGA",
  cvUrl: "/cv/CV_Gayuh_Raiguna.pdf",
  navLinks: [
    { label: { id: "Proyek", en: "Projects" }, href: "#projects" },
    { label: { id: "Galeri", en: "Gallery" }, href: "#gallery" },
    { label: { id: "Tentang", en: "About" }, href: "#about" },
    { label: { id: "Kontak", en: "Contact" }, href: "#contact" },
  ],
  hero: {
    status: {
      id: "Tersedia untuk Proyek Baru",
      en: "Available for New Projects",
    },
    headline: {
      id: "Membangun Aplikasi Web yang Rapi, Cepat, dan Siap Pakai.",
      en: "Building Clean, Fast, and Production-Ready Web Applications.",
    },
    subheadline: {
      id: "Full-Stack Web Developer yang merancang sistem web fungsional—mulai dari aplikasi pembukuan bisnis hingga platform belajar interaktif.",
      en: "Full-Stack Web Developer crafting functional web systems—from business bookkeeping applications to interactive learning platforms.",
    },
    primaryCta: {
      label: { id: "Lihat Proyek", en: "View Projects" },
      href: "#projects",
    },
    secondaryCta: {
      label: { id: "Hubungi Saya", en: "Contact Me" },
      href: "#contact",
    },
    cvCta: {
      label: { id: "Download CV", en: "Download CV" },
    },
  },
  projectsSection: {
    eyebrow: {
      id: "01 / Portofolio Terpilih",
      en: "01 / Featured Portfolio",
    },
    title: {
      id: "Proyek Terpilih",
      en: "Selected Projects",
    },
    subtitle: {
      id: "Sistem web fungsional yang dibangun dengan fokus pada kejelasan arsitektur, kecepatan, dan pengalaman pengguna.",
      en: "Functional web systems engineered with a focus on clean architecture, speed, and seamless user experience.",
    },
    liveDemoLabel: {
      id: "Lihat Demo",
      en: "Live Demo",
    },
    githubLabel: {
      id: "Kode Sumber",
      en: "Source Code",
    },
  },
  projects: [
    {
      id: "labaku",
      number: "01",
      category: {
        id: "Aplikasi Web",
        en: "Web Application",
      },
      title: "LabaKu",
      subtitle: {
        id: "Aplikasi Web Keuangan & Pembukuan UMKM",
        en: "Financial & Bookkeeping Web Application",
      },
      description: {
        id: "Aplikasi pembukuan dan pelacakan arus kas berbasis web untuk UMKM agar pengelolaan pemasukan dan profit lebih praktis.",
        en: "A web-based bookkeeping and cash-flow tracking app tailored for small businesses to manage revenue and profit effortlessly.",
      },
      tags: ["Laravel", "MySQL", "Tailwind CSS"],
      image: "/images/projects/project-4.webp",
      liveDemoUrl: "https://finora.gt.tc/",
      githubUrl: "https://github.com/raiga7740",
    },
    {
      id: "jplearn",
      number: "02",
      category: {
        id: "Platform Edukasi",
        en: "Educational Platform",
      },
      title: "JPLearn",
      subtitle: {
        id: "Platform Belajar Bahasa Jepang Interaktif",
        en: "Interactive Japanese Language Learning Platform",
      },
      description: {
        id: "Platform belajar bahasa Jepang interaktif dengan flashcard SRS, sistem XP/streak, dan audio pelafalan otomatis.",
        en: "An interactive Japanese learning platform featuring spaced-repetition (SRS) flashcards, XP/streak progression, and automated pronunciation audio.",
      },
      tags: ["Laravel", "JavaScript", "Web Speech API"],
      image: "/images/projects/jplearn.webp",
      liveDemoUrl: "https://jplearn.ct.ws/",
      githubUrl: "https://github.com/raiga7740",
    },
    {
      id: "saung-sunda",
      number: "03",
      category: {
        id: "Web Kuliner & Hospitaliti",
        en: "Culinary & Hospitality Web",
      },
      title: "Saung Sunda",
      subtitle: {
        id: "Website Profil & Reservasi Restoran Sunda",
        en: "Traditional Sundanese Restaurant & Reservation Web",
      },
      description: {
        id: "Website profil dan katalog menu restoran Sunda dengan tata letak hangat, informasi paket keluarga, dan navigasi reservasi yang responsif.",
        en: "A restaurant profile and menu showcase for Sundanese cuisine featuring a warm layout, family dining packages, and responsive reservation navigation.",
      },
      tags: ["HTML5", "Tailwind CSS", "JavaScript"],
      image: "/images/projects/saungsunda.webp",
      liveDemoUrl: "https://saungsunda.gt.tc/",
      githubUrl: "https://github.com/raiga7740",
    },
    {
      id: "slekbew",
      number: "04",
      category: {
        id: "Pengalaman Web Komunitas",
        en: "Community Web Experience",
      },
      title: "Slekbew",
      subtitle: {
        id: "Landing Page Komunitas & Tongkrongan Digital",
        en: "Late-Night Digital Hangout & Community Landing Page",
      },
      description: {
        id: "Landing page komunitas digital modern dengan atmosfer interaktif untuk berkumpul, mengobrol santai, dan menghubungkan anggota baru.",
        en: "A modern digital community landing page crafted with an interactive atmosphere for hanging out, casual conversations, and onboarding new members.",
      },
      tags: ["JavaScript", "Tailwind CSS", "UI/UX Design"],
      image: "/images/projects/slekbew.webp",
      liveDemoUrl: "https://www.4kslebew.my.id/",
      githubUrl: "https://github.com/raiga7740",
    },
    {
      id: "discord-community-hub",
      number: "05",
      category: {
        id: "Portal Real-Time",
        en: "Real-Time Portal",
      },
      title: "Discord Community Hub",
      subtitle: {
        id: "Manajemen Anggota & Komunitas Real-Time",
        en: "Real-Time Community & Member Management",
      },
      description: {
        id: "Website komunitas yang terintegrasi dengan bot Node.js untuk menampilkan daftar anggota dan hierarki role secara real-time.",
        en: "A community portal integrated with a Node.js bot to display live member directories and server role hierarchies in real time.",
      },
      tags: ["Node.js", "JavaScript", "Discord API"],
      liveDemoUrl: "https://github.com/raiga7740",
      githubUrl: "https://github.com/raiga7740",
    },
  ] satisfies ProjectItem[],
  gallerySection: {
    eyebrow: {
      id: "02 / Pameran Karya Visual",
      en: "02 / Visual Exhibition",
    },
    title: {
      id: "Galeri Visual & Desain",
      en: "Visual & Design Gallery",
    },
    subtitle: {
      id: "Eksplorasi desain poster, ilustrasi karakter, dan materi visual promosi dalam ruang pameran 3D interaktif.",
      en: "An interactive 3D exhibition showcasing poster designs, character illustrations, and promotional visual artworks.",
    },
    interactionHint: {
      id: "Geser untuk menjelajah karya",
      en: "Drag to explore artworks",
    },
    loadingLabel: {
      id: "Memuat Galeri 3D...",
      en: "Loading 3D Gallery...",
    },
    previewLabel: {
      id: "Perbesar",
      en: "Preview",
    },
    prevAria: {
      id: "Karya sebelumnya",
      en: "Previous artwork",
    },
    nextAria: {
      id: "Karya berikutnya",
      en: "Next artwork",
    },
    closeLightboxLabel: {
      id: "Tutup",
      en: "Close",
    },
    closeLightboxAria: {
      id: "Tutup pratinjau",
      en: "Close preview",
    },
  },
  galleryItems: [
    {
      id: "poster-musik",
      title: {
        id: "Sistem Promosi & Poster Musik Event",
        en: "Music Event Promotional Poster",
      },
      category: {
        id: "Desain Poster",
        en: "Poster Design",
      },
      description: {
        id: "Perancangan poster promosi event musik dengan tipografi dinamis, perpaduan warna atraktif, dan hierarki informasi terstruktur.",
        en: "Promotional music event poster built with dynamic typography, bold color harmony, and clear visual hierarchy.",
      },
      image: "/images/gallery/poster-musik.webp",
      width: 1200,
      height: 1697,
    },
    {
      id: "wuthering-waves-changli",
      title: {
        id: "Visual Artwork — Changli",
        en: "Visual Artwork — Changli",
      },
      category: {
        id: "Seni Visual",
        en: "Visual Art",
      },
      description: {
        id: "Eksplorasi komposisi grafis karakter game Changli dengan harmonisasi warna hangat, framing sinematik, dan estetika tipografi.",
        en: "Graphic composition study of game character Changli featuring warm color grading, cinematic framing, and typographic accents.",
      },
      image: "/images/gallery/wuthering-waves-changli.webp",
      width: 1080,
      height: 1350,
    },
    {
      id: "ive",
      title: {
        id: "Ilustrasi Karakter & Tipografi — Ive",
        en: "Character Illustration & Typography — Ive",
      },
      category: {
        id: "Ilustrasi",
        en: "Illustration",
      },
      description: {
        id: "Eksplorasi artwork karakter dengan sentuhan warna lembut, integrasi elemen tipografi modern, dan mood visual yang tenang.",
        en: "Character artwork exploration combining soft palettes, modern editorial typography, and a calm visual mood.",
      },
      image: "/images/gallery/ive.webp",
      width: 1080,
      height: 1350,
    },
    {
      id: "artboard-2",
      title: {
        id: "Katalog Konten & Media Sosial Gaming",
        en: "Gaming Social Media Content Catalog",
      },
      category: {
        id: "Desain Media Sosial",
        en: "Social Media Design",
      },
      description: {
        id: "Desain feed promosi media sosial untuk layanan gaming dengan palet kontras modern dan Call-To-Action yang jelas.",
        en: "Social media promotional feed design for gaming services using high-contrast modern palettes and clear calls to action.",
      },
      image: "/images/gallery/artboard-2.webp",
      width: 1090,
      height: 1352,
    },
    {
      id: "final-1",
      title: {
        id: "Seri Poster Komersial Otomotif",
        en: "Automotive Commercial Poster Series",
      },
      category: {
        id: "Desain Poster",
        en: "Poster Design",
      },
      description: {
        id: "Karya poster komersial otomotif dengan lighting effects dinamis, tekstur aspal realistis, dan ketelitian detail kendaraan.",
        en: "Commercial automotive poster featuring dynamic lighting effects, realistic asphalt textures, and crisp vehicle detailing.",
      },
      image: "/images/gallery/final-1.webp",
      width: 1080,
      height: 1350,
    },
    {
      id: "final-2",
      title: {
        id: "Thumbnail YouTube Otomotif — Vol. 01",
        en: "Automotive YouTube Thumbnail — Vol. 01",
      },
      category: {
        id: "Desain Thumbnail",
        en: "Thumbnail Design",
      },
      description: {
        id: "Desain cover video dengan rasio kontras tinggi, ekspresi subjek menonjol, dan tipografi punchy untuk memaksimalkan CTR.",
        en: "High-contrast video cover design with prominent subject framing and punchy typography crafted to maximize click-through rate.",
      },
      image: "/images/gallery/final-2.webp",
      width: 1200,
      height: 675,
    },
    {
      id: "final-3",
      title: {
        id: "Thumbnail YouTube Otomotif — Vol. 02",
        en: "Automotive YouTube Thumbnail — Vol. 02",
      },
      category: {
        id: "Desain Thumbnail",
        en: "Thumbnail Design",
      },
      description: {
        id: "Kelanjutan seri thumbnail video otomotif dengan penataan visual aksi berkendara dan color grading sinematik.",
        en: "Follow-up automotive video thumbnail series highlighting driving action composition and cinematic color grading.",
      },
      image: "/images/gallery/final-3.webp",
      width: 1200,
      height: 675,
    },
    {
      id: "artwork-2",
      title: {
        id: "Banner Promosi Layanan Gaming",
        en: "Gaming Service Promotional Banner",
      },
      category: {
        id: "Desain Media Sosial",
        en: "Social Media Design",
      },
      description: {
        id: "Materi promosi komersial untuk layanan game dengan penyampaian daftar harga, benefit, dan struktur visual yang ringkas.",
        en: "Commercial promotional banner for gaming services presenting pricing tiers, key benefits, and a clean visual structure.",
      },
      image: "/images/gallery/artwork-2.webp",
      width: 1200,
      height: 675,
    },
  ] satisfies GalleryItem[],
  about: {
    eyebrow: {
      id: "03 / Tentang Saya",
      en: "03 / About Me",
    },
    title: {
      id: "Pendekatan Praktis untuk Solusi Digital.",
      en: "A Practical Approach to Digital Solutions.",
    },
    bio: {
      id: "Saya Raiga, Full-Stack Web Developer yang membangun aplikasi web dari nol hingga siap produksi. Fokus pada struktur kode yang rapi, performa ringan, dan antarmuka yang mudah digunakan.",
      en: "I'm Raiga, a Full-Stack Web Developer building web applications from the ground up to production. I focus on clean code architecture, lightweight performance, and intuitive user interfaces.",
    },
    stackTitle: {
      id: "Keahlian & Tech Stack",
      en: "Skills & Tech Stack",
    },
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
    cvLabel: {
      id: "Download CV",
      en: "Download CV",
    },
  },
  contact: {
    eyebrow: {
      id: "04 / Kontak",
      en: "04 / Contact",
    },
    headline: {
      id: "Punya ide proyek atau butuh aplikasi web untuk bisnismu?",
      en: "Have a project in mind or need a web app for your business?",
    },
    subtext: {
      id: "Terbuka untuk proyek freelance, pembuatan MVP, maupun kolaborasi pengembangan web.",
      en: "Open for freelance projects, MVP development, and web engineering collaborations.",
    },
    primaryButton: {
      label: {
        id: "Kirim Email",
        en: "Send Email",
      },
      href: "mailto:gayuhraiiguna@gmail.com",
    },
    socials: [
      { label: "GitHub", href: "https://github.com/raiga7740" },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/gayuh-raiguna-0a2a112aa/",
      },
    ],
  },
  footer: {
    id: "© 2026 Raiga. Dibangun dengan Next.js & Three.js.",
    en: "© 2026 Raiga. Built with Next.js & Three.js.",
  },
} as const;
