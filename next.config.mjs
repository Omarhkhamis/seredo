import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: projectRoot,
  },
  async redirects() {
    return [
      {
        source: "/exhibitor.html",
        destination: "/exhibitors",
        permanent: true,
      },
      {
        source: "/visitors.html",
        destination: "/visitors",
        permanent: true,
      },
      {
        source: "/visitor.html",
        destination: "/visitors",
        permanent: true,
      },
      {
        source: "/sponsors.html",
        destination: "/sponsors",
        permanent: true,
      },
      {
        source: "/media.html",
        destination: "/media",
        permanent: true,
      },
      {
        source: "/سياسة-الخصوصية",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9",
        destination: "/privacy",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "seredoexpo.sa",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
    ],
  },
};

export default nextConfig;
