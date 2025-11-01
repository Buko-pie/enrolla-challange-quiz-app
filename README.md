This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Architecture notes

Just used NextJS default App route

```bash
src/
├─ app/
│  ├─ page.tsx          <- Home/Landing page
│  └─ quiz/
│     └─ page.tsx       <- Quiz page component
|     ├─ prep/
|     |  └─ page.tsx    <- Prep/Starting page befor taking the quiz
|     └─ result/
|        └─ page.tsx    <- Quiz results page
```

## Libraries used and rationale

- moment.js for handling timestamp and formatting
- react-redux for handling quiz states

## Trade-offs and shortcuts taken

I did use react redux for this, to me redux makes more sense than using React's useState and useEffect.
Also using cookies for storing data for lacking a database.

## Honest time spent

About 10 hours, I worked on this repo in 2 days on and off
