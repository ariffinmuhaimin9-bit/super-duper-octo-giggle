# MinVerse Hub 2.0 — Release Readiness

This repository is a release-candidate work area, not a verified full release.

## Changes in this package

- Added Android GitHub Actions CI using JDK 21, Android SDK, and Gradle 9.3.1.
- CI runs `testDebugUnitTest` and `assembleDebug`, then stores the debug APK as an artifact.
- OpenGL shader compilation and program linking now check status and report driver logs instead of silently continuing with invalid shader state.
- The Compose-hosted GLSurfaceView now pauses/resumes with the Android lifecycle and pauses on disposal.

## Required validation before calling this a full release

1. Push this branch to GitHub and wait for the Android CI workflow to pass.
2. Install the generated debug APK on at least two physical Android devices.
3. Verify sign-in, profile, game catalogue, World rendering, touch controls, app background/foreground, and low-memory behavior.
4. Test cloud multiplayer with two authenticated accounts and local Wi-Fi multiplayer on the same LAN.
5. Implement and verify authoritative, rate-limited real-time player transform replication. The current Firestore room document is lobby state, not a high-frequency game-state transport.
6. Test portal destination routing and each game's distinct win/lose/restart loop.
7. Configure production Firebase security rules, App Check enforcement, API-key restrictions, and release signing secrets.
8. Produce a signed release AAB/APK from the intended production signing key.

## Important limitations

- This environment does not contain Android SDK/platform tools or a Gradle installation and cannot access the Gradle distribution host. Therefore no Android build or device test is claimed here.
- `gradle/wrapper/gradle-wrapper.jar` is absent from the supplied archive. CI intentionally uses a pinned Gradle installation and does not depend on the wrapper.
- The current world is a low-poly OpenGL ES prototype. It is not yet a complete 3D social world with production avatar assets, collision/portal routing, or networked player presence.
- Online and LAN room/lobby code exists in the source, but that alone does not prove synchronized real-time multiplayer gameplay.
- A production release signing key and credentials must be supplied/managed by the project owner; never commit those secrets.
