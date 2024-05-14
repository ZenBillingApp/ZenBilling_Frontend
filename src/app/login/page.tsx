import React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ModeToggle } from "@/components/ui/toggle-theme";

type Props = {};

function page({}: Props) {
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen w-full overflow-auto min-h-50">
        <h1 className="absolute text-2xl font-bold text-primary-foreground top-10 left-10">
          <span className={cn("text-border")}>Z</span>enBilling
        </h1>

        <Image
          className="absolute -z-10"
          src="/assets/background/background_Auth.svg"
          alt="background_Auth"
          layout="fill"
          objectFit="cover"
        />
        <div
          className={cn(
            "flex flex-col items-center justify-center bg-white border rounded-lg shadow-lg gap-4 z-10 p-6 xl:w-[600px]  lg:w-[500px]  md:w-[400px]  sm:w-[300px] "
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3 w-full">
            <h1
              className={cn(
                "font-bold text-forground xl:text-3xl lg:text-2xl md:text-xl sm:text-lg"
              )}
            >
              Welcome Back !
            </h1>
            <p
              className={cn(
                "text-foreground   xl:text-base lg:text-sm md:text-xs sm:text-xs text-center"
              )}
            >
              Please sign in to your account
            </p>
          </div>
          <form className="flex flex-col items-center justify-center w-full xl:gap-2 lg:gap-2 md:gap-2 sm:gap-2">
            <Input
              type="text"
              placeholder="Email"
              className="w-[80%] h-12 mt-5"
            />
            <Input
              type="password"
              placeholder="Password"
              className="w-[80%] h-12 mt-5"
            />
            <Button className="w-[80%]  mt-5" variant={"outline"}>
              Sign In
            </Button>
            <div className="flex items-center justify-between w-[80%] mt-5">
              <a
                href="#"
                className={cn(
                  "text-foreground hover:text-foreground xl:text-base lg:text-sm md:text-xs sm:text-xs"
                )}
              >
                Forgot Password?
              </a>
            </div>
            <div className="flex items-center justify-center w-[80%] mt-5">
              <span
                className={cn(
                  "text-foreground xl:text-base lg:text-sm md:text-xs sm:text-xs"
                )}
              >
                Dont have an account?
              </span>
              <a
                href="#"
                className={cn(
                  "text-foreground font-semibold ml-2 hover:text-foreground xl:text-base lg:text-sm md:text-xs sm:text-xs"
                )}
              >
                Sign Up
              </a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default page;
