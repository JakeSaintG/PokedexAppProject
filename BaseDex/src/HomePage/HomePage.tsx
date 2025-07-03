interface Props extends React.HTMLAttributes<HTMLElement>{
    value: string
}

export function HomePage( props: Props ) {
    return (
        <div>
            <p>{props.value}</p>
        </div>
    );
}
