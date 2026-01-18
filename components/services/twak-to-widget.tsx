// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

// Extend Window interface to include Tawk_API
declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

interface TawkUser {
  name?: string;
  email?: string;
  userId?: string;
  hash?: string;
}

interface TawkToWidgetProps {
  user?: TawkUser | null;
  hideOnRoutes?: string[]; // Routes where widget should be hidden
}

export default function TawkToWidget({
  user,
  hideOnRoutes = [],
}: TawkToWidgetProps) {
  const pathname = usePathname();
  const enforcementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const enforcementTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleScriptLoad = () => {
    // Wait for Tawk to be fully ready
    if (window.Tawk_API) {
      window.Tawk_API.onLoad = function () {
        // Force online status
        if (typeof window.Tawk_API.setAttributes === "function") {
          window.Tawk_API.setAttributes({
            alwaysOnline: "true",
          }, function (err: any) {
            if (err) console.error("Tawk error:", err);
          });
        }

        // Initial user setup
        updateTawkUser(user);
      };
    }
  };

  const updateTawkUser = (userData: TawkUser | undefined | null) => {
    if (!window.Tawk_API || !userData) return;

    try {
      const attributes: any = {};
      if (userData.name) attributes.name = userData.name;
      if (userData.email) attributes.email = userData.email;
      if (userData.hash) attributes.hash = userData.hash;

      if (typeof window.Tawk_API.setAttributes === "function") {
        window.Tawk_API.setAttributes(attributes, function (error: any) {
          if (error) console.error("Tawk.to setAttributes error:", error);
        });
      }

      if (userData.userId && typeof window.Tawk_API.addTags === "function") {
        window.Tawk_API.addTags([`user-${userData.userId}`], function (error: any) {
          if (error) console.error("Tawk.to addTags error:", error);
        });
      }
    } catch (error) {
      console.error("Error setting Tawk user attributes:", error);
    }
  };

  // Reactive user updates when login state changes
  useEffect(() => {
    if (window.Tawk_API && user) {
      updateTawkUser(user);
    }
  }, [user]);

  useEffect(() => {
    // Initialize Tawk_API before script loads
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
  }, []);

  // AGGRESSIVE show/hide widget based on current route
  useEffect(() => {
    const shouldHide = hideOnRoutes.some((route) => {
      if (route.endsWith("*")) {
        // Wildcard matching: /auth/* matches /auth/login, /auth/signup, etc.
        const baseRoute = route.slice(0, -1);
        return pathname.startsWith(baseRoute);
      }
      return pathname === route;
    });

    // Clear any existing intervals/timeouts
    if (enforcementIntervalRef.current) {
      clearInterval(enforcementIntervalRef.current);
    }
    if (enforcementTimeoutRef.current) {
      clearTimeout(enforcementTimeoutRef.current);
    }

    // Immediate attempt to hide/show
    if (window.Tawk_API) {
      if (shouldHide) {
        window.Tawk_API.hideWidget?.();
      } else {
        window.Tawk_API.showWidget?.();
      }
    }

    // Aggressively enforce visibility state every 50ms
    enforcementIntervalRef.current = setInterval(() => {
      if (window.Tawk_API) {
        if (shouldHide) {
          window.Tawk_API.hideWidget?.();

          // Extra aggressive: Also try to hide the iframe directly
          const tawkIframe = document.querySelector(
            'iframe[title*="chat"]'
          ) as HTMLIFrameElement;
          if (tawkIframe) {
            tawkIframe.style.display = "none";
            tawkIframe.style.visibility = "hidden";
          }
        } else {
          window.Tawk_API.showWidget?.();

          // Restore iframe visibility
          const tawkIframe = document.querySelector(
            'iframe[title*="chat"]'
          ) as HTMLIFrameElement;
          if (tawkIframe) {
            tawkIframe.style.display = "";
            tawkIframe.style.visibility = "";
          }
        }
      }
    }, 50);

    // Keep enforcing for 8 seconds to handle all edge cases
    enforcementTimeoutRef.current = setTimeout(() => {
      if (enforcementIntervalRef.current) {
        clearInterval(enforcementIntervalRef.current);
      }
    }, 8000);

    // Cleanup function
    return () => {
      if (enforcementIntervalRef.current) {
        clearInterval(enforcementIntervalRef.current);
      }
      if (enforcementTimeoutRef.current) {
        clearTimeout(enforcementTimeoutRef.current);
      }
    };
  }, [pathname, hideOnRoutes]);

  return (
    <>
      <Script
        id="tawk-to-script"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={(e) => {
          console.error("Failed to load Tawk.to script:", e);
        }}
      >
        {`
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/68e0328228fea3194d8c4b6b/1j6lsak4g';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `}
      </Script>
    </>
  );
}
