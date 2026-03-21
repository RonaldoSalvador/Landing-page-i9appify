import { Application, extend } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useMemo } from 'react';
import { useSquadStore } from '../../store/useSquadStore';
import { AgentDesk, CELL_W, CELL_H, GRID_OFFSET_X, GRID_OFFSET_Y } from './AgentDesk';
import { drawFloor } from './drawRoom';
import { drawBookshelf, drawPlant, drawClock, drawWhiteboard, drawCoffeeMachine, drawFilingCabinet } from './drawFurniture';
import { TILE, COLORS, SCENE_SCALE } from './palette';

extend({ Container, Graphics });

const MIN_STAGE_W = 400;
const MIN_STAGE_H = 320;

function sortAgentsByDesk(agents) {
  return [...agents].sort((a, b) => {
    if (a.desk.row !== b.desk.row) return a.desk.row - b.desk.row;
    return a.desk.col - b.desk.col;
  });
}

export function OfficeScene() {
  const activeState = useSquadStore((s) =>
    s.selectedSquad ? s.activeStates.get(s.selectedSquad) : undefined
  );
  const squadInfo = useSquadStore((s) =>
    s.selectedSquad ? s.squads.get(s.selectedSquad) : undefined
  );

  const agents = useMemo(
    () => (activeState?.agents ? sortAgentsByDesk(activeState.agents) : []),
    [activeState]
  );

  const maxCol = agents.length > 0 ? Math.max(...agents.map((a) => a.desk.col)) : 1;
  const maxRow = agents.length > 0 ? Math.max(...agents.map((a) => a.desk.row)) : 1;

  const wallTop = TILE * 2;
  const marginX = Math.round(TILE * 1.5);
  const marginY = TILE * 1;
  const floorW = marginX * 2 + maxCol * CELL_W;
  const floorH = marginY * 2 + maxRow * CELL_H;
  const floorX = GRID_OFFSET_X - marginX;
  const floorY = GRID_OFFSET_Y - marginY;
  const stageW = Math.max(floorX + floorW + marginX, MIN_STAGE_W);
  const stageH = Math.max(floorY + floorH + marginY, MIN_STAGE_H);

  const drawBackground = useCallback(
    (g) => {
      g.clear();

      // Dark void surround
      g.rect(0, 0, stageW, stageH);
      g.fill({ color: 0x101018 });

      // Floor (wood planks)
      drawFloor(g, floorW, floorH, floorX, floorY);

      // Top wall
      g.rect(floorX - 1, 0, floorW + 2, wallTop);
      g.fill({ color: COLORS.wallFace });
      g.rect(floorX - 1, wallTop - 3, floorW + 2, 3);
      g.fill({ color: COLORS.wallShadow });
      g.rect(floorX, wallTop, floorW, 3);
      g.fill({ color: 0x000000, alpha: 0.06 });

      // Room borders
      g.rect(floorX - 1, wallTop, 1, floorH);
      g.fill({ color: COLORS.wallShadow });
      g.rect(floorX + floorW, wallTop, 1, floorH);
      g.fill({ color: COLORS.wallShadow });
      g.rect(floorX - 1, wallTop + floorH, floorW + 2, 1);
      g.fill({ color: COLORS.wallShadow });

      // Wall-mounted furniture
      const wallItemY = 4;
      drawBookshelf(g, floorX + 10, wallItemY);
      if (floorW > 300) {
        drawBookshelf(g, floorX + floorW - 74, wallItemY);
      }
      drawWhiteboard(g, floorX + floorW / 2 - 24, wallItemY);
      drawClock(g, floorX + floorW / 2 + 28, wallItemY + 6);

      // Floor furniture
      drawPlant(g, floorX + 4, floorY + 8);
      drawPlant(g, floorX + floorW - 36, floorY + 8);
      drawPlant(g, floorX + 4, floorY + floorH - 36);
      drawFilingCabinet(g, floorX + floorW - 36, floorY + floorH - 52);

      if (floorH > 200) {
        drawCoffeeMachine(g, floorX + floorW - 36, floorY + floorH / 2 - 16);
      }
    },
    [stageW, stageH, floorW, floorH, floorX, floorY, wallTop]
  );

  if (!activeState) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 8,
        color: '#888',
      }}>
        {squadInfo ? (
          <>
            <span style={{ fontSize: 48 }}>{squadInfo.icon}</span>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{squadInfo.name}</span>
            <span style={{ fontSize: 13, opacity: 0.6 }}>{squadInfo.description}</span>
            <span style={{ fontSize: 12, marginTop: 12, opacity: 0.4 }}>Squad não está rodando</span>
          </>
        ) : (
          <span style={{ fontSize: 14, opacity: 0.5 }}>Selecione um squad para monitorar</span>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <Application
        width={stageW * SCENE_SCALE}
        height={stageH * SCENE_SCALE}
        backgroundColor={0x101018}
      >
        <pixiContainer scale={SCENE_SCALE}>
          <pixiGraphics draw={drawBackground} />
          {agents.map((agent, i) => (
            <AgentDesk key={agent.id} agent={agent} agentIndex={i} />
          ))}
        </pixiContainer>
      </Application>
    </div>
  );
}
