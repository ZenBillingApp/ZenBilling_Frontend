import React from "react";

type Props = {
  children: React.ReactNode;
};

function LoginLayout({ children }: Props) {
  return <div className="h-screen w-screen">{children}</div>;
}

export default LoginLayout;
