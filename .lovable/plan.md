## Add Letterboxd Profile Card

Insert a new card for the Letterboxd account right after **Digital Nurse** on the home page, featuring the two uploaded screenshots arranged professionally side-by-side (or stacked on mobile).

### Steps

1. **Upload the two screenshots as Lovable Assets**
   - `user-uploads://Screenshot_20260702_014754_...jpg` → Lists view (Top 100, Beyond amazing, Space)
   - `user-uploads://Screenshot_20260702_014809_...jpg` → Profile view (Cinema is my home)
   - Store pointer JSONs under `src/assets/`.

2. **Extend `ProjectCard.tsx`**
   - Add optional prop `images?: string[]` (1–2 image URLs).
   - When provided, render a professional two-image gallery above the description:
     - Desktop: 2-column grid, equal height, rounded corners, subtle inner border.
     - Mobile: stacked with 12px gap.
     - Aspect ratio kept portrait (matches the phone screenshots).
     - Soft shadow + `object-cover` to look polished on the dark green card.

3. **Add the Letterboxd card in `src/pages/Index.tsx`**
   - Position: index 1 (right after Digital Nurse, before InsightMed).
   - Title: `Letterboxd` · Subtitle (EN/AR): `Cinema Journal` / `يوميات السينما`.
   - Description (EN/AR): short line about curated film lists (Top 100, Beyond Amazing, Space) and "Cinema is my home".
   - Tags: `Film Lists, Reviews, Watchlist, Cinema` / `قوائم أفلام, مراجعات, قائمة مشاهدة, سينما`.
   - CTA: `View Profile` / `عرض الملف` → `https://boxd.it/7RQST`.
   - Icon: existing `Letterboxd` SVG (two-dot logo) in a white/10 tile.
   - Card color: deep Letterboxd green `hsl(150, 60%, 22%)` with slightly lighter icon tile — matches the brand and stays in the dark-card family already used.
   - Pass `images={[profileShot, listsShot]}` so the two screenshots render at the top of the card.

4. **No changes** to `Projects.tsx` (per prior direction, Letterboxd lives on the home page as a card, not on the separate Projects route).

### Technical notes
- Images imported as ES modules from the generated `.asset.json` pointers.
- Grid uses Tailwind `grid grid-cols-2 gap-3 md:gap-4` inside the card, wrapped in `rounded-xl overflow-hidden`.
- Each image: `aspect-[9/16] w-full object-cover rounded-lg ring-1 ring-white/15`.
- Card retains the existing entrance animation via the `motion.div` wrapper already in `Index.tsx`.
