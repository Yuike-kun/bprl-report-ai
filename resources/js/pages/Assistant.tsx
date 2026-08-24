import { Head } from '@inertiajs/react';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import AppLayout from './layout';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const CHIPS = [
    'Apa itu KKPRL?',
    'Apa saja dokumen persyaratan KKPRL?',
    'Bagaimana cara mendaftar KKPRL di OSS?',
    'Berapa biaya PNBP KKPRL?',
    'Bagaimana cara melacak status permohonan KKPRL?',
    'Berapa lama proses (SLA) penerbitan KKPRL?',
    'Apa saja mitos yang salah tentang KKPRL?',
];

function escapeHtml(str: string) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatText(content: string) {
    return escapeHtml(content)
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
        .replace(/\n/g, '<br>');
}

export default function Assistant() {
    const [history, setHistory] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const threadRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (threadRef.current) {
            threadRef.current.scrollTop = threadRef.current.scrollHeight;
        }
    }, [history, sending]);

    const askAsisten = async (question: string, nextHistory: Message[]) => {
        setSending(true);
        try {
            const res = await fetch('/kkprl/assistant', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)
                            ?.content ?? '',
                },
                body: JSON.stringify({ messages: nextHistory }),
            });
            const data = await res.json().catch(() => null);
            const text =
                data && data.reply
                    ? data.reply
                    : 'Maaf, terjadi kendala saat memproses pertanyaan. Silakan coba lagi.';
            setHistory((prev) => [...prev, { role: 'assistant', content: text }]);
        } catch {
            setHistory((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi sesaat lagi.',
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    const sendMessage = (q: string) => {
        const question = q.trim();
        if (!question) return;
        const nextHistory: Message[] = [...history, { role: 'user', content: question }];
        setHistory(nextHistory);
        askAsisten(question, nextHistory);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const q = input.trim();
        if (!q) return;
        setInput('');
        if (inputRef.current) inputRef.current.style.height = 'auto';
        sendMessage(q);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const q = input.trim();
            if (!q) return;
            setInput('');
            if (inputRef.current) inputRef.current.style.height = 'auto';
            sendMessage(q);
        }
    };

    return (
        <AppLayout>
            <Head title="Asisten e-GerAI · KKPRL" />

            {/* .asisten-hero */}
            <section
                className="px-8 pt-6.5 pb-7.5"
                style={{
                    background: 'linear-gradient(135deg,#eaf2fb 0%,#cfe1f6 55%,#a9cdec 100%)',
                }}
            >
                <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-5">
                    <div>
                        <h1 className="m-0 mb-1.5 text-2xl font-extrabold text-[#123A63]">
                            Asisten e-GerAI &mdash; Tanya KKPRL
                        </h1>
                        <p className="m-0 max-w-[560px] text-[13.5px] leading-[1.5] text-[#33495e]">
                            Tanyakan apa pun seputar persyaratan, alur permohonan OSS/e-SEA,
                            biaya PNBP, reklamasi, hingga cara tracking permohonan KKPRL.
                            Dijawab singkat dan jelas oleh asisten BPRL Makassar.
                        </p>
                    </div>
                    <img
                        src="/static/logo-egerai-v2.png"
                        alt="e-GerAI BPRL Makassar"
                        className="h-14 w-auto object-contain"
                    />
                </div>
            </section>

            {/* .asisten-wrap */}
            <div className="relative z-[2] mx-auto -mt-2.5 max-w-[1600px] px-8 pt-6 pb-10 md:px-10">
                <a
                    href="/"
                    className="mb-4.5 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#1E63C7]"
                >
                    <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Beranda
                </a>

                {/* .chat-shell — relative wrapper so navi.png can sit behind the card */}
                <div
                    className="relative mx-auto max-w-[720px] font-sans"
                    style={{ height: 'min(680px, 78vh)' }}
                >
                    <img
                        src="/navi.png"
                        alt="Navi"
                        className="pointer-events-none absolute -left-20 bottom-0 z-0 h-[85%] w-auto select-none object-contain object-bottom drop-shadow-[0_12px_24px_rgba(10,37,87,.25)] sm:-left-28 md:-left-36"
                    />

                    {/* .chat-card — z-10 + solid bg so it visually overlaps the image */}
                    <div
                        className="relative z-10 flex h-full flex-col overflow-hidden rounded-[18px] border bg-white"
                        style={{
                            boxShadow: '0 10px 34px rgba(10,37,87,.16)',
                            borderColor: 'rgba(10,37,87,0.13)',
                        }}
                    >
                        {/* .chat-head */}
                        <div
                            className="relative flex items-start gap-3.25 overflow-hidden py-4.5 pl-5"
                            style={{
                                paddingRight: '96px',
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
                                <div className="text-[10.5px] font-bold tracking-[.13em] uppercase opacity-78">
                                    Balai Penataan Ruang Laut Makassar &middot; Ditjen Penataan
                                    Ruang Laut, KKP
                                </div>
                                <h2 className="mt-0.75 mb-0.75 text-lg font-extrabold tracking-[-.01em]">
                                    Halo e-GerAI BPRL Makassar
                                </h2>
                                <div className="max-w-[440px] text-xs leading-[1.5] opacity-85">
                                    Jawaban singkat &amp; jelas seputar Kesesuaian Kegiatan
                                    Pemanfaatan Ruang Laut.
                                </div>
                                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/22 bg-white/14 py-0.75 pr-2.25 pl-1.75 text-[10.5px]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#F2A83B] shadow-[0_0_0_3px_rgba(242,168,59,.3)]" />
                                    Asisten Navi Siap Menjawab
                                </div>
                            </div>
                        </div>

                        {/* .chat-chips */}
                        <div
                            className="flex gap-2 overflow-x-auto border-b bg-[#EAF6FC] px-3.5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            style={{ borderColor: 'rgba(10,37,87,0.13)' }}
                        >
                            {CHIPS.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => sendMessage(q)}
                                    className="flex-none rounded-full border bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-[#12468C] transition-transform duration-150 hover:-translate-y-px hover:border-[#F2A83B] hover:bg-[#FFF9EF] hover:text-[#D6821A] hover:shadow-[0_4px_10px_rgba(242,168,59,.22)]"
                                    style={{ borderColor: 'rgba(10,37,87,0.13)' }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* .chat-thread */}
                        <div
                            ref={threadRef}
                            className="flex flex-1 flex-col gap-3 overflow-y-auto bg-white px-3.5 py-4"
                        >
                            <div
                                className="max-w-[86%] self-start rounded-xl rounded-tl-[3px] border border-l-[3px] bg-[#EAF6FC] px-3 py-2.25 text-[13.3px] leading-[1.55] whitespace-pre-wrap text-[#0A2557]"
                                style={{ borderColor: 'rgba(10,37,87,0.13)', borderLeftColor: '#1AA6E0' }}
                            >
                                <div className="mb-1 text-[9.5px] font-bold tracking-[.08em] text-[#D6821A] uppercase opacity-85">
                                    e-GerAI BPRL Makassar
                                </div>
                                Selamat datang. Silakan tanyakan hal seputar <b>KKPRL</b> &mdash;
                                persyaratan, prosedur OSS, reklamasi, biaya, atau tracking
                                permohonan. Jawaban akan diberikan singkat dan jelas.
                            </div>

                            {history.map((m, i) =>
                                m.role === 'user' ? (
                                    <div
                                        key={i}
                                        className="max-w-[86%] self-end rounded-xl rounded-tr-[3px] px-3 py-2.25 text-[13.3px] leading-[1.55] whitespace-pre-wrap text-white"
                                        style={{
                                            background: 'linear-gradient(135deg,#0A2557,#12468C)',
                                            boxShadow: '0 4px 12px rgba(10,37,87,.22)',
                                        }}
                                    >
                                        {m.content}
                                    </div>
                                ) : (
                                    <div
                                        key={i}
                                        className="max-w-[86%] self-start rounded-xl rounded-tl-[3px] border border-l-[3px] bg-[#EAF6FC] px-3 py-2.25 text-[13.3px] leading-[1.55] whitespace-pre-wrap text-[#0A2557]"
                                        style={{ borderColor: 'rgba(10,37,87,0.13)', borderLeftColor: '#1AA6E0' }}
                                    >
                                        <div className="mb-1 text-[9.5px] font-bold tracking-[.08em] text-[#D6821A] uppercase opacity-85">
                                            e-GerAI BPRL Makassar
                                        </div>
                                        <div dangerouslySetInnerHTML={{ __html: formatText(m.content) }} />
                                    </div>
                                ),
                            )}

                            {/* .chat-typing */}
                            {sending && (
                                <div
                                    className="flex w-fit gap-1 self-start rounded-xl rounded-tl-[3px] border border-l-[3px] bg-[#EAF6FC] px-3.25 py-2.75"
                                    style={{ borderColor: 'rgba(10,37,87,0.13)', borderLeftColor: '#1AA6E0' }}
                                >
                                    {[0, 1, 2].map((d) => (
                                        <span
                                            key={d}
                                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1AA6E0]"
                                            style={{ animationDelay: `${d * 200}ms` }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* .chat-form */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex gap-2 border-t px-3.25 py-2.75"
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
                                        Math.min(e.target.scrollHeight, 86) + 'px';
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder="Tulis pertanyaan seputar KKPRL..."
                                className="flex-1 resize-none rounded-[10px] border bg-[#F3F7FB] px-2.75 py-2.25 font-sans text-[13px] text-[#0A2557] outline-none placeholder:text-slate-400 focus:border-[#1AA6E0] focus:bg-white"
                                style={{ borderColor: 'rgba(10,37,87,0.13)', maxHeight: '86px' }}
                            />
                            <button
                                type="submit"
                                aria-label="Kirim"
                                disabled={!input.trim() || sending}
                                className="flex h-10.5 w-10.5 flex-none items-center justify-center rounded-[10px] text-white transition-transform duration-150 hover:-translate-y-px hover:brightness-105 disabled:translate-y-0 disabled:cursor-default disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg,#F2A83B,#D6821A)',
                                    boxShadow: '0 4px 10px rgba(214,130,26,.35)',
                                }}
                            >
                                {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-[17px] w-[17px]" />
                                )}
                            </button>
                        </form>
                    </div>

                    {/* .chat-foot */}
                    <p className="px-2.5 pt-1.25 text-center text-[10px] text-[#8a97a3]">
                        Jawaban bersifat informatif, bukan pengganti dokumen resmi peraturan
                        KKP.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}