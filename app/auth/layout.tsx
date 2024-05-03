import React from "react";

type Props = {
  children: React.ReactNode;
};

function AuthLayout({ children }: Props) {
  return <div className="w-full h-screen flex ">{children}</div>;
}

export default AuthLayout;
