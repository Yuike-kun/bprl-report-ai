import { useRef, useState, useEffect } from "react";
import { PenTool, Upload, Trash2, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
    value?: string;
    onChange: (value: string) => void;
    error?: string;
    label?: string;
    required?: boolean;
};

export default function SignaturePad({ value, onChange, error, label, required }: Props) {
    const [mode, setMode] = useState<"draw" | "upload">("draw");
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [fileName, setFileName] = useState<string>("");

    // Setup canvas resolution and drawing context
    useEffect(() => {
        if (mode !== "draw" || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = 160 * dpr;

        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.strokeStyle = "#0f172a"; // Slate-900 ink
            ctx.lineWidth = 2.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
        }
    }, [mode]);

    // Redraw existing signature if value exists when switching to draw mode
    useEffect(() => {
        if (value && mode === "draw" && canvasRef.current && !hasDrawn) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), 160);
                setHasDrawn(true);
            };
            img.src = value;
        }
    }, [value, mode]);

    const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const rect = canvasRef.current.getBoundingClientRect();
        if ("touches" in e) {
            const touch = e.touches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const { x, y } = getPos(e);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !canvasRef.current) return;
        const { x, y } = getPos(e);
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.stroke();
            setHasDrawn(true);
        }
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (canvasRef.current && hasDrawn) {
            const dataUrl = canvasRef.current.toDataURL("image/png");
            onChange(dataUrl);
        }
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
        setHasDrawn(false);
        setFileName("");
        onChange("");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran file maksimal 2MB.");
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onChange(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-700">
                    {label ?? "Tanda Tangan"} {required && <span className="text-red-500">*</span>}
                </Label>

                {/* Mode Selector Tabs */}
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium">
                    <button
                        type="button"
                        onClick={() => setMode("draw")}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                            mode === "draw"
                                ? "bg-white text-blue-700 shadow-xs font-semibold"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <PenTool className="w-3.5 h-3.5" />
                        Gambar Digital
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("upload")}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-all ${
                            mode === "upload"
                                ? "bg-white text-blue-700 shadow-xs font-semibold"
                                : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                        <Upload className="w-3.5 h-3.5" />
                        Unggah Gambar
                    </button>
                </div>
            </div>

            {mode === "draw" ? (
                <div className="space-y-2">
                    <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-slate-300 transition-colors">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full h-40 cursor-crosshair touch-none block"
                        />
                        {!hasDrawn && !value && (
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-sm select-none">
                                Goreskan tanda tangan di sini...
                            </div>
                        )}
                        {(hasDrawn || value) && (
                            <button
                                type="button"
                                onClick={clearCanvas}
                                className="absolute top-2 right-2 rounded-lg bg-slate-100/90 hover:bg-red-50 text-slate-500 hover:text-red-600 p-1.5 text-xs font-medium transition-colors border border-slate-200/80 flex items-center gap-1"
                                title="Bersihkan Tanda Tangan"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Bersihkan
                            </button>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                        Gunakan tetikus (mouse) atau layar sentuh untuk menggambar tanda tangan.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {value ? (
                        <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-16 h-12 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                                    <img src={value} alt="Preview Tanda Tangan" className="max-h-full max-w-full object-contain" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-700">{fileName || "Tanda Tangan Diunggah"}</p>
                                    <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-0.5">
                                        <Check className="w-3 h-3" /> Berhasil dimuat
                                    </p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={clearCanvas}
                                className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg text-xs"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Ganti
                            </Button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-blue-50/30 hover:border-blue-300 transition-all cursor-pointer p-4 group">
                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 group-hover:border-blue-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 shadow-xs transition-colors mb-2">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                                Klik untuk unggah gambar tanda tangan
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                PNG, JPG, atau WEBP (maksimal 2MB)
                            </p>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs font-medium text-red-500 flex items-center gap-1">
                    {error}
                </p>
            )}
        </div>
    );
}
