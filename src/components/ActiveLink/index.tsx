import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, cloneElement } from "react";

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassName: string;
}

export function ActiveLink({
  children,
  activeClassName,
  ...props
}: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === props.href ? activeClassName : "";

  return (
    <>
      {/* clonar elemento permite adicionar novos parâmetros ao children */}
      <Link {...props}>
        {cloneElement(children, {
          className,
        })}
      </Link>
    </>
  );
}
