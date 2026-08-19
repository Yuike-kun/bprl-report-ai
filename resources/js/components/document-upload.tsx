import { CheckCircle2, FileUp, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState, ReactNode } from 'react';

export default function DocumentUpload({
    number,
    title,
    description,
    onFile,
}: {
    number: number;
    title: string;
    description: ReactNode;
    onFile?: (file: File) => void;
}) {
    const [file, setFile] = useState<File>();
    const [drag, setDrag] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const choose = (f?: File) => {
        if (f) {
            setFile(f);
            onFile?.(f);
        }
    };
    const size = (n: number) =>
        n > 1048576
            ? `${(n / 1048576).toFixed(2)} MB`
            : `${Math.ceil(n / 1024)} KB`;
    return (
        <section className="rounded-2xl bg-white p-[23px] shadow-[0_6px_24px_#123a6314]">
            <div className="flex items-center gap-[11px]">
                <i className="grid h-[26px] w-[26px] place-items-center rounded-full bg-[#1e63c7] text-[13px] font-extrabold text-white not-italic">
                    {number}
                </i>
                <span className="grid h-[43px] w-[43px] place-items-center rounded-xl bg-[#eaf1fc] text-[#1e63c7]">
                    <FileUp className="w-[22px]" />
                </span>
            </div>
            <h2 className="mt-3 mb-[3px] text-[15px] text-[#123a63]">
                {title}
            </h2>
            <p className="mb-[15px] text-[12px] leading-relaxed text-[#5b6b7c]">
                {description}
            </p>
            {file ? (
                <div className="flex items-center gap-2 rounded-[10px] border border-[#cdeedb] bg-[#eafaf0] p-[10px] text-[#1c2b3a]">
                    <CheckCircle2 className="w-[17px] text-[#15955a]" />
                    <span className="overflow-hidden font-semibold text-ellipsis whitespace-nowrap">
                        {file.name}
                    </span>
                    <small className="ml-auto text-[#5b6b7c]">
                        {size(file.size)}
                    </small>
                    <button
                        type="button"
                        onClick={() => {
                            setFile(undefined);
                            onFile?.(undefined as any);
                        }}
                        className="border-0 bg-transparent cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                    </button>
                </div>
            ) : (
                <div
                    className={
                        'flex min-h-[150px] flex-col items-center justify-center gap-[5px] rounded-xl border-2 border-dashed text-[#5b6b7c] transition-[0.15s] ' +
                        (drag
                            ? 'border-[#1e63c7] bg-[#eef5fd]'
                            : 'border-[#b9cbe0] bg-[#f7fafd] hover:border-[#1e63c7] hover:bg-[#eef5fd]')
                    }
                    onClick={() => input.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDrag(true);
                    }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDrag(false);
                        choose(e.dataTransfer.files[0]);
                    }}
                >
                    <UploadCloud className="h-[30px] w-[30px] text-[#1e63c7]" />
                    <strong className="text-[13px] text-[#123a63]">
                        Drag & Drop PDF/Word di sini
                    </strong>
                    <span>atau klik untuk memilih file</span>
                    <small className="mt-[5px] text-[11px]">
                        Maksimum 256 MB · PDF atau .docx
                    </small>
                </div>
            )}
            <input
                ref={input}
                className="hidden"
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => choose(e.target.files?.[0])}
            />
        </section>
    );
}
