import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Dart from "./Dart";
import { useGame } from "../state/store";
import { useThrowUI } from "../state/throwStore";
import { useProjectedPins, type ProjectedPin } from "./pins";
import {
  launchVelocity,
  impactOnBoard,
  boardPointToUV,
  hitTest,
  type Vec3,
} from "../lib/physics";
import { CHARGE_RATE, GRAVITY, THROW_DISTANCE } from "../lib/constants";

/** First-person launch point of the dart (physics origin). */
const THROW_ORIGIN = new THREE.Vector3(0, 0.25, THROW_DISTANCE - 0.3);
const FORWARD = new THREE.Vector3(0, 0, -1);

interface Flight {
  active: boolean;
  resolved: boolean;
  origin: THREE.Vector3;
  velocity: Vec3;
  tEnd: number;
  elapsed: number;
  hit: boolean;
  restaurant: ProjectedPin["restaurant"] | null;
}

export default function Thrower() {
  const { raycaster, pointer, camera } = useThree();
  const releaseThrow = useGame((s) => s.releaseThrow);
  const resolveThrow = useGame((s) => s.resolveThrow);
  const phase = useGame((s) => s.phase);

  const pins = useProjectedPins();
  const pinsRef = useRef<ProjectedPin[]>(pins);
  pinsRef.current = pins;

  const dartRef = useRef<THREE.Group>(null);
  const reticleRef = useRef<THREE.Mesh>(null);
  const reticleMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const chargeDir = useRef(1);
  const flight = useRef<Flight>({
    active: false,
    resolved: false,
    origin: THROW_ORIGIN.clone(),
    velocity: { x: 0, y: 0, z: -1 },
    tEnd: 0,
    elapsed: 0,
    hit: false,
    restaurant: null,
  });

  // scratch vectors (avoid per-frame allocation)
  const tmpBoard = useRef(new THREE.Vector3());
  const tmpDir = useRef(new THREE.Vector3());
  const tmpQuat = useRef(new THREE.Quaternion());
  const lastAimLabel = useRef<string | null>(null);

  // Re-arm whenever we (re)enter aim — fresh dart in hand, power cleared.
  useEffect(() => {
    if (phase !== "aim") return;
    flight.current.active = false;
    flight.current.resolved = false;
    flight.current.elapsed = 0;
    chargeDir.current = 1;
    useThrowUI.getState().reset();
  }, [phase]);

  // Charge on press, throw on release — only while aiming.
  useEffect(() => {
    const dom = (document.querySelector("canvas") as HTMLElement) ?? window;
    const onDown = () => {
      if (useGame.getState().phase !== "aim") return;
      chargeDir.current = 1;
      useThrowUI.setState({ charging: true, power: 0 });
    };
    const onUp = () => {
      const ui = useThrowUI.getState();
      if (!ui.charging || useGame.getState().phase !== "aim") return;
      ui.setCharging(false);
      fire(ui.power);
    };
    dom.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      dom.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Where the cursor ray meets the board plane (z=0), into `out`. */
  function cursorOnBoard(out: THREE.Vector3): THREE.Vector3 | null {
    raycaster.setFromCamera(pointer, camera);
    const o = raycaster.ray.origin;
    const d = raycaster.ray.direction;
    if (d.z === 0) return null;
    const t = -o.z / d.z;
    if (t <= 0) return null;
    return out.set(o.x + d.x * t, o.y + d.y * t, 0);
  }

  /** Aim direction from the throw origin toward the current cursor board point. */
  function aimDir(out: THREE.Vector3): THREE.Vector3 {
    const board = cursorOnBoard(tmpBoard.current);
    if (!board) return out.copy(FORWARD);
    return out.copy(board).sub(THROW_ORIGIN).normalize();
  }

  /** Commit the throw at the given power. */
  function fire(power: number) {
    const dir = aimDir(tmpDir.current);
    const velocity = launchVelocity({ x: dir.x, y: dir.y, z: dir.z }, power);
    const impact = impactOnBoard(THROW_ORIGIN, velocity, GRAVITY);
    if (!impact) return; // never reaches board; ignore stray release
    const uv = boardPointToUV(impact.point);
    const idx = hitTest(uv, pinsRef.current);
    const restaurant = idx >= 0 ? pinsRef.current[idx].restaurant : null;

    flight.current = {
      active: true,
      resolved: false,
      origin: THROW_ORIGIN.clone(),
      velocity,
      tEnd: impact.t,
      elapsed: 0,
      hit: idx >= 0,
      restaurant,
    };
    releaseThrow();
  }

  /** Position the dart along its parabola at time τ, oriented along motion. */
  function placeDartAt(tau: number) {
    const f = flight.current;
    const x = f.origin.x + f.velocity.x * tau;
    const y = f.origin.y + f.velocity.y * tau - 0.5 * GRAVITY * tau * tau;
    const z = f.origin.z + f.velocity.z * tau;
    const dart = dartRef.current;
    if (!dart) return;
    dart.position.set(x, y, z);
    // orient along instantaneous velocity
    tmpDir.current
      .set(f.velocity.x, f.velocity.y - GRAVITY * tau, f.velocity.z)
      .normalize();
    dart.quaternion.copy(
      tmpQuat.current.setFromUnitVectors(FORWARD, tmpDir.current),
    );
  }

  useFrame((_state, delta) => {
    const ph = useGame.getState().phase;
    const dart = dartRef.current;

    if (ph === "aim") {
      const ui = useThrowUI.getState();
      // charge oscillates so power requires timing
      if (ui.charging) {
        let p = ui.power + CHARGE_RATE * delta * chargeDir.current;
        if (p >= 1) {
          p = 1;
          chargeDir.current = -1;
        } else if (p <= 0) {
          p = 0;
          chargeDir.current = 1;
        }
        ui.setPower(p);
      }
      const previewPower = ui.charging ? ui.power : 0.5;

      const dir = aimDir(tmpDir.current);
      // hold the dart at the origin, pointing where we aim
      if (dart) {
        dart.position.copy(THROW_ORIGIN);
        dart.quaternion.copy(
          tmpQuat.current.setFromUnitVectors(FORWARD, dir),
        );
      }
      // predicted landing for current aim + power → reticle
      const velocity = launchVelocity({ x: dir.x, y: dir.y, z: dir.z }, previewPower);
      const impact = impactOnBoard(THROW_ORIGIN, velocity, GRAVITY);
      if (impact && reticleRef.current) {
        reticleRef.current.visible = true;
        reticleRef.current.position.set(
          impact.point.x,
          impact.point.y,
          0.04,
        );
        const idx = hitTest(boardPointToUV(impact.point), pinsRef.current);
        const over = idx >= 0;
        reticleMatRef.current?.color.set(over ? "#46b877" : "#d9a441");
        const label = over ? pinsRef.current[idx].restaurant.name : null;
        if (label !== lastAimLabel.current) {
          lastAimLabel.current = label;
          useThrowUI.getState().setAimLabel(label);
        }
      } else if (reticleRef.current) {
        reticleRef.current.visible = false;
      }
    } else if (ph === "throw") {
      const f = flight.current;
      if (f.active && !f.resolved) {
        f.elapsed += delta;
        const tau = Math.min(f.elapsed, f.tEnd);
        placeDartAt(tau);
        if (f.elapsed >= f.tEnd) {
          f.resolved = true;
          resolveThrow({
            hit: f.hit,
            restaurant: f.restaurant,
            at: Date.now(),
          });
        }
      }
    } else if (ph === "result/retry") {
      // dart stays stuck at the impact point (placed on the final throw frame)
      if (dart && flight.current.tEnd > 0) placeDartAt(flight.current.tEnd);
    }
  });

  return (
    <group>
      <Dart ref={dartRef} />
      <mesh ref={reticleRef} visible={false}>
        <ringGeometry args={[0.18, 0.26, 32]} />
        <meshBasicMaterial
          ref={reticleMatRef}
          color="#d9a441"
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
