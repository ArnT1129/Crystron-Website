# Crystron Technologies website

The site at [www.crystrontech.com](https://www.crystrontech.com). It's a single page (`index.html`) with hash routes (`#team`, `#careers`, …), hosted on Vercel.

## What's where

```
index.html          The whole site: markup, styles, and scripts
jobs.js             Careers postings (edit this to post or close a role)
api/apply.mjs       Vercel function that emails job applications
images/
  brand/            Logos and the 192px app icon
  home/             Home page hero (.webp on the page, .jpg for link previews)
  technology/       Process diagram and microscope image
  applications/     Application sector photos (also the Technology banner)
  team/             Headshots, 420×420 JPEG
favicon.ico, apple-touch-icon.png   Stay at the root, where browsers look for them
```

## Common edits

- **Post or close a job:** follow the instructions at the top of `jobs.js`.
- **Add a team member:** copy a card in the `#team-page` section of `index.html` and add a square headshot to `images/team/` (about 420×420 JPEG, under 50 KB).
- **New photos:** save them as `.webp` (photos) or `.png` (logos with transparency) in the matching `images/` folder. Large PNG photos make the site slow on phones.

## Run it locally

Any static server works, for example:

```
python -m http.server 3000
```

Then open http://localhost:3000. Job applications only send from the deployed site, because they need the Vercel environment variables.

## Deploying

Pushing to `main` deploys production on Vercel; other branches get preview deployments. If a commit was already built as a preview on another branch, Vercel may skip the production build for that same commit, so push to `main` first.
