const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const { test, before, after, beforeEach } = require("node:test");
const fs = require("node:fs");

let testEnv;
const PROJECT_ID = process.env.GCP_PROJECT || "demo-no-project";
const ALICE_UID = "alice_uid_123";
const BOB_UID = "bob_uid_456";
const CHARLIE_UID = "charlie_uid_789";

const [emulatorHost, emulatorPortStr] = (process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8085").split(":");
const emulatorPort = parseInt(emulatorPortStr, 10);

before(async () => {
  const rules = fs.readFileSync("./firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: emulatorHost,
      port: emulatorPort,
    },
  });
});

after(async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
});

beforeEach(async () => {
  if (testEnv) {
    await testEnv.clearFirestore();
  }
});

// --- USER PROFILE TESTS ---

test("Unauthenticated user: cannot read or write UserProfile", async () => {
  const unauthDb = testEnv.unauthenticatedContext().firestore();
  await assertFails(unauthDb.collection("users").doc(ALICE_UID).get());
  await assertFails(
    unauthDb.collection("users").doc(ALICE_UID).set({
      userId: ALICE_UID,
      displayName: "Hacker",
      avatarEmoji: "🦊",
      avatarColorHex: "#38BDF8",
      bio: "Hi",
      favoriteBadge: "Pemain Baru",
      totalScore: 0,
      gamesPlayed: 0,
      favoriteGameIds: [],
      createdAt: new Date(Date.now() - 1000),
      updatedAt: new Date(Date.now() - 1000),
    })
  );
});

test("UserProfile owner: create, partial update, and cross-user isolation", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();
  const past = new Date(Date.now() - 5000);

  // Valid create (matches Kotlin UserProfile payload without @DocumentId `id`)
  await assertSucceeds(
    aliceDb.collection("users").doc(ALICE_UID).set({
      userId: ALICE_UID,
      displayName: "Kuki Fox",
      avatarEmoji: "🦊",
      avatarColorHex: "#38BDF8",
      bio: "Suka main Sumo 3D!",
      favoriteBadge: "Juara Sumo",
      totalScore: 100,
      gamesPlayed: 3,
      favoriteGameIds: ["sumo_3d", "pong_neon"],
      createdAt: past,
      updatedAt: past,
    })
  );

  // Owner read succeeds
  await assertSucceeds(aliceDb.collection("users").doc(ALICE_UID).get());

  // Cross-user read & write fail
  await assertFails(bobDb.collection("users").doc(ALICE_UID).get());
  await assertFails(bobDb.collection("users").doc(ALICE_UID).update({ displayName: "Stolen" }));

  // Owner partial update succeeds
  await assertSucceeds(
    aliceDb.collection("users").doc(ALICE_UID).update({
      displayName: "Kuki Pro",
      bio: "Master MiniVerse!",
      totalScore: 150,
      gamesPlayed: 4,
      updatedAt: new Date(Date.now() - 1000),
    })
  );

  // Reject immutable createdAt modification & shadow fields & future timestamps
  await assertFails(
    aliceDb.collection("users").doc(ALICE_UID).update({
      createdAt: new Date(Date.now() - 500),
      updatedAt: new Date(Date.now() - 500),
    })
  );
  await assertFails(
    aliceDb.collection("users").doc(ALICE_UID).update({
      isAdmin: true,
      updatedAt: new Date(Date.now() - 500),
    })
  );
  await assertFails(
    aliceDb.collection("users").doc(ALICE_UID).update({
      displayName: "Future",
      updatedAt: new Date(Date.now() + 60000),
    })
  );
});

// --- GAME ROOM TESTS ---

test("GameRoom: host create, guest join, ready toggle, emote, start & rematch", async () => {
  const aliceDb = testEnv.authenticatedContext(ALICE_UID).firestore();
  const bobDb = testEnv.authenticatedContext(BOB_UID).firestore();
  const charlieDb = testEnv.authenticatedContext(CHARLIE_UID).firestore();
  const past = new Date(Date.now() - 5000);

  // Host creates 4-digit room
  await assertSucceeds(
    aliceDb.collection("rooms").doc("room_4821").set({
      roomCode: "4821",
      hostUid: ALICE_UID,
      hostName: "Kuki Fox",
      hostAvatar: "🦊",
      guestReady: false,
      gameId: "sumo_3d",
      status: "waiting",
      lastEmote: "Jom mula!",
      lastEmoteSender: "Kuki Fox",
      createdAt: past,
      updatedAt: past,
    })
  );

  // Unfiltered list query fails; host-filtered list query succeeds
  await assertFails(aliceDb.collection("rooms").get());
  await assertSucceeds(aliceDb.collection("rooms").where("hostUid", "==", ALICE_UID).get());

  // Bob joins room
  await assertSucceeds(
    bobDb.collection("rooms").doc("room_4821").update({
      guestUid: BOB_UID,
      guestName: "Milo Panda",
      guestAvatar: "🐼",
      guestReady: false,
      updatedAt: new Date(Date.now() - 2000),
    })
  );

  // Charlie cannot hijack room once guestUid is set
  await assertFails(
    charlieDb.collection("rooms").doc("room_4821").update({
      guestUid: CHARLIE_UID,
      guestName: "Charlie",
      guestAvatar: "🤖",
      guestReady: false,
      updatedAt: new Date(Date.now() - 1500),
    })
  );

  // Bob toggles ready
  await assertSucceeds(
    bobDb.collection("rooms").doc("room_4821").update({
      guestReady: true,
      updatedAt: new Date(Date.now() - 1000),
    })
  );

  // Bob sends safe quick emote
  await assertSucceeds(
    bobDb.collection("rooms").doc("room_4821").update({
      lastEmote: "Hebat gila!",
      lastEmoteSender: "Milo Panda",
      updatedAt: new Date(Date.now() - 800),
    })
  );

  // Host starts game
  await assertSucceeds(
    aliceDb.collection("rooms").doc("room_4821").update({
      status: "playing",
      updatedAt: new Date(Date.now() - 500),
    })
  );

  // Host finishes game
  await assertSucceeds(
    aliceDb.collection("rooms").doc("room_4821").update({
      status: "finished",
      updatedAt: new Date(Date.now() - 300),
    })
  );

  // Cannot send emote once finished (terminal state protection)
  await assertFails(
    bobDb.collection("rooms").doc("room_4821").update({
      lastEmote: "Alamak!",
      lastEmoteSender: "Milo Panda",
      updatedAt: new Date(Date.now() - 200),
    })
  );

  // Host can reset back to waiting for rematch
  await assertSucceeds(
    aliceDb.collection("rooms").doc("room_4821").update({
      status: "waiting",
      guestReady: false,
      updatedAt: new Date(Date.now() - 100),
    })
  );
});
