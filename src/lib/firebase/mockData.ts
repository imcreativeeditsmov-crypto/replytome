import { UserProfile, Post, PostTextBlock } from "@/types";
import { isPlatformAdmin } from "@/lib/auth/adminCheck";

export const INITIAL_DEMO_USER: UserProfile = {
  uid: "shivai-creator-uid",
  displayName: "AI by Shivai",
  username: "aibyshivai",
  email: "aibyshivai@gmail.com",
  bio: "AI tools, viral prompts & automated creator workflows. Comment on my Instagram Reels to unlock exclusive copyable resources.",
  photoURL: "https://lh3.googleusercontent.com/a/ACg8ocJ9qWnDSojX5KvmBmcLNNTSuvefpZR2yQRh0rsX2DynIXdeo7I=s96-c",
  instagramUrl: "https://www.instagram.com/creativeedits.mov/",
  isAdmin: true,
  role: "admin",
  createdAt: "2026-10-14T06:38:19.771Z",
};

export const INITIAL_DEMO_POSTS: Post[] = [
  {
    "id": "post_1791960258914_bx6qp",
    "uid": "shivai-creator-uid",
    "title": "Cafe Build Prompt",
    "slug": "cafe-build-prompt",
    "images": [
      "/cafe-build.png"
    ],
    "reelUrl": "https://www.instagram.com/reel/DedwtwOyvat/?dlrf=MzRlODBiNWFlZA==&srtk=MzRlODBiNWFlZA==",
    "gateEnabled": true,
    "gateKeyword": "CAFE",
    "gateMessage": "Comment CAFE on the reel to unlock the full guide & resources.",
    "gateScope": "both",
    "allowDownload": true,
    "status": "published",
    "order": 0,
    "textBlocks": [
      {
        "id": "block_1791960169944_1",
        "title": "Block 1: Prompt / Resource",
        "text": "RESTAURANT VFX BUILD — 10-SECOND ONE-TAKE FPV USE THE UPLOADED REFERENCE IMAGE AS THE FINAL ARCHITECTURAL AND INTERIOR DESIGN TARGET ONLY.\n\nThe uploaded image represents the COMPLETED RESTAURANT AT THE END OF THE VIDEO.\n\nIt is NOT the starting state.\n\nAt 00:00, the restaurant interior is completely empty.\n\nThe video must show the restaurant being physically constructed from nothing during one continuous, extremely dynamic FPV camera shot.\n\nBy 00:10, the completed restaurant must match the uploaded reference as closely as possible.\n\nPreserve the reference's: architecture, proportions, spatial layout, floor plan, ceiling geometry, furniture placement, materials, colors,\nlighting design, bar/counter, seating, decorative elements, plants, wall treatments, windows and overall visual identity.\n\nDo not redesign the restaurant.\n\nDo not invent a different interior.\n\nThe uploaded image is the final destination.\n\nCORE VISUAL CONCEPT\n\nThis is NOT a normal interior timelapse.\n\nThis is a high-end Hollywood VFX construction sequence.\n\nThe restaurant appears to be assembled by a violent invisible gravitational force.\n\nMaterials begin as loose physical components scattered beneath and around the empty space.\n\nThen the entire interior enters a controlled state of reverse gravity / electromagnetic construction.\n\nMassive objects violently launch upward.\n\nSmaller components orbit around them.\n\nMaterials rotate through the air.\n\nArchitectural pieces accelerate toward their final positions.\n\nComponents collide, align and mechanically lock together.\n\nEvery major construction event creates: realistic impact dust tiny debris sparks from metal connections vibration secondary particles\nsubtle camera shake motion trails caused by extreme velocity realistic momentum physically believable collisions The effect must feel like\nreal architecture being assembled at impossible speed, not magical CGI.\n\nABSOLUTE CAMERA RULE\n\nONE SINGLE CONTINUOUS CAMERA TAKE.\n\nThe entire 10 seconds must be captured by one uninterrupted FPV camera movement.\n\nNO CUTS.\n\nNO HIDDEN CUTS.\n\nNO EDITS.\n\nNO TRANSITIONS.\n\nNO FADE.\n\nNO TELEPORTATION.\n\nNO CAMERA RESET.\n\nNO DISCONTINUOUS POSITION CHANGES.\n\nThe camera must continuously travel through the same physical restaurant space from beginning to end.\n\nThe camera itself must feel physically present inside the construction.\n\nObjects should pass extremely close to the lens.\n\nThe camera should sometimes narrowly avoid incoming objects by only a few centimeters.\n\nUse aggressive:\n\nFPV banking, barrel rolls, rapid pitch changes, speed ramps, dives, climbs, tight arcs, parallax passes and near-miss maneuvers.\n\nHowever, the camera movement must remain physically continuous.\n\nVISUAL LANGUAGE\n\nPhotorealistic luxury architectural commercial.\n\nHollywood VFX quality.\n\nIMAX-scale realism.\n\n14mm ultra-wide FPV lens.\n\nHigh dynamic range.\n\nPhysically accurate global illumination.\n\nRealistic reflections.\n\nRealistic glass refraction.\n\nRealistic brushed metal.\n\nRealistic stone.\n\nRealistic wood.\n\nRealistic fabric.\n\nRealistic polished floors.\n\nVolumetric atmospheric light.\n\nSubtle lens bloom.\n\nNatural motion blur.\n\nRealistic depth of field.\n\nFine dust particles.\n\nMicro-debris.\n\nTiny floating particles catching the light.\n\nExtremely detailed materials.\n\nNo artificial video-game appearance.\n\nNo plastic-looking CGI.\n\nNo fantasy environment.\n\nThe finished restaurant should look like a real architectural photograph.\n\nIMPORTANT — CONSTRUCTION MUST HAVE A VISUAL HIERARCHY Do NOT assemble every object simultaneously.\n\nThe construction happens in large cinematic waves: STRUCTURE → ARCHITECTURE → FURNITURE → LIGHTING → DECORATION → FINAL DETAILS Large\nobjects dominate first.\n\nSmall objects appear only after the major structure is established.\n\nThis prevents visual clutter and keeps the construction readable.\n\n00:00–00:01 — THE EMPTY SPACE\n\nBegin inside the exact spatial environment represented by the reference image.\n\nThe restaurant is completely empty.\n\nOnly the bare architectural shell exists.\n\nBare concrete floor.\n\nBare structural walls.\n\nBare ceiling.\n\nNo furniture.\n\nNo lights.\n\nNo plants.\n\nNo decorations.\n\nNo bar.\n\nNo equipment.\n\nNo finished interior.\n\nCamera flies approximately 20 cm above the floor at extremely high speed.\n\nThe empty room feels strangely still.\n\nThen the floor begins vibrating.\n\nDust trembles.\n\nSmall pieces of gravel jump.\n\nMetal fragments rotate.\n\nTiny screws begin floating upward.\n\nA low-frequency physical vibration travels through the floor.\n\nThe camera accelerates directly into the disturbance.\n\n00:01–00:02 — THE CONSTRUCTION VORTEX\n\nSuddenly, hundreds of construction components violently launch upward.\n\nNot randomly.\n\nThey begin forming a gigantic spiraling construction vortex around the camera.\n\nFloor slabs.\n\nStone.\n\nWood.\n\nMetal framing.\n\nGlass.\n\nElectrical components.\n\nCeiling pieces.\n\nArchitectural panels.\n\nEverything rotates around a central invisible axis.\n\nThe camera flies directly through the vortex.\n\nLarge objects pass within centimeters of the lens.\n\nThe camera narrowly avoids a massive stone slab.\n\nA steel frame rotates directly above the camera.\n\nA cloud of dust explodes past the lens.\n\nThe construction vortex rapidly compresses toward the restaurant's final geometry.\n\n00:02–00:03 — FLOOR + ARCHITECTURE LOCK\n\nThe camera dives toward the floor.\n\nThe finished flooring rapidly assembles beneath it.\n\nIndividual stone / wood / concrete / tile sections shoot upward and slide together with millimeter precision.\n\nTHUD.\n\nFirst section locks.\n\nTHUD.\n\nSecond section locks.\n\nThen dozens more rapidly connect in a wave traveling toward the camera.\n\nAt the same time: wall panels rise.\n\nArchitectural columns form.\n\nCeiling structures unfold.\n\nWood slats rotate into alignment.\n\nDecorative architectural geometry snaps into place.\n\nEvery connection produces tiny realistic dust bursts and mechanical vibration.\n\nThe camera flies directly through the newly forming architecture.\n\n00:03–00:04 — THE BAR EXPLODES INTO EXISTENCE The camera aggressively banks toward the main bar / counter.\n\nThis becomes the first major hero construction moment.\n\nThe bar structure launches upward from the floor.\n\nCabinet modules rotate.\n\nMetal framework assembles.\n\nStone countertop flies horizontally through frame.\n\nIt rotates approximately 90 degrees.\n\nThen:\n\nSLAM.\n\nIt locks perfectly into place.\n\nShelves rise behind it.\n\nGlass panels snap together.\n\nBottle shelves assemble.\n\nMetal details attach.\n\nThe camera performs a tight FPV orbit around the rapidly forming bar.\n\nThe entire structure completes in less than one second.\n\nA powerful pressure wave pushes dust away from the completed counter.\n\n00:04–00:05 — FURNITURE STORM\n\nThe camera launches into the dining area.\n\nNow the furniture construction begins.\n\nDozens of tables and chairs are initially visible as individual components flying through the environment.\n\nBut instead of appearing randomly: they travel along controlled curved trajectories, almost like they are being pulled by an invisible\nmagnetic field.\n\nChair legs rotate.\n\nFrames assemble.\n\nSeats lock.\n\nBackrests snap into place.\n\nTable legs rise.\n\nTabletops spin horizontally.\n\nTables land perfectly.\n\nEntire rows of seating assemble in synchronized waves.\n\nThe camera flies directly between them.\n\nOne chair misses the lens by centimeters.\n\nA tabletop rotates above the camera.\n\nAnother table locks into position directly behind the camera.\n\nEverything follows the exact arrangement of the reference image.\n\n00:05–00:06 — LIGHTING ACTIVATION WAVE\n\nThe camera suddenly pitches vertically upward.\n\nThe ceiling becomes the focus.\n\nPendant lights, track lights, chandeliers and LED elements rise into the frame.\n\nElectrical cables rapidly connect.\n\nMetal fixtures rotate.\n\nGlass shades lock into position.\n\nThen the lighting activates in a CHAIN REACTION.\n\nOne light turns on.\n\nThen the next.\n\nThen the next.\n\nThen dozens simultaneously.\n\nA warm illumination wave travels through the entire restaurant.\n\nThe environment changes from cold unfinished construction space into the finished luxurious atmosphere of the reference.\n\nThe camera dives back toward the dining area.\n\n00:06–00:07 — ARCHITECTURAL DETAIL STORM\n\nNow the small details begin assembling.\n\nBut they must behave like a controlled VFX particle system.\n\nPlants rise from the floor.\n\nLeaves unfold.\n\nDecorative panels fly toward walls.\n\nMirrors rotate into position.\n\nArtwork locks onto walls.\n\nShelves assemble.\n\nCushions land on seating.\n\nCurtains drop.\n\nTable settings rapidly appear.\n\nGlassware rotates into position.\n\nSmall decorative objects orbit once around the camera before locking into their final locations.\n\nUse elegant controlled trajectories rather than random flying objects.\n\nThe camera aggressively weaves through the storm.\n\nEvery object has realistic momentum.\n\n00:07–00:08 — FINAL 10% / MAXIMUM VFX INTENSITY The restaurant is now approximately 90% complete.\n\nThe camera accelerates dramatically.\n\nThe remaining components suddenly begin moving much faster.\n\nHundreds of tiny architectural details fly through the room.\n\nMetal particles.\n\nGlass fragments.\n\nWood components.\n\nDecorative elements.\n\nLighting details.\n\nFurniture details.\n\nPlants.\n\nSmall objects.\n\nAll converge toward their final positions.\n\nThe entire restaurant appears to be temporarily surrounded by a controlled swirling construction field.\n\nThe camera flies directly through its center.\n\nThen—\n\nEVERYTHING STOPS.\n\nFor approximately a fraction of a second, all remaining objects hang perfectly suspended in the air.\n\nAbsolute visual tension.\n\n00:08–00:09 — GRAVITY SNAP\n\nGravity suddenly returns.\n\nEverything suspended above the restaurant drops downward.\n\nBut instead of falling randomly, every component falls toward its exact final position.\n\nTables settle.\n\nChairs land.\n\nDecorations drop.\n\nPendant lights stabilize.\n\nPlants settle.\n\nFinal architectural elements descend.\n\nEach object lands with a precise physical impact.\n\nA synchronized wave of tiny dust bursts travels across the restaurant.\n\nThe camera performs a rapid backward dive.\n\n00:09–00:10 — THE FINAL REVEAL\n\nThe final remaining architectural component falls into place.\n\nMASSIVE FINAL IMPACT.\n\nA subtle circular dust shockwave expands across the floor.\n\nThe camera rockets backward and upward.\n\nThe entire completed restaurant is revealed.\n\nAll lights are fully active.\n\nAll materials are finished.\n\nAll furniture is perfectly positioned.\n\nThe environment is completely clean and premium.\n\nThe camera slows into a beautiful cinematic architectural hero shot.\n\nThe final composition should closely resemble the uploaded reference image.\n\nThe transformation should feel like:\n\nEMPTY SPACE → IMPOSSIBLE CONSTRUCTION → COMPLETE LUXURY RESTAURANT The final frame must look like a real professional architectural\nphotograph.\n\nPHYSICS REQUIREMENTS\n\nEvery object must obey believable physics.\n\nObjects have weight.\n\nObjects have inertia.\n\nObjects accelerate and decelerate.\n\nLarge objects move slower than small objects.\n\nHeavy stone and metal must feel heavy.\n\nGlass must feel fragile.\n\nWood must have realistic mass.\n\nFurniture must not float unnaturally.\n\nObjects cannot pass through each other.\n\nObjects cannot merge together.\n\nObjects cannot duplicate.\n\nObjects cannot randomly disappear.\n\nNo object may teleport.\n\nNo object may morph from one shape into another.\n\nEach object must visibly travel from its origin to its destination.\n\nCAMERA / VFX INTERACTION\n\nThe camera must interact with the construction.\n\nObjects should pass extremely close to the lens.\n\nParticles should occasionally hit the lens.\n\nDust should briefly obscure the image.\n\nFast-moving objects should create strong motion blur.\n\nLarge impacts should produce subtle physical camera shake.\n\nAir pressure from large objects should move nearby dust.\n\nThe camera should react naturally to nearby impacts.\n\nUse aggressive but believable FPV movement.\n\nThe camera should feel like a real drone flying through an active construction site.\n\nREFERENCE MATCHING RULE\n\nThe reference image is the single source of truth for the final restaurant.\n\nDo not invent: new furniture, new walls, new windows, new architectural shapes, new colors, new lighting fixtures, new decorations, new\nlayouts, new signage, or additional rooms.\n\nIf an object is not visible or clearly implied by the reference, do not introduce it unnecessarily.\n\nThe AI must prioritize reference accuracy over adding visual complexity.\n\nFINAL NEGATIVE CONSTRAINTS\n\nNO CUTS.\n\nNO HIDDEN CUTS.\n\nNO CAMERA TELEPORTATION.\n\nNO CAMERA RESET.\n\nNO TIME JUMPS.\n\nNO MORPHING.\n\nNO MAGICALLY SPAWNED OBJECTS.\n\nNO RANDOM OBJECTS.\n\nNO DUPLICATED OBJECTS.\n\nNO FLOATING FURNITURE.\n\nNO IMPOSSIBLE PHYSICS.\n\nNO OBJECT INTERSECTIONS.\n\nNO MELTING MATERIALS.\n\nNO RUBBER-LIKE METAL.\n\nNO PLASTIC-LOOKING WOOD.\n\nNO CGI-LOOKING GLASS.\n\nNO DISTORTED ARCHITECTURE.\n\nNO RANDOM ROOM CHANGES.\n\nNO SCI-FI BUILDING.\n\nNO FUTURISTIC HOLOGRAMS.\n\nNO TEXT.\n\nNO CAPTIONS.\n\nNO WATERMARKS.\n\nNO LOGOS UNLESS THEY ARE PRESENT IN THE REFERENCE.\n\nNO PEOPLE UNLESS PRESENT IN THE REFERENCE.\n\nNO RANDOM CAMERA CUTS.\n\nNO SUDDEN CHANGE OF LENS.\n\nNO CHANGE OF ENVIRONMENT.\n\nNO CHANGE OF ARCHITECTURAL STYLE.\n\nThe entire sequence must feel like one physically continuous impossible construction event captured by one FPV camera.\n\nThe final restaurant must look real enough that the viewer could believe the entire interior was actually assembled around the camera."
      }
    ],
    "views": 0,
    "unlocks": 0,
    "createdAt": "2026-10-14T06:44:18.914Z",
    "updatedAt": "2026-10-14T06:44:18.914Z"
  }
];

const STORAGE_KEY_USER = "replyto_active_user_v6";
const STORAGE_KEY_USERS = "replyto_all_users_v6";
const STORAGE_KEY_POSTS = "replyto_shivai_posts_v6";

function getStoredUsers(): UserProfile[] {
  if (typeof window === "undefined") return [INITIAL_DEMO_USER];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((u: UserProfile) => {
          const isSysAdmin = isPlatformAdmin(u);
          return {
            ...u,
            isAdmin: isSysAdmin,
            role: isSysAdmin ? "admin" : "creator",
          };
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
  return [INITIAL_DEMO_USER];
}

function saveStoredUsers(users: UserProfile[]) {
  if (typeof window === "undefined") return;
  try {
    const sanitized = users.map((u) => {
      const isSysAdmin = isPlatformAdmin(u);
      return {
        ...u,
        isAdmin: isSysAdmin,
        role: isSysAdmin ? "admin" : "creator",
      };
    });
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(sanitized));
  } catch (e) {
    console.error(e);
  }
}

function getStoredUser(): UserProfile {
  if (typeof window === "undefined") return INITIAL_DEMO_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      const isSysAdmin = isPlatformAdmin(parsed);
      return {
        ...parsed,
        isAdmin: isSysAdmin,
        role: isSysAdmin ? "admin" : "creator",
      };
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_DEMO_USER;
}

function getStoredPosts(): Post[] {
  if (typeof window === "undefined") return INITIAL_DEMO_POSTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_DEMO_POSTS;
}

function saveStoredUser(user: UserProfile) {
  if (typeof window === "undefined") return;
  try {
    const isSysAdmin = isPlatformAdmin(user);
    const safeUser: UserProfile = {
      ...user,
      isAdmin: isSysAdmin,
      role: isSysAdmin ? "admin" : "creator",
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(safeUser));
    const all = getStoredUsers();
    const idx = all.findIndex((u) => u.uid === safeUser.uid || u.username.toLowerCase() === safeUser.username.toLowerCase());
    if (idx !== -1) {
      all[idx] = safeUser;
    } else {
      all.push(safeUser);
    }
    saveStoredUsers(all);
  } catch (e) {
    console.error(e);
  }
}

function saveStoredPosts(posts: Post[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts));
  } catch (e) {
    console.error(e);
  }
}

export const MockStore = {
  getUser(uidOrUsername?: string): UserProfile | null {
    if (!uidOrUsername) return null;
    const users = getStoredUsers();
    const found = users.find(
      (u) =>
        u.uid === uidOrUsername ||
        u.username.toLowerCase() === uidOrUsername.toLowerCase()
    );
    return found || null;
  },


  getAllUsers(): UserProfile[] {
    return getStoredUsers();
  },

  getUserByUsername(username: string): UserProfile | null {
    const users = getStoredUsers();
    const found = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
    return found || null;
  },

  isUsernameTaken(username: string, currentUid?: string): boolean {
    const users = getStoredUsers();
    return users.some(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.uid !== currentUid
    );
  },

  updateUser(updates: Partial<UserProfile>): UserProfile {
    const all = getStoredUsers();
    const existing = all.find(
      (u) =>
        (updates.uid && u.uid === updates.uid) ||
        (updates.username && u.username.toLowerCase() === updates.username.toLowerCase())
    );

    const base: UserProfile = existing || {
      uid: updates.uid || `user_${Date.now()}`,
      displayName: updates.displayName || "Creator",
      username: updates.username || "creator",
      bio: updates.bio || "Sharing my curated resources & links.",
      photoURL: updates.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${updates.username || "creator"}`,
      email: updates.email || "creator@gmail.com",
      createdAt: new Date().toISOString(),
    };

    const isSysAdmin = isPlatformAdmin({ ...base, ...updates });
    const updated: UserProfile = {
      ...base,
      ...updates,
      bio: updates.bio !== undefined ? updates.bio : base.bio,
      photoURL: updates.photoURL !== undefined ? updates.photoURL : base.photoURL,
      isAdmin: isSysAdmin,
      role: isSysAdmin ? "admin" : "creator",
      updatedAt: new Date().toISOString(),
    };

    saveStoredUser(updated);
    return updated;
  },

  addUser(user: UserProfile): UserProfile {
    const isSysAdmin = isPlatformAdmin(user);
    const safeUser: UserProfile = {
      ...user,
      isAdmin: isSysAdmin,
      role: isSysAdmin ? "admin" : "creator",
    };
    saveStoredUser(safeUser);
    return safeUser;
  },

  getPosts(uid?: string): Post[] {
    const posts = getStoredPosts();
    if (uid) {
      return posts.filter((p) => p.uid === uid).sort((a, b) => a.order - b.order);
    }
    return posts.sort((a, b) => a.order - b.order);
  },

  getPublishedPostsByUsername(username: string): Post[] {
    const user = this.getUserByUsername(username);
    if (!user) return [];
    const posts = getStoredPosts();
    return posts
      .filter((p) => p.uid === user.uid && p.status === "published")
      .sort((a, b) => a.order - b.order);
  },

  getPostBySlug(username: string, slug: string): { post: Post; user: UserProfile } | null {
    const user = this.getUserByUsername(username);
    if (!user) return null;
    const posts = getStoredPosts();
    const post = posts.find((p) => p.uid === user.uid && p.slug === slug);
    if (!post) return null;
    return { post, user };
  },

  getPostById(postId: string): Post | null {
    const posts = getStoredPosts();
    return posts.find((p) => p.id === postId) || null;
  },

  savePost(postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "views" | "unlocks"> & { id?: string }): Post {
    const posts = getStoredPosts();
    const now = new Date().toISOString();

    if (postData.id) {
      const index = posts.findIndex((p) => p.id === postData.id);
      if (index !== -1) {
        const updated: Post = {
          ...posts[index],
          ...postData,
          id: postData.id,
          updatedAt: now,
        };
        posts[index] = updated;
        saveStoredPosts(posts);
        return updated;
      }
    }

    const newPost: Post = {
      ...postData,
      id: postData.id || `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      views: 0,
      unlocks: 0,
      createdAt: now,
      updatedAt: now,
    };
    posts.unshift(newPost);
    saveStoredPosts(posts);
    return newPost;
  },

  setPosts(posts: Post[], uid?: string): void {
    if (!uid) {
      saveStoredPosts(posts);
      return;
    }
    const all = getStoredPosts();
    const other = all.filter((p) => p.uid !== uid);
    const updated = [...other, ...posts.map((p) => ({ ...p, uid }))];
    saveStoredPosts(updated);
  },


  deletePost(postId: string): boolean {
    const posts = getStoredPosts();
    const filtered = posts.filter((p) => p.id !== postId && p.slug !== postId);
    saveStoredPosts(filtered);
    return true;
  },

  reorderPosts(reorderedPostIds: string[]): Post[] {
    const posts = getStoredPosts();
    const updated = posts.map((post) => {
      const newOrder = reorderedPostIds.indexOf(post.id);
      if (newOrder !== -1) {
        return { ...post, order: newOrder };
      }
      return post;
    });
    saveStoredPosts(updated);
    return updated.sort((a, b) => a.order - b.order);
  },

  incrementViews(postId: string): void {
    const posts = getStoredPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.views = (post.views || 0) + 1;
      saveStoredPosts(posts);
    }
  },

  incrementUnlocks(postId: string): void {
    const posts = getStoredPosts();
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.unlocks = (post.unlocks || 0) + 1;
      saveStoredPosts(posts);
    }
  },

  resetToDefault() {
    saveStoredUser(INITIAL_DEMO_USER);
    saveStoredPosts(INITIAL_DEMO_POSTS);
  },
};
