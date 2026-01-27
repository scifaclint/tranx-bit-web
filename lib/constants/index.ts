type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'lateNight';
type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface DynamicMessages {
    timeOfDay: Record<TimeOfDay, string[]>;
    dayOfWeek: Record<DayOfWeek, string[]>;
}

export const adminGreetings = {
    timeOfDay: {
        morning: [
            "Good morning, Boss! Let's make some money",
            "Morning, Chief! Dashboard looking good",
            "Rise and grind, Admin!",
            "Good morning! Ready to manage the empire?",
            "Morning! Time to check those numbers"
        ],
        afternoon: [
            "Good afternoon, Boss! How's business?",
            "Afternoon, Admin! Everything running smooth?",
            "Hey there! Midday check-in time",
            "Good afternoon! Let's see what's moving",
            "Afternoon grind, let's get it"
        ],
        evening: [
            "Good evening, Boss! Wrapping up the day?",
            "Evening, Admin! Time to review today's wins",
            "Hey! Evening analytics time",
            "Good evening! Let's see how we did today",
            "Evening check-in, Chief!"
        ],
        lateNight: [
            "Still grinding? Respect, Boss!",
            "Burning the midnight oil, Admin?",
            "Late night hustle! What's cooking?",
            "Night owl mode activated, Chief!",
            "Can't sleep? Business never stops!"
        ]
    },

    dayOfWeek: {
        monday: [
            "Happy Monday, Boss! New week, new revenue",
            "Monday grind starts now, Admin!",
            "Let's crush this week, Chief!",
            "Monday motivation: count that cash!"
        ],
        tuesday: [
            "Tuesday check-in, Boss!",
            "Hey Admin! Let's keep the momentum",
            "Tuesday hustle continues, Chief!",
            "What's good, Boss? Sales looking fire?"
        ],
        wednesday: [
            "Hump day, Admin! Halfway there",
            "Wednesday wins, let's go Boss!",
            "Midweek check, Chief! How we looking?",
            "Hey Admin! Wednesday grind time"
        ],
        thursday: [
            "Almost Friday, Boss!",
            "Thursday power moves, Admin!",
            "One more day, Chief! Let's finish strong",
            "Thursday grind, Boss! Keep pushing"
        ],
        friday: [
            "Happy Friday, Boss! Week's almost done",
            "TGIF, Admin! Let's close strong",
            "Friday vibes, Chief! Review the wins",
            "Friday feeling, Boss! Business looking good?"
        ],
        saturday: [
            "Weekend warrior, Boss!",
            "Saturday hustle, Admin! Respect",
            "Weekend grind, Chief! Dedication",
            "Even on Saturday? That's the spirit, Boss!"
        ],
        sunday: [
            "Sunday check-in, Boss! Planning ahead?",
            "Sunday prep, Admin! Smart moves",
            "Sunday hustle, Chief! Setting up the week",
            "Sunday vibes, Boss! Business never sleeps"
        ]
    }
};
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
export function getWelcomeMessage(username: string, isAdmin: boolean = false): { greeting: string, message: string } {
    const timeOfDay = getTimeOfDay();
    const dayOfWeek = getDayOfWeek();

    const source = isAdmin ? adminGreetings : dynamicMessages;

    // Randomly pick between time-based or day-based
    const useTimeBased = Math.random() > 0.5;
    const messages = useTimeBased
        ? source.timeOfDay[timeOfDay]
        : source.dayOfWeek[dayOfWeek];

    const message = messages[Math.floor(Math.random() * messages.length)];

    let greeting = "Welcome";
    if (timeOfDay === "morning") greeting = "Good Morning";
    if (timeOfDay === "afternoon") greeting = "Good Afternoon";
    if (timeOfDay === "evening") greeting = "Good Evening";
    if (timeOfDay === "lateNight") greeting = "Good Evening"; // or Late Night

    return { greeting, message };
}