import type { BeatSpec, CourseMode, Lang, RepMode } from '../types';
import { Scene0Dehydration } from './Scene0Dehydration';
import { Scene1HelixAndRuler } from './Scene1HelixAndRuler';
import { Scene2EnzymeAlbumin } from './Scene2EnzymeAlbumin';
import { Scene3GpcrOrgans } from './Scene3GpcrOrgans';

export interface BioStageProps {
  mode: CourseMode;
  currentTime: number;
  activeBeat: BeatSpec;
  repMode: RepMode;
  showLabels: boolean;
  lang: Lang;
}

export function BioStage({
  mode,
  currentTime,
  activeBeat,
  repMode,
  showLabels,
  lang,
}: BioStageProps) {
  const duration = Math.max(0.01, activeBeat.end - activeBeat.start);
  const localT = Math.max(0, Math.min(1, (currentTime - activeBeat.start) / duration));
  const sceneIdx = activeBeat.sceneIdx;

  return (
    <group>
      {sceneIdx === 0 && (
        <Scene0Dehydration
          localT={localT}
          repMode={repMode}
          showLabels={showLabels}
          lang={lang}
        />
      )}
      {sceneIdx === 1 && (
        <Scene1HelixAndRuler
          localT={localT}
          mode={mode}
          repMode={repMode}
          showLabels={showLabels}
          lang={lang}
        />
      )}
      {sceneIdx === 2 && (
        <Scene2EnzymeAlbumin
          localT={localT}
          mode={mode}
          repMode={repMode}
          showLabels={showLabels}
          lang={lang}
        />
      )}
      {sceneIdx === 3 && (
        <Scene3GpcrOrgans
          localT={localT}
          mode={mode}
          repMode={repMode}
          showLabels={showLabels}
          lang={lang}
        />
      )}
    </group>
  );
}
