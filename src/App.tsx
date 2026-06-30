import { useGame } from "./state/store";
import PickAreaMap from "./map/PickAreaMap";
import Scene from "./three/Scene";
import Hud from "./ui/Hud";
import ResultPanel from "./ui/ResultPanel";

// Phase drives which view is shown: the map in pick-area, the 3D game in every
// other phase. The store is the single source of truth.
export default function App() {
  const phase = useGame((s) => s.phase);

  if (phase === "pick-area") return <PickAreaMap />;

  return (
    <>
      <Scene />
      <Hud />
      <ResultPanel />
    </>
  );
}
