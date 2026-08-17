# Asura Falls website

This is a static website for GitHub Pages. No build step is required.

## Editing website content

All editable website content is kept in four JSON files:

- [Edit upcoming shows](data/shows.json)
- [Edit press articles](data/press.json)
- [Edit all English website text](data/en.json)
- [Edit all German website text](data/de.json)

You can edit these files directly on GitHub by opening the file, clicking the
pencil icon, making the changes, and committing them. GitHub Pages will publish
the update after the commit has been processed.

General editing workflow:

1. Open the relevant JSON file using one of the links above.
2. Click the pencil icon (`Edit this file`) on GitHub.
3. Change only the text between quotation marks unless you are intentionally
   adding or removing a complete entry.
4. Keep the surrounding field names, quotes, commas, braces, and brackets.
5. Select **Commit changes**, enter a short description, and confirm the
   commit.
6. Wait for GitHub Pages to publish the commit, then test the changed page.

### Edit general English or German text

All navigation labels, page headings, band biographies, band history, contact
text, gallery labels, imprint labels, error-page text, and SEO titles and
descriptions are stored in the language files:

- English: [data/en.json](data/en.json)
- German: [data/de.json](data/de.json)

The same key identifies matching text in both files. For example,
`"nav.contact"` controls the Contact/Kontakt navbar label.

To change a short text, edit the value after the key while keeping the key
unchanged:

```json
"nav.contact": "Contact us"
```

Make the corresponding change in the other language file if a translation is
available:

```json
"nav.contact": "Kontaktiert uns"
```

The longer content is stored in ordered lists:

- `bandIntro`: The five introductory band paragraphs.
- `memberHeadings`: Names and roles shown in the member carousel.
- `memberBios`: Member biographies in the same order as `memberHeadings`.
- `historyParagraphs`: Paragraphs on the History page.

Edit an existing list item in place. Keep the list order and do not remove the
comma between items. For example:

```json
"bandIntro": [
  "First paragraph.",
  "Second paragraph."
]
```

The English and German lists should contain the same number of items so each
translation remains attached to the correct person or paragraph. Page titles
and search descriptions use keys beginning with `page.`; keep descriptions
clear and concise when editing them.

Shows and press articles remain in their own files because each entry contains
both its content and related image/link information. When a translation is
missing there, the available language is displayed automatically.

### Add or edit a show

1. Open [data/shows.json](data/shows.json).
2. To edit a show, change the values in its existing `{ ... }` block.
3. To add a show, copy one complete block and paste it before the closing `]`.
4. Add a comma between entries. The final entry must not have a comma after it.
5. Providing both `en` and `de` text is recommended, but either language may
   be omitted. The website automatically falls back to the available text.
6. Commit the change and check the published website.

Example:

```json
{
  "image": "images/example-show.jpg",
  "title": {
    "en": "12 Dec 2026 — Frankfurt",
    "de": "12.12.2026 — Frankfurt"
  },
  "location": {
    "en": "Example Club",
    "de": "Example Club"
  },
  "with": {
    "en": "Example Band, Another Band",
    "de": "Example Band, Another Band"
  },
  "ticketLabel": {
    "en": "Get tickets",
    "de": "Tickets kaufen"
  },
  "url": "https://example.com/tickets"
}
```

Show fields:

- `image`: Image path from the project root.
- `title`: Date and city shown as the heading.
- `description`: Optional general text, useful for announcements.
- `location`: Optional venue or location.
- `with`: Optional list of other performing bands.
- `ticketLabel`: Optional text displayed on the ticket button or label.
- `url`: Ticket-page address. Use an empty string (`""`) when there is no link;
  the ticket label will then be shown without creating a broken link.

To remove a past show, delete its complete `{ ... }` block and make sure the
remaining entries are still separated by commas.

### Add or edit a press article

1. Open [data/press.json](data/press.json).
2. Edit an existing article or copy a complete `{ ... }` block to add one.
3. Add English and German versions when possible. If only one translation is
   available, the website displays it in both language modes.
4. Add a comma between entries, but not after the final entry.
5. Commit the change and check the published website.

Example:

```json
{
  "image": "images/example-press-photo.jpg",
  "imageAlt": {
    "en": "Asura Falls live in Frankfurt",
    "de": "Asura Falls live in Frankfurt"
  },
  "title": {
    "en": "Review of the Frankfurt show",
    "de": "Review der Frankfurt-Show"
  },
  "description": {
    "en": "A short English summary of the article.",
    "de": "Eine kurze deutsche Zusammenfassung des Artikels."
  },
  "url": "https://example.com/article"
}
```

### Add an image

1. Upload the new image to the [images folder](images/).
2. Use a short file name without spaces, for example `frankfurt-2026.jpg`.
3. Reference it in JSON as `images/frankfurt-2026.jpg`.
4. File names are case-sensitive after publishing: `Poster.jpg` and
   `poster.jpg` are different files on GitHub Pages.

### Avoid JSON errors

- Use double quotes (`"`) around field names and text.
- Do not add comments inside JSON files.
- Separate entries with commas.
- Do not leave a comma after the final entry.
- Preserve the surrounding `{ }` and `[ ]` characters.
- Both `en` and `de` are recommended, but a single available translation is
  used as a fallback and will not break the section.
- Removing one translation line may leave a comma immediately before `}`. The
  website tolerates this common editing mistake and still loads the content.

If the Shows or Press section becomes empty after an edit, the most likely cause
is invalid JSON. Recheck the last changed entry, especially its quotes and
commas.

## Pages and language

Folder-based pages provide extension-free URLs such as `/history`, `/gallery`, and `/imprint`. GitHub Pages resolves the underlying folders, and the site removes the directory slash from the visible browser address. The site chooses German when the visitor's browser language starts with `de`; otherwise it uses English. A selection made with the language switch is saved in the browser and takes precedence on later visits.

The footer year is generated from the visitor's current date.

## Test the website locally

Do not open `index.html` directly from the file explorer. The Shows and Press
sections load JSON with `fetch()`, which requires the website to be served over
HTTP just like it is on GitHub Pages.

### Quick test with Python

1. Open a terminal in the project folder.
2. Start a local static server:

   **Windows:**

   ```powershell
   py -m http.server 8000
   ```

   If `py` is unavailable, try:

   ```powershell
   python -m http.server 8000
   ```

   **macOS or Linux:**

   ```bash
   python3 -m http.server 8000
   ```

3. Open [http://localhost:8000/](http://localhost:8000/) in a browser.
4. Use the website navigation or enter the slash-free subpage URLs listed
   below. The address bar should finish on `/history`, `/gallery`, or
   `/imprint`, without a trailing slash.
5. Leave the terminal open while testing. Press `Ctrl+C` in the terminal to
   stop the server.

Python initially resolves a subpage through its folder—for example,
`/history/`—because the actual file is `history/index.html`. The website then
removes that final slash from the visible address without reloading the page.
This is also how the site handles GitHub Pages' folder routing.

### URLs to check

- Homepage: [http://localhost:8000/](http://localhost:8000/)
- History: [http://localhost:8000/history](http://localhost:8000/history)
- Gallery: [http://localhost:8000/gallery](http://localhost:8000/gallery)
- Imprint: [http://localhost:8000/imprint](http://localhost:8000/imprint)
- Shows data: [http://localhost:8000/data/shows.json](http://localhost:8000/data/shows.json)
- Press data: [http://localhost:8000/data/press.json](http://localhost:8000/data/press.json)
- Custom error page: [http://localhost:8000/404.html](http://localhost:8000/404.html)

Check the desktop and mobile layouts, both language buttons, navbar scrolling,
images, ticket links, Press links, and the browser console for errors. For each
subpage, confirm that:

- The page loads when its URL is entered without a trailing slash.
- The address bar remains on the slash-free form after loading.
- Refreshing the slash-free URL still loads the same page.
- Navigation between History, Gallery, and Imprint keeps using slash-free URLs.

### Test with a server closer to GitHub Pages

If Node.js is installed, the `serve` package provides clean routes and custom
404 handling that more closely resemble GitHub Pages:

```powershell
npx serve . --listen 8000
```

The first run may ask permission to download `serve`. Open
[http://localhost:8000/](http://localhost:8000/), test the slash-free subpage
URLs above, and enter a nonexistent URL such as
`http://localhost:8000/does-not-exist` to check the custom 404 page.

Python's basic server does not automatically substitute `404.html` for an
unknown URL, so open `/404.html` directly when using the Python method. GitHub
Pages will use the root `404.html` automatically after deployment.

### Final production check

After committing and pushing the changes, wait for GitHub Pages to finish its
deployment and repeat the checks on
[https://www.asurafalls.de/](https://www.asurafalls.de/). In particular, verify
the clean page URLs, JSON content, language fallback, and a nonexistent URL.
Directly open and refresh each production URL:

- [https://www.asurafalls.de/history](https://www.asurafalls.de/history)
- [https://www.asurafalls.de/gallery](https://www.asurafalls.de/gallery)
- [https://www.asurafalls.de/imprint](https://www.asurafalls.de/imprint)

All three should display without a trailing slash after the page has loaded.
