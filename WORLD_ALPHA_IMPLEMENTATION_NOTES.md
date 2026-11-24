# World Alpha implementation notes

## Files

- `app/src/main/java/com/example/ui/world/MinVerseWorldScreen.kt`
  - Compose overlay and AndroidView host.
  - Drag joystick reports normalized input continuously.
  - Jump control invokes the renderer jump action.
- `app/src/main/java/com/example/ui/world/MinVerseWorldRenderer.kt`
  - OpenGL ES 2.0 scene renderer.
  - Perspective third-person follow camera.
  - Delta-time movement and jump/gravity update.
  - Low-poly environment and avatar geometry.

## Current controls

- Drag the on-screen joystick to walk in the corresponding direction.
- Tap **Lompat** to jump.
- Tap **Pilih permainan** to return to the existing game catalogue.
- Tap **Keluar** to return to the hub.

## Next integration work

- Replace primitive block avatar with a rigged model and animation clips.
- Add collision detection and world bounds based on scene geometry.
- Add portal trigger volumes and destination mapping.
- Introduce world presence and player transform replication over a real-time transport.
- Add Wi-Fi peer discovery and connection UX.
- Run Android Studio Gradle sync/build and device testing.
