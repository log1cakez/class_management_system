import Link from "next/link";

interface NavigationButtonsProps {
  homeButtonSize?: number;
  backButtonSize?: number;
  worksButtonSize?: number;
  gap?: string;
  onWorksClick?: () => void;
  homeUrl?: string;
  backUrl?: string;
  onBackClick?: () => void;
  showHomeButton?: boolean;
  showWorksButton?: boolean;
}

export default function NavigationButtons({
  homeButtonSize = 100,
  backButtonSize = 100,
  worksButtonSize = 100,
  gap = "gap-5",
  onWorksClick,
  homeUrl = "/dashboard",
  backUrl,
  onBackClick,
  showHomeButton = true,
  showWorksButton = true,
}: NavigationButtonsProps) {
  const iconButton = (icon: React.ReactNode, size: number) => (
    <div className="flex items-center justify-center rounded-full shadow-lg bg-yellow-400 group-hover:bg-yellow-500" style={{ width: size, height: size }}>
      {icon}
    </div>
  );

  return (
    <div className={`flex items-center ${gap} fixed top-8 right-8 z-30`}>
      {/* Back Button */}
      {(backUrl || onBackClick) && (
        <div className="flex flex-col items-center gap-1">
          {backUrl ? (
            <Link href={backUrl} className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-110">
              {iconButton(
                <svg className="drop-shadow-lg text-white" width={backButtonSize * 0.5} height={backButtonSize * 0.5} viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>,
                backButtonSize
              )}
              <span className="text-xs font-bold text-yellow-900 drop-shadow">Back</span>
            </Link>
          ) : (
            <button onClick={onBackClick} className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-110">
              {iconButton(
                <svg className="drop-shadow-lg text-white" width={backButtonSize * 0.5} height={backButtonSize * 0.5} viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>,
                backButtonSize
              )}
              <span className="text-xs font-bold text-yellow-900 drop-shadow">Back</span>
            </button>
          )}
        </div>
      )}

      {/* Home Button */}
      {showHomeButton && (
        <div className="flex flex-col items-center gap-1">
          <Link href={homeUrl} className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-110">
            {iconButton(
              <svg className="drop-shadow-lg text-white" width={homeButtonSize * 0.5} height={homeButtonSize * 0.5} viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>,
              homeButtonSize
            )}
            <span className="text-xs font-bold text-yellow-900 drop-shadow">Menu</span>
          </Link>
        </div>
      )}

      {/* Classes/Students Button */}
      {showWorksButton && (
        <div className="flex flex-col items-center gap-1">
          <button onClick={onWorksClick} className="group flex flex-col items-center gap-1 transition-all duration-200 hover:scale-110">
            {iconButton(
              <svg className="drop-shadow-lg text-white" width={worksButtonSize * 0.5} height={worksButtonSize * 0.5} viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>,
              worksButtonSize
            )}
            <span className="text-xs font-bold text-yellow-900 drop-shadow">Works</span>
          </button>
        </div>
      )}
    </div>
  );
}
