export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  WON = 'WON',
  LOST = 'LOST',
}

export interface Point {
  x: number;
  y: number;
}

export interface Missile {
  id: string;
  start: Point;
  current: Point;
  target: Point;
  speed: number;
  color: string;
  isExploding: boolean;
  explosionRadius: number;
  maxExplosionRadius: number;
}

export interface EnemyRocket {
  id: string;
  start: Point;
  current: Point;
  target: Point;
  speed: number;
}

export interface City {
  id: string;
  x: number;
  isDestroyed: boolean;
}

export interface Battery {
  id: string;
  x: number;
  ammo: number;
  maxAmmo: number;
  isDestroyed: boolean;
}
