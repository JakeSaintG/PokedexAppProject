interface Props extends React.HTMLAttributes<HTMLElement>{
    value: string
}

export function StartPage( props: Props ) {
    return (
        <div>
            <p>{props.value}</p>
        </div>
    );
}
