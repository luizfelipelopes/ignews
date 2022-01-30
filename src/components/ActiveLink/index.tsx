import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ReactElement, cloneElement } from "react";

interface ActiveLinkProps extends LinkProps {
    children: ReactElement;
    activeClassName: string;
}

export function ActiveLink({ children, activeClassName, ...rest }: ActiveLinkProps) {

    const { asPath } = useRouter(); // Recupera rota atual

    // className passa a receber a classe ativa se a url do link é igual a rota atual
    const className = asPath === rest.href
    ? activeClassName
    : '';


    return (
        <Link {...rest}>
            {/* clona elemento children e passa a classe ativa como propriedade */}
            {cloneElement(children, {
                className
            }) }
        </Link>
    );
}