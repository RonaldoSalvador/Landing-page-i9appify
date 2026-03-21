import { useEffect } from 'react';
import { useSquadStore } from '../../store/useSquadStore';
import { OfficeScene } from '../../components/office/OfficeScene';

// Status labels
const STATUS_LABEL = {
  idle:        { label: 'Aguardando',  color: '#aaaacc', bg: 'rgba(170,170,204,0.1)' },
  working:     { label: 'Rodando',     color: '#60b0ff', bg: 'rgba(96,176,255,0.1)' },
  checkpoint:  { label: 'Checkpoint', color: '#ffbb22', bg: 'rgba(255,187,34,0.1)' },
  concluido:   { label: 'Concluído',  color: '#60f080', bg: 'rgba(96,240,128,0.1)' },
  erro:        { label: 'Erro',        color: '#ff6060', bg: 'rgba(255,96,96,0.1)' },
};

function StatusBadge({ status }) {
  const s = STATUS_LABEL[status] || STATUS_LABEL.idle;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 99,
      fontSize: 12, fontWeight: 600,
      color: s.color, background: s.bg,
      border: `1px solid ${s.color}33`,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: s.color,
        boxShadow: status === 'working' ? `0 0 6px ${s.color}` : 'none',
        animation: status === 'working' ? 'pulse 1.5s infinite' : 'none',
      }} />
      {s.label}
    </span>
  );
}

function SquadSidebar() {
  const { squads, selectedSquad, selectSquad, activeStates, latestRuns } = useSquadStore();

  return (
    <aside style={{
      width: 260,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(0,0,0,0.15)',
      flexShrink: 0,
    }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, margin: 0 }}>
          Squads Ativos
        </p>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {[...squads.values()].map((squad) => {
          const state = activeStates.get(squad.code);
          const run = latestRuns.get(squad.code);
          const isSelected = selectedSquad === squad.code;

          return (
            <button
              key={squad.code}
              onClick={() => selectSquad(squad.code)}
              style={{
                width: '100%', textAlign: 'left',
                padding: '12px 14px', borderRadius: 10,
                border: isSelected ? '1px solid rgba(96,176,255,0.3)' : '1px solid transparent',
                background: isSelected ? 'rgba(96,176,255,0.08)' : 'transparent',
                cursor: 'pointer', marginBottom: 4,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{squad.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{squad.name}</p>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>{squad.agents.length} agentes</p>
                </div>
              </div>
              <StatusBadge status={state?.status || 'idle'} />
              {state?.leadsGerados > 0 && (
                <p style={{ margin: '6px 0 0', fontSize: 11, opacity: 0.5 }}>
                  {state.leadsGerados} leads gerados
                </p>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function AgentStatusList() {
  const { selectedSquad, activeStates } = useSquadStore();
  const state = selectedSquad ? activeStates.get(selectedSquad) : undefined;

  if (!state) return null;

  const AGENT_STATUS = {
    idle:        { label: 'Aguardando', color: '#aaaacc' },
    working:     { label: 'Trabalhando', color: '#60b0ff' },
    done:        { label: 'Concluído',  color: '#60f080' },
    checkpoint:  { label: 'Pausado',    color: '#ffbb22' },
    delivering:  { label: 'Entregando', color: '#60b0ff' },
  };

  return (
    <div style={{
      width: 200, borderLeft: '1px solid rgba(255,255,255,0.06)',
      padding: '16px 12px', flexShrink: 0,
      background: 'rgba(0,0,0,0.15)',
    }}>
      <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, margin: '0 0 12px' }}>
        Agentes
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {state.agents.map((agent) => {
          const s = AGENT_STATUS[agent.status] || AGENT_STATUS.idle;
          return (
            <div key={agent.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 10px', borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontSize: 16 }}>{agent.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {agent.name}
                </p>
                <p style={{ margin: 0, fontSize: 10, color: s.color }}>{s.label}</p>
              </div>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: s.color,
                boxShadow: agent.status === 'working' ? `0 0 6px ${s.color}` : 'none',
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Squads() {
  const { fetchLatestRun, subscribeRealtime, unsubscribeRealtime, squads } = useSquadStore();

  useEffect(() => {
    // Fetch latest run for all squads on mount
    for (const squad of squads.values()) {
      fetchLatestRun(squad.code);
    }
    subscribeRealtime();
    return () => unsubscribeRealtime();
  }, []);

  return (
    <>
      {/* Pulse animation */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>

      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        background: 'var(--bg, #0d1117)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>🏢</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Escritório Virtual</h1>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.5 }}>Monitore os squads de IA em tempo real</p>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <SquadSidebar />

          {/* Center: office canvas */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <OfficeScene />
          </div>

          <AgentStatusList />
        </div>
      </div>
    </>
  );
}
