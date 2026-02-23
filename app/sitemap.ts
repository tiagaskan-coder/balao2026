import type { MetadataRoute } from "next";

const BASE_URL = "https://www.balao.info";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/pcgamer",
    "/seminovos",
    "/envio-e-entrega",
    "/como-comprar",
    "/seguranca-e-privacidade",
    "/trocas-e-devolucoes",
    "/sobre-nos",
    "/sobre-a-empresa",
    "/fale-conosco",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  return staticPages;
}

