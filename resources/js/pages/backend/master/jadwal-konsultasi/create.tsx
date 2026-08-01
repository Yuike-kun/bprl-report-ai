import JadwalKonsultasiForm from "./form";

type Location = {
    id: number;
    nama_lokasi: string;
};

type Props = {
    locations: Location[];
};

export default function CreateJadwalKonsultasi({ locations }: Props) {
    return <JadwalKonsultasiForm mode="create" locations={locations} />;
}
