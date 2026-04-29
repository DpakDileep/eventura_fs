import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, state } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, state]);
  return null;
}
