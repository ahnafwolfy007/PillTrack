// Dhaka, Bangladesh Timezone Utilities
// Timezone: Asia/Dhaka (UTC+6)

export const TIMEZONE = 'Asia/Dhaka';
export const TIMEZONE_OFFSET = 6; // UTC+6

/**
 * Get current date/time in Dhaka timezone
 */
export const getDhakaTime = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
};

/**
 * Format time to HH:mm in Dhaka timezone
 */
export const formatTimeInDhaka = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
};

/**
 * Format time to HH:mm AM/PM in Dhaka timezone
 */
export const formatTime12hInDhaka = (date = new Date()) => {
    return date.toLocaleTimeString('en-US', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Format date in Dhaka timezone
 */
export const formatDateInDhaka = (date = new Date(), options = {}) => {
    const defaultOptions = {
        timeZone: TIMEZONE,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Get today's date string (YYYY-MM-DD) in Dhaka timezone
 */
export const getTodayKeyInDhaka = () => {
    const now = new Date();
    return now.toLocaleDateString('en-CA', { timeZone: TIMEZONE }); // en-CA gives YYYY-MM-DD format
};

/**
 * Get current hour, minute, and second in Dhaka timezone
 */
export const getCurrentTimeInDhaka = () => {
    const now = new Date();
    const dhakaTimeStr = now.toLocaleTimeString('en-US', {
        timeZone: TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const [hours, minutes, seconds] = dhakaTimeStr.split(':').map(Number);
    return { hours, minutes, seconds, totalMinutes: hours * 60 + minutes };
};

/**
 * Check if a time string (HH:mm) matches current time in Dhaka (+/- tolerance minutes)
 */
export const isTimeNowInDhaka = (timeStr, toleranceMinutes = 1) => {
    const [targetHour, targetMinute] = timeStr.split(':').map(Number);
    const targetTotalMinutes = targetHour * 60 + targetMinute;
    
    const { totalMinutes: currentTotalMinutes } = getCurrentTimeInDhaka();
    
    return Math.abs(targetTotalMinutes - currentTotalMinutes) <= toleranceMinutes;
};

/**
 * Parse time string (HH:mm) to a Date object for today in Dhaka timezone
 */
export const parseTimeToDateInDhaka = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = getDhakaTime();
    now.setHours(hours, minutes, 0, 0);
    return now;
};

/**
 * Check if a dose time has passed today in Dhaka timezone
 */
export const hasTimePassed = (timeStr) => {
    const [targetHour, targetMinute] = timeStr.split(':').map(Number);
    const targetTotalMinutes = targetHour * 60 + targetMinute;
    
    const { totalMinutes: currentTotalMinutes } = getCurrentTimeInDhaka();
    
    return currentTotalMinutes > targetTotalMinutes;
};

/**
 * Get greeting based on Dhaka time
 */
export const getGreetingInDhaka = () => {
    const { hours } = getCurrentTimeInDhaka();
    if (hours < 12) return 'Good Morning';
    if (hours < 18) return 'Good Afternoon';
    return 'Good Evening';
};

/**
 * Format relative time (e.g., "in 2 hours", "5 minutes ago")
 */
export const getRelativeTime = (timeStr) => {
    const [targetHour, targetMinute] = timeStr.split(':').map(Number);
    const targetTotalMinutes = targetHour * 60 + targetMinute;
    
    const { totalMinutes: currentTotalMinutes } = getCurrentTimeInDhaka();
    const diffMinutes = targetTotalMinutes - currentTotalMinutes;
    
    if (Math.abs(diffMinutes) < 1) return 'Now';
    
    if (diffMinutes > 0) {
        if (diffMinutes < 60) return `in ${diffMinutes} min`;
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`;
    } else {
        const absDiff = Math.abs(diffMinutes);
        if (absDiff < 60) return `${absDiff} min ago`;
        const hours = Math.floor(absDiff / 60);
        const mins = absDiff % 60;
        return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
    }
};

export default {
    TIMEZONE,
    getDhakaTime,
    formatTimeInDhaka,
    formatTime12hInDhaka,
    formatDateInDhaka,
    getTodayKeyInDhaka,
    getCurrentTimeInDhaka,
    isTimeNowInDhaka,
    parseTimeToDateInDhaka,
    hasTimePassed,
    getGreetingInDhaka,
    getRelativeTime
};
