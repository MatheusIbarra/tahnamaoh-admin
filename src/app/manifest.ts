import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TáhNaMão Admin",
    short_name: "Admin",
    description: "Painel administrativo TáhNaMão",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF7F2",
    theme_color: "#FF5A36",
    orientation: "any",
    icons: [
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
