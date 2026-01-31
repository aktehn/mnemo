
/**
 * Spaced Repetition System (SRS) Logic
 * 
 * Implements the SM-2 Algorithm for efficient vocabulary retention.
 * Logic details:
 * - Interval(1) = 1
 * - Interval(2) = 6
 * - Interval(n) = Interval(n-1) * EF
 * - EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
 * - q = Grade (0-5 scale)
 * 
 * @module features/vocabulary/logic/srs
 */

import type { SRSStats, Grade } from '../../../types';

/**
 * Calculates the next review date and new SRS stats based on the SM-2 algorithm.
 * 
 * @param {SRSStats} currentStats - Current SRS statistics (interval, repetition, EF, dueDate)
 * @param {Grade} grade - User's recall quality rating (0-5)
 *                        0: Complete blackout
 *                        1: Incorrect response; the correct one remembered
 *                        2: Incorrect response; where the correct one seemed easy to recall
 *                        3: Correct response recalled with serious difficulty
 *                        4: Correct response after a hesitation
 *                        5: Perfect recall
 * 
 * @returns {SRSStats} New SRS statistics
 */
export const calculateNextReview = (currentStats: SRSStats, grade: Grade): SRSStats => {
    let { interval, repetition, ef } = currentStats;

    // 1. Update Easiness Factor (EF)
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // EF should not drop below 1.3
    let newEF = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
    if (newEF < 1.3) newEF = 1.3;

    // 2. Update Repetition Count & Interval
    // If grade >= 3, the user remembered the word
    if (grade >= 3) {
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * newEF);
        }
        repetition += 1;
    } else {
        // If grade < 3, the user forgot the word
        // Reset repetitions and interval (start over)
        // Original SM-2 resets interval to 1. 
        // Some variants keep EF unchanged or decrease it. Standard SM-2 updates EF regardless.
        repetition = 0;
        interval = 1;
    }

    // 3. Calculate Due Date
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    return {
        interval,
        repetition,
        ef: parseFloat(newEF.toFixed(2)), // Keep EF precise but readable
        dueDate: nextReviewDate.toISOString()
    };
};

/**
 * Helper to determine "Grade" from simple UI actions (Easy/Hard/etc)
 * 
 * @param {string} action - 'easy' | 'good' | 'hard' | 'again'
 * @returns {Grade} Corresponding SM-2 grade
 */
export const getGradeFromAction = (action: 'easy' | 'good' | 'hard' | 'again'): Grade => {
    switch (action) {
        case 'easy': return 5;  // Perfect recall
        case 'good': return 4;  // Hesitation
        case 'hard': return 3;  // Serious difficulty
        case 'again': return 0; // Complete blackout
        default: return 3;
    }
};
