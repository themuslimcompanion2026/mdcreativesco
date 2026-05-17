import { useEffect } from "react";
import { useSiteSetting } from "@/hooks/useSiteData";

/**
 * Updates favicon + apple-touch-icon at runtime from the global brand logo.
 */
export function DynamicFavicon() {
  const { data: brand } = useSiteSetting("brand");
  const url: string | undefined = brand?.logo_url;

  useEffect(() => {
    if (typeof document === "undefined" || !url) return;
    const setIcon = (rel: string) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = url;
    };
    setIcon("icon");
    setIcon("shortcut icon");
    setIcon("apple-touch-icon");
  }, [url]);

  return null;
}
