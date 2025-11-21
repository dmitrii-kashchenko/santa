import React, { useState } from 'react';
import { NaughtyNiceBar } from '../NaughtyNiceBar/NaughtyNiceBar';

export const NaughtyNiceTest = () => {
  const [score, setScore] = useState(0);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px'
    }}>
      <h1>Naughty vs Nice Sandbox</h1>
      
      <div style={{ marginBottom: '40px', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <NaughtyNiceBar score={score} />
      </div>

      <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setScore(s => Math.max(-10, s - 1))}>-1</button>
          <button onClick={() => setScore(s => Math.min(10, s + 1))}>+1</button>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setScore(-10)}>Min (-10)</button>
          <button onClick={() => setScore(0)}>Reset (0)</button>
          <button onClick={() => setScore(10)}>Max (10)</button>
        </div>

        <input 
          type="range" 
          min="-10" 
          max="10" 
          value={score} 
          onChange={(e) => setScore(parseInt(e.target.value))}
          style={{ width: '300px', marginTop: '20px' }}
        />
        <div>Current Score: {score}</div>
      </div>
    </div>
  );
};

