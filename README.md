# Opt-Out List Scrubber

A browser-based data-hygiene tool for The Messenger Network: cross-reference a customer
database against an opt-out / do-not-contact list and remove every matching contact
before the database is used.

Built as a web replacement for the "Opt-Out List Scrubber" Gemini Gem — same matching
logic, now as a reusable tool instead of a chat prompt.

## How it works

1. **Upload opt-out file(s)** — one or more CSV/XLSX files. A file can have multiple
   sheets (e.g. "Opt Out", "RSVP", "Unsubscribed"); pick which sheets count and which
   column(s) hold phone numbers.
2. **Upload the customer database** — the list to be cleaned. Confirm its phone column(s)
   and, optionally, a name column (used for the removed-contacts reference list).
3. **Run the scrub** — every phone number is normalized to a pure digit string
   (country code + local number, no symbols/spaces/leading zero) and cross-referenced.
   Any customer row whose number appears in the opt-out set is removed — including every
   duplicate row sharing that number.
4. **Review & download** — a summary report (rows in, unique opt-outs, unique contacts
   removed, rows removed, rows remaining) plus the cleaned file in the original format,
   and an optional removed-contacts reference file.

Everything runs client-side in the browser — no file is ever uploaded to a server,
which matters for a compliance-adjacent tool handling personal contact data.

### Matching logic

Numbers are normalized the same way on both files before comparing:

1. Strip everything that isn't a digit.
2. If a separate country-code column is selected, prefix it onto the local number
   (leading `0` stripped).
3. Otherwise, if the number starts with a leading `0`, replace it with the configured
   default country code (South Africa `27` by default).
4. Otherwise the digits are used as-is.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint   # ESLint
npm run build  # production build / type-check
```

## Deployment

This is a standard Next.js app with no backend/API routes — it deploys to
[Vercel](https://vercel.com) with zero configuration.

## Known limitation

This project depends on the `xlsx` (SheetJS) package for Excel parsing/writing. The
version published on npm carries known ReDoS/prototype-pollution advisories with no
npm-published fix; SheetJS's patched builds are distributed only from their own CDN,
which isn't reachable from this environment. Since all parsing happens client-side on
files the user chooses to upload themselves (not a server, not third-party input), the
practical risk is low, but keep this in mind if the tool is ever moved server-side or
if that CDN becomes reachable and the dependency should be upgraded.
