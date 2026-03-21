import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

// ─── Static squad definitions ────────────────────────────────────────────────
// Each agent has: id, name, icon, desk: { col, row }
const SQUAD_DEFINITIONS = new Map([
  ['captacao-i9appify', {
    id: 'captacao-i9appify',
    name: 'Captação I9Appify',
    code: 'captacao-i9appify',
    icon: '🎯',
    description: 'Prospecção, qualificação e disparo de leads B2B',
    agents: [
      { id: 'prospector', name: 'Aldo Apollo',      icon: '🔍', desk: { col: 1, row: 1 } },
      { id: 'qualifier',  name: 'Queli Qualifica',  icon: '✅', desk: { col: 2, row: 1 } },
      { id: 'copywriter', name: 'Carlos Copy',      icon: '✍️', desk: { col: 1, row: 2 } },
      { id: 'dispatcher', name: 'Diego Disparo',    icon: '🚀', desk: { col: 2, row: 2 } },
    ],
  }],
]);

// Map pipeline step → which agents are active and their status
function deriveAgentStatuses(squadCode, etapa, runStatus) {
  const squad = SQUAD_DEFINITIONS.get(squadCode);
  if (!squad) return [];

  const step = parseInt(etapa || '0', 10);

  return squad.agents.map((agent) => {
    let status = 'idle';

    if (squadCode === 'captacao-i9appify') {
      if (agent.id === 'prospector') {
        if (step >= 1 && step <= 2) status = 'working';
        else if (step >= 3) status = 'done';
      } else if (agent.id === 'qualifier') {
        if (step === 4) status = 'working';
        else if (step >= 5) status = 'done';
      } else if (agent.id === 'copywriter') {
        if (step === 5) status = 'working';
        else if (step >= 6) status = 'done';
      } else if (agent.id === 'dispatcher') {
        if (step === 7) status = step === 7 && runStatus === 'concluido' ? 'done' : 'working';
      }

      // Checkpoint steps pause the previous agent
      if (step === 3 && agent.id === 'prospector') status = 'checkpoint';
      if (step === 6 && agent.id === 'copywriter') status = 'checkpoint';
    }

    if (runStatus === 'concluido') status = 'done';
    if (runStatus === 'erro') status = 'idle';

    return { ...agent, status };
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useSquadStore = create((set, get) => ({
  squads: SQUAD_DEFINITIONS,
  activeStates: new Map(),
  selectedSquad: 'captacao-i9appify',
  latestRuns: new Map(),
  realtimeChannel: null,

  selectSquad(code) {
    set({ selectedSquad: code });
  },

  // Fetch latest run for a squad and build active state
  async fetchLatestRun(squadCode) {
    const { data, error } = await supabase
      .from('squad_runs')
      .select('*')
      .eq('squad_codigo', squadCode)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[useSquadStore] fetchLatestRun error:', error.message);
      return;
    }

    get()._applyRun(squadCode, data);
  },

  _applyRun(squadCode, run) {
    const squad = SQUAD_DEFINITIONS.get(squadCode);
    if (!squad) return;

    const agents = run
      ? deriveAgentStatuses(squadCode, run.etapa_atual, run.status)
      : squad.agents.map((a) => ({ ...a, status: 'idle' }));

    const newStates = new Map(get().activeStates);
    newStates.set(squadCode, {
      runId: run?.id || null,
      status: run?.status || 'idle',
      etapa: run?.etapa_atual || 0,
      leadsGerados: run?.leads_gerados || 0,
      agents,
    });

    const newRuns = new Map(get().latestRuns);
    if (run) newRuns.set(squadCode, run);

    set({ activeStates: newStates, latestRuns: newRuns });
  },

  // Subscribe to Supabase Realtime for squad_runs updates
  subscribeRealtime() {
    const existing = get().realtimeChannel;
    if (existing) supabase.removeChannel(existing);

    const channel = supabase
      .channel('squad_runs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'squad_runs' },
        (payload) => {
          const run = payload.new || payload.old;
          if (run?.squad_codigo) {
            get()._applyRun(run.squad_codigo, payload.new || null);
          }
        }
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeRealtime() {
    const channel = get().realtimeChannel;
    if (channel) {
      supabase.removeChannel(channel);
      set({ realtimeChannel: null });
    }
  },
}));
