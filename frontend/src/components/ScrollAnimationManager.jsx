import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollAnimationManager() {
  const location = useLocation();

  useEffect(() => {
    const selectors = [
      ".mini-line",
      ".analytics-bars",
      ".performance-chart-card",
      ".score-ring",
      ".accuracy-ring",
      ".forecast-card",
      ".metric-strip",
      ".capabilities-section",
    ];

    let observer;

    const startAnimations = () => {
      if (observer) {
        observer.disconnect();
      }

      const elements = document.querySelectorAll(
        selectors.join(",")
      );

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target;

            if (entry.isIntersecting) {
              element.classList.remove("animate-now");

              void element.offsetWidth;

              element.classList.add("animate-now");
            } else {
              element.classList.remove("animate-now");
            }
          });
        },
        {
          threshold: 0.25,
          rootMargin: "0px 0px -8% 0px",
        }
      );

      elements.forEach((element) => {
        observer.observe(element);
      });
    };

    const timer = window.setTimeout(() => {
      startAnimations();
    }, 50);

    const handlePageShow = () => {
      window.setTimeout(() => {
        startAnimations();
      }, 50);
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        "pageshow",
        handlePageShow
      );

      if (observer) {
        observer.disconnect();
      }
    };
  }, [location.pathname, location.key]);

  return null;
}