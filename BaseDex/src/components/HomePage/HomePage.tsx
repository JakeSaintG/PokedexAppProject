import { DexHeader } from "../DexHeader";
import { NavigationMenu } from "../NavigationMenu";

interface Props extends React.HTMLAttributes<HTMLElement>{
    value: string
}

export function HomePage( props: Props ) {
    return (
        <div>
            <DexHeader></DexHeader>
            <p>{props.value}</p>
            <NavigationMenu></NavigationMenu>
        </div>
    );
}
