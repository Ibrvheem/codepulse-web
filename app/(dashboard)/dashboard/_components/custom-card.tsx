// Individual Card components (extracted from the original HoverEffect)
export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`rounded-2xl h-full w-full p-4 overflow-hidden bg-white border border-gray-200 dark:border-transparent dark:dark:border-white/[0.2] group-hover:border-indigo-300 dark:group-hover:border-slate-700 relative z-20 ${
        className || ""
      }`}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={`text-zinc-100 font-bold tracking-wide ${className || ""}`}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={`my-4 text-zinc-400 tracking-wide leading-relaxed text-sm ${
        className || ""
      }`}
    >
      {children}
    </p>
  );
};
