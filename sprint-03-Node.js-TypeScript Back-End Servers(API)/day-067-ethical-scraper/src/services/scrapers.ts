import * as cheerio from "cheerio";
import { rateLimitedFetch } from "./fetcher";
import { HackerNewsItem, Quote } from "../types";

/* ── Hacker News scraper ─────────────────────────────────────────────
   Hacker News front page HTML structure (simplified):
   <tr class="athing">
     <td class="title">
       <span class="rank">1.</span>
       <a class="titlelink" href="...">Title</a>
     </td>
   </tr>
   <tr>
     <td class="subtext">
       <span class="score">123 points</span>
       by <a class="hnuser">username</a>
       <a href="item?id=...">42 comments</a>
     </td>
   </tr>

   We use $ (Cheerio's jQuery-like API) to traverse these elements.
────────────────────────────────────────────────────────────────────── */
export async function scrapeHackerNews(): Promise<HackerNewsItem[]> {
  const html = await rateLimitedFetch("https://news.ycombinator.com");
  const $ = cheerio.load(html);
  const items: HackerNewsItem[] = [];

  /* Each story row has class "athing" */
  $("tr.athing").each((i, el) => {
    const row = $(el);
    const subRow = row.next(); /* the next <tr> has points/author/comments */

    /* Extract rank — "1." → 1 */
    const rankText = row.find("span.rank").text().replace(".", "").trim();
    const rank = parseInt(rankText) || i + 1;

    /* Extract title and URL */
    const titleEl = row.find("span.titleline > a").first();
    const title = titleEl.text().trim();
    let url = titleEl.attr("href") || "";

    /* Some HN items are internal links like "item?id=..." */
    if (url.startsWith("item?")) {
      url = `https://news.ycombinator.com/${url}`;
    }

    /* Extract points from subrow */
    const pointsText = subRow.find("span.score").text();
    const points = parseInt(pointsText) || 0;

    /* Extract author */
    const author = subRow.find("a.hnuser").text().trim();

    /* Extract comment count — last link in subtext */
    const commentLinks = subRow.find("a");
    const commentText = commentLinks.last().text();
    const comments = parseInt(commentText) || 0;

    if (title) {
      items.push({ rank, title, url, points, author, comments });
    }
  });

  return items.slice(0, 30); /* top 30 stories */
}

/* ── Quotes scraper ──────────────────────────────────────────────────
   quotes.toscrape.com is a practice site built specifically for
   learning web scraping. Its HTML structure:
   <div class="quote">
     <span class="text">"Quote text here"</span>
     <small class="author">Author Name</small>
     <div class="tags">
       <a class="tag">tag1</a>
       <a class="tag">tag2</a>
     </div>
   </div>
────────────────────────────────────────────────────────────────────── */
export async function scrapeQuotes(page: number = 1): Promise<{ quotes: Quote[]; hasNext: boolean }> {
  const url = `http://quotes.toscrape.com/page/${page}/`;
  const html = await rateLimitedFetch(url);
  const $ = cheerio.load(html);
  const quotes: Quote[] = [];

  $("div.quote").each((_, el) => {
    /* Remove the opening/closing curly quotes from text */
    const text = $(el).find("span.text").text()
      .replace(/\u201c|\u201d/g, "") /* remove " and " */
      .trim();

    const author = $(el).find("small.author").text().trim();

    /* Collect all tag links into an array */
    const tags: string[] = [];
    $(el).find("a.tag").each((_, tagEl) => {
      tags.push($(tagEl).text().trim());
    });

    if (text && author) {
      quotes.push({ text, author, tags });
    }
  });

  /* Check if there's a next page button */
  const hasNext = $("li.next").length > 0;

  return { quotes, hasNext };
}