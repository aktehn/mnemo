/**
 * Spaced Repetition System (SRS) Service
 * 
 * Implements a modified SuperMemo-2 (SM-2) algorithm for optimizing learning schedules.
 * This service handles the calculation of review intervals based on user feedback.
 * 
 * Algorithm Logic:
 * - Interval (I): Days until next review
 * - Repetition (R): Count of successful recalls
 * - Easiness Factor (EF): Difficulty check (starts at 2.5)
 * 
 * @module services/srsService
 */

import type { SRSStats, Grade } from '../types';

/**
 * Calculates the next review schedule for a word based on user grade.
 * 
 * @param {SRSStats} currentStats - Current SRS statistics of the word
 * @param {Grade} grade - User's recall grade (0-5)
 *   5 - Perfect response
 *   4 - Correct response after hesitation
 *   3 - Correct response recalled with difficulty
 *   2 - Incorrect response; where the correct one seemed easy to recall
 *   1 - Incorrect response; the correct one remembered
 *   0 - Complete blackout
 * 
 * @returns {SRSStats} Updated SRS statistics including new due date
 */
export function calculateNextReview(currentStats: SRSStats, grade: Grade): SRSStats {
    let { interval, repetition, ef } = currentStats;

    // Initialize defaults if missing
    interval = interval || 0;
    repetition = repetition || 0;
    ef = ef || 2.5;

    // Hard (grade < 3): 4 minutes interval
    if (grade < 3) {
        repetition = 0;
        interval = 4; // 4 minutes for hard words
        // EF remains unchanged
    } else {
        // Easy (grade >= 3): 10 minutes interval
        // 1. Calculate new EF
        ef = ef + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));

        // EF constraint: never drop below 1.3
        if (ef < 1.3) ef = 1.3;

        // 2. Increment Repetitions
        repetition += 1;

        // 3. Set interval to 10 minutes for easy reviews
        interval = 10; // 10 minutes for easy words
    }

    return {
        interval,
        repetition,
        ef: parseFloat(ef.toFixed(2)),
        dueDate: getFutureDateMinutes(interval) // Changed to use minutes
    };
}

/**
 * Calculates a future date based on a number of minutes from now.
 * 
 * @param {number} minutes - Number of minutes to add
 * @returns {string} ISO Date string
 */
function getFutureDateMinutes(minutes: number): string {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
}



/**
 * Gets the initial SRS stats for a new word.
 * 
 * @returns {SRSStats} Initial stats
 */
export function getInitialStats(): SRSStats {
    return {
        interval: 0,
        repetition: 0,
        ef: 2.5,
        dueDate: new Date().toISOString()
    };
}
