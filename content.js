window.CCN_STREAMING_DEFAULTS = {
  settings: {
    secondsPerFeature: 11,
    autoplay: true,
    networkName: "Callaway Command Network",
    battalion: "4th Battalion Chargers",
    school: "Callaway High School JROTC",
    motto: "Motivate • Lead • Achieve",
    qrImage: "assets/ui/qr-placeholder.svg",
    lineupTitle: "Today’s Lineup"
  },
  display: {
    lesson: true,
    objective: true,
    terms: true,
    exit: true,
    event: true,
    announcements: true,
    spotlights: true,
    service: true
  },
  titles: {
    lessonLabel: "Today’s Lesson",
    objectiveLabel: "Lesson Objective",
    objectiveTitle: "Know the Standard",
    objectiveCardTitle: "Lesson Objective",
    termsLabel: "Key Terms",
    termsTitle: "Words to Know",
    exitLabel: "Exit Questions",
    exitTitle: "Show What You Know",
    eventLabel: "Upcoming Event",
    announcementLabel: "Announcement",
    serviceLabel: "Community Impact",
    serviceTitle: "Service in Action"
  },
  lesson: {
    title: "The Supervising Leader",
    cardTitle: "",
    subtitle: "Today's Lesson",
    hook: "Leaders build trust, communicate standards, and hold the team accountable.",
    let: "LET 3 and 4",
    lesson: "Lesson 1",
    period: "",
    duration: "45 min",
    objective: "Explain how supervising leaders communicate standards, check progress, and develop accountable teams.",
    essentialQuestion: "How can a leader build trust while still enforcing standards?"
  },
  keyTerms: [
    { word: "Delegation", definition: "Assigning responsibility and authority while remaining accountable for the result." },
    { word: "Supervision", definition: "Guiding, observing, and supporting people as they complete the task." },
    { word: "Accountability", definition: "Taking ownership of actions, standards, and results." },
    { word: "Follow-Through", definition: "Checking progress and ensuring the task is completed to standard." }
  ],
  exitQuestions: [
    "What is the difference between delegation and simply giving an order?",
    "Why must leaders check progress after assigning a task?",
    "Give one example of accountability in JROTC."
  ],
  announcements: [
    { headline: "Uniform Inspection", detail: "Tuesday — arrive prepared and wear it right.", status: "ACTION REQUIRED" },
    { headline: "Promotion Packets", detail: "Due Friday before the end of the school day.", status: "DEADLINE" },
    { headline: "Drill Practice", detail: "After school at 3:45 PM.", status: "TEAM UPDATE" }
  ],
  operation: {
    title: "Adventure Training",
    date: "2026-09-19T08:00:00",
    detail: "Teamwork • Courage • Leadership",
    location: "Training Site TBD",
    showPhoto: true,
    photo: "assets/photos/hero-adventure.jpg"
  },
  spotlights: [
    {
      type: "Cadet of the Month",
      customType: "",
      enabled: true,
      showParents: true,
      name: "C/SGT Jordan Smith",
      headline: "",
      detail: "LET 3 and 4 • Drill Team • 3.8 GPA",
      quote: "Leadership means setting the example before giving the order.",
      badges: ["Leadership", "Service", "Academics"],
      showPhoto: true,
      portrait: "assets/photos/cadet-portrait.jpg",
      media: [],
      mediaSeconds: 5,
      coverIndex: 0,
      startDate: "",
      endDate: ""
    }
  ],
  customSections: [],
  galleries: {
    lesson: { enabled: false, seconds: 5, coverIndex: 0, media: [] },
    objective: { enabled: false, seconds: 5, coverIndex: 0, media: [] },
    terms: { enabled: false, seconds: 5, coverIndex: 0, media: [] },
    exit: { enabled: false, seconds: 5, coverIndex: 0, media: [] },
    event: { enabled: false, seconds: 5, coverIndex: 0, media: [] },
    announcements: { enabled: false, seconds: 5, coverIndex: 0, media: [] },
    spotlights: { enabled: false, seconds: 5, coverIndex: 0, media: [] },
    service: { enabled: false, seconds: 5, coverIndex: 0, media: [] }
  }
,
  artwork: {
    lesson: "lesson-board.svg",
    objective: "focus-target.svg",
    terms: "notebook-pen.svg",
    exit: "clipboard-check.svg",
    event: "mountain-event.svg",
    announcements: "bullhorn-siren.svg",
    recognition: "medal-recognition.svg",
    service: "community-hands.svg",
    challenge: "stopwatch-challenge.svg",
    promotion: "promotion-chevron.svg",
    academic: "academic-cap.svg"
  }

};
