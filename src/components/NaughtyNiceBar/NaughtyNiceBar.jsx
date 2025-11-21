import React from 'react';
import styles from './NaughtyNiceBar.module.css';

export const NaughtyNiceBar = ({ score = 0 }) => {
  return (
    <div className={styles.container}>
      <div className={styles.barContainer}>
        {Array.from({ length: 11 }).map((_, i) => {
          // 11 segments total: 5 naughty (left), 1 neutral (middle), 5 nice (right)
          // Middle segment (index 5) is always neutral gray
          const middleIndex = 5;
          const isNeutral = i === middleIndex;
          
          // Calculate segments based on score (-10 to +10)
          // Every 2 points = 1 segment, so score 10 = 5 segments (full nice side)
          const segmentCount = score / 2;

          const getSegmentState = (i) => {
            // Middle segment is always neutral
            if (isNeutral) {
              return { isNice: false, isNaughty: false, isNeutral: true, opacity: 1 };
            }
            
            if (score > 0) {
              // For positive scores, light up segments from the middle+1 (index 6) to the right
              const startIndex = middleIndex + 1; // Start from index 6
              const endIndex = startIndex + segmentCount;
              
              // Check if this segment is in the range [startIndex, endIndex)
              if (i < startIndex || i >= Math.ceil(endIndex)) {
                return { isNice: false, isNaughty: false, isNeutral: false, opacity: 1 };
              }
              
              // Check if this is the last segment and it's partial
              if (endIndex % 1 !== 0 && i === Math.floor(endIndex)) {
                const partialAmount = endIndex % 1;
                return { isNice: true, isNaughty: false, isNeutral: false, opacity: partialAmount };
              }
              
              return { isNice: true, isNaughty: false, isNeutral: false, opacity: 1 };
            } else if (score < 0) {
              // For negative scores, light up segments from the middle-1 (index 4) to the left
              const startIndex = middleIndex - 1; // Start from index 4
              const absSegmentCount = Math.abs(segmentCount);
              const endIndex = startIndex - absSegmentCount;
              
              if (i <= Math.floor(endIndex) || i > startIndex) {
                return { isNice: false, isNaughty: false, isNeutral: false, opacity: 1 };
              }
              
              if (endIndex % 1 !== 0 && i === Math.ceil(endIndex)) {
                const partialAmount = 1 - (endIndex % 1);
                return { isNice: false, isNaughty: true, isNeutral: false, opacity: partialAmount };
              }
              
              return { isNice: false, isNaughty: true, isNeutral: false, opacity: 1 };
            }
            
            // Score 0 - neutral (except middle segment which is always neutral)
            return { isNice: false, isNaughty: false, isNeutral: false, opacity: 1 };
          };

          const segmentState = getSegmentState(i);
          
          // Calculate color based on position for gradient effect
          const getSegmentColor = () => {
            if (segmentState.isNeutral) {
              return '#D3D3D3'; // Gray for neutral
            }
            
            if (segmentState.isNaughty) {
              // Orange/yellow to red gradient (5 segments: indices 0-4)
              // Index 0 = orange/yellow, index 4 = red
              const naughtyIndex = i; // 0-4
              const ratio = naughtyIndex / 4; // 0 to 1
              // Orange/yellow (255, 165, 0) to red (220, 20, 20)
              const red = Math.round(255 - (ratio * 35)); // 255 to 220
              const green = Math.round(165 - (ratio * 145)); // 165 to 20
              const blue = 0; // Always 0 for orange/yellow to red
              return `rgb(${red}, ${green}, ${blue})`;
            }
            
            if (segmentState.isNice) {
              // Yellow to green gradient (5 segments: indices 6-10)
              // Index 6 = yellow, index 10 = green
              const niceIndex = i - 6; // 0-4
              const ratio = niceIndex / 4; // 0 to 1
              // Yellow (255, 255, 0) to green (34, 139, 34)
              const red = Math.round(255 - (ratio * 221)); // 255 to 34
              const green = Math.round(255 - (ratio * 116)); // 255 to 139
              const blue = Math.round(0 + (ratio * 34)); // 0 to 34
              return `rgb(${red}, ${green}, ${blue})`;
            }
            
            return '#D3D3D3'; // Default gray
          };
          
          return (
            <div
              key={i}
              className={styles.segment}
              style={{
                backgroundColor: getSegmentColor(),
                opacity: segmentState.isNice || segmentState.isNaughty ? segmentState.opacity : 1,
              }}
            />
          );
        })}
      </div>
      <div className={styles.labels}>
        <div className={styles.naughtySide}>
          <span className={styles.naughtyEmoji}>
            <img src="/icons/mood-sad.svg" alt="Sad" className={styles.moodIcon} />
          </span>
          <span className={styles.naughtyLabel}>NAUGHTY ←</span>
        </div>
        <span className={styles.centerEmoji}>
          <img src="/icons/mood-neutral.svg" alt="Neutral" className={styles.moodIcon} />
        </span>
        <div className={styles.niceSide}>
          <span className={styles.niceLabel}>→ NICE</span>
          <span className={styles.niceEmoji}>
            <img src="/icons/mood-happy.svg" alt="Happy" className={styles.moodIcon} />
          </span>
        </div>
      </div>
    </div>
  );
};
