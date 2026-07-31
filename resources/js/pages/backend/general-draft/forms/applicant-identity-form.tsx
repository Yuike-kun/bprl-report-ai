import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
    data: {
        nama_perusahaan?: string,
        nib?: string,
        npwp?: string,
        telp?: string,
        email?: string,
        jenis_kegiatan?: string,
        no_referensi?: string,
        tanggal_penyusunan?: string,
    }
    onChange: (key: string, value: string) => void
    errors?: Record<string, string>
}
export default function ApplicantIdentityForm({ data, onChange, errors }: Props) {
    const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => onChange(key, e.target.value);

    return (
        <div className="space-y-4">
            <Field
                label="Nama Pemohon / Pelaku Usaha"
                id="nama_perusahaan"
                placeholder="PT Contoh Maritim Indonesia"
                value={data.nama_perusahaan}
                onChange={handleChange("nama_perusahaan")}
                error={errors?.nama_perusahaan}
            />

            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="NIB (Nomor Induk Berusaha)"
                    id="nib"
                    placeholder="Diisi dengan NIB usaha"
                    value={data.nib}
                    onChange={handleChange("nib")}
                    error={errors?.nib}
                />
                <Field
                    label="NPWP"
                    id="npwp"
                    placeholder="Diisi dengan NPWP"
                    value={data.npwp}
                    onChange={handleChange("npwp")}
                    error={errors?.npwp}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="Nomor Telepon Selular"
                    id="telp"
                    placeholder="08xxxxxxxxxx"
                    value={data.telp}
                    onChange={handleChange("telp")}
                    error={errors?.telp}
                />
                <Field
                    label="Surat Elektronik (Email)"
                    id="email"
                    type="email"
                    placeholder="nama@perusahaan.com"
                    value={data.email}
                    onChange={handleChange("email")}
                    error={errors?.email}
                />
            </div>

            <Field
                label="Jenis Kegiatan"
                id="jenis_kegiatan"
                placeholder="Pelabuhan / Tersus / Budidaya / dll."
                value={data.jenis_kegiatan}
                onChange={handleChange("jenis_kegiatan")}
                error={errors?.jenis_kegiatan}
            />

            <div className="grid grid-cols-2 gap-4">
                <Field
                    label="Nomor Referensi"
                    id="no_referensi"
                    placeholder="KKPRL/SIM/001/2026"
                    value={data.no_referensi}
                    onChange={handleChange("no_referensi")}
                    error={errors?.no_referensi}
                />
                <Field
                    label="Tanggal Penyusunan"
                    id="tanggal_penyusunan"
                    type="date"
                    value={data.tanggal_penyusunan}
                    onChange={handleChange("tanggal_penyusunan")}
                    error={errors?.tanggal_penyusunan}
                />
            </div>
        </div>
    );
}

function Field({ label, id, type = "text", placeholder, value, onChange, error }: {
    label: string,
    id: string,
    type?: string,
    placeholder?: string,
    value?: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    error?: string
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value ?? ""}
                onChange={onChange}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
    );
}