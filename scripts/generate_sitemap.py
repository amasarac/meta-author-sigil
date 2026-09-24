#!/usr/bin/env python3
"""Generate the crawl maps for the GitHub Pages site.

Walks the repository and writes, at the repo root:

  sitemap.xml   every HTML page and PDF, for search engines (sitemaps.org 0.9)
  sitemap.html  a plain linked index of every published file, so crawlers
                that follow links (and people) can reach pages nothing else
                links to
  llms.txt      a Markdown index for LLMs and AI agents (llmstxt.org)

Standard library only. Run from anywhere:

    python3 scripts/generate_sitemap.py

`lastmod` comes from each file's last git commit, so run it on a full clone
(`fetch-depth: 0` in CI); files git doesn't know about fall back to mtime.
"""

import html
import os
import re
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from urllib.parse import quote

BASE_URL = "https://amasarac.github.io/meta-author-sigil/"
REPO_URL = "https://github.com/amasarac/meta-author-sigil"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GENERATED = {"sitemap.xml", "sitemap.html", "llms.txt"}
# Site-verification stubs and tooling that shouldn't be advertised.
EXCLUDE_FILES = {"google66673756dc3b8cb1.html", "package-lock.json"}
EXCLUDE_DIRS = {"node_modules", "vendor"}

PAGE_EXTS = {".html", ".htm"}
DOC_EXTS = {".pdf"}
# Everything else worth listing in sitemap.html / llms.txt.
DATA_EXTS = {
    ".md", ".txt", ".json", ".jsonld", ".jsonl", ".csv", ".svg", ".png",
    ".jpg", ".jpeg", ".gif", ".webp", ".mp3", ".wav", ".js", ".mjs", ".jsx",
    ".py", ".css", ".xml", ".yml", ".yaml", ".docx", ".zip", ".raee",
    ".skill", ".log", ".def",
}


def published_files():
    """Yield repo-relative POSIX paths that GitHub Pages (Jekyll) serves."""
    for dirpath, dirnames, filenames in os.walk(ROOT):
        # Jekyll skips anything whose name starts with "_" or ".".
        dirnames[:] = sorted(
            d for d in dirnames
            if not d.startswith((".", "_")) and d not in EXCLUDE_DIRS
        )
        for name in sorted(filenames):
            if name.startswith((".", "_")) or name in EXCLUDE_FILES:
                continue
            rel = os.path.relpath(os.path.join(dirpath, name), ROOT)
            yield rel.replace(os.sep, "/")


def git_lastmod():
    """Map path -> ISO date of the last commit touching it (one git call)."""
    try:
        out = subprocess.run(
            ["git", "-c", "core.quotepath=off", "log", "--format=@%cs",
             "--name-only", "--no-renames"],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout
    except (OSError, subprocess.CalledProcessError):
        return {}
    dates, current = {}, None
    for line in out.splitlines():
        if line.startswith("@"):
            current = line[1:]
        elif line and current:
            dates.setdefault(line, current)  # log is newest-first
    return dates


def lastmod(path, dates):
    if path in dates:
        return dates[path]
    ts = os.path.getmtime(os.path.join(ROOT, path))
    return datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%d")


def url_for(path):
    return BASE_URL + quote(path, safe="/")


def blob_url(path):
    return f"{REPO_URL}/blob/main/{quote(path, safe='/')}"


def ext(path):
    return os.path.splitext(path)[1].lower()


TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
DESC_RE = re.compile(
    r"<meta\s+[^>]*name=[\"']description[\"'][^>]*content=[\"'](.*?)[\"']",
    re.I | re.S,
)
MD_HEADING_RE = re.compile(r"^#\s+(.+)$", re.M)


def clean(text):
    return " ".join(html.unescape(text).split())


def describe(path):
    """Return (title, description) scraped from the file, or ("", "")."""
    if ext(path) not in PAGE_EXTS | {".md"}:
        return "", ""
    try:
        with open(os.path.join(ROOT, path), encoding="utf-8", errors="replace") as f:
            head = f.read(20000)
    except OSError:
        return "", ""
    if ext(path) == ".md":
        m = MD_HEADING_RE.search(head)
        return (clean(m.group(1)) if m else ""), ""
    title = TITLE_RE.search(head)
    desc = DESC_RE.search(head)
    return (clean(title.group(1)) if title else "",
            clean(desc.group(1)) if desc else "")


def priority(path):
    if path == "index.html":
        return "1.0"
    if os.path.basename(path) == "index.html":
        return "0.8"
    return "0.5"


def write(name, content):
    with open(os.path.join(ROOT, name), "w", encoding="utf-8", newline="\n") as f:
        f.write(content)


def build_sitemap_xml(pages, dates):
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    # Root first: the site's own URL rather than /index.html.
    for path in sorted(pages, key=lambda p: (p != "index.html", p)):
        loc = BASE_URL if path == "index.html" else url_for(path)
        lines += [
            "  <url>",
            f"    <loc>{html.escape(loc)}</loc>",
            f"    <lastmod>{lastmod(path, dates)}</lastmod>",
            f"    <priority>{priority(path)}</priority>",
            "  </url>",
        ]
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def group_by_dir(paths):
    groups = defaultdict(list)
    for p in paths:
        groups[os.path.dirname(p)].append(p)
    return sorted(groups.items(), key=lambda kv: (kv[0] != "", kv[0].lower()))


def label(path, title):
    name = os.path.basename(path)
    return f"{title} ({name})" if title and title != name else name


def build_sitemap_html(files, meta):
    out = [
        "<!DOCTYPE html>",
        '<html lang="en">',
        "<head>",
        '<meta charset="UTF-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        "<title>Meta-Author Sigil Lattice — Site Index</title>",
        '<meta name="description" content="Complete linked index of every page,'
        ' document and data file in the Meta-Author Sigil Lattice.">',
        f'<link rel="canonical" href="{BASE_URL}sitemap.html">',
        '<link rel="sitemap" type="application/xml" href="sitemap.xml">',
        "<style>",
        ":root{--bg:#fff;--fg:#1a1a1a;--muted:#666;--link:#2446a8;--rule:#ddd}",
        "@media (prefers-color-scheme:dark){:root{--bg:#0b0b10;--fg:#e8e8ee;"
        "--muted:#999;--link:#9db4ff;--rule:#333}}",
        "body{margin:0 auto;max-width:960px;padding:24px 16px;background:var(--bg);"
        "color:var(--fg);font:15px/1.5 system-ui,sans-serif}",
        "a{color:var(--link)}h2{margin-top:2em;border-bottom:1px solid var(--rule);"
        "font-size:1.1em}ul{padding-left:1.2em}li{overflow-wrap:anywhere}"
        ".m{color:var(--muted);font-size:.9em}",
        "</style>",
        "</head>",
        "<body>",
        "<h1>Meta-Author Sigil Lattice — Site Index</h1>",
        f'<p>Every published file in the lattice, grouped by folder. Also available as '
        f'<a href="sitemap.xml">sitemap.xml</a> for search engines and '
        f'<a href="llms.txt">llms.txt</a> for AI agents. '
        f'Source: <a href="{REPO_URL}">{REPO_URL}</a>.</p>',
        '<p><a href="./">← Enter the lattice</a></p>',
    ]
    for folder, paths in group_by_dir(files):
        heading = folder + "/" if folder else "Root"
        out.append(f"<h2>{html.escape(heading)}</h2>")
        out.append("<ul>")
        # Pages first, then everything else.
        for p in sorted(paths, key=lambda p: (ext(p) not in PAGE_EXTS, p.lower())):
            title, desc = meta[p]
            href = quote(p, safe="/")
            item = f'<a href="{href}">{html.escape(label(p, title))}</a>'
            if desc:
                item += f' <span class="m">— {html.escape(desc)}</span>'
            out.append(f"<li>{item}</li>")
        out.append("</ul>")
    out += ["</body>", "</html>"]
    return "\n".join(out) + "\n"


def md_link(text, url):
    text = text.replace("[", "(").replace("]", ")")
    return f"[{text}]({url})"


def build_llms_txt(files, meta):
    pages = [p for p in files if ext(p) in PAGE_EXTS | DOC_EXTS]
    docs = [p for p in files if ext(p) == ".md"]
    data = [p for p in files if p not in pages and p not in docs]

    out = [
        "# Meta-Author Sigil Lattice (MASL)",
        "",
        "> A living recursion of story, system, and self: an interactive "
        "mythopoetic archive of portals, sigils, glyph lattices, JSON-LD "
        "personas and protocols, published as a static GitHub Pages site.",
        "",
        f"Site: {BASE_URL}",
        f"Source repository: {REPO_URL}",
        f"Human-readable index of every file: {BASE_URL}sitemap.html",
        f"Search-engine sitemap: {BASE_URL}sitemap.xml",
        "",
        "Markdown documents are linked to their GitHub source view; pages and "
        "data files are linked to the live site, where they are served as-is.",
        "",
        "## Start here",
        "",
    ]
    for p in ("index.html", "README.md", "DIRECTORY.md", "PagePortal.html",
              "thoughtform-navigator.html"):
        if p in files:
            url = blob_url(p) if ext(p) == ".md" else (
                BASE_URL if p == "index.html" else url_for(p))
            out.append(f"- {md_link(label(p, meta[p][0]), url)}")

    out += ["", "## Pages and PDFs", ""]
    for p in sorted(pages, key=str.lower):
        title, desc = meta[p]
        line = f"- {md_link(p if not title else f'{title} — {p}', url_for(p))}"
        out.append(line + (f": {desc}" if desc else ""))

    out += ["", "## Documents", ""]
    for p in sorted(docs, key=str.lower):
        title = meta[p][0]
        out.append(f"- {md_link(p if not title else f'{title} — {p}', blob_url(p))}")

    out += ["", "## Optional", "",
            "Data, media, scripts and other supporting files.", ""]
    for p in sorted(data, key=str.lower):
        out.append(f"- {md_link(p, url_for(p))}")
    return "\n".join(out) + "\n"


def main():
    files = [
        p for p in published_files()
        if p not in GENERATED and ext(p) in PAGE_EXTS | DOC_EXTS | DATA_EXTS
    ]
    meta = {p: describe(p) for p in files}
    dates = git_lastmod()
    pages = [p for p in files if ext(p) in PAGE_EXTS | DOC_EXTS]

    write("sitemap.xml", build_sitemap_xml(pages, dates))
    write("sitemap.html", build_sitemap_html(files, meta))
    write("llms.txt", build_llms_txt(files, meta))
    print(f"sitemap.xml: {len(pages)} URLs; sitemap.html / llms.txt: {len(files)} files")


if __name__ == "__main__":
    main()
