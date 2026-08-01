import JadwalKonsultasiForm from "./form";

type Location = {
    id: number;
    nama_lokasi: string;
};

type Schedule = {
    id: number;
    tanggal: string;
    waktu_awal: string;
    waktu_akhir: string;
    pelaksanaan: "Luring" | "Daring" | "Hybrid";
    lokasi_konsultasi_id: number | null;
    kuota_konsultasi: number;
};

type Props = {
    schedule: Schedule;
    locations: Location[];
};

export default function EditJadwalKonsultasi({ schedule, locations }: Props) {
    return <JadwalKonsultasiForm mode="edit" schedule={schedule} locations={locations} />;
}
