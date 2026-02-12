import { ScheduleItem } from "../types";

export interface ConflictOption {
    group: string;
    items: ScheduleItem[];
}

export interface Conflict {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
    options: ConflictOption[];
}

/**
 * Detects time-slot conflicts where different groups have classes at the same time.
 * A conflict exists when 2+ items have the same day + time but different groups.
 */
export function detectConflicts(schedule: ScheduleItem[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const processed = new Set<string>();

    // Create a map of time slots to items
    const timeSlotMap = new Map<string, ScheduleItem[]>();

    for (const item of schedule) {
        const key = `${item.day}-${item.startTime}-${item.endTime}`;
        if (!timeSlotMap.has(key)) {
            timeSlotMap.set(key, []);
        }
        timeSlotMap.get(key)!.push(item);
    }

    // Find time slots with multiple groups
    for (const [key, items] of timeSlotMap.entries()) {
        if (processed.has(key)) continue;

        // Get unique groups in this time slot
        const groupMap = new Map<string, ScheduleItem[]>();

        for (const item of items) {
            const groupKey = item.group || '__universal__';
            if (!groupMap.has(groupKey)) {
                groupMap.set(groupKey, []);
            }
            groupMap.get(groupKey)!.push(item);
        }

        // If there are multiple distinct groups (excluding universal), it's a conflict
        const groups = Array.from(groupMap.keys()).filter(g => g !== '__universal__');

        if (groups.length > 1) {
            const [day, startTime, endTime] = key.split('-');

            conflicts.push({
                id: crypto.randomUUID(),
                day,
                startTime,
                endTime,
                options: groups.map(group => ({
                    group,
                    items: groupMap.get(group)!,
                })),
            });

            processed.add(key);
        }
    }

    return conflicts;
}

/**
 * Filters the schedule based on user's conflict resolutions.
 * @param schedule - Original full schedule
 * @param conflicts - Detected conflicts
 * @param selections - Map of conflictId -> selected group
 */
export function resolveConflicts(
    schedule: ScheduleItem[],
    conflicts: Conflict[],
    selections: Record<string, string>
): ScheduleItem[] {
    // Create a set of item IDs to exclude
    const excludeIds = new Set<string>();

    for (const conflict of conflicts) {
        const selectedGroup = selections[conflict.id];
        if (!selectedGroup) continue;

        // Exclude items from non-selected groups in this conflict
        for (const option of conflict.options) {
            if (option.group !== selectedGroup) {
                option.items.forEach(item => excludeIds.add(item.id));
            }
        }
    }

    // Return filtered schedule
    return schedule.filter(item => !excludeIds.has(item.id));
}
