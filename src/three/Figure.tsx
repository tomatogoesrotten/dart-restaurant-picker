import Dart from "./Dart";

const SKIN = "#caa07a";
const CLOTHES = "#e23b3b";
const PANTS = "#2a3340";

/**
 * A simple un-rigged low-poly figure (feet at local y=0) facing the board (-z),
 * right arm raised holding a dart. Shown only during the brief 3rd-person beat.
 */
export default function Figure() {
  return (
    <group>
      {/* legs */}
      <mesh position={[-0.16, 0.45, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.9, 8]} />
        <meshStandardMaterial color={PANTS} />
      </mesh>
      <mesh position={[0.16, 0.45, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.9, 8]} />
        <meshStandardMaterial color={PANTS} />
      </mesh>

      {/* torso */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.6, 0.75, 0.32]} />
        <meshStandardMaterial color={CLOTHES} />
      </mesh>

      {/* head */}
      <mesh position={[0, 1.85, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={SKIN} />
      </mesh>

      {/* left arm down */}
      <mesh position={[-0.42, 1.2, 0]} rotation={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
        <meshStandardMaterial color={CLOTHES} />
      </mesh>

      {/* right upper arm, raised forward */}
      <mesh position={[0.42, 1.5, 0.18]} rotation={[-0.9, 0, -0.2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.7, 8]} />
        <meshStandardMaterial color={CLOTHES} />
      </mesh>

      {/* dart held in the raised hand, pointing toward the board */}
      <group position={[0.5, 1.75, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <Dart />
      </group>
    </group>
  );
}
