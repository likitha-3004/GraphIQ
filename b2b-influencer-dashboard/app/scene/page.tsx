import { Scene } from "../Scene";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "WarpFieldBackground — Letter Storm (Scene)",
  description: "160 tumbling glyphs wandering off the rails while the streak field keeps the corridor moving.",
};

export default function ScenePage() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", margin: 0, padding: 0 }}>
      <Scene />
    </div>
  );
}
