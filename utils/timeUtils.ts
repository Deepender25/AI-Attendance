export const parseTime = (timeStr: string): number => {
    if (!timeStr) return 0;

    // Normalize string: remove spaces, convert to lowercase
    const normalized = timeStr.toLowerCase().trim();

    // Regular expression to match time formats (e.g., "9:00", "9:00am", "09:00 pm")
    // Groups: 1: hours, 2: minutes, 3: am/pm (optional)
    const match = normalized.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);

    if (!match) return 0;

    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const meridian = match[3];

    // Handle 12-hour format if AM/PM is present
    if (meridian) {
        if (meridian === 'pm' && hours < 12) {
            hours += 12;
        } else if (meridian === 'am' && hours === 12) {
            hours = 0;
        }
    }

    return hours * 60 + minutes;
};

export const compareTimes = (timeA: string, timeB: string): number => {
    return parseTime(timeA) - parseTime(timeB);
};
