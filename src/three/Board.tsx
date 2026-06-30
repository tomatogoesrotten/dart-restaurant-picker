import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGame } from "../state/store";
import { BOARD_SIZE } from "../lib/constants";
import { useProjectedPins, type ProjectedPin } from "./pins";

function Pin({ pin }: { pin: ProjectedPin }) {
  return (
    <group position={[pin.x, pin.y, 0]}>
      {/* stem out of the board (cylinder axis rotated from y to z) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]}>
        <cylinderGeometry args={[0.014, 0.014, 0.12, 8]} />
        <meshStandardMaterial color="#243029" />
      </mesh>
      <mesh position={[0, 0, 0.14]}>
        <sphereGeometry args={[0.085, 16, 16]} />
        <meshStandardMaterial
          color="#46b877"
          emissive="#46b877"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** The map-textured board plane (z=0) plus one pin per filtered restaurant. */
export default function Board() {
  const boardTexture = useGame((s) => s.boardTexture);
  const pins = useProjectedPins();

  const texture = useMemo(() => {
    if (!boardTexture) return null;
    const t = new THREE.TextureLoader().load(boardTexture);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [boardTexture]);

  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <group>
      <mesh>
        <planeGeometry args={[BOARD_SIZE, BOARD_SIZE]} />
        {texture ? (
          <meshBasicMaterial map={texture} />
        ) : (
          <meshBasicMaterial color="#1a2230" />
        )}
      </mesh>
      {/* thin brass frame */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(BOARD_SIZE, BOARD_SIZE)]}
        />
        <lineBasicMaterial color="#d9a441" toneMapped={false} />
      </lineSegments>
      {pins.map((pin) => (
        <Pin key={pin.restaurant.id} pin={pin} />
      ))}
    </group>
  );
}
