import { useEffect, useRef, useState } from "react";

export default function RevealOnScroll({
  children,
  className = "",
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
      }
    );

    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className={`scroll-reveal ${visible ? "is-visible" : ""} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}