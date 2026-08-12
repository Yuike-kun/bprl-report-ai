import HomeLayout from './layout';

export default function IframeKKPRL() {
    return (
        <HomeLayout>
            <div>
                <iframe
                    src="https://egeraibprlmakassar-production.up.railway.app/proposal-manual"
                    className="h-screen w-full border-0"
                    title="Asisten Proposal KKPRL"
                    allow="clipboard-write"
                />
            </div>
        </HomeLayout>
    );
}
