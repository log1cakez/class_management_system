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
  return (
    <div className={`flex items-center ${gap} fixed top-8 right-8 z-30`}>
      {/* Back Button */}
      {(backUrl || onBackClick) && (
        <>
          {backUrl ? (
            <Link
              href={backUrl}
              className="flex items-center justify-center transition-all duration-200 hover:scale-110 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
              style={{
                width: backButtonSize,
                height: backButtonSize,
              }}
            >
              <svg
                className="drop-shadow-lg text-white"
                width={backButtonSize * 0.5}
                height={backButtonSize * 0.5}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          ) : (
            <button
              onClick={onBackClick}
              className="flex items-center justify-center transition-all duration-200 hover:scale-110 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
              style={{
                width: backButtonSize,
                height: backButtonSize,
              }}
            >
              <svg
                className="drop-shadow-lg text-white"
                width={backButtonSize * 0.5}
                height={backButtonSize * 0.5}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </>
      )}

      {/* Home Button */}
      {showHomeButton && (
        <Link
          href={homeUrl}
          className="flex items-center justify-center transition-all duration-200 hover:scale-110 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
          style={{
            width: homeButtonSize,
            height: homeButtonSize,
          }}
        >
          <svg
            className="drop-shadow-lg text-white"
            width={homeButtonSize * 0.5}
            height={homeButtonSize * 0.5}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </Link>
      )}

      {/* Classes/Students Button */}
      {showWorksButton && (
        <button
          onClick={onWorksClick}
          className="flex items-center justify-center transition-all duration-200 hover:scale-110 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500"
          style={{
            width: worksButtonSize,
            height: worksButtonSize,
          }}
        >
          <svg
            className="drop-shadow-lg text-white"
            width={worksButtonSize * 0.5}
            height={worksButtonSize * 0.5}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        </button>
      )}
    </div>
  );
}
