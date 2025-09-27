import { createPortal } from "react-dom";
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
    const loaderContent = (
      <div
        className={`fullscreen-loader-overlay ${
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

    return createPortal(loaderContent, document.body);
  }

  return (
    <div className="">
      <div className="loader"></div>
    </div>
  );
};
