# Replyto.me — Your Link in Bio, but Smarter

> Full-stack "Link in Bio" web app built with a clean white, Apple-style design. Turn your Instagram Reel comments into instant engagement with Comment-to-Unlock gates, multiple copyable text blocks, and swipeable carousels.

---

## Features

- **Apple Clean White Aesthetic:** Pure white background (`#FFFFFF`), secondary surface (`#F5F5F7`), thin 1px `#E5E5EA` borders, rounded 16–24px corners, and Apple blue (`#0071E3`) accents.
- **Comment-to-Unlock Gate:** Gate prompts, links, and exclusive guides behind an Instagram Reel comment keyword (e.g. `PROMPT`, `LINK`).
- **Secure Server-Side Unlock:** Locked text content is **never sent to the client** until verified via `/api/unlock`, preventing client-side inspection.
- **Multiple Copyable Text Blocks:** Add multiple text blocks with one-tap "Copy" buttons. Perfect for ChatGPT prompts, code snippets, and product recommendations.
- **Swipeable Image Carousel & One-Click Downloads:** Upload multiple high-res photos with reordering and smooth slide animations. Visitors can download individual pictures or use "Download All" to save the full gallery, with an Apple-style full-resolution lightbox modal.
- **Creator Download Control:** Creators can toggle image downloading on or off per post in the dashboard editor.
- **Instagram Reel Integration:** Auto-validates Instagram Reel URLs and renders an interactive preview card that links directly to Instagram.
- **Mobile-First & Fast:** Fully optimized for visitors arriving from Instagram on smartphones.
- **Dynamic Open Graph & Social Sharing:** Native Web Share API on mobile, one-tap clipboard copy, and quick share to WhatsApp, X (Twitter), and Telegram.
- **Zero-Setup Demo Mode:** The app runs out of the box with realistic mock creator profiles (`@alexrivera`) and posts even before configuring Firebase!

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Vanilla CSS tokens
- **Animations:** Framer Motion + Canvas Confetti
- **Icons:** Lucide React
- **Backend / Database:** Firebase Authentication (Google Sign-In), Cloud Firestore, Firebase Storage
- **Server Verification:** Firebase Admin SDK

---

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Locally in Demo Mode

Replyto.me comes with an automatic in-memory & localStorage fallback mode so you can run the entire app immediately without any setup:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, or visit [http://localhost:3000/alexrivera](http://localhost:3000/alexrivera) to test a live public creator bio.

---

## Production Firebase Setup

To connect live Firebase Authentication, Firestore, and Storage:

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
2. Give your project a name (e.g., `replyto-me`) and follow the on-screen steps.

### 2. Enable Google Authentication
1. In the Firebase console sidebar, navigate to **Build** → **Authentication**.
2. Click **Get Started** and select **Google** under the *Sign-in providers* tab.
3. Enable it, select your project support email, and click **Save**.
4. In *Authorized domains*, make sure `localhost` and your production domain (e.g. `your-app.vercel.app`) are listed.

### 3. Create Cloud Firestore Database
1. Navigate to **Build** → **Firestore Database** → **Create Database**.
2. Start in **Production mode** (or test mode for quick dev) and pick your preferred region.
3. Apply the security rules from `firestore.rules` located in the root of this project:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 4. Enable Firebase Storage
1. Navigate to **Build** → **Storage** → **Get Started**.
2. Apply the security rules from `storage.rules`:
   ```bash
   firebase deploy --only storage
   ```

### 5. Generate Firebase Admin Service Account Key
1. Go to **Project Settings** (gear icon) → **Service accounts**.
2. Click **Generate new private key**.
3. Download the JSON file and extract:
   - `project_id`
   - `client_email`
   - `private_key`

### 6. Configure `.env.local`

Create a `.env.local` file in the root directory and populate your keys:

```env
NEXT_PUBLIC_APP_URL=https://replyto.me

# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-Side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## Data Model (Firestore)

- **`users/{uid}`**:
  - `displayName`: string
  - `username`: string (unique handle)
  - `bio`: string
  - `photoURL`: string
  - `createdAt`: ISO timestamp string
- **`usernames/{username}`**:
  - `uid`: string (enforces handle uniqueness across all creators)
- **`posts/{postId}`**:
  - `uid`: author UID
  - `slug`: URL slug (e.g., `ai-system-prompts`)
  - `title`: post title
  - `images`: array of storage URLs
  - `textBlocks`: `[{ id, title, text }]`
  - `reelUrl`: Instagram reel link
  - `gateEnabled`: boolean
  - `gateKeyword`: string (e.g. `PROMPT`)
  - `gateMessage`: custom message on the lock screen
  - `gateScope`: `'text_blocks'` | `'images'` | `'both'`
  - `status`: `'draft'` | `'published'`
  - `order`: integer for custom creator feed sorting
  - `views`: view count integer
  - `unlocks`: unlock count integer
  - `createdAt`: ISO timestamp
  - `updatedAt`: ISO timestamp

---

## Unlock Verification Architecture

- **V1 (Included):** Honor-based 3-step unlock flow. When the user taps *"I've commented"*, an authenticated request is dispatched to `/api/unlock`. The server verifies existence, increments the unlock count, and returns the unlocked payload so it is not visible in initial page HTML source.
- **V2 (Architected):** Defined in `src/lib/services/unlockService.ts` via the `InstagramCommentVerifier` interface. Once you register a Meta for Developers app and supply `INSTAGRAM_GRAPH_API_TOKEN`, the service can automatically verify that a real comment matching the keyword exists on the media ID before releasing the content.

---

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables from your `.env.local`.
4. Click **Deploy**.

---

## License

MIT © Replyto.me
