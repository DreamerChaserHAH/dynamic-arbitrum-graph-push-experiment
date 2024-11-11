"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import {PrivyProvider, usePrivy} from '@privy-io/react-auth';
import { ThemeProviderProps } from "next-themes/dist/types";
import { useState } from "react";
import dotenv from 'dotenv';

dotenv.config();

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  const {theme} = useTheme();

  console.log(theme);
  return (
      <NextUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
            <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ""}
            config={{
                appearance: {
                  landingHeader: "YumeRTS Notifications Experiment",
                  theme: theme == "dark" ? "dark" : "light",
                }
              }}
            >
            {children}
          </PrivyProvider>
        </NextThemesProvider>
      </NextUIProvider>
  );
}
