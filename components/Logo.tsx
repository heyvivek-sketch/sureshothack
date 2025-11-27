interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-20 h-20",
    lg: "w-24 h-24",
  };

  const iconSizes = {
    sm: 24,
    md: 48,
    lg: 64,
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${sizeClasses[size]} bg-primary-orange rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50`}
      >
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tiger/Lion head outline */}
          <path
            d="M24 8C15.16 8 8 15.16 8 24C8 32.84 15.16 40 24 40C32.84 40 40 32.84 40 24C40 15.16 32.84 8 24 8Z"
            fill="white"
            stroke="black"
            strokeWidth="2"
          />
          {/* Eyes */}
          <circle cx="18" cy="20" r="2" fill="black" />
          <circle cx="30" cy="20" r="2" fill="black" />
          {/* Nose */}
          <path
            d="M24 26C22.5 26 21.5 25 21.5 24C21.5 23 22.5 22 24 22C25.5 22 26.5 23 26.5 24C26.5 25 25.5 26 24 26Z"
            fill="black"
          />
          {/* Mouth/Teeth */}
          <path
            d="M20 30C20 30 22 32 24 32C26 32 28 30 28 30"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showText && (
        <>
          <p className="text-white text-xs font-semibold mt-2">SURESHOT HACK</p>
          {size === "md" && (
            <h1 className="text-4xl font-bold text-white mt-2">SureShot_Hack</h1>
          )}
        </>
      )}
    </div>
  );
}

