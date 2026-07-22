/**
 * Fixed decorative gradient blobs + subtle grid pattern.
 * Hidden below md: on the two heaviest blobs for mobile perf.
 */
export default function AmbientBackground() {
  return (
    <>
      <div className="pointer-events-none fixed top-[-10%] right-[-5%] w-2/5 h-2/5 bg-gradient-to-br from-pink-100 to-transparent rounded-full blur-3xl -z-10 dark:from-pink-900/10" />
      <div className="pointer-events-none fixed bottom-[-10%] left-[-5%] w-2/5 h-2/5 bg-gradient-to-tr from-pink-100 to-transparent rounded-full blur-3xl -z-10 dark:from-pink-900/10" />
      <div className="pointer-events-none hidden md:block fixed top-1/4 left-[-10%] w-1/3 h-1/3 bg-gradient-to-tr from-pink-200/20 to-transparent rounded-full blur-3xl -z-10 dark:from-pink-800/8" />
      <div className="pointer-events-none hidden md:block fixed bottom-1/4 right-[-10%] w-1/3 h-1/3 bg-gradient-to-bl from-pink-200/20 to-transparent rounded-full blur-3xl -z-10 dark:from-pink-800/8" />
      {/* subtle dot pattern */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.22] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,146,183,0.55) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 90%)",
        }}
      />
    </>
  );
}
