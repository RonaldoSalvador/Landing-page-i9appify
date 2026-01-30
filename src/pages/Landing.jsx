import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring, useScroll, AnimatePresence } from 'framer-motion';
import { trackVisit, trackPageView, trackEvent } from '../lib/tracking';
import {
  Bot,
  Zap,
  Globe,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Smartphone,
  Clock,
  Users,
  Layers,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  ArrowUp
} from 'lucide-react';

/* =============================================================================
  CONFIGURAÇÕES GLOBAIS E UTILITÁRIOS
  =============================================================================
*/

// --- ÍCONE DO WHATSAPP (SVG OTIMIZADO) ---
const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382C17.112 14.011 15.32 13.09 14.987 12.977C14.655 12.864 14.412 12.808 14.169 13.146C13.926 13.484 13.235 14.382 13.027 14.606C12.819 14.832 12.612 14.86 12.279 14.691C11.946 14.522 10.871 14.143 9.597 12.949C8.583 12.001 7.898 10.83 7.69 10.436C7.482 10.043 7.668 9.843 7.835 9.663C7.984 9.502 8.167 9.244 8.334 9.019C8.501 8.794 8.556 8.625 8.667 8.399C8.778 8.174 8.723 7.977 8.64 7.78C8.556 7.583 7.863 5.753 7.573 5.023C7.29 4.312 7.004 4.408 6.804 4.418C6.619 4.427 6.41 4.427 6.202 4.427C5.994 4.427 5.656 4.512 5.373 4.849C5.089 5.187 4.286 6.002 4.286 7.662C4.286 9.321 5.418 10.925 5.584 11.15C5.75 11.375 7.794 14.739 11.026 16.241C13.722 17.493 14.269 17.243 14.851 17.158C15.434 17.073 16.638 16.369 16.888 15.581C17.138 14.793 17.138 14.118 17.068 13.978C16.998 13.837 16.818 13.753 16.485 13.584V13.584ZM12.032 21.812C10.237 21.812 8.57 21.31 7.123 20.434L6.78 20.219L2.83 21.32L3.935 17.279L3.702 16.885C2.735 15.249 2.227 13.383 2.227 11.454C2.227 5.86 6.626 1.31 12.037 1.31C14.655 1.31 17.116 2.389 18.966 4.348C20.816 6.307 21.835 8.913 21.835 11.459C21.835 17.053 17.436 21.812 12.032 21.812Z" />
  </svg>
);

// --- COMPONENTE DE REVELAÇÃO AO ROLAR (REVEAL ON SCROLL) ---
const RevealOnScroll = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.8, delay: delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// --- PRELOADER (TELA DE CARREGAMENTO) ---
const Preloader = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#050505]"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: [0.5, 1.5, 1],
          opacity: 1,
          filter: ["blur(20px)", "blur(0px)"]
        }}
        transition={{ duration: 1.8, times: [0, 0.6, 1], ease: "circOut" }}
        className="relative flex flex-col items-center justify-center"
      >
        <img
          src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png"
          alt="Loading"
          className="h-32 md:h-64 w-auto object-contain drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]"
        />
        <motion.div
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl -z-10"
        />
      </motion.div>
    </motion.div>
  );
};

// --- CUSTOM CURSOR (INTERATIVO) ---
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      const target = e.target;
      const isClickable = target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a') || target.classList.contains('clickable');
      setIsHovering(isClickable);
    };
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <motion.div
      className="fixed pointer-events-none z-[9999] mix-blend-screen hidden md:block"
      animate={{ x: position.x, y: position.y, scale: isHovering ? 2.5 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.5 }}
      style={{ translateX: '-50%', translateY: '-50%' }}
    >
      <div className={`w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 ${isHovering ? 'opacity-0' : 'opacity-100'}`} />
      <div className={`w-12 h-12 border-2 ${isHovering ? 'border-cyan-400 bg-cyan-400/10' : 'border-cyan-500/30 bg-cyan-500/10'} rounded-full blur-sm transition-colors duration-300`} />
    </motion.div>
  );
};

// --- BOTÃO VOLTAR AO TOPO ---
const BackToTop = () => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => scrollYProgress.onChange((latest) => setVisible(latest > 0.1)), [scrollYProgress]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:bg-cyan-500/30 transition-colors clickable"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/* =============================================================================
  COMPONENTES VISUAIS (BACKGROUNDS E EFEITOS)
  =============================================================================
*/

// --- FIBER OPTIC STREAM (BACKGROUND ANIMADO) ---
const FiberOpticStream = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Otimização Mobile: Menos fibras em telas pequenas
    const isMobile = window.innerWidth < 768;
    const fiberCount = isMobile ? 6 : 12; // 6 no mobile, 12 no desktop

    const fibers = Array.from({ length: fiberCount }, () => ({
      xOffset: (Math.random() - 0.5) * 100,
      speed: Math.random() * 0.002 + 0.001,
      amplitude: Math.random() * 30 + 10,
      thickness: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
      pulses: []
    }));

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let time = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scrollYVal = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min(scrollYVal / docHeight, 1);
      const flowSpeed = 2 + (scrollPercent * 8);
      time += 0.01;

      const hue = scrollPercent < 0.5 ? 180 + (scrollPercent * 200) : 280 - ((scrollPercent - 0.5) * 240);
      const centerX = canvas.width < 768 ? canvas.width / 2 : canvas.width * 0.5;

      fibers.forEach((fiber) => {
        ctx.beginPath();
        for (let y = 0; y < canvas.height; y += 20) {
          const wave1 = Math.sin(y * 0.003 + time * fiber.speed + fiber.phase) * fiber.amplitude;
          const wave2 = Math.cos(y * 0.005 - time * 0.5) * (fiber.amplitude * 0.5);
          const spread = 1 + Math.abs(y - canvas.height / 2) * 0.001;
          const x = centerX + fiber.xOffset * spread + wave1 + wave2;
          if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.15)`;
        ctx.lineWidth = fiber.thickness;
        ctx.stroke();

        if (Math.random() < 0.01 + (scrollPercent * 0.03)) {
          fiber.pulses.push({ y: -50, speed: Math.random() * 3 + flowSpeed, size: Math.random() * 3 + 2, tailLength: Math.random() * 50 + 20 });
        }

        for (let j = fiber.pulses.length - 1; j >= 0; j--) {
          const pulse = fiber.pulses[j];
          pulse.y += pulse.speed;

          const wave1 = Math.sin(pulse.y * 0.003 + time * fiber.speed + fiber.phase) * fiber.amplitude;
          const wave2 = Math.cos(pulse.y * 0.005 - time * 0.5) * (fiber.amplitude * 0.5);
          const spread = 1 + Math.abs(pulse.y - canvas.height / 2) * 0.001;
          const currentX = centerX + fiber.xOffset * spread + wave1 + wave2;

          const gradient = ctx.createLinearGradient(currentX, pulse.y - pulse.tailLength, currentX, pulse.y);
          gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0)`);
          gradient.addColorStop(1, `hsla(${hue}, 100%, 90%, 1)`);

          ctx.beginPath();
          ctx.moveTo(currentX, pulse.y - pulse.tailLength);
          ctx.lineTo(currentX, pulse.y);
          ctx.lineWidth = fiber.thickness * 2;
          ctx.strokeStyle = gradient;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(currentX, pulse.y, pulse.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 100%, 95%, 1)`;
          ctx.fill();

          if (pulse.y > canvas.height + 100) fiber.pulses.splice(j, 1);
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]" />;
};

/* =============================================================================
  COMPONENTES DE INTERFACE (UI)
  =============================================================================
*/

// --- CARD ANTIGRAVITY ---
const AntigravityCard = ({ icon: Icon, title, subtitle, color, delay = 0, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Physics mais "solta" (menos stiffness/damping) para sensação de fluidez líquida
  const mouseX = useSpring(x, { stiffness: 50, damping: 10, mass: 0.8 });
  const mouseY = useSpring(y, { stiffness: 50, damping: 10, mass: 0.8 });

  const rotateX = useTransform(mouseY, [-150, 150], [15, -15]); // Rotação mais suave
  const rotateY = useTransform(mouseX, [-150, 150], [-15, 15]);

  // Spotlight dinâmico seguindo o mouse
  const spotlightX = useTransform(mouseX, [-150, 150], [0, 100]);
  const spotlightY = useTransform(mouseY, [-150, 150], [0, 100]);

  const colorMap = {
    'cyan-400': { border: 'group-hover:border-cyan-400/50', bg: 'bg-cyan-400/20', text: 'text-cyan-400', glow: 'bg-cyan-400/10', iconBorder: 'border-cyan-400/30', spotlight: 'from-cyan-500/20' },
    'purple-500': { border: 'group-hover:border-purple-500/50', bg: 'bg-purple-500/20', text: 'text-purple-500', glow: 'bg-purple-500/10', iconBorder: 'border-purple-500/30', spotlight: 'from-purple-500/20' },
    'pink-500': { border: 'group-hover:border-pink-500/50', bg: 'bg-pink-500/20', text: 'text-pink-500', glow: 'bg-pink-500/10', iconBorder: 'border-pink-500/30', spotlight: 'from-pink-500/20' },
  };

  const theme = colorMap[color] || colorMap['cyan-400'];

  function handleMouse(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() { x.set(0); y.set(0); }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      whileHover={{ scale: 1.02, zIndex: 50 }} // Escala levemente menor para não ser agressivo
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="relative w-full md:w-72 h-auto min-h-[320px] perspective-1000 mb-6 md:mb-0 cursor-pointer"
      onClick={onClick}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
        style={{ perspective: 1000 }}
        className="w-full h-full cursor-pointer group"
      >
        <motion.div
          style={{ rotateX, rotateY, z: 100 }}
          onMouseMove={handleMouse}
          onMouseLeave={handleMouseLeave}
          className={`
            relative w-full h-full rounded-3xl p-8 flex flex-col justify-start gap-4
            backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden
            bg-[#0a0a0a]/90
            ${theme.border} transition-colors duration-500
          `}
        >
          {/* Spotlight Effect Gradient */}
          <motion.div
            style={{
              background: `radial-gradient(400px circle at ${mouseX.get() + 150}px ${mouseY.get() + 150}px, var(--spotlight-color), transparent 60%)`,
              '--spotlight-color': theme.spotlight === 'from-cyan-500/20' ? 'rgba(6,182,212,0.15)' :
                theme.spotlight === 'from-purple-500/20' ? 'rgba(168,85,247,0.15)' : 'rgba(236,72,153,0.15)'
            }}
            className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />

          {/* Static Ambient Glow */}
          <div className={`absolute inset-0 rounded-3xl ${theme.glow} blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />

          <div className="relative z-10 pointer-events-none transform transition-transform duration-500 group-hover:translate-z-10">
            {/* Icon Box */}
            <div className={`w-16 h-16 rounded-2xl ${theme.bg} flex items-center justify-center mb-6 ${theme.text} border ${theme.iconBorder} shadow-[0_0_20px_rgba(0,0,0,0.2)] group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(0,0,0,0.4)] transition-all duration-300`}>
              <Icon size={32} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-gray-400 text-base leading-relaxed group-hover:text-gray-300 transition-colors">
              {subtitle}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// --- BOTÃO NEON ---
const NeonButton = ({ children, primary = false, whatsapp = false, onClick }) => {
  let baseClass = "relative px-8 py-4 rounded-full font-bold text-sm tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2 clickable";
  let styleClass = whatsapp ? "bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500/20 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]" :
    primary ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]" :
      "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/30";

  return (
    <motion.button className={`${baseClass} ${styleClass}`} onClick={onClick} whileTap={{ scale: 0.95 }}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
};

// --- FAQ ACCORDION ---
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0 relative z-10 bg-black/40 backdrop-blur-sm rounded-lg mb-2">
      <button
        className="w-full py-6 px-4 flex items-center justify-between text-left focus:outline-none clickable"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-white/90">{question}</span>
        <ChevronDown className={`text-cyan-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden px-4"
      >
        <p className="pb-6 text-gray-400 leading-relaxed">{answer}</p>
      </motion.div>
    </div>
  );
};

// --- LINK DA NAVBAR ---
const NavLink = ({ href, children, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className="relative group text-sm font-medium text-gray-400 hover:text-white transition-colors clickable py-2"
  >
    {children}
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full box-border" />
  </a>
);

/* =============================================================================
  APP PRINCIPAL
  =============================================================================
*/
export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();

  // Track visit when page loads
  useEffect(() => {
    trackVisit();
    trackPageView('/');
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-x-hidden selection:bg-cyan-500/30 cursor-none">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        :root { font-family: 'Outfit', sans-serif; }
        html { scroll-behavior: smooth; scroll-padding-top: 100px; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #050505; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #00F0FF; }
      `}</style>

      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <>
          <CustomCursor />
          <BackToTop />
          <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-purple-500 origin-left z-[60]" style={{ scaleX: scrollYProgress }} />
          <FiberOpticStream />
          <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-0" />
          <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none z-0" />

          {/* NAVBAR */}
          <nav className="fixed w-full z-50 top-0 left-0 border-b border-white/5 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png" alt="I9 Appify Logo" className="h-16 md:h-20 w-auto object-contain" />
              </div>
              <div className="hidden md:flex items-center gap-8">
                <NavLink href="#beneficios">Benefícios</NavLink>
                <NavLink href="#como-funciona">Como Funciona</NavLink>
                <NavLink href="#faq">FAQ</NavLink>
                <NavLink href="/blog">Blog</NavLink>
                <NeonButton primary onClick={() => window.open('https://wa.me/553199398889?text=Tudo%20bem%3F%20Estou%20interessado%20em%20saber%20mais%20sobre%20os%20servi%C3%A7os%20que%20voce%20oferece.', '_blank')}>Contato</NeonButton>
                <NeonButton onClick={() => window.location.href = '/login'}>Entrar</NeonButton>
              </div>
              <div className="md:hidden">
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors clickable">
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                  className="absolute top-24 left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-white/10 md:hidden flex flex-col p-6 gap-4 shadow-2xl z-[999]"
                >
                  <a href="#beneficios" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-cyan-400 py-2 border-b border-white/5">Benefícios</a>
                  <a href="#como-funciona" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-cyan-400 py-2 border-b border-white/5">Como Funciona</a>
                  <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-cyan-400 py-2 border-b border-white/5">FAQ</a>
                  <a href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-gray-300 hover:text-cyan-400 py-2 border-b border-white/5">Blog</a>
                  <div className="pt-4 flex flex-col gap-3">
                    <NeonButton primary onClick={() => { setIsMobileMenuOpen(false); window.open('https://wa.me/553199398889', '_blank'); }}>Contato</NeonButton>
                    <NeonButton onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/login'; }}>Entrar</NeonButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* HERO SECTION */}
          <main className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 order-2 lg:order-1 relative">
                <div className="absolute inset-0 bg-black/40 blur-3xl -z-10 rounded-full opacity-50"></div>
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
                  <h1 className="text-4xl md:text-7xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500 drop-shadow-lg">
                    Soluções Inteligentes <br /> para seu <span className="text-cyan-400">Negócio</span>
                  </h1>
                  <p className="text-lg text-gray-400 max-w-lg leading-relaxed bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/5">
                    Criação de apps, sites e fluxos inteligentes. Soluções práticas para transformar seu negócio.
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-wrap gap-4">
                  <NeonButton whatsapp onClick={() => window.open('https://wa.me/553199398889?text=Tudo%20bem%3F%20Estou%20interessado%20em%20saber%20mais%20sobre%20os%20servi%C3%A7os%20que%20voce%20oferece.', '_blank')}>
                    <WhatsAppIcon size={20} /> WhatsApp
                  </NeonButton>
                </motion.div>
                <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/5">
                  <div><p className="text-2xl md:text-3xl font-bold text-cyan-400">+45%</p><p className="text-xs text-gray-500 uppercase">Satisfação</p></div>
                  <div><p className="text-2xl md:text-3xl font-bold text-green-400">-35%</p><p className="text-xs text-gray-500 uppercase">Custos</p></div>
                  <div><p className="text-2xl md:text-3xl font-bold text-purple-400">+60%</p><p className="text-xs text-gray-500 uppercase">Eficiência</p></div>
                </div>
              </div>
              <div className="relative min-h-[600px] lg:h-[600px] h-auto flex items-center justify-center perspective-1000 order-1 lg:order-2 py-12 lg:py-0">
                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 transform md:rotate-y-[-5deg] md:rotate-x-[5deg] z-20">
                  <div className="flex flex-col gap-6 mt-12">
                    <AntigravityCard icon={Bot} title="Automação com IA" subtitle="Atendimento 24/7 no WhatsApp com inteligência artificial que aprende e converte." color="cyan-400" delay={0.1} onClick={() => window.location.href = '/form/automacao'} />
                    <AntigravityCard icon={Globe} title="Sites e Pages" subtitle="Páginas de alta conversão e sites institucionais modernos e responsivos." color="purple-500" delay={0.3} onClick={() => window.location.href = '/form/site'} />
                  </div>
                  <div className="flex flex-col gap-6 mb-12 md:mt-12">
                    <AntigravityCard icon={Smartphone} title="Criação de Apps" subtitle="Aplicativos personalizados No-code para o seu negócio, sem custos abusivos." color="pink-500" delay={0.2} onClick={() => window.location.href = '/form/app'} />
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* BENEFÍCIOS */}
          <section id="beneficios" className="py-24 bg-white/5 backdrop-blur-sm relative border-y border-white/5 z-20">
            <div className="max-w-7xl mx-auto px-6">
              <RevealOnScroll>
                <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Como a <span className="text-cyan-400">I9 Appify</span> transforma seu negócio?</h2>
                </div>
              </RevealOnScroll>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Zap, title: "Automação Inteligente", text: "Automatize processos repetitivos com IA avançada", color: "text-yellow-400", bg: "bg-yellow-400/10" },
                  { icon: MessageCircle, title: "Respostas Personalizadas", text: "Agente de IA que aprende com cada interação", color: "text-green-400", bg: "bg-green-400/10" },
                  { icon: TrendingUp, title: "Análise em Tempo Real", text: "Métricas e insights para melhorar seu atendimento", color: "text-cyan-400", bg: "bg-cyan-400/10" }
                ].map((item, i) => (
                  <RevealOnScroll key={i} delay={i * 0.2}>
                    <div className="p-8 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all shadow-xl hover:-translate-y-2">
                      <div className={`w-12 h-12 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-6`}>
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-gray-400">{item.text}</p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>

          {/* DESAFIOS */}
          <section className="py-24 relative px-6 z-20">
            <div className="max-w-7xl mx-auto">
              <RevealOnScroll>
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold">Os Desafios Que Você Enfrenta</h2>
                </div>
              </RevealOnScroll>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { icon: Clock, title: "Tempo de Resposta", text: "Clientes esperando muito tempo por respostas", color: "text-red-400" },
                  { icon: Users, title: "Equipe Sobrecarregada", text: "Funcionários dedicados a tarefas repetitivas", color: "text-orange-400" },
                  { icon: Layers, title: "Múltiplos Canais", text: "Dificuldade em gerenciar diferentes plataformas", color: "text-red-400" }
                ].map((item, i) => (
                  <RevealOnScroll key={i} delay={i * 0.2}>
                    <div className="group relative p-8 rounded-2xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-red-900/20 hover:border-red-500/30 transition-all z-20">
                      <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-500">{item.text}</p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>

          {/* COMPARATIVO */}
          <section className="py-24 bg-black/40 border-y border-white/5 px-6 z-20 relative">
            <div className="max-w-5xl mx-auto">
              <RevealOnScroll>
                <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold mb-2">I9 Appify vs Outras Soluções</h2>
                </div>
              </RevealOnScroll>
              <div className="grid md:grid-cols-2 gap-8">
                <RevealOnScroll delay={0.2}>
                  <div className="p-8 rounded-3xl bg-cyan-900/10 border border-cyan-500/30 relative overflow-hidden backdrop-blur-md">
                    <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-12 h-12 flex items-center justify-center">
                        <img src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png" alt="I9 Appify Logo" className="w-full h-full object-contain" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">I9 Appify</h3>
                    </div>
                    <ul className="space-y-4">
                      {['Atendimento 24/7', 'IA Personalizada', 'Suporte Dedicado'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-white">
                          <CheckCircle2 size={20} className="text-cyan-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealOnScroll>
                <RevealOnScroll delay={0.4}>
                  <div className="p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-sm opacity-70">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        <Bot size={20} className="text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-300">Outras Soluções</h3>
                    </div>
                    <ul className="space-y-4">
                      {['Horário Limitado', 'IA Genérica', 'Suporte Básico'].map(item => (
                        <li key={item} className="flex items-center gap-3 text-gray-400">
                          <XCircle size={20} className="text-red-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </RevealOnScroll>
              </div>
            </div>
          </section>

          {/* COMO FUNCIONA */}
          <section id="como-funciona" className="py-24 px-6 relative z-20">
            <div className="max-w-7xl mx-auto">
              <RevealOnScroll>
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Como Funciona em <span className="text-cyan-400">3 Passos Simples</span></h2>
              </RevealOnScroll>
              <div className="grid md:grid-cols-3 gap-8 relative">
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                {[
                  { num: "1", title: "Análise Personalizada", text: "Entendemos suas necessidades e criamos uma solução sob medida." },
                  { num: "2", title: "Implementação Rápida", text: "Setup simples e rápido, sem complicações técnicas." },
                  { num: "3", title: "Resultados Imediatos", text: "Comece a ver melhorias no seu atendimento desde o primeiro dia." }
                ].map((step, i) => (
                  <RevealOnScroll key={i} delay={i * 0.3}>
                    <div className="relative z-10 text-center group">
                      <div className="w-24 h-24 mx-auto bg-[#0a0a0a] border-4 border-cyan-500/20 rounded-full flex items-center justify-center mb-6 group-hover:border-cyan-400 transition-colors shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <span className="text-4xl font-bold text-white">{step.num}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-gray-400 px-4">{step.text}</p>
                    </div>
                  </RevealOnScroll>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="py-24 bg-white/5 backdrop-blur-sm px-6 relative z-20">
            <div className="max-w-3xl mx-auto">
              <RevealOnScroll>
                <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
                <div className="space-y-4">
                  <FAQItem question="Como funciona a automação do WhatsApp?" answer="Nossa solução utiliza inteligência artificial para automatizar respostas e interações no WhatsApp, mantendo um atendimento personalizado e eficiente 24/7." />
                  <FAQItem question="É necessário ter conhecimento técnico?" answer="Não! Nossa plataforma é intuitiva e fácil de usar. Oferecemos suporte completo para configuração e treinamento da sua equipe." />
                  <FAQItem question="Quanto tempo leva para implementar?" answer="A implementação é rápida, geralmente entre 24 a 48 horas após a contratação. Nosso time oferece suporte durante todo o processo." />
                  <FAQItem question="É compatível com meu WhatsApp Business?" answer="Sim! Nossa solução é totalmente compatível com WhatsApp Business e pode ser integrada facilmente com seus sistemas existentes." />
                  <FAQItem question="Como funciona a garantia de 7 dias?" answer="Oferecemos 7 dias de garantia incondicional. Se não estiver satisfeito, devolvemos 100% do seu investimento, sem questionamentos." />
                </div>
              </RevealOnScroll>
            </div>
          </section>

          {/* GARANTIA */}
          <section className="py-16 px-6 z-20 relative">
            <RevealOnScroll>
              <div className="max-w-4xl mx-auto text-center p-8 rounded-3xl bg-gradient-to-r from-green-900/20 to-green-800/20 border border-green-500/30 backdrop-blur-md">
                <ShieldCheck size={48} className="mx-auto text-green-400 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Garantia de Satisfação</h3>
                <p className="text-gray-300">Sem Custos Extras! 7 dias de garantia incondicional.</p>
              </div>
            </RevealOnScroll>
          </section>

          {/* CTA FINAL */}
          <section className="py-24 px-6 relative overflow-hidden z-20">
            <RevealOnScroll>
              <div className="max-w-4xl mx-auto relative z-10 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Pronto para transformar <br /> seu atendimento?</h2>
                <p className="text-gray-400 mb-8 max-w-lg mx-auto bg-black/30 backdrop-blur-sm p-4 rounded-lg">
                  Transformando negócios através da tecnologia. Automação, inteligência artificial e desenvolvimento no-code ao seu alcance.
                </p>
                <div className="flex justify-center">
                  <NeonButton whatsapp onClick={() => window.open('https://wa.me/553199398889?text=Tudo%20bem%3F%20Estou%20interessado%20em%20saber%20mais%20sobre%20os%20servi%C3%A7os%20que%20voce%20oferece.', '_blank')}>
                    <WhatsAppIcon size={20} /> WhatsApp
                  </NeonButton>
                </div>
              </div>
            </RevealOnScroll>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.08)_0,rgba(0,0,0,0)_70%)] pointer-events-none" />
          </section>

          {/* FOOTER */}
          <footer className="border-t border-white/5 bg-[#080808] pt-16 pb-8 px-6 z-20 relative">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <img src="https://ldqjunoqeepcdctheidd.supabase.co/storage/v1/object/public/i9appify/Fotos/LOGO_DA_I9_9TESTE_SEM_FUNDO-removebg-preview.png" alt="I9 Appify Logo" className="h-20 md:h-24 w-auto object-contain mb-6" />
                <p className="text-gray-500 max-w-xs">Transformando negócios através da tecnologia. Automação, inteligência artificial e desenvolvimento no-code ao seu alcance.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-6">Links Rápidos</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#beneficios" className="hover:text-cyan-400 transition-colors clickable">Benefícios</a></li>
                  <li><a href="#como-funciona" className="hover:text-cyan-400 transition-colors clickable">Como Funciona</a></li>
                  <li><a href="#faq" className="hover:text-cyan-400 transition-colors clickable">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-white mb-6">Serviços</h4>
                <ul className="space-y-4 text-gray-500 text-sm">
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Automação com IA</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Criação de Apps</a></li>
                  <li><a href="#" className="hover:text-cyan-400 transition-colors">Sites e Landing Pages</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/5 pt-8 text-center text-gray-600 text-sm">
              <p>&copy; 2025 I9 Appify. Todos os direitos reservados.</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
