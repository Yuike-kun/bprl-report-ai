import HomeLayout from './layout';

export default function IframeKKPRL() {
    return (
        <HomeLayout>
            <div>
                <iframe
                    src="https://egeraibprlmakassar-production.up.railway.app"
                    className="h-screen w-full border-0"
                    title="Asisten Proposal KKPRL"
                    allow="clipboard-write" // Optional: allows the iframe to copy/paste
                />
            </div>
        </HomeLayout>
    );
}
