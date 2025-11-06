"use client";

import { useEffect, useState } from "react";
import type { UserSearchResult } from "../types";

interface UserMentionDropdownProps {
  users: UserSearchResult[];
  onSelect: (username: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function UserMentionDropdown({
  users,
  onSelect,
  onClose,
  position,
}: UserMentionDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < users.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (users[selectedIndex]) {
            onSelect(users[selectedIndex].username);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [users, selectedIndex, onSelect, onClose]);

  if (users.length === 0) {
    return null;
  }

  return (
    <div
      className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        minWidth: "200px",
      }}
    >
      <ul className="py-1">
        {users.map((user, index) => (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onSelect(user.username)}
              className={`
                w-full text-left px-4 py-2 text-sm transition-colors
                ${
                  index === selectedIndex
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-50"
                }
              `}
            >
              @{user.username}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
