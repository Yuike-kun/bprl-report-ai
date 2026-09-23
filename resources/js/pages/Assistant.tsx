import { Head } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Globe, Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from './layout';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Source = {
    title: string;
    url: string;
};

function hostnameOf(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: Source[];
};

const CHIPS: { label: string; question: string }[] = [
    { label: 'Apa itu KKPRL?', question: 'Apa itu KKPRL?' },
    {
        label: 'Dokumen persyaratan',
        question: 'Apa saja dokumen persyaratan KKPRL?',
    },
    {
        label: 'Cara daftar OSS',
        question: 'Bagaimana cara mendaftar KKPRL di OSS?',
    },
    { label: 'Biaya PNBP', question: 'Berapa biaya PNBP KKPRL?' },
    {
        label: 'Lacak status',
        question: 'Bagaimana cara melacak status permohonan KKPRL?',
    },
    {
        label: 'SLA proses',
        question: 'Berapa lama proses (SLA) penerbitan KKPRL?',
    },
    {
        label: 'Cek fakta KKPRL',
        question: 'Apa saja mitos yang salah tentang KKPRL?',
    },
];

// Reveals `text` a few characters at a time, like a typewriter/streaming effect.
// Only used for the most recently-arrived assistant message — see `typingId` below —
// so older messages in history render instantly instead of re-typing on every render.
function TypingMarkdown({
    text,
    onTick,
    onDone,
}: {
    text: string;
    onTick?: () => void;
    onDone?: () => void;
}) {
    const [shown, setShown] = useState('');
    const doneRef = useRef(false);

    useEffect(() => {
        doneRef.current = false;
        setShown('');
        let i = 0;
        // ~2 chars per tick at 16ms keeps it fast enough not to feel sluggish
        // on longer answers, while still reading as "typing" rather than instant.
        const charsPerTick = Math.max(1, Math.round(text.length / 220));
        const id = setInterval(() => {
            i += charsPerTick;
            setShown(text.slice(0, i));
            onTick?.();
            if (i >= text.length) {
                clearInterval(id);
                if (!doneRef.current) {
                    doneRef.current = true;
                    onDone?.();
                }
            }
        }, 16);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text]);

    return (
        <div className="markdown-answer">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{shown}</ReactMarkdown>
            {shown.length < text.length && (
                <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-[#1AA6E0] align-middle" />
            )}
        </div>
    );
}

export default function Assistant() {
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [typingId, setTypingId] = useState<string | null>(null);
    const threadRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [history, sending]);

    const scrollToBottom = () => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    };

    const makeId = () =>
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Temporary: points at the standalone e-GerAI Asisten API. Override with
    // VITE_ASISTEN_API_URL once a permanent endpoint is available.
    const ASISTEN_API =
        import.meta.env.VITE_ASISTEN_API_URL ?? 'http://localhost:8001';

    const askAsisten = async (question: string, priorMessages: Message[]) => {
        setSending(true);

        try {
            // `history` state is already chronological (oldest -> newest), so the
            // slice below keeps that order. The API requires the very last
            // message to be the current "user" question being asked.
            const conversationHistory = priorMessages
                .slice(-20)
                .filter((m) => m.role && m.content)
                .map((m) => ({ role: m.role, content: m.content }));
            const res = await fetch(`${ASISTEN_API}/api/v1/asisten/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': import.meta.env.VITE_ASISTEN_API_KEY ?? '',
                },
                body: JSON.stringify({
                    messages: [
                        ...conversationHistory,
                        { role: 'user', content: question },
                    ],
                }),
            });
            const data = await res.json().catch(() => null);
            const text =
                res.ok && data && data.data && data.data.reply
                    ? data.data.reply
                    : 'Maaf, terjadi kendala saat memproses pertanyaan. Silakan coba lagi.';
            const sources: Source[] =
                res.ok && data?.data?.sources
                    ? data.data.sources.map((s: any) => ({
                          title: s.title || 'Sumber',
                          url: s.url || '#',
                      }))
                    : [];
            const newId = makeId();
            setHistory((prev) => [
                ...prev,
                { id: newId, role: 'assistant', content: text, sources },
            ]);
            setTypingId(newId);
        } catch {
            const newId = makeId();
            setHistory((prev) => [
                ...prev,
                {
                    id: newId,
                    role: 'assistant',
                    content:
                        'Maaf, terjadi kesalahan koneksi. Silakan coba lagi sesaat lagi.',
                },
            ]);
            setTypingId(newId);
        } finally {
            setSending(false);
        }
    };

    const sendMessage = (q: string) => {
        const question = q.trim();

        if (!question) {
            return;
        }

        const priorMessages = history;
        const nextHistory: Message[] = [
            ...history,
            { id: makeId(), role: 'user', content: question },
        ];
        setHistory(nextHistory);
        askAsisten(question, priorMessages);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = input.trim();

        if (!q) {
            return;
        }

        setInput('');

        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        sendMessage(q);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const q = input.trim();

            if (!q) {
                return;
            }

            setInput('');

            if (inputRef.current) {
                inputRef.current.style.height = 'auto';
            }

            sendMessage(q);
        }
    };

    const isEmpty = history.length === 0;

    return (
        <AppLayout>
            <Head title="Asisten e-GerAI · KKPRL" />

            {/* .asisten-hero */}
            <section
                className="-mx-6 -mt-20 hidden px-4 pt-24 pb-7 md:block lg:-mx-8"
                style={{
                    background:
                        'linear-gradient(135deg,#eaf2fb 0%,#cfe1f6 55%,#a9cdec 100%)',
                }}
            >
                <div className="mx-auto flex max-w-full px-10 flex-wrap items-center justify-between gap-5">
                    <div>
                        <h1 className="m-0 mb-1.5 text-xl font-extrabold text-[#123A63] sm:text-2xl">
                            Asisten e-GerAI &mdash; Tanya KKPRL
                        </h1>
                        <p className="m-0 max-w-[560px] text-[12px] leading-[1.5] text-[#33495e] sm:text-[13.5px]">
                            Tanyakan apa pun seputar persyaratan, alur
                            permohonan OSS/e-SEA, biaya PNBP, reklamasi, hingga
                            cara tracking permohonan KKPRL. Dijawab singkat dan
                            jelas oleh asisten BPRL Makassar.
                        </p>
                    </div>
                    <img
                        src="/egerai-logo.png"
                        alt="e-GerAI BPRL Makassar"
                        className="h-14 w-auto object-contain"
                    />
                </div>
            </section>

            {/* .asisten-wrap */}
            <div className="asisten-wrap-mobile fixed inset-0 z-[40] bg-white md:relative md:z-[2] md:mx-auto md:-mt-2.5 md:max-w-[2000px] md:bg-transparent md:pt-6 md:pb-4">
                <style>{`
                    .asisten-wrap-mobile {
                        top: 70px;
                    }
                    @media (min-width: 768px) {
                        .asisten-wrap-mobile {
                            top: auto;
                        }
                    }
                `}</style>
                <a
                    href="/"
                    className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-[#1E63C7] shadow-sm backdrop-blur-sm md:static md:mb-4.5 md:rounded-none md:bg-transparent md:p-0 md:text-[12.5px] md:shadow-none"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Beranda
                </a>

                {/* .chat-shell — the boxed widget, centered on the page */}
                <div className="chat-shell-wrapper relative mx-auto h-full w-full font-sans md:h-auto md:max-w-[1400px] md:px-0">
                    <style>{`
                        @media (min-width: 768px) {
                            .chat-shell-wrapper { height: min(760px, 88vh); }
                        }
                    `}</style>
                    <img
                        src="/navi.png"
                        alt="Navi"
                        className="pointer-events-none absolute bottom-0 -left-20 z-0 hidden h-[85%] w-auto object-contain object-bottom drop-shadow-[0_12px_24px_rgba(10,37,87,.25)] select-none sm:-left-28 md:-left-36 lg:block"
                    />

                    {/* .chat-card */}
                    <motion.div
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="relative z-10 flex h-full flex-col overflow-hidden rounded-none border-0 bg-white shadow-none md:rounded-[18px] md:border md:shadow-[0_10px_34px_rgba(10,37,87,.16)]"
                        style={{
                            borderColor: 'rgba(10,37,87,0.13)',
                        }}
                    >
                        {/* .chat-head */}
                        <div
                            className="relative flex items-start gap-3 overflow-hidden py-4 pl-4 pr-20 sm:gap-3.25 sm:py-4.5 sm:pl-5 sm:pr-24"
                            style={{
                                background:
                                    'linear-gradient(135deg,#0A2557 0%, #12468C 45%, #1AA6E0 100%)',
                                color: '#fff',
                            }}
                        >
                            <div
                                className="pointer-events-none absolute -right-10 -bottom-15 h-[180px] w-[180px] rounded-full"
                                style={{
                                    background:
                                        'radial-gradient(circle, rgba(242,168,59,.4), transparent 70%)',
                                }}
                            />
                            <div className="relative z-[1] flex h-11 w-11 flex-none items-center justify-center rounded-[11px] bg-white/96 p-1.25 shadow-[0_6px_16px_rgba(0,0,0,.18)]">
                                <img
                                    src="/logo-egerai-icon.png"
                                    alt="Logo e-GerAI"
                                    className="h-full w-full object-contain"
                                />
                            </div>
                            <div className="relative z-[1] min-w-0 flex-1">
                                <div className="text-[9px] font-bold tracking-[.12em] uppercase opacity-78 sm:text-[10.5px] sm:tracking-[.13em]">
                                    Balai Penataan Ruang Laut Makassar &middot;
                                    Ditjen Penataan Ruang Laut, KKP
                                </div>
                                <h2 className="mt-0.75 mb-0.75 text-base font-extrabold tracking-[-.01em] sm:text-lg">
                                    Halo e-GerAI BPRL Makassar
                                </h2>
                                <div className="max-w-full text-[11px] leading-[1.5] opacity-85 sm:max-w-[440px] sm:text-xs">
                                    Jawaban singkat &amp; jelas seputar
                                    Kesesuaian Kegiatan Pemanfaatan Ruang Laut.
                                </div>
                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/22 bg-white/14 py-0.75 pr-2.25 pl-1.75 text-[9.5px] sm:mt-2.5 sm:text-[10.5px]">
                                    <motion.span
                                        className="h-1.5 w-1.5 rounded-full bg-[#F2A83B]"
                                        animate={{
                                            boxShadow: [
                                                '0 0 0 0px rgba(242,168,59,.5)',
                                                '0 0 0 5px rgba(242,168,59,0)',
                                            ],
                                        }}
                                        transition={{
                                            duration: 1.6,
                                            repeat: Infinity,
                                            ease: 'easeOut',
                                        }}
                                    />
                                    Asisten Navi Siap Menjawab
                                </div>
                            </div>
                            <div className="pointer-events-none absolute -right-4 top-1/2 h-[80px] w-[80px] -translate-y-1/2 rounded-full bg-[#F2A83B]/30 shadow-[0_12px_24px_rgba(242,168,59,.25)] sm:-right-2 sm:h-[100px] sm:w-[100px]">
                                <img src="/navi.gif" alt="Navi" className="relative z-[1] h-full w-full flex-none object-contain" />
                            </div>
                        </div>

                        {/* .chat-chips — scrollable row, only before the conversation starts */}
                        <AnimatePresence>
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="flex-none overflow-hidden border-b bg-[#EAF6FC]"
                                style={{ borderColor: 'rgba(10,37,87,0.13)' }}
                            >
                                <div className="flex flex-wrap gap-2 overflow-x-auto px-3 py-2.5 sm:px-3.5 sm:py-3 lg:flex-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {CHIPS.map((chip, i) => (
                                        <motion.button
                                            key={chip.question}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                delay: 0.15 + i * 0.05,
                                                duration: 0.25,
                                            }}
                                            type="button"
                                            onClick={() => sendMessage(chip.question)}
                                            className="flex-none rounded-full border bg-white px-2.5 py-1.25 text-[11px] font-semibold whitespace-nowrap text-[#12468C] transition-transform duration-150 hover:-translate-y-px hover:border-[#F2A83B] hover:bg-[#FFF9EF] hover:text-[#D6821A] hover:shadow-[0_4px_10px_rgba(242,168,59,.22)] sm:px-3 sm:py-1.5 sm:text-xs"
                                            style={{ borderColor: 'rgba(10,37,87,0.13)' }}
                                        >
                                            {chip.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* .chat-thread */}
                        <div
                            ref={threadRef}
                            className="flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden bg-white px-3 py-3 sm:px-3.5 sm:py-4"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="max-w-[92%] self-start rounded-xl rounded-tl-[3px] border border-l-[3px] bg-[#EAF6FC] px-3 py-2.25 text-[13px] leading-[1.55] break-words text-[#0A2557] md:text-[13.3px]"
                                style={{
                                    borderColor: 'rgba(10,37,87,0.13)',
                                    borderLeftColor: '#1AA6E0',
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                <div className="mb-1 text-[9.5px] font-bold tracking-[.08em] text-[#D6821A] uppercase opacity-85">
                                    e-GerAI BPRL Makassar
                                </div>
                                Selamat datang. Silakan tanyakan hal seputar{' '}
                                <b>KKPRL</b> &mdash; persyaratan, prosedur OSS,
                                reklamasi, biaya, atau tracking permohonan.
                                Jawaban akan diberikan singkat dan jelas.
                            </motion.div>

                            {!isEmpty && (
                                <div className="flex max-w-full [scrollbar-width:none] gap-1.5 self-start overflow-x-auto [&::-webkit-scrollbar]:hidden">
                                    {CHIPS.slice(0, 4).map((chip) => (
                                        <button
                                            key={chip.question}
                                            type="button"
                                            onClick={() => sendMessage(chip.question)}
                                            className="flex-none rounded-full border border-[#cfe0f5] bg-[#F3F8FF] px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-[#12468C] hover:bg-[#FFF9EF] hover:text-[#D6821A]"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <AnimatePresence initial={false}>
                                {history.map((m) =>
                                    m.role === 'user' ? (
                                        <motion.div
                                            key={m.id}
                                            layout
                                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.22, ease: 'easeOut' }}
                                            className="max-w-[85%] self-end rounded-xl rounded-tr-[3px] px-3 py-2.25 text-[13px] leading-[1.55] break-words text-white md:text-[13.3px]"
                                            style={{
                                                background:
                                                    'linear-gradient(135deg,#0A2557,#12468C)',
                                                boxShadow:
                                                    '0 4px 12px rgba(10,37,87,.22)',
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {m.content}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key={m.id}
                                            layout
                                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ duration: 0.26, ease: 'easeOut' }}
                                            className="max-w-[92%] self-start rounded-xl rounded-tl-[3px] border border-l-[3px] bg-[#EAF6FC] px-3 py-2.25 text-[13px] leading-[1.55] break-words text-[#0A2557] md:text-[13.3px]"
                                            style={{
                                                borderColor: 'rgba(10,37,87,0.13)',
                                                borderLeftColor: '#1AA6E0',
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            <div className="mb-1 text-[9.5px] font-bold tracking-[.08em] text-[#D6821A] uppercase opacity-85">
                                                e-GerAI BPRL Makassar
                                            </div>
                                            {m.id === typingId ? (
                                                <TypingMarkdown
                                                    text={m.content}
                                                    onTick={scrollToBottom}
                                                    onDone={() =>
                                                        setTypingId((cur) =>
                                                            cur === m.id ? null : cur,
                                                        )
                                                    }
                                                />
                                            ) : (
                                                <div className="markdown-answer">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            {m.id !== typingId &&
                                                !!m.sources?.length && (
                                                    <div className="mt-2.5 border-t pt-2" style={{ borderColor: 'rgba(10,37,87,0.1)' }}>
                                                        <div className="mb-1.5 flex items-center gap-1 text-[9.5px] font-bold tracking-[.06em] text-[#5b7291] uppercase opacity-85">
                                                            <Globe className="h-3 w-3" />
                                                            Sumber
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {m.sources.map((src, i) => (
                                                                <a
                                                                    key={src.url + i}
                                                                    href={src.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title={src.title || src.url}
                                                                    className="inline-flex max-w-[220px] items-center gap-1 rounded-full border bg-white px-2 py-1 text-[10.5px] font-medium text-[#12468C] transition-colors hover:border-[#1AA6E0] hover:bg-[#F3FAFF] hover:text-[#0A2557]"
                                                                    style={{ borderColor: 'rgba(10,37,87,0.15)' }}
                                                                >
                                                                    <span className="flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full bg-[#EAF6FC] text-[8px] font-bold text-[#1AA6E0]">
                                                                        {i + 1}
                                                                    </span>
                                                                    <span className="truncate">
                                                                        {src.title || hostnameOf(src.url)}
                                                                    </span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                        </motion.div>
                                    ),
                                )}
                            </AnimatePresence>

                            {/* .chat-typing */}
                            <AnimatePresence>
                                {sending && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex w-fit gap-1 self-start rounded-xl rounded-tl-[3px] border border-l-[3px] bg-[#EAF6FC] px-3.25 py-2.75"
                                        style={{
                                            borderColor: 'rgba(10,37,87,0.13)',
                                            borderLeftColor: '#1AA6E0',
                                        }}
                                    >
                                        {[0, 1, 2].map((d) => (
                                            <motion.span
                                                key={d}
                                                className="h-1.5 w-1.5 rounded-full bg-[#1AA6E0]"
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{
                                                    duration: 0.8,
                                                    repeat: Infinity,
                                                    delay: d * 0.15,
                                                    ease: 'easeInOut',
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* .chat-form */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-shrink-0 gap-2 border-t px-3 py-2.5 sm:px-4 sm:py-3"
                            style={{ borderColor: 'rgba(10,37,87,0.13)' }}
                        >
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'auto';
                                    e.target.style.height =
                                        Math.min(e.target.scrollHeight, 86) +
                                        'px';
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Tulis pertanyaan seputar KKPRL..."
                                className="min-w-0 flex-1 resize-none rounded-[10px] border bg-[#F3F7FB] px-2.75 py-2.25 font-sans text-[13px] text-[#0A2557] outline-none placeholder:text-slate-400 focus:border-[#1AA6E0] focus:bg-white"
                                style={{
                                    borderColor: 'rgba(10,37,87,0.13)',
                                    maxHeight: '86px',
                                }}
                            />
                            <button
                                type="submit"
                                aria-label="Kirim"
                                disabled={!input.trim() || sending}
                                className="flex h-10.5 w-10.5 flex-shrink-0 items-center justify-center rounded-[10px] text-white transition-colors duration-150 disabled:cursor-default disabled:opacity-50"
                                style={{
                                    background:
                                        'linear-gradient(135deg,#F2A83B,#D6821A)',
                                    boxShadow:
                                        '0 4px 10px rgba(214,130,26,.35)',
                                }}
                            >
                                {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-[17px] w-[17px]" />
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* .chat-foot */}
                    <p className="hidden px-2.5 pt-1.25 text-center text-[10px] text-[#8a97a3] md:block">
                        Jawaban bersifat informatif, bukan pengganti dokumen
                        resmi peraturan KKP.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}