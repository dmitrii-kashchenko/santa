// Simple in-memory storage for daily usage tracking
// In production, replace with Vercel KV, Redis, or a database
// For local dev, we use a file-based cache to persist across function invocations

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CACHE_FILE = join('/tmp', 'santa-usage-cache.json');

// Load from file cache if it exists
function loadCache() {
  try {
    if (existsSync(CACHE_FILE)) {
      const data = readFileSync(CACHE_FILE, 'utf8');
      const entries = JSON.parse(data);
      return new Map(entries);
    }
  } catch (error) {
    console.warn('[usage-storage] Failed to load cache:', error.message);
  }
  return new Map();
}

// Save to file cache
function saveCache(map) {
  try {
    const entries = Array.from(map.entries());
    const data = JSON.stringify(entries);
    writeFileSync(CACHE_FILE, data, 'utf8');
  } catch (error) {
    console.warn('[usage-storage] Failed to save cache:', error.message);
  }
}

// Create a Map with file persistence
class PersistentMap extends Map {
  set(key, value) {
    const result = super.set(key, value);
    saveCache(this);
    return result;
  }
  
  delete(key) {
    const result = super.delete(key);
    saveCache(this);
    return result;
  }
  
  clear() {
    super.clear();
    saveCache(this);
  }
}

// Use global Map with file persistence
// Check if global already exists, otherwise create new one and load from cache
let usageStore;
if (global.usageStore) {
  usageStore = global.usageStore;
} else {
  usageStore = new PersistentMap(loadCache());
  global.usageStore = usageStore;
}

export const MAX_DAILY_SECONDS = 180; // 3 minutes

function getTodayKey(identifier) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${identifier}:${today}`;
}

function syncFromFile() {
  const cached = loadCache();
  for (const [key, value] of cached) {
    if (!usageStore.has(key)) {
      usageStore.set(key, value);
    } else {
      // Merge if file has newer data (higher usedSeconds means more recent)
      const memUsage = usageStore.get(key);
      if (value.usedSeconds > memUsage.usedSeconds) {
        usageStore.set(key, value);
      }
    }
  }
}

export function getUsage(identifier) {
  syncFromFile(); // Always sync from file first
  const key = getTodayKey(identifier);
  const usage = usageStore.get(key) || { usedSeconds: 0, sessions: [] };
  const result = {
    usedSeconds: usage.usedSeconds,
    remainingSeconds: Math.max(0, MAX_DAILY_SECONDS - usage.usedSeconds),
    sessions: usage.sessions || []
  };
  console.log('[usage-storage] getUsage - Key:', key, 'Store size:', usageStore.size, 'Usage:', result);
  return result;
}

export function canStartSession(identifier) {
  const usage = getUsage(identifier);
  return usage.remainingSeconds > 0;
}

export function getRemainingTime(identifier) {
  const usage = getUsage(identifier);
  return usage.remainingSeconds;
}

export function recordSession(identifier, durationSeconds) {
  syncFromFile(); // Always sync from file first
  const key = getTodayKey(identifier);
  const existingUsage = usageStore.get(key);
  const usage = existingUsage || { usedSeconds: 0, sessions: [] };
  
  console.log('[usage-storage] recordSession - Key:', key, 'Before - Used:', usage.usedSeconds, 'Store size:', usageStore.size);
  
  // Calculate remaining seconds from used seconds
  const remainingSeconds = Math.max(0, MAX_DAILY_SECONDS - usage.usedSeconds);
  const actualDuration = Math.min(durationSeconds, remainingSeconds);
  
  usage.usedSeconds += actualDuration;
  usage.sessions.push({
    duration: actualDuration,
    timestamp: new Date().toISOString()
  });
  
  usageStore.set(key, usage); // This will save to file automatically
  
  const result = {
    usedSeconds: usage.usedSeconds,
    remainingSeconds: Math.max(0, MAX_DAILY_SECONDS - usage.usedSeconds)
  };
  
  console.log('[usage-storage] recordSession - After - Used:', result.usedSeconds, 'Remaining:', result.remainingSeconds, 'Store size:', usageStore.size);
  
  return result;
}

export function reserveTime(identifier, requestedSeconds) {
  const key = getTodayKey(identifier);
  const usage = usageStore.get(key) || { usedSeconds: 0, sessions: [] };
  const remaining = Math.max(0, MAX_DAILY_SECONDS - usage.usedSeconds);
  const reserved = Math.min(requestedSeconds, remaining);
  
  return {
    reservedSeconds: reserved,
    remainingSeconds: remaining - reserved
  };
}

// Export usageStore for test bypass
export { usageStore };

// Clean up old entries (older than 2 days) to prevent memory leaks
function cleanup() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const cutoffDate = twoDaysAgo.toISOString().split('T')[0];
  
  for (const [key] of usageStore) {
    const date = key.split(':')[1];
    if (date < cutoffDate) {
      usageStore.delete(key);
    }
  }
}

// Run cleanup every hour
setInterval(cleanup, 60 * 60 * 1000);

