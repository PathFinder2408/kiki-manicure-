interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (data: unknown) => void;
}

export interface PublicBeautyArticle {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
}

const RSS_URL =
  "https://news.google.com/rss/search?q=dermatologia+OR+skincare+OR+manicura+OR+%22spa+de+manos%22&hl=es-419&gl=CL&ceid=CL:es-419";

function decodeEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeEntities(match[1]) : "";
}

/**
 * Obtiene noticias públicas recientes sobre dermatología, cosmetología y spa
 * desde Google News RSS en español, con caché de 1 hora en Vercel Edge.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, items: [] });
  }

  try {
    const response = await fetch(RSS_URL, {
      headers: { "User-Agent": "KikiSpaNewsReader/1.0" },
    });

    if (!response.ok) {
      return res.status(200).json({ ok: false, items: [] });
    }

    const xml = await response.text();
    const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) ?? [];

    const items: PublicBeautyArticle[] = itemMatches.slice(0, 6).map((itemXml) => {
      const rawTitle = extractTag(itemXml, "title");
      const link = extractTag(itemXml, "link");
      const pubDate = extractTag(itemXml, "pubDate");
      const source = extractTag(itemXml, "source") || "Actualidad";

      // Google News suele incluir " - Nombre Medio" al final del título
      const cleanTitle = rawTitle.replace(/\s+-\s+[^-]+$/, "").trim() || rawTitle;

      return {
        title: cleanTitle,
        link,
        source,
        publishedAt: pubDate ? new Date(pubDate).toLocaleDateString("es-CL") : "",
      };
    });

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ ok: true, items });
  } catch (error) {
    console.error("[API beauty-news] Error:", error);
    return res.status(200).json({ ok: false, items: [] });
  }
}
