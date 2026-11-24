# MinVerse Hub 2.0 — World Alpha

This is an Android/Kotlin + Jetpack Compose project with a native OpenGL ES 2.0 MinVerse World prototype. Existing app screens, account flow, catalogue, Firestore room metadata and Wi-Fi room code are retained.

## Open the project

1. Open this project folder in Android Studio.
2. Let Android Studio sync the Gradle project.
3. Confirm `google-services.json` belongs to your Firebase project before running Firebase-backed features.
4. Run the `app` configuration on an Android device or emulator with OpenGL ES 2.0 support.
5. In the app, tap **World** in the top bar.

## World Alpha features in this revision

- Native OpenGL ES 2.0 rendering; no additional 3D engine dependency.
- Perspective camera that follows the local avatar.
- Touch joystick with continuous movement rather than single-step taps.
- Jump action with simple gravity.
- Low-poly floating island, central plaza, fountain, trees, decorative rocks and three colored portal gates.
- Simple walking leg animation.
- Existing app navigation back to the game catalogue.

## Important implementation boundaries

This is a local playable 3D world prototype, not a completed online multiplayer release. The current renderer simulates one local player. It does not yet stream player transforms to Firebase or Wi-Fi peers, and the portal gates are visual landmarks rather than connected game launchers. The existing Firestore room model is designed for room metadata and ready/status state; it should not be used for high-frequency position streaming.

Before enabling public multiplayer, implement and test:

1. A shared world-session identity and participant lifecycle.
2. A versioned player-state packet (position, facing, animation state, sequence number and timestamp).
3. A real-time transport with interpolation, stale-packet handling, reconnect and host/session authority. Firestore can continue to hold room metadata; use a suitable real-time channel for movement.
4. The same packet contract for local Wi-Fi transport, with peer discovery and connection failure handling.
5. Collision boundaries, portal proximity detection and actual game transitions.
6. Automated build, device tests, network tests and performance profiling on target Android phones.

## Build verification

The source package is prepared for Android Studio, but an Android SDK/Gradle build was not available in the editing environment. Run a Gradle sync and build in Android Studio before installing or publishing. Do not treat this ZIP as a signed release APK.
