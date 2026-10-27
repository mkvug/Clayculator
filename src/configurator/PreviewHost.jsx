import { useEffect, useRef } from "react";
import { mountCalculator } from "../embed/mountCalculator.jsx";

// Live preview rendered exactly as it will appear on a studio's site (same shadow-root mount).
export default function PreviewHost({ config }) {
  const hostRef = useRef(null);
  const api = useRef(null);

  useEffect(() => {
    api.current = mountCalculator(hostRef.current, config);
    return () => api.current.unmount();
  }, []);

  useEffect(() => {
    if (api.current) api.current.update(config);
  }, [config]);

  return <div ref={hostRef} className="preview-host" />;
}
