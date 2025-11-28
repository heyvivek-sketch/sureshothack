import { NextResponse } from 'next/server';

/**
 * Get available game types
 * GET /api/game/types
 */
export async function GET() {
  try {
    // All available game types
    const gameTypes = [
      { id: 'jalwa-game', name: 'Jalwa Game', icon: '🎯' },
      { id: 'tashanwin', name: 'TashanWin', icon: '🏆' },
      { id: '91club', name: '91Club', icon: '🎲' },
      { id: 'tc-lottery', name: 'Tc Lottery', icon: '🎰' },
      { id: 'bdg', name: 'BDG', icon: '🎪' },
      { id: 'diuwin', name: 'DiuWin', icon: '🎮' },
      { id: 'daman', name: 'Daman', icon: '🎨' },
      { id: '82-lottery', name: '82 lottery', icon: '🎫' },
      { id: 'sikkim', name: 'sikkim', icon: '🎭' },
      { id: '55club', name: '55club', icon: '🎯' },
      { id: 'dream99', name: 'Dream99', icon: '🌟' },
      { id: 'okwin', name: 'okwin', icon: '⭐' },
      { id: 'tiranga-game', name: 'tiranga game', icon: '🇮🇳' },
      { id: '51-game', name: '51 game', icon: '🎲' },
      { id: '66-lottery', name: '66 lottery', icon: '🎰' },
      { id: 'bharat-club', name: 'bharat club', icon: '🎪' },
      { id: 'in999', name: 'in999', icon: '🎮' },
      { id: 'lottery7', name: 'lottery7', icon: '🎫' },
      { id: 'rajaluck', name: 'rajaLuck', icon: '👑' },
      { id: 'kwg-game', name: 'KWG Game', icon: '🎯' },
      { id: 'raja-games', name: 'Raja Games', icon: '👑' },
    ];

    return NextResponse.json({
      success: true,
      data: gameTypes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch game types',
      },
      { status: 500 }
    );
  }
}

