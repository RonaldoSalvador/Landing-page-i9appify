import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Clock, Plus, X, User, Phone, Check, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [events, setEvents] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [leads, setLeads] = useState([])

    const [newEvent, setNewEvent] = useState({
        lead_id: '',
        titulo: '',
        data: '',
        hora: '',
        tipo: 'reuniao'
    })

    useEffect(() => {
        fetchEvents()
        fetchLeads()
    }, [currentMonth])

    const fetchEvents = async () => {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)

        const { data } = await supabase
            .from('eventos')
            .select('*, leads(nome, whatsapp)')
            .gte('data', format(start, 'yyyy-MM-dd'))
            .lte('data', format(end, 'yyyy-MM-dd'))
            .order('data', { ascending: true })

        setEvents(data || [])
        setLoading(false)
    }

    const fetchLeads = async () => {
        const { data } = await supabase
            .from('leads')
            .select('id, nome, whatsapp')
            .order('nome')

        setLeads(data || [])
    }

    const createEvent = async () => {
        if (!newEvent.titulo || !newEvent.data) return

        const { error } = await supabase
            .from('eventos')
            .insert({
                ...newEvent,
                lead_id: newEvent.lead_id || null
            })

        if (!error) {
            fetchEvents()
            setShowModal(false)
            setNewEvent({ lead_id: '', titulo: '', data: '', hora: '', tipo: 'reuniao' })
        }
    }

    const deleteEvent = async (eventId) => {
        await supabase.from('eventos').delete().eq('id', eventId)
        fetchEvents()
    }

    const markDone = async (eventId) => {
        await supabase.from('eventos').update({ status: 'concluido' }).eq('id', eventId)
        fetchEvents()
    }

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    })

    const getEventsForDay = (day) => {
        return events.filter(e => isSameDay(parseISO(e.data), day))
    }

    const openCreateModal = (date = null) => {
        setNewEvent({
            ...newEvent,
            data: date ? format(date, 'yyyy-MM-dd') : ''
        })
        setShowModal(true)
    }

    const eventTypes = {
        reuniao: { label: 'Reunião', color: 'bg-blue-500' },
        ligacao: { label: 'Ligação', color: 'bg-green-500' },
        proposta: { label: 'Enviar Proposta', color: 'bg-purple-500' },
        outro: { label: 'Outro', color: 'bg-gray-500' }
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Agenda</h1>
                    <p className="text-gray-400 mt-1">Gerencie reuniões e follow-ups</p>
                </div>
                <button
                    onClick={() => openCreateModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl hover:bg-cyan-500/30 transition-colors"
                >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Novo Evento</span>
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                {/* Month Navigation */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold text-white capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-white/5">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="p-2 text-center text-xs text-gray-500 font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 flex-1">
                    {/* Empty cells for days before month starts */}
                    {Array.from({ length: days[0].getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-2 border-b border-r border-white/5 bg-black/20" />
                    ))}

                    {days.map(day => {
                        const dayEvents = getEventsForDay(day)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <div
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(isSameDay(day, selectedDate) ? null : day)}
                                className={`p-2 border-b border-r border-white/5 min-h-[80px] cursor-pointer transition-colors ${isToday ? 'bg-cyan-500/5' : 'hover:bg-white/5'
                                    } ${isSameDay(day, selectedDate) ? 'bg-white/10' : ''}`}
                            >
                                <div className={`text-sm mb-1 ${isToday ? 'text-cyan-400 font-bold' : 'text-gray-400'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {dayEvents.slice(0, 2).map(event => (
                                        <div
                                            key={event.id}
                                            className={`text-xs px-1.5 py-0.5 rounded truncate ${event.status === 'concluido'
                                                    ? 'bg-white/10 text-gray-500 line-through'
                                                    : eventTypes[event.tipo]?.color + ' text-white'
                                                }`}
                                        >
                                            {event.hora && `${event.hora.slice(0, 5)} `}{event.titulo}
                                        </div>
                                    ))}
                                    {dayEvents.length > 2 && (
                                        <div className="text-xs text-gray-500">+{dayEvents.length - 2} mais</div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Selected Date Panel */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 overflow-hidden"
                    >
                        <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white">
                                    {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                                </h3>
                                <button
                                    onClick={() => openCreateModal(selectedDate)}
                                    className="text-sm text-cyan-400 hover:text-cyan-300"
                                >
                                    + Adicionar
                                </button>
                            </div>

                            {getEventsForDay(selectedDate).length === 0 ? (
                                <p className="text-gray-500 text-sm text-center py-4">Nenhum evento</p>
                            ) : (
                                <div className="space-y-2">
                                    {getEventsForDay(selectedDate).map(event => (
                                        <div
                                            key={event.id}
                                            className={`flex items-center justify-between p-3 rounded-lg ${event.status === 'concluido' ? 'bg-white/5 opacity-50' : 'bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${eventTypes[event.tipo]?.color}`} />
                                                <div>
                                                    <p className={`text-white ${event.status === 'concluido' ? 'line-through' : ''}`}>
                                                        {event.titulo}
                                                    </p>
                                                    {event.leads && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <User size={10} /> {event.leads.nome}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {event.hora && (
                                                    <span className="text-xs text-gray-500">{event.hora.slice(0, 5)}</span>
                                                )}
                                                {event.status !== 'concluido' && (
                                                    <button
                                                        onClick={() => markDone(event.id)}
                                                        className="p-1 text-green-400 hover:bg-green-400/10 rounded"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteEvent(event.id)}
                                                    className="p-1 text-red-400 hover:bg-red-400/10 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Event Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">Novo Evento</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Título *</label>
                                    <input
                                        type="text"
                                        value={newEvent.titulo}
                                        onChange={(e) => setNewEvent({ ...newEvent, titulo: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
                                        placeholder="Ex: Reunião com cliente"
                                    />
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(eventTypes).map(([key, val]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setNewEvent({ ...newEvent, tipo: key })}
                                                className={`p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${newEvent.tipo === key
                                                        ? val.color + ' text-white'
                                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${val.color}`} />
                                                {val.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Data *</label>
                                        <input
                                            type="date"
                                            value={newEvent.data}
                                            onChange={(e) => setNewEvent({ ...newEvent, data: e.target.value })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Hora</label>
                                        <input
                                            type="time"
                                            value={newEvent.hora}
                                            onChange={(e) => setNewEvent({ ...newEvent, hora: e.target.value })}
                                            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Lead (optional) */}
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Vincular ao Lead</label>
                                    <select
                                        value={newEvent.lead_id}
                                        onChange={(e) => setNewEvent({ ...newEvent, lead_id: e.target.value })}
                                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500/50"
                                    >
                                        <option value="">Nenhum</option>
                                        {leads.map(lead => (
                                            <option key={lead.id} value={lead.id}>{lead.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={createEvent}
                                    disabled={!newEvent.titulo || !newEvent.data}
                                    className="w-full py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-medium hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
                                >
                                    Criar Evento
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
