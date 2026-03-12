import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/** Mini auto-playing bubble sort for the hero decoration */
function useMiniSort() {
  const [bars, setBars] = useState([65, 35, 85, 20, 50, 75, 40, 90, 30, 60]);
  const [active, setActive] = useState<[number, number] | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let arr = [...bars];
    const n = arr.length;
    let i = 0;
    let j = 0;
    let running = true;

    function step() {
      if (!running) return;
      if (i >= n - 1) {
        arr = [65, 35, 85, 20, 50, 75, 40, 90, 30, 60];
        i = 0;
        j = 0;
        setBars([...arr]);
        setActive(null);
        timeoutRef.current = setTimeout(step, 1000);
        return;
      }
      if (j >= n - i - 1) {
        i++;
        j = 0;
        timeoutRef.current = setTimeout(step, 120);
        return;
      }

      setActive([j, j + 1]);
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        setBars([...arr]);
      }
      j++;
      timeoutRef.current = setTimeout(step, 120);
    }

    timeoutRef.current = setTimeout(step, 800);

    return () => {
      running = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { bars, active };
}

export function Hero() {
  const { bars, active } = useMiniSort();
  const maxVal = Math.max(...bars);
  const sectionRef = useRef<HTMLElement>(null);

  // Parallax scroll transforms
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const bgY1 = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const bgY2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Hide the server-rendered fallback hero once React hydrates
  useEffect(() => {
    document.getElementById('hero-fallback')?.remove();
  }, []);

  return (
    <motion.section
      ref={sectionRef}
      className="relative min-h-[80vh] flex items-center overflow-hidden"
      style={{ opacity: heroOpacity }}
    >
      {/* Background decoration — parallax layers */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-[var(--color-accent)] opacity-5 blur-3xl"
          style={{ y: bgY1 }}
        />
        <motion.div
          className="absolute bottom-1/4 -left-20 w-60 h-60 rounded-full bg-[var(--color-accent-secondary)] opacity-5 blur-3xl"
          style={{ y: bgY2 }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        {/* Text content — slower parallax */}
        <motion.div className="flex-1 max-w-xl" style={{ y: textY }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-[clamp(4rem,10vw,8rem)] leading-none tracking-wide text-[var(--color-text)]">
              A+DS
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-4 text-lg text-[var(--color-text-muted)] max-w-md"
          >
            See algorithms come alive. Interactive visualizations, step-by-step
            walkthroughs, and editorial-grade design — built for students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex gap-3"
          >
            <a
              href="/sorting/bubble-sort"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg
                         bg-[var(--color-accent)] text-white font-medium text-sm
                         hover:opacity-90 transition-opacity"
            >
              Start Learning
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </motion.div>
        </motion.div>

        {/* Mini sorting visualization — faster parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 max-w-md w-full"
          style={{ y: cardY }}
        >
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-glass)]
                          backdrop-blur-md p-6 aspect-[4/3] flex items-end gap-1.5">
            {bars.map((value, i) => {
              const height = (value / maxVal) * 100;
              const isActive = active && (i === active[0] || i === active[1]);
              return (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t"
                  animate={{
                    height: `${height}%`,
                    backgroundColor: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  style={{ opacity: isActive ? 1 : 0.5 }}
                />
              );
            })}
          </div>
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-3 font-mono">
            Bubble Sort — live
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
