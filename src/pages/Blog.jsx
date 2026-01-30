import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Calendar, Clock, ArrowRight, Home, Menu, X, Search,
    Tag, TrendingUp, BookOpen, Mail, ChevronRight, ChevronDown,
    Sparkles, Eye, Heart, Share2, Bookmark, Zap, Code, Bot,
    Smartphone, Globe, Cpu, Brain
} from 'lucide-react'

// Imagens ÚNICAS para cada artigo (todas diferentes do Unsplash)
const imagensCapas = {
    'deepseek-r1': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    'claude-35-opus': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop',
    'ia-whatsapp-business': 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&h=500&fit=crop',
    'comparativo-ias-2026': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=500&fit=crop',
    'no-code-2026': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop',
    'i9-appify-ia': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
    'automacao-vendas': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop',
    'futuro-apps-2026': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=500&fit=crop',
    'chatbots-avancados': 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=500&fit=crop',
    'gpt-5-rumores': 'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&h=500&fit=crop',
    'ai-agents-2026': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=500&fit=crop',
    'aplicativos-advocacia': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=500&fit=crop',
    'n8n-automacao': 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=800&h=500&fit=crop',
    'crm-pequenas-empresas': 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=500&fit=crop',
    'seo-ia-2026': 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=500&fit=crop',
    'react-native-flutter': 'https://images.unsplash.com/photo-1617040619263-41c5a9ca7521?w=800&h=500&fit=crop',
    'landing-pages-conversao': 'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&h=500&fit=crop',
    'prompt-engineering': 'https://images.unsplash.com/photo-1676299081847-c3c9b8c8e8d8?w=800&h=500&fit=crop'
}

// Posts completos com imagens ÚNICAS e mais conteúdo
const postsEstaticos = [
    {
        id: 1,
        titulo: 'DeepSeek R1: A IA chinesa que está abalando o mercado',
        slug: 'deepseek-r1',
        resumo: 'Nova IA open-source promete rivalizar com ChatGPT e Claude por uma fração do custo. Entenda o impacto desta revolução.',
        categoria: 'Trending',
        tags: ['IA', 'DeepSeek', 'Open Source', 'China'],
        tempo_leitura: '5 min',
        views: 12847,
        likes: 856,
        created_at: '2026-01-28',
        destaque: true
    },
    {
        id: 2,
        titulo: 'GPT-5: Tudo que sabemos sobre o próximo modelo da OpenAI',
        slug: 'gpt-5-rumores',
        resumo: 'Vazamentos indicam que o GPT-5 terá capacidades de raciocínio superiores e memória de longo prazo. Confira as novidades.',
        categoria: 'Novidades',
        tags: ['GPT-5', 'OpenAI', 'IA', 'Rumores'],
        tempo_leitura: '6 min',
        views: 8923,
        likes: 534,
        created_at: '2026-01-27'
    },
    {
        id: 3,
        titulo: 'AI Agents: O futuro da automação já chegou',
        slug: 'ai-agents-2026',
        resumo: 'Agentes de IA autônomos estão revolucionando a forma como trabalhamos. Entenda como funcionam e como usar no seu negócio.',
        categoria: 'Tendências',
        tags: ['AI Agents', 'Automação', 'IA', 'Produtividade'],
        tempo_leitura: '8 min',
        views: 6721,
        likes: 423,
        created_at: '2026-01-26'
    },
    {
        id: 4,
        titulo: 'Como usar IA para automatizar seu WhatsApp Business',
        slug: 'ia-whatsapp-business',
        resumo: 'Tutorial prático: configure um chatbot inteligente para atender seus clientes 24/7 sem complicação.',
        categoria: 'Tutorial',
        tags: ['WhatsApp', 'Chatbot', 'Automação', 'Negócios'],
        tempo_leitura: '7 min',
        views: 15521,
        likes: 934,
        created_at: '2026-01-25'
    },
    {
        id: 5,
        titulo: 'Aplicativos para Advocacia: Guia Completo 2026',
        slug: 'aplicativos-advocacia',
        resumo: 'Descubra como um app personalizado pode transformar seu escritório de advocacia e atrair mais clientes.',
        categoria: 'Cases',
        tags: ['Advocacia', 'Apps', 'Direito', 'Tecnologia'],
        tempo_leitura: '6 min',
        views: 4892,
        likes: 287,
        created_at: '2026-01-24'
    },
    {
        id: 6,
        titulo: 'n8n vs Zapier vs Make: Qual ferramenta de automação escolher?',
        slug: 'n8n-automacao',
        resumo: 'Comparativo definitivo entre as principais ferramentas de automação do mercado. Prós, contras e quando usar cada uma.',
        categoria: 'Análise',
        tags: ['n8n', 'Zapier', 'Make', 'Automação'],
        tempo_leitura: '9 min',
        views: 7234,
        likes: 456,
        created_at: '2026-01-23'
    },
    {
        id: 7,
        titulo: 'Claude 3.5 Opus: O que esperar do novo modelo',
        slug: 'claude-35-opus',
        resumo: 'Vazamentos indicam capacidades de raciocínio avançado e visual multimodal revolucionário.',
        categoria: 'Novidades',
        tags: ['Claude', 'Anthropic', 'IA', 'GPT'],
        tempo_leitura: '4 min',
        views: 5923,
        likes: 389,
        created_at: '2026-01-22'
    },
    {
        id: 8,
        titulo: 'CRM para Pequenas Empresas: Guia de Implementação',
        slug: 'crm-pequenas-empresas',
        resumo: 'Aprenda a implementar um CRM do zero e organize seus leads, vendas e relacionamento com clientes.',
        categoria: 'Tutorial',
        tags: ['CRM', 'Vendas', 'Leads', 'Gestão'],
        tempo_leitura: '10 min',
        views: 6127,
        likes: 378,
        created_at: '2026-01-21'
    },
    {
        id: 9,
        titulo: 'ChatGPT vs Claude vs Gemini: Qual a melhor IA?',
        slug: 'comparativo-ias-2026',
        resumo: 'Comparativo completo entre as principais IAs do mercado. Descubra qual é a melhor para cada caso de uso.',
        categoria: 'Análise',
        tags: ['ChatGPT', 'Claude', 'Gemini', 'Comparativo'],
        tempo_leitura: '6 min',
        views: 9156,
        likes: 678,
        created_at: '2026-01-20'
    },
    {
        id: 10,
        titulo: 'SEO com IA: Como ranquear seu site em 2026',
        slug: 'seo-ia-2026',
        resumo: 'Estratégias de SEO potencializadas por inteligência artificial. Ferramentas, técnicas e resultados reais.',
        categoria: 'Tutorial',
        tags: ['SEO', 'IA', 'Marketing', 'Google'],
        tempo_leitura: '8 min',
        views: 5678,
        likes: 345,
        created_at: '2026-01-19'
    },
    {
        id: 11,
        titulo: 'No-Code em 2026: As ferramentas que você precisa conhecer',
        slug: 'no-code-2026',
        resumo: 'De Bubble a FlutterFlow: as melhores plataformas para criar apps sem programar uma linha de código.',
        categoria: 'No-Code',
        tags: ['No-Code', 'Bubble', 'FlutterFlow', 'Apps'],
        tempo_leitura: '5 min',
        views: 4089,
        likes: 245,
        created_at: '2026-01-18'
    },
    {
        id: 12,
        titulo: 'React Native vs Flutter: Qual framework mobile usar?',
        slug: 'react-native-flutter',
        resumo: 'Análise técnica e prática dos dois principais frameworks para desenvolvimento mobile multiplataforma.',
        categoria: 'Desenvolvimento',
        tags: ['React Native', 'Flutter', 'Mobile', 'Apps'],
        tempo_leitura: '7 min',
        views: 3892,
        likes: 234,
        created_at: '2026-01-17'
    },
    {
        id: 13,
        titulo: 'Landing Pages que Convertem: O Guia Definitivo',
        slug: 'landing-pages-conversao',
        resumo: 'Aprenda a criar landing pages de alta conversão. Psicologia, design e copywriting que vendem.',
        categoria: 'Marketing',
        tags: ['Landing Page', 'Conversão', 'Marketing', 'Vendas'],
        tempo_leitura: '9 min',
        views: 4567,
        likes: 298,
        created_at: '2026-01-16'
    },
    {
        id: 14,
        titulo: 'Prompt Engineering: A arte de conversar com IAs',
        slug: 'prompt-engineering',
        resumo: 'Técnicas avançadas para extrair o máximo das IAs generativas. Do básico ao nível expert.',
        categoria: 'Tutorial',
        tags: ['Prompts', 'IA', 'ChatGPT', 'Claude'],
        tempo_leitura: '11 min',
        views: 7234,
        likes: 567,
        created_at: '2026-01-15'
    },
    {
        id: 15,
        titulo: 'Como a I9 Appify usa IA para transformar negócios',
        slug: 'i9-appify-ia',
        resumo: 'Cases reais de clientes que automatizaram processos e aumentaram vendas exponencialmente.',
        categoria: 'Cases',
        tags: ['I9 Appify', 'Cases', 'Sucesso', 'Automação'],
        tempo_leitura: '4 min',
        views: 2567,
        likes: 192,
        created_at: '2026-01-14'
    },
    {
        id: 16,
        titulo: 'Chatbots Avançados: Além do FAQ Automatizado',
        slug: 'chatbots-avancados',
        resumo: 'Como criar chatbots que realmente vendem, qualificam leads e encantam clientes.',
        categoria: 'Tutorial',
        tags: ['Chatbot', 'IA', 'Atendimento', 'Vendas'],
        tempo_leitura: '6 min',
        views: 3876,
        likes: 198,
        created_at: '2026-01-13'
    }
]

const categoriaCores = {
    'Trending': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', icon: TrendingUp },
    'Novidades': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', icon: Sparkles },
    'Tutorial': { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', icon: BookOpen },
    'Análise': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', icon: Eye },
    'No-Code': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', icon: Zap },
    'Cases': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', icon: Heart },
    'Tendências': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30', icon: Brain },
    'Desenvolvimento': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', icon: Code },
    'Marketing': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', icon: Globe }
}

export default function Blog() {
    const [posts, setPosts] = useState(postsEstaticos)
    const [loading, setLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [categoriaAtiva, setCategoriaAtiva] = useState('Todos')
    const [searchQuery, setSearchQuery] = useState('')
    const [showSearch, setShowSearch] = useState(false)
    const [visiblePosts, setVisiblePosts] = useState(9)
    const [emailNewsletter, setEmailNewsletter] = useState('')
    const [newsletterStatus, setNewsletterStatus] = useState(null)
    const [savedPosts, setSavedPosts] = useState([])
    const searchInputRef = useRef(null)

    useEffect(() => {
        fetchPosts()
        const saved = localStorage.getItem('savedPosts')
        if (saved) setSavedPosts(JSON.parse(saved))
    }, [])

    useEffect(() => {
        if (showSearch && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [showSearch])

    const fetchPosts = async () => {
        try {
            const { data } = await supabase
                .from('posts')
                .select('*')
                .eq('publicado', true)
                .order('created_at', { ascending: false })

            // Só usa dados do Supabase se tiver MAIS posts que os estáticos
            // Caso contrário, mantém os estáticos (mais atualizados)
            if (data && data.length > postsEstaticos.length) {
                setPosts(data)
            }
            // Se Supabase retornar menos ou igual, mantém os estáticos
        } catch {
            console.log('Usando posts estáticos')
        } finally {
            setLoading(false)
        }
    }


    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const getImagem = (slug) => {
        return imagensCapas[slug] || `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop&${slug}`
    }

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault()
        if (!emailNewsletter) return

        setNewsletterStatus('loading')

        try {
            await supabase.from('newsletter').insert({ email: emailNewsletter })
            setNewsletterStatus('success')
            setEmailNewsletter('')
            setTimeout(() => setNewsletterStatus(null), 3000)
        } catch {
            setNewsletterStatus('success')
            setEmailNewsletter('')
            setTimeout(() => setNewsletterStatus(null), 3000)
        }
    }

    const toggleSavePost = (postId) => {
        const newSaved = savedPosts.includes(postId)
            ? savedPosts.filter(id => id !== postId)
            : [...savedPosts, postId]
        setSavedPosts(newSaved)
        localStorage.setItem('savedPosts', JSON.stringify(newSaved))
    }

    const sharePost = (post) => {
        const url = `${window.location.origin}/blog/${post.slug}`
        if (navigator.share) {
            navigator.share({ title: post.titulo, url })
        } else {
            navigator.clipboard.writeText(url)
            alert('Link copiado!')
        }
    }

    // Filtros
    const categorias = ['Todos', ...new Set(posts.map(p => p.categoria))]
    const allTags = [...new Set(posts.flatMap(p => p.tags || []))]

    const postsFiltrados = posts.filter(post => {
        const matchCategoria = categoriaAtiva === 'Todos' || post.categoria === categoriaAtiva
        const matchSearch = !searchQuery ||
            post.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.resumo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (post.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchCategoria && matchSearch
    })

    const postDestaque = posts.find(p => p.destaque)
    const postsRecentes = posts.filter(p => !p.destaque).slice(0, 2)
    const postsGrid = postsFiltrados.filter(p => !p.destaque || categoriaAtiva !== 'Todos' || searchQuery)
    const postsVisiveis = postsGrid.slice(0, visiblePosts)
    const hasMore = postsGrid.length > visiblePosts

    // Posts populares (por views)
    const postsPopulares = [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5)

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 backdrop-blur-xl bg-[#050505]/90">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <img
                            src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png"
                            alt="I9 Appify"
                            className="h-12 w-auto object-contain"
                        />
                        <div className="hidden md:block">
                            <span className="text-xl font-bold">Blog</span>
                            <span className="text-xs text-gray-500 block">Notícias sobre IA & Tech</span>
                        </div>
                    </Link>

                    {/* Search Bar */}
                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="absolute left-1/2 -translate-x-1/2 w-full max-w-md px-4"
                            >
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Buscar artigos, tags..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                                    />
                                    <button
                                        onClick={() => { setShowSearch(false); setSearchQuery('') }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <Search size={20} />
                        </button>
                        <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                            <Home size={16} />
                            Home
                        </Link>
                        <button
                            onClick={() => window.open('https://wa.me/553199398889', '_blank')}
                            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                        >
                            Fale Conosco
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center gap-2">
                        <button
                            onClick={() => setShowSearch(!showSearch)}
                            className="p-2 text-gray-400 hover:text-white"
                        >
                            <Search size={20} />
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-white hover:bg-white/10 rounded-lg"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-[#050505]/95 backdrop-blur-xl border-b border-white/10"
                        >
                            <div className="p-6 space-y-4">
                                <Link to="/" className="block text-lg font-medium text-gray-300 hover:text-cyan-400">Home</Link>
                                <button
                                    onClick={() => window.open('https://wa.me/553199398889', '_blank')}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold"
                                >
                                    Fale Conosco
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section com Layout Magazine */}
            <section className="pt-28 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <span className="inline-flex items-center gap-2 text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-4 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/30">
                            <Bot size={16} />
                            Blog I9 Appify
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold mb-4">
                            Notícias sobre <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">IA & Tecnologia</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Fique por dentro das últimas novidades sobre inteligência artificial, automação e desenvolvimento de apps.
                        </p>
                    </motion.div>

                    {/* Layout Magazine: 1 Grande + 2 Menores */}
                    {!searchQuery && categoriaAtiva === 'Todos' && postDestaque && (
                        <div className="grid lg:grid-cols-2 gap-6 mb-12">
                            {/* Post Destaque Grande */}
                            <Link to={`/blog/${postDestaque.slug}`} className="lg:row-span-2">
                                <motion.article
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group relative h-full min-h-[400px] lg:min-h-full overflow-hidden rounded-3xl cursor-pointer"
                                >
                                    <img
                                        src={getImagem(postDestaque.slug)}
                                        alt={postDestaque.titulo}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                        <div className="flex flex-wrap items-center gap-3 mb-4">
                                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                                <TrendingUp size={12} />
                                                DESTAQUE
                                            </span>
                                            <span className="text-gray-300 text-sm bg-white/10 px-2 py-1 rounded-full">
                                                {postDestaque.tempo_leitura}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
                                            {postDestaque.titulo}
                                        </h2>
                                        <p className="text-gray-300 mb-4 line-clamp-2">
                                            {postDestaque.resumo}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-gray-400 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Eye size={14} />
                                                    {(postDestaque.views || 0).toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Heart size={14} />
                                                    {postDestaque.likes || 0}
                                                </span>
                                            </div>
                                            <span className="inline-flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all">
                                                Ler mais <ArrowRight size={18} />
                                            </span>
                                        </div>
                                    </div>
                                </motion.article>
                            </Link>

                            {/* 2 Posts Menores */}
                            <div className="space-y-6">
                                {postsRecentes.map((post, i) => (
                                    <Link key={post.id} to={`/blog/${post.slug}`}>
                                        <motion.article
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 * (i + 1) }}
                                            className="group relative h-[190px] overflow-hidden rounded-2xl cursor-pointer"
                                        >
                                            <img
                                                src={getImagem(post.slug)}
                                                alt={post.titulo}
                                                loading="lazy"
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${categoriaCores[post.categoria]?.bg} ${categoriaCores[post.categoria]?.text}`}>
                                                        {post.categoria}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">{post.tempo_leitura}</span>
                                                </div>
                                                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                                                    {post.titulo}
                                                </h3>
                                            </div>
                                        </motion.article>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Filtros por Categoria */}
            <section className="px-6 mb-8 sticky top-20 z-40 bg-[#050505]/95 backdrop-blur-xl py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {categorias.map(cat => {
                            const catInfo = categoriaCores[cat]
                            const Icon = catInfo?.icon || Tag
                            return (
                                <button
                                    key={cat}
                                    onClick={() => { setCategoriaAtiva(cat); setVisiblePosts(9) }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${categoriaAtiva === cat
                                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                        }`}
                                >
                                    {cat !== 'Todos' && <Icon size={14} />}
                                    {cat}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="py-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Posts Grid */}
                        <div className="lg:col-span-2">
                            {loading ? (
                                <div className="grid md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="bg-white/5 rounded-2xl animate-pulse">
                                            <div className="h-48 bg-white/10 rounded-t-2xl" />
                                            <div className="p-6 space-y-4">
                                                <div className="h-4 bg-white/10 rounded w-1/3" />
                                                <div className="h-6 bg-white/10 rounded w-full" />
                                                <div className="h-4 bg-white/10 rounded w-2/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {searchQuery && (
                                        <div className="mb-6 flex items-center justify-between">
                                            <p className="text-gray-400">
                                                {postsFiltrados.length} resultado{postsFiltrados.length !== 1 ? 's' : ''} para "<span className="text-white">{searchQuery}</span>"
                                            </p>
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="text-cyan-400 hover:underline text-sm"
                                            >
                                                Limpar busca
                                            </button>
                                        </div>
                                    )}

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {postsVisiveis.map((post, index) => {
                                            const catInfo = categoriaCores[post.categoria] || {}
                                            const CatIcon = catInfo.icon || Tag

                                            return (
                                                <motion.article
                                                    key={post.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="group bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-[0_0_40px_rgba(6,182,212,0.1)]"
                                                >
                                                    <Link to={`/blog/${post.slug}`}>
                                                        <div className="relative h-48 overflow-hidden">
                                                            <img
                                                                src={getImagem(post.slug)}
                                                                alt={post.titulo}
                                                                loading="lazy"
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                            <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 ${catInfo.bg} ${catInfo.text} ${catInfo.border}`}>
                                                                <CatIcon size={12} />
                                                                {post.categoria}
                                                            </span>

                                                            {/* Bookmark */}
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); toggleSavePost(post.id) }}
                                                                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${savedPosts.includes(post.id)
                                                                    ? 'bg-cyan-500 text-black'
                                                                    : 'bg-black/50 text-white hover:bg-white/20'
                                                                    }`}
                                                            >
                                                                <Bookmark size={16} fill={savedPosts.includes(post.id) ? 'currentColor' : 'none'} />
                                                            </button>
                                                        </div>
                                                    </Link>

                                                    <div className="p-6">
                                                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {formatDate(post.created_at)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={14} />
                                                                {post.tempo_leitura || '5 min'}
                                                            </span>
                                                        </div>

                                                        <Link to={`/blog/${post.slug}`}>
                                                            <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                                                                {post.titulo}
                                                            </h2>
                                                        </Link>

                                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                                            {post.resumo}
                                                        </p>

                                                        {/* Tags */}
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {(post.tags || []).slice(0, 2).map(tag => (
                                                                <span
                                                                    key={tag}
                                                                    onClick={() => setSearchQuery(tag)}
                                                                    className="text-xs bg-white/5 hover:bg-white/10 px-2 py-1 rounded-full text-gray-400 cursor-pointer transition-colors"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                            <div className="flex items-center gap-4 text-gray-500 text-sm">
                                                                <span className="flex items-center gap-1">
                                                                    <Eye size={14} />
                                                                    {(post.views || 0).toLocaleString()}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Heart size={14} />
                                                                    {post.likes || 0}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => sharePost(post)}
                                                                className="p-2 text-gray-500 hover:text-cyan-400 transition-colors"
                                                            >
                                                                <Share2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.article>
                                            )
                                        })}
                                    </div>

                                    {/* Load More */}
                                    {hasMore && (
                                        <div className="mt-10 text-center">
                                            <button
                                                onClick={() => setVisiblePosts(prev => prev + 6)}
                                                className="px-8 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 rounded-xl font-medium transition-all inline-flex items-center gap-2 text-cyan-400"
                                            >
                                                <ChevronDown size={18} />
                                                Carregar mais artigos
                                            </button>
                                        </div>
                                    )}

                                    {postsFiltrados.length === 0 && (
                                        <div className="text-center py-16">
                                            <Search size={48} className="mx-auto mb-4 text-gray-600" />
                                            <p className="text-gray-500">Nenhum artigo encontrado.</p>
                                            <button
                                                onClick={() => { setSearchQuery(''); setCategoriaAtiva('Todos') }}
                                                className="mt-4 text-cyan-400 hover:underline"
                                            >
                                                Limpar filtros
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-8">
                            {/* Newsletter */}
                            <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                                        <Mail size={20} className="text-cyan-400" />
                                    </div>
                                    <h3 className="font-bold text-lg">Newsletter</h3>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">
                                    Receba as melhores notícias sobre IA direto no seu email. Sem spam!
                                </p>
                                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                                    <input
                                        type="email"
                                        placeholder="Seu melhor email"
                                        value={emailNewsletter}
                                        onChange={(e) => setEmailNewsletter(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={newsletterStatus === 'loading'}
                                        className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
                                    >
                                        {newsletterStatus === 'loading' ? 'Enviando...' :
                                            newsletterStatus === 'success' ? '✓ Inscrito!' : 'Quero receber'}
                                    </button>
                                </form>
                            </div>

                            {/* Posts Populares */}
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <TrendingUp size={20} className="text-red-400" />
                                    </div>
                                    <h3 className="font-bold text-lg">Mais Lidos</h3>
                                </div>
                                <div className="space-y-4">
                                    {postsPopulares.map((post, i) => (
                                        <Link
                                            key={post.id}
                                            to={`/blog/${post.slug}`}
                                            className="flex gap-4 group"
                                        >
                                            <span className="text-3xl font-bold text-gray-700 group-hover:text-cyan-400 transition-colors w-8">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-2 text-sm">
                                                    {post.titulo}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                    <Eye size={12} />
                                                    {(post.views || 0).toLocaleString()} views
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Tags Cloud */}
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <Tag size={20} className="text-purple-400" />
                                    </div>
                                    <h3 className="font-bold text-lg">Tags</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.slice(0, 15).map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => setSearchQuery(tag)}
                                            className="text-sm bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30 px-3 py-1.5 rounded-full text-gray-400 transition-all border border-white/10"
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6 text-center">
                                <Smartphone className="mx-auto mb-4 text-green-400" size={40} />
                                <h3 className="font-bold text-lg mb-2">Precisa de um App?</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Transformamos sua ideia em realidade com IA & tecnologia.
                                </p>
                                <button
                                    onClick={() => window.open('https://wa.me/553199398889', '_blank')}
                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-green-500/25 transition-all"
                                >
                                    💬 Falar no WhatsApp
                                </button>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-6 mt-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <img
                                src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png"
                                alt="I9 Appify"
                                className="h-10 w-auto"
                            />
                            <p className="text-gray-600 text-sm">© 2026 I9 Appify. Todos os direitos reservados.</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/" className="text-gray-600 hover:text-cyan-400 text-sm transition-colors">Home</Link>
                            <Link to="/blog" className="text-cyan-400 text-sm">Blog</Link>
                            <Link to="/formulario" className="text-gray-600 hover:text-cyan-400 text-sm transition-colors">Contato</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
