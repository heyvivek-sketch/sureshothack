"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

interface GameType {
  id: string;
  name: string;
  icon: string;
}

interface GameSelectorProps {
  selectedGame: string;
  onGameChange: (gameType: string) => void;
}

export default function GameSelector({ selectedGame, onGameChange }: GameSelectorProps) {
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameTypes = async () => {
      try {
        const response = await apiClient.getGameTypes();
        if (response.success && response.data) {
          setGameTypes(response.data);
          if (response.data.length > 0 && !selectedGame) {
            onGameChange(response.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching game types:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameTypes();
  }, [selectedGame, onGameChange]);

  const selectedGameData = gameTypes.find((g) => g.id === selectedGame);

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg p-4 text-center text-gray-500">
        Loading games...
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-auto max-w-[240px] sm:max-w-[220px] bg-blue-400 hover:bg-blue-500 rounded-full px-4 py-2.5 sm:px-4 sm:py-2 flex items-center justify-between text-white font-medium shadow-md hover:shadow-lg transition-all text-sm sm:text-sm min-w-0"
      >
        <div className="flex items-center gap-2">
          <svg
            className="w-3.5 h-3.5 text-white flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-base text-white">{selectedGameData?.name || "Select The Game"}</span>
        </div>
        <svg
          className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-[101] w-full max-w-xs mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto">
            {gameTypes.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No games available</div>
            ) : (
              gameTypes.map((game) => (
                <button
                  key={game.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onGameChange(game.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-3 flex items-center gap-3 text-left hover:bg-gray-100 transition-colors ${
                    selectedGame === game.id ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="text-xl flex-shrink-0">{game.icon}</span>
                  <span className="font-medium text-sm flex-1 text-left text-black">{game.name}</span>
                  {selectedGame === game.id && (
                    <span className="ml-auto text-blue-600 flex-shrink-0">✓</span>
                  )}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

