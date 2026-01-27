type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'lateNight';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DynamicMessages {
    timeOfDay: Record<TimeOfDay, string[]>;
    dayOfWeek: Record<DayOfWeek, string[]>;
}

const dynamicMessages: DynamicMessages = {
    timeOfDay: {
        morning: [
            "Good morning! Fresh deals just dropped",
            "Rise and save! New giftcards available",
            "Start your day with amazing deals",
            "Morning savings await you",
            "Early bird gets the best deals"
        ],
        afternoon: [
            "Good afternoon! Check out today's hot deals",
            "Midday steals are live now",
            "Afternoon savings calling your name",
            "Perfect time to grab those deals",
            "Your lunchbreak deal fix is here"
        ],
        evening: [
            "Good evening! Grab tonight's best offers",
            "Evening deals are looking good",
            "Unwind with some serious savings",
            "End your day with a great deal",
            "Prime time for giftcard shopping"
        ],
        lateNight: [
            "Still up? Score late-night deals",
            "Night owl special deals await",
            "Burning the midnight oil? We've got deals",
            "Late night, great savings",
            "Can't sleep? Browse exclusive deals"
        ]
    },

    dayOfWeek: {
        monday: [
            "Start your week saving big!",
            "New week, fresh deals!",
            "Monday motivation: amazing savings",
            "Kick off the week with hot offers",
            "Monday steals are here"
        ],
        tuesday: [
            "Tuesday deals are fire!",
            "Terrific Tuesday savings await",
            "Midweek deals starting strong",
            "Your Tuesday treat is here",
            "Deal hunting Tuesday style"
        ],
        wednesday: [
            "Midweek steals waiting for you!",
            "Wednesday wins start here",
            "Hump day? More like deal day!",
            "Wednesday specials are live",
            "Over the hump with savings"
        ],
        thursday: [
            "Almost Friday! Celebrate with deals",
            "Thursday treasures uncovered",
            "Pre-weekend savings start now",
            "Thursday's looking profitable",
            "One day closer to savings"
        ],
        friday: [
            "Friday deals are here - treat yourself!",
            "TGIF! Time for some retail therapy",
            "Weekend prep starts with savings",
            "Friday feels even better with deals",
            "Kickstart your weekend with offers"
        ],
        saturday: [
            "Weekend shopping made easy!",
            "Saturday specials are live",
            "Weekend deals at your fingertips",
            "Relax and browse amazing offers",
            "Saturday savings await"
        ],
        sunday: [
            "Sunday funday deals!",
            "Lazy Sunday? Productive savings!",
            "End your weekend with a bang",
            "Sunday steals before the week starts",
            "Chill out with hot deals"
        ]
    }
};

// Helper functions
function getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 24) return 'evening';
    return 'lateNight';
}

function getDayOfWeek(): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
}

// Main function
export function getWelcomeMessage(username: string): { greeting: string, message: string } {
    const timeOfDay = getTimeOfDay();
    const dayOfWeek = getDayOfWeek();

    // Randomly pick between time-based or day-based
    const useTimeBased = Math.random() > 0.5;
    const messages = useTimeBased
        ? dynamicMessages.timeOfDay[timeOfDay]
        : dynamicMessages.dayOfWeek[dayOfWeek];

    const message = messages[Math.floor(Math.random() * messages.length)];

    let greeting = "Welcome";
    if (timeOfDay === "morning") greeting = "Good Morning";
    if (timeOfDay === "afternoon") greeting = "Good Afternoon";
    if (timeOfDay === "evening") greeting = "Good Evening";
    if (timeOfDay === "lateNight") greeting = "Good Evening"; // or Late Night

    return { greeting, message };
}