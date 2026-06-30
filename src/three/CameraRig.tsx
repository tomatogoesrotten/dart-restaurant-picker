import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "../state/store";
import { THROW_DISTANCE } from "../lib/constants";

const THIRD_PERSON = new THREE.Vector3(4, 2.6, THROW_DISTANCE + 3.4);
const FIRST_PERSON = new THREE.Vector3(0, 0.85, THROW_DISTANCE);
const LOOK_AT = new THREE.Vector3(0, 0, 0);

/** How long the third-person "figure holding a dart" beat lingers (ms). */
const MATERIALIZE_BEAT_MS = 1900;

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Drives the camera pose from the phase and runs the materialize → aim beat. */
export default function CameraRig() {
  const { camera } = useThree();
  const phase = useGame((s) => s.phase);
  const materialized = useGame((s) => s.materialized);
  const target = useRef(new THREE.Vector3().copy(THIRD_PERSON));

  useEffect(() => {
    if (phase === "materialize") {
      camera.position.copy(THIRD_PERSON); // snap so the beat reads
      target.current.copy(THIRD_PERSON);
      const id = setTimeout(materialized, MATERIALIZE_BEAT_MS);
      return () => clearTimeout(id);
    }
    // aim / throw / result share the first-person pose; the lerp is the zoom-in
    target.current.copy(FIRST_PERSON);
    if (reduceMotion) camera.position.copy(FIRST_PERSON);
  }, [phase, camera, materialized]);

  useFrame((_state, delta) => {
    if (!reduceMotion) {
      const alpha = 1 - Math.exp(-3.5 * delta);
      camera.position.lerp(target.current, alpha);
    }
    camera.lookAt(LOOK_AT);
  });

  return null;
}
