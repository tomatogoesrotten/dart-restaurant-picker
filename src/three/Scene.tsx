import { Canvas } from "@react-three/fiber";
import { useGame } from "../state/store";
import Board from "./Board";
import Figure from "./Figure";
import Thrower from "./Thrower";
import CameraRig from "./CameraRig";
import { BOARD_SIZE, THROW_DISTANCE } from "../lib/constants";

const FLOOR_Y = -BOARD_SIZE / 2;

export default function Scene() {
  const phase = useGame((s) => s.phase);
  const inFirstPerson =
    phase === "aim" || phase === "throw" || phase === "result/retry";

  return (
    <Canvas
      camera={{
        position: [4, 2.6, THROW_DISTANCE + 3.4],
        fov: 55,
        near: 0.1,
        far: 120,
      }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <color attach="background" args={["#0d1014"]} />
      <fog attach="fog" args={["#0d1014", 16, 40]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 9, 7]} intensity={1.15} />
      <directionalLight position={[-6, 2, 4]} intensity={0.3} color="#9fb6ff" />

      <CameraRig />
      <Board />

      {phase === "materialize" && (
        <group position={[1.3, FLOOR_Y, THROW_DISTANCE - 1.3]}>
          <Figure />
        </group>
      )}

      {inFirstPerson && <Thrower />}

      {/* subtle floor at the board's base for grounding */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 4]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#0a0d11" />
      </mesh>
    </Canvas>
  );
}
