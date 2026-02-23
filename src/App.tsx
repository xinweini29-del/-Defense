import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Shield, Zap, Info, Languages } from 'lucide-react';
import GameCanvas from './components/GameCanvas';
import { GameState } from './types';
import { WIN_SCORE } from './constants';

const TRANSLATIONS = {
  en: {
    title: "Xinwei Defense",
    score: "Score",
    ammo: "Ammo",
    win: "VICTORY!",
    lose: "GAME OVER",
    playAgain: "Play Again",
    start: "Start Game",
    instructions: "Defend your cities! Click to intercept rockets. Reach 1000 points to win.",
    left: "L",
    mid: "M",
    right: "R",
  },
  zh: {
    title: "新惟",
    score: "得分",
    ammo: "弹药",
    win: "胜利！",
    lose: "游戏结束",
    playAgain: "再玩一次",
    start: "开始游戏",
    instructions: "保卫你的城市！点击拦截火箭。达到1000分即可获胜。",
    left: "左",
    mid: "中",
    right: "右",
  }
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [ammo, setAmmo] = useState<number[]>([0, 0, 0]);
  const [lang, setLang] = useState<'en' | 'zh'>('zh');

  const t = TRANSLATIONS[lang];

  const handleGameOver = useCallback((won: boolean) => {
    setGameState(won ? GameState.WON : GameState.LOST);
  }, []);

  const handleRestart = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="max-w-4xl mx-auto p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <Shield className="w-6 h-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight uppercase italic font-serif">
            {t.title}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLang}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-white/10"
          >
            <Languages className="w-5 h-5 text-white/70" />
          </button>
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
              {t.score}
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-400">
              {score.toString().padStart(4, '0')}
            </span>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="max-w-4xl mx-auto px-4 pb-12 relative">
        <div className="aspect-[4/3] relative bg-black rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">
          <GameCanvas 
            gameState={gameState} 
            onScoreChange={setScore} 
            onGameOver={handleGameOver}
            onAmmoChange={setAmmo}
          />

          {/* Overlays */}
          <AnimatePresence>
            {gameState !== GameState.PLAYING && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-8"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="text-center space-y-8 max-w-md"
                >
                  {gameState === GameState.START && (
                    <>
                      <div className="space-y-4">
                        <Zap className="w-16 h-16 text-emerald-500 mx-auto animate-pulse" />
                        <h2 className="text-4xl font-bold tracking-tighter uppercase italic">
                          {t.title}
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed">
                          {t.instructions}
                        </p>
                      </div>
                      <button 
                        onClick={() => setGameState(GameState.PLAYING)}
                        className="group relative px-8 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-emerald-500 transition-all duration-300 overflow-hidden"
                      >
                        <span className="relative z-10">{t.start}</span>
                        <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      </button>
                    </>
                  )}

                  {gameState === GameState.WON && (
                    <>
                      <div className="space-y-4">
                        <Trophy className="w-20 h-20 text-yellow-500 mx-auto" />
                        <h2 className="text-6xl font-black tracking-tighter text-yellow-500 italic">
                          {t.win}
                        </h2>
                        <div className="text-2xl font-mono text-white/80">
                          {score} / {WIN_SCORE}
                        </div>
                      </div>
                      <button 
                        onClick={handleRestart}
                        className="flex items-center gap-2 mx-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-full font-bold transition-all"
                      >
                        <RotateCcw className="w-5 h-5" />
                        {t.playAgain}
                      </button>
                    </>
                  )}

                  {gameState === GameState.LOST && (
                    <>
                      <div className="space-y-4">
                        <div className="w-20 h-20 border-4 border-red-500 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-4xl font-bold text-red-500">!</span>
                        </div>
                        <h2 className="text-6xl font-black tracking-tighter text-red-500 italic">
                          {t.lose}
                        </h2>
                        <div className="text-2xl font-mono text-white/80">
                          {score}
                        </div>
                      </div>
                      <button 
                        onClick={handleRestart}
                        className="flex items-center gap-2 mx-auto px-8 py-4 bg-white text-black hover:bg-red-500 hover:text-white rounded-full font-bold transition-all"
                      >
                        <RotateCcw className="w-5 h-5" />
                        {t.playAgain}
                      </button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* HUD / Ammo Display */}
        <div className="mt-8 grid grid-cols-3 gap-6">
          {[
            { label: t.left, count: ammo[0], max: 20 },
            { label: t.mid, count: ammo[1], max: 40 },
            { label: t.right, count: ammo[2], max: 20 }
          ].map((battery, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                {battery.label} {t.ammo}
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-mono font-bold ${battery.count === 0 ? 'text-red-500' : 'text-white'}`}>
                  {battery.count}
                </span>
                <span className="text-white/20 text-sm">/ {battery.max}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(battery.count / battery.max) * 100}%` }}
                  className={`h-full ${battery.count < 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <footer className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-white/30 text-xs font-mono uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>System Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Cities Online</span>
            </div>
          </div>
          <div className="flex items-center gap-2 italic">
            <Info className="w-3 h-3" />
            <span>Intercept all incoming threats</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
