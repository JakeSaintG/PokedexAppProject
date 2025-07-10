import { DexHeader } from "../DexHeader";

interface Props extends React.HTMLAttributes<HTMLElement>{
    value: string
}

export function HomePage( props: Props ) {
    return (
        <div>
            <DexHeader></DexHeader>
            <p>{props.value}</p>
        </div>
    );
}
