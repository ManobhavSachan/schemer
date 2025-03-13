"use client";

import { useEffect } from "react";

type KeyCombo = string;
type KeyHandler = (event: KeyboardEvent) => void;

export function useHotkeys(keyCombo: KeyCombo, handler: KeyHandler) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Parse the key combo
      const keys = keyCombo.toLowerCase().split("+");
      const key = event.key.toLowerCase();
      
      // Check if all modifiers are pressed
      const ctrlRequired = keys.includes("ctrl");
      const shiftRequired = keys.includes("shift");
      const altRequired = keys.includes("alt");
      const metaRequired = keys.includes("meta") || keys.includes("cmd");
      
      // Check if the main key is pressed
      const mainKey = keys.filter(
        (k) => !["ctrl", "shift", "alt", "meta", "cmd"].includes(k)
      )[0];
      
      // Check if the key combo matches
      if (
        key === mainKey &&
        event.ctrlKey === ctrlRequired &&
        event.shiftKey === shiftRequired &&
        event.altKey === altRequired &&
        event.metaKey === metaRequired
      ) {
        event.preventDefault();
        handler(event);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [keyCombo, handler]);
}