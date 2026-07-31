import Heading from "@/components/backend/heading";
import MainLayout from "./layout";

export default function Dashboard() {
    return (
        <MainLayout pageTitle="Dashboard">
            <Heading title="Dashboard" description="Dashboard" />
        </MainLayout>
    );
}