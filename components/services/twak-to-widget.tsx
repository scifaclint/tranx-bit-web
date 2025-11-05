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
    console.log("Script loaded, user data:", user);

    // Wait for Tawk to be fully ready
    const checkTawk = setInterval(() => {
      if (window.Tawk_API && window.Tawk_API.onLoad) {
        clearInterval(checkTawk);

        window.Tawk_API.onLoad = function () {
          console.log("Tawk.to loaded successfully");
          console.log("Setting user attributes:", user);

          // Show widget and force online status
          window.Tawk_API.showWidget();
          window.Tawk_API.setAttributes({
            alwaysOnline: "true",
          });

          if (user && (user.name || user.email)) {
            try {
              const attributes: any = {};
              if (user.name) attributes.name = user.name;
              if (user.email) attributes.email = user.email;
              if (user.hash) attributes.hash = user.hash;

              console.log("Calling setAttributes with:", attributes);

              window.Tawk_API.setAttributes(attributes, function (error: any) {
                if (error) {
                  console.error("Tawk.to setAttributes error:", error);
                } else {
                  console.log("User attributes set successfully!");
                }
              });

              if (user.userId) {
                window.Tawk_API.addTags(
                  [`user-${user.userId}`],
                  function (error: any) {
                    if (error) {
                      console.error("Tawk.to addTags error:", error);
                    } else {
                      console.log("User tags added successfully!");
                    }
                  }
                );
              }
            } catch (error) {
              console.error("Error setting Tawk user attributes:", error);
            }
          } else {
            console.warn("No user data provided or user has no name/email");
          }
        };
      }
    }, 100);

    // Clear interval after 10 seconds if Tawk doesn't load
    setTimeout(() => clearInterval(checkTawk), 10000);
  };

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

    console.log(`Route: ${pathname}, Should hide: ${shouldHide}`);

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
        console.log("Immediately hiding Tawk widget");
      } else {
        window.Tawk_API.showWidget?.();
        console.log("Immediately showing Tawk widget");
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
        console.log("Stopped enforcing widget visibility");
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
