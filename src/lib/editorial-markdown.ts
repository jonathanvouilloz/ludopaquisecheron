const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const inlineMarkdown = (value: string): string => {
  const links: string[] = [];
  const escaped = escapeHtml(value).replace(
    /\[([^\]]+)]\(((?:https?:\/\/|mailto:|\/)[^)\s]+)\)/g,
    (_match, label: string, href: string) => {
      const index =
        links.push(`<a href="${href}" rel="noopener noreferrer">${label}</a>`) - 1;
      return `\uE000${index}\uE001`;
    },
  );
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_]+)__/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/(?<!_)_([^_]+)_(?!_)/g, "<em>$1</em>")
    .replace(/\uE000(\d+)\uE001/g, (_match, index: string) => links[Number(index)] ?? "");
};

const isUnorderedItem = (line: string) => /^\s*[-*+]\s+/.test(line);
const isOrderedItem = (line: string) => /^\s*\d+\.\s+/.test(line);

/**
 * Converts the small Markdown subset used by public editorial content to safe HTML blocks.
 * Raw HTML is always escaped; only generated tags can reach Astro's set:html directive.
 */
export function markdownBlocks(markdown: string | null): string[] {
  if (!markdown?.trim()) return [];

  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^\s*#{1,6}\s+(.+)$/);
    if (heading) {
      const level = Math.min(4, Math.max(2, line.trimStart().indexOf(" ")));
      blocks.push(
        `<h${level}>${inlineMarkdown(heading[1].trim())}</h${level}>`,
      );
      index += 1;
      continue;
    }

    if (isUnorderedItem(line) || isOrderedItem(line)) {
      const ordered = isOrderedItem(line);
      const items: string[] = [];
      while (
        index < lines.length &&
        (ordered ? isOrderedItem(lines[index]) : isUnorderedItem(lines[index]))
      ) {
        const content = lines[index].replace(
          ordered ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/,
          "",
        );
        items.push(`<li>${inlineMarkdown(content.trim())}</li>`);
        index += 1;
      }
      const tag = ordered ? "ol" : "ul";
      blocks.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, "").trim());
        index += 1;
      }
      blocks.push(
        `<blockquote><p>${inlineMarkdown(quote.join(" "))}</p></blockquote>`,
      );
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^\s*#{1,6}\s+/.test(lines[index]) &&
      !isUnorderedItem(lines[index]) &&
      !isOrderedItem(lines[index]) &&
      !/^\s*>\s?/.test(lines[index])
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return blocks;
}
