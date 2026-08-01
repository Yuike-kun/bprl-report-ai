import LokasiKonsultasiForm from "./form";

type Location = {
    id: number;
    nama_lokasi: string;
};

type Props = {
    location: Location;
};

export default function EditLokasiKonsultasi({ location }: Props) {
    return <LokasiKonsultasiForm mode="edit" location={location} />;
}
