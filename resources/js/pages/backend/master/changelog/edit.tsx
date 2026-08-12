import Form from "./form";

type ChangelogItem = {
    id: number;
    version: string;
    title: string;
    description: string;
    type: "feature" | "bugfix" | "improvement";
    release_date: string;
};

type Props = {
    changelog: ChangelogItem;
};

export default function ChangelogEdit({ changelog }: Props) {
    return <Form mode="edit" changelog={changelog} />;
}
