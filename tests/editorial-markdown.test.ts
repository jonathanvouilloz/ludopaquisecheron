import { describe, expect, it } from "vitest";
import { markdownBlocks } from "../src/lib/editorial-markdown";

describe("Markdown éditorial sûr", () => {
  it("rend les titres, listes, citations et styles utiles", () => {
    expect(
      markdownBlocks(
        "# Titre\n\nUn texte **important** avec [un lien](https://example.org/a_b).\n\n- Un\n- Deux\n\n> À retenir",
      ),
    ).toEqual([
      "<h2>Titre</h2>",
      '<p>Un texte <strong>important</strong> avec <a href="https://example.org/a_b" rel="noopener noreferrer">un lien</a>.</p>',
      "<ul><li>Un</li><li>Deux</li></ul>",
      "<blockquote><p>À retenir</p></blockquote>",
    ]);
  });

  it("échappe le HTML brut et n'active pas les liens dangereux", () => {
    expect(markdownBlocks('<img src=x onerror=alert(1)> [piège](javascript:alert(1))')).toEqual([
      "<p>&lt;img src=x onerror=alert(1)&gt; [piège](javascript:alert(1))</p>",
    ]);
  });
});
