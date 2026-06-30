import { forwardRef } from "react";
import * as THREE from "three";

/**
 * A dart whose nose points along local -z (forward, toward the board). The
 * parent positions/orients it via the forwarded ref — during flight the Thrower
 * mutates this group's transform every frame.
 */
const Dart = forwardRef<THREE.Group>(function Dart(_props, ref) {
  return (
    <group ref={ref}>
      {/* shaft (cylinder axis rotated from y to z) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.5, 10]} />
        <meshStandardMaterial color="#cfd6e0" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* tip cone pointing -z */}
      <mesh position={[0, 0, -0.31]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.03, 0.13, 10]} />
        <meshStandardMaterial
          color="#d9a441"
          metalness={0.7}
          roughness={0.2}
          emissive="#d9a441"
          emissiveIntensity={0.25}
          toneMapped={false}
        />
      </mesh>
      {/* flights (two crossed fins at the tail) */}
      <mesh position={[0, 0, 0.22]}>
        <boxGeometry args={[0.16, 0.0015, 0.16]} />
        <meshStandardMaterial color="#e23b3b" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.22]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.16, 0.0015, 0.16]} />
        <meshStandardMaterial color="#e23b3b" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
});

export default Dart;
