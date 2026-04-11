"use client";

import { useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  extractUTMParams,
  storeUTMParams,
  getStoredUTMParams,
  type UTMParams,
} from "@/lib/analytics";

export function useUTMParams(): UTMParams {
  const searchParams = useSearchParams();

  const utmParams = useMemo(() => {
    const storedParams = getStoredUTMParams();
    const urlParams = extractUTMParams(searchParams);
    return { ...storedParams, ...urlParams };
  }, [searchParams]);

  useEffect(() => {
    storeUTMParams(utmParams);
  }, [utmParams]);

  return utmParams;
}

export function useUTMFormFields(): Record<string, string> {
  const utmParams = useUTMParams();

  return useMemo(() => {
    const formFields: Record<string, string> = {};
    for (const [key, value] of Object.entries(utmParams)) {
      if (value) {
        formFields[key] = value;
      }
    }
    return formFields;
  }, [utmParams]);
}
