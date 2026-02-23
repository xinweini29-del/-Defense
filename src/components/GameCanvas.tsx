import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Point, Missile, EnemyRocket, City, Battery } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  EXPLOSION_SPEED, 
  MAX_EXPLOSION_RADIUS, 
  MISSILE_SPEED, 
  ENEMY_SPEED_MIN, 
  ENEMY_SPEED_MAX,
  BATTERY_AMMO,
  SCORE_PER_KILL,
  COLORS
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  onScoreChange: (score: number) => void;
  onGameOver: (won: boolean) => void;
  onAmmoChange: (ammo: number[]) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  onScoreChange, 
  onGameOver,
  onAmmoChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  
  // Game State Refs (to avoid closure issues in the loop)
  const scoreRef = useRef(0);
  const missilesRef = useRef<Missile[]>([]);
  const enemiesRef = useRef<EnemyRocket[]>([]);
  const citiesRef = useRef<City[]>([]);
  const batteriesRef = useRef<Battery[]>([]);
  const lastEnemySpawnTime = useRef(0);

  const initGame = useCallback(() => {
    scoreRef.current = 0;
    missilesRef.current = [];
    enemiesRef.current = [];
    
    // Initialize Cities
    const cityWidth = CANVAS_WIDTH / 10;
    citiesRef.current = [
      { id: 'c1', x: cityWidth * 1.5, isDestroyed: false },
      { id: 'c2', x: cityWidth * 2.5, isDestroyed: false },
      { id: 'c3', x: cityWidth * 3.5, isDestroyed: false },
      { id: 'c4', x: cityWidth * 6.5, isDestroyed: false },
      { id: 'c5', x: cityWidth * 7.5, isDestroyed: false },
      { id: 'c6', x: cityWidth * 8.5, isDestroyed: false },
    ];

    // Initialize Batteries
    batteriesRef.current = [
      { id: 'b1', x: cityWidth * 0.5, ammo: BATTERY_AMMO[0], maxAmmo: BATTERY_AMMO[0], isDestroyed: false },
      { id: 'b2', x: cityWidth * 5.0, ammo: BATTERY_AMMO[1], maxAmmo: BATTERY_AMMO[1], isDestroyed: false },
      { id: 'b3', x: cityWidth * 9.5, ammo: BATTERY_AMMO[2], maxAmmo: BATTERY_AMMO[2], isDestroyed: false },
    ];
    
    onScoreChange(0);
    onAmmoChange(batteriesRef.current.map(b => b.ammo));
  }, [onScoreChange, onAmmoChange]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      initGame();
    }
  }, [gameState, initGame]);

  const spawnEnemy = () => {
    const targets = [
      ...citiesRef.current.filter(c => !c.isDestroyed).map(c => ({ x: c.x, type: 'city', id: c.id })),
      ...batteriesRef.current.filter(b => !b.isDestroyed).map(b => ({ x: b.x, type: 'battery', id: b.id }))
    ];

    if (targets.length === 0) return;

    const target = targets[Math.floor(Math.random() * targets.length)];
    const startX = Math.random() * CANVAS_WIDTH;
    
    enemiesRef.current.push({
      id: Math.random().toString(36).substr(2, 9),
      start: { x: startX, y: 0 },
      current: { x: startX, y: 0 },
      target: { x: target.x, y: CANVAS_HEIGHT - 20 },
      speed: ENEMY_SPEED_MIN + Math.random() * (ENEMY_SPEED_MAX - ENEMY_SPEED_MIN)
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (gameState !== GameState.PLAYING) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (CANVAS_WIDTH / rect.width);
    const y = (clientY - rect.top) * (CANVAS_HEIGHT / rect.height);

    // Find closest battery with ammo
    let bestBattery: Battery | null = null;
    let minDist = Infinity;

    batteriesRef.current.forEach(b => {
      if (!b.isDestroyed && b.ammo > 0) {
        const dist = Math.abs(b.x - x);
        if (dist < minDist) {
          minDist = dist;
          bestBattery = b;
        }
      }
    });

    if (bestBattery) {
      (bestBattery as Battery).ammo -= 1;
      onAmmoChange(batteriesRef.current.map(b => b.ammo));

      missilesRef.current.push({
        id: Math.random().toString(36).substr(2, 9),
        start: { x: (bestBattery as Battery).x, y: CANVAS_HEIGHT - 20 },
        current: { x: (bestBattery as Battery).x, y: CANVAS_HEIGHT - 20 },
        target: { x, y },
        speed: MISSILE_SPEED,
        color: COLORS.MISSILE,
        isExploding: false,
        explosionRadius: 0,
        maxExplosionRadius: MAX_EXPLOSION_RADIUS
      });
    }
  };

  const update = (time: number) => {
    if (gameState !== GameState.PLAYING) return;

    // Spawn enemies
    if (time - lastEnemySpawnTime.current > 1500 - Math.min(scoreRef.current / 2, 1000)) {
      spawnEnemy();
      lastEnemySpawnTime.current = time;
    }

    // Update Missiles
    missilesRef.current = missilesRef.current.filter(m => {
      if (m.isExploding) {
        m.explosionRadius += EXPLOSION_SPEED;
        return m.explosionRadius < m.maxExplosionRadius;
      } else {
        const dx = m.target.x - m.current.x;
        const dy = m.target.y - m.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < m.speed) {
          m.current = { ...m.target };
          m.isExploding = true;
        } else {
          m.current.x += (dx / dist) * m.speed;
          m.current.y += (dy / dist) * m.speed;
        }
        return true;
      }
    });

    // Update Enemies
    enemiesRef.current = enemiesRef.current.filter(e => {
      const dx = e.target.x - e.current.x;
      const dy = e.target.y - e.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < e.speed) {
        // Hit target!
        const city = citiesRef.current.find(c => Math.abs(c.x - e.target.x) < 5);
        if (city) city.isDestroyed = true;
        
        const battery = batteriesRef.current.find(b => Math.abs(b.x - e.target.x) < 5);
        if (battery) battery.isDestroyed = true;

        // Check game over
        if (batteriesRef.current.every(b => b.isDestroyed)) {
          onGameOver(false);
        }

        return false;
      } else {
        e.current.x += (dx / dist) * e.speed;
        e.current.y += (dy / dist) * e.speed;

        // Check collision with explosions
        const hitByExplosion = missilesRef.current.some(m => {
          if (!m.isExploding) return false;
          const edx = e.current.x - m.current.x;
          const edy = e.current.y - m.current.y;
          const edist = Math.sqrt(edx * edx + edy * edy);
          return edist < m.explosionRadius;
        });

        if (hitByExplosion) {
          scoreRef.current += SCORE_PER_KILL;
          onScoreChange(scoreRef.current);
          if (scoreRef.current >= 1000) {
            onGameOver(true);
          }
          return false;
        }
        return true;
      }
    });
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Ground
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Draw Cities
    citiesRef.current.forEach(c => {
      if (!c.isDestroyed) {
        ctx.fillStyle = COLORS.CITY;
        ctx.fillRect(c.x - 15, CANVAS_HEIGHT - 35, 30, 15);
        // Windows
        ctx.fillStyle = '#fde047';
        ctx.fillRect(c.x - 10, CANVAS_HEIGHT - 30, 4, 4);
        ctx.fillRect(c.x + 6, CANVAS_HEIGHT - 30, 4, 4);
      } else {
        ctx.fillStyle = '#444';
        ctx.fillRect(c.x - 15, CANVAS_HEIGHT - 25, 30, 5);
      }
    });

    // Draw Batteries
    batteriesRef.current.forEach(b => {
      if (!b.isDestroyed) {
        ctx.fillStyle = COLORS.BATTERY;
        ctx.beginPath();
        ctx.moveTo(b.x - 20, CANVAS_HEIGHT - 20);
        ctx.lineTo(b.x, CANVAS_HEIGHT - 50);
        ctx.lineTo(b.x + 20, CANVAS_HEIGHT - 20);
        ctx.fill();
      } else {
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(b.x, CANVAS_HEIGHT - 20, 15, Math.PI, 0);
        ctx.fill();
      }
    });

    // Draw Enemies
    enemiesRef.current.forEach(e => {
      ctx.strokeStyle = COLORS.ENEMY;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(e.start.x, e.start.y);
      ctx.lineTo(e.current.x, e.current.y);
      ctx.stroke();

      ctx.fillStyle = COLORS.ENEMY;
      ctx.beginPath();
      ctx.arc(e.current.x, e.current.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Missiles
    missilesRef.current.forEach(m => {
      if (m.isExploding) {
        ctx.fillStyle = COLORS.EXPLOSION;
        ctx.beginPath();
        ctx.arc(m.current.x, m.current.y, m.explosionRadius, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Trail
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(m.start.x, m.start.y);
        ctx.lineTo(m.current.x, m.current.y);
        ctx.stroke();

        // Missile head
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.current.x, m.current.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Target X
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        const size = 4;
        ctx.beginPath();
        ctx.moveTo(m.target.x - size, m.target.y - size);
        ctx.lineTo(m.target.x + size, m.target.y + size);
        ctx.moveTo(m.target.x + size, m.target.y - size);
        ctx.lineTo(m.target.x - size, m.target.y + size);
        ctx.stroke();
      }
    });
  };

  const loop = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    update(time);
    draw(ctx);
    (requestRef as any).current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    (requestRef as any).current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseDown={handleCanvasClick}
      onTouchStart={handleCanvasClick}
      className="w-full h-full cursor-crosshair touch-none bg-black rounded-lg shadow-2xl border border-white/10"
    />
  );
};

export default GameCanvas;
