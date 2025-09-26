import "./Loader.css";

interface LoaderProps {
  fullscreen?: boolean;
  message?: string;
  whiteBackground?: boolean;
}

export const Loader = ({
  fullscreen = true,
  message,
  whiteBackground = false,
}: LoaderProps) => {
  if (fullscreen) {
    return (
      <div
        className={`z-50 fullscreen-loader-overlay ${
          whiteBackground ? "white-background" : ""
        }`}
      >
        <div className="fullscreen-loader-content">
          <div className="loader"></div>
          {message && (
            <p
              className={`fullscreen-loader-message ${
                whiteBackground ? "dark-text" : ""
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="loader"></div>
    </div>
  );
};
