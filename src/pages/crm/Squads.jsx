import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Cpu, MonitorPlay } from 'lucide-react';

// Simulated coordinates overlaid on the ChatDev 'company.png' background.
// Using percentages so it scales nicely on different monitor sizes.
const DESK_POSITIONS = [
    { top: '55%', left: '33%', img: '/assets/squads/programmer.png' }, // Bottom-left desk
    { top: '65%', left: '50%', img: '/assets/squads/right.png' },      // Middle desk
    { top: '35%', left: '60%', img: '/assets/squads/left.png' },       // Top desk
    { top: '45%', left: '40%', img: '/assets/squads/tester.png' },     // Middle desk 2
    { top: '75%', left: '75%', img: '/assets/squads/ceo.png' },        // Bottom-Right desk
    { top: '25%', left: '20%', img: '/assets/squads/designer.png' },   // Top-Left desk
    { top: '50%', left: '80%', img: '/assets/squads/hr.png' },         // Right desk
];

export default function Squads() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgents();

        // 🟢 Mágica do Realtime: A tela atualiza sozinha se um agente mudar de status no banco!
        const channel = supabase
            .channel('public:agentes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'agentes' },
                () => {
                    fetchAgents();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAgents = async () => {
        try {
            // Puxa todos os agentes que pertencem a org do usuário (ou puxa todos se for master)
            const { data, error } = await supabase
                .from('agentes')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setAgents(data || []);
        } catch (error) {
            console.error('Erro ao buscar esquadrão:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-theme(spacing.16))] w-full overflow-y-auto">
            {/* Header Mágico */}
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent flex items-center gap-3">
                    <span className="text-4xl">🕹️</span> HQ Esquadrão 2D
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg mt-2">
                    Acompanhe a sua matriz de Agentes de Inteligência Artificial trabalhando em tempo real no meta-escritório.
                </p>
            </div>

            {/* Container do Jogo 2D (ChatDev Office Extracted) */}
            <div className="w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 bg-[#e6dcc3] relative group">
                
                {/* Imagem Padrão do fundo company.png */}
                <div 
                    className="relative w-full aspect-[4/3] md:aspect-video" 
                    style={{
                        backgroundImage: 'url(/assets/squads/company.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
                >
                    
                    {/* Renderiza os bonequinhos baseados no Supabase */}
                    <AnimatePresence>
                        {agents.map((agent, index) => {
                            // Se o agente estiver inativo, podemos ocultar ou deixar opaco.
                            // Neste caso, vamos deixar um pouco transparente se não tiver status 'ativo'.
                            const isActive = agent.status !== 'inativo';
                            const pos = DESK_POSITIONS[index % DESK_POSITIONS.length];
                            
                            return (
                                <motion.div
                                    key={agent.id}
                                    initial={{ opacity: 0, scale: 0, y: -20 }}
                                    animate={{ 
                                        opacity: isActive ? 1 : 0.4, 
                                        scale: 1, 
                                        y: 0 
                                    }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="absolute flex flex-col items-center justify-center cursor-pointer hover:z-50"
                                    style={{
                                        top: pos.top,
                                        left: pos.left,
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 10 + index
                                    }}
                                >
                                    {/* Tooltip Visível no Hover */}
                                    <div className="mb-2 px-3 py-1 bg-black/80 rounded-lg text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-xl border border-white/20">
                                        {agent.name}
                                        {isActive ? (
                                            <span className="block text-[9px] text-emerald-400 font-normal">Trabalhando...</span>
                                        ) : (
                                            <span className="block text-[9px] text-red-400 font-normal">Dormindo (zZz)</span>
                                        )}
                                    </div>

                                    {/* O Avatar (Bonequinho 2D) */}
                                    <div className="relative">
                                        <motion.img
                                            src={pos.img}
                                            alt={agent.name}
                                            className="w-16 h-16 object-contain filter drop-shadow-xl"
                                            animate={isActive ? { y: [0, -6, 0] } : {}}
                                            transition={{
                                                duration: 1.5 + (Math.random()), // Tempos aleatórios pra não pularem sincronizados
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                            }}
                                        />

                                        {/* Luz de Status (Verde piscante se ativo) */}
                                        {isActive && (
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-[0_0_12px_rgba(16,185,129,1)] animate-pulse" />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Loading Overlay state */}
                    {loading && (
                        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="p-4 bg-white/90 dark:bg-black/90 rounded-2xl shadow-2xl font-bold flex gap-2 items-center">
                                <MonitorPlay className="animate-spin text-emerald-500" /> Carregando Esquadrão...
                            </div>
                        </div>
                    )}
                </div>

            </div>

            {/* Painel de Legenda Minimalista */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white dark:bg-[#0d1117] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <h3 className="font-bold mb-2 flex items-center gap-2"><Bot size={18} className="text-emerald-500"/> Total de Agentes</h3>
                    <p className="text-3xl font-black">{agents.length}</p>
                </div>
                <div className="p-6 bg-white dark:bg-[#0d1117] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <h3 className="font-bold mb-2 flex items-center gap-2"><Cpu size={18} className="text-blue-500"/> Operando (Online)</h3>
                    <p className="text-3xl font-black text-emerald-500">
                        {agents.filter(a => a.status !== 'inativo').length}
                    </p>
                </div>
            </div>

        </div>
    );
}
