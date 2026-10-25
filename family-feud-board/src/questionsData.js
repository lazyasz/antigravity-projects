// NAVSHAKTI 2026: THE CAMPUS SHOWDOWN
// Institution: MIT-ADT University, Pune | Event: SOC Navratri Celebration (14 October 2026)
// Complete 15-Question Bank across 3 Core Rounds + Grand Finale

export const NAVSHAKTI_ROUNDS = [
  {
    id: 'r1',
    number: 1,
    name: 'ROUND 1: SHAKTI & TRADITION',
    subtitle: 'Navratri, Women Empowerment & Cultural Identity',
    multiplier: 1,
    themeColor: '#e11d48',
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5']
  },
  {
    id: 'r2',
    number: 2,
    name: 'ROUND 2: CAMPUS REALITY CHECK',
    subtitle: 'Student Life, Faculty Dynamics & Classroom Truths',
    multiplier: 2,
    themeColor: '#f59e0b',
    questionIds: ['q6', 'q7', 'q8', 'q9', 'q10']
  },
  {
    id: 'r3',
    number: 3,
    name: 'ROUND 3: THE MEME MINDSET',
    subtitle: 'Gen Z Culture, Social Habits & Digital Realities',
    multiplier: 3,
    themeColor: '#8b5cf6',
    questionIds: ['q11', 'q12', 'q13', 'q14', 'q15']
  },
  {
    id: 'finale',
    number: 4,
    name: 'FINALE: THE SHOWDOWN',
    subtitle: 'High-Stakes Campus Fast Answer & Garba Anthem',
    multiplier: 3,
    themeColor: '#ffd700',
    questionIds: ['q16']
  }
];

export const INITIAL_QUESTION_BANK = [
  // =========================================================================
  // ROUND 1: SHAKTI & TRADITION
  // =========================================================================
  {
    id: 'q1',
    roundId: 'r1',
    roundName: 'ROUND 1: SHAKTI & TRADITION',
    multiplier: 1,
    questionNumber: 1,
    question: "If Navratri were a reminder for today's generation, what would it most strongly remind us to do?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "STAND UP FOR YOURSELF & OTHERS", points: 35, aliases: ["stand up", "courage", "speak up", "self defense", "bravery"] },
      { text: "RESPECT WOMEN & THEIR CHOICES", points: 28, aliases: ["respect women", "equality", "consent", "respect", "women choices"] },
      { text: "FIND COURAGE TO START AGAIN", points: 18, aliases: ["start again", "resilience", "never give up", "restart", "hope"] },
      { text: "CHALLENGE OUTDATED EXPECTATIONS", points: 11, aliases: ["break stereotypes", "question rules", "challenge expectations", "freedom"] },
      { text: "CELEBRATE STRENGTH IN DIVERSE FORMS", points: 8, aliases: ["diversity", "inner strength", "shakti", "celebrate strength", "unity"] }
    ]
  },
  {
    id: 'q2',
    roundId: 'r1',
    roundName: 'ROUND 1: SHAKTI & TRADITION',
    multiplier: 1,
    questionNumber: 2,
    question: "If Goddess Durga were addressing a modern college campus, which problem would she tell us to defeat first?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "HARASSMENT & DISRESPECT", points: 36, aliases: ["harassment", "disrespect", "bullying", "eve teasing", "abuse"] },
      { text: "GENDER DISCRIMINATION", points: 27, aliases: ["gender bias", "discrimination", "inequality", "sexism", "patriarchy"] },
      { text: "FEAR OF SPEAKING UP", points: 17, aliases: ["fear", "silence", "hesitation", "afraid to speak", "introversion"] },
      { text: "PEER PRESSURE & NEED TO FIT IN", points: 12, aliases: ["peer pressure", "fit in", "validation", "fomo", "conformity"] },
      { text: "INEQUALITY OF OPPORTUNITY", points: 8, aliases: ["opportunities", "nepotism", "unfair chances", "bias", "privilege"] }
    ]
  },
  {
    id: 'q3',
    roundId: 'r1',
    roundName: 'ROUND 1: SHAKTI & TRADITION',
    multiplier: 1,
    questionNumber: 3,
    question: "What is one quality that makes a woman genuinely powerful in today's world?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "COURAGE TO SPEAK HER MIND", points: 34, aliases: ["courage", "speaking up", "voice", "fearless", "vocal"] },
      { text: "FINANCIAL & PERSONAL INDEPENDENCE", points: 29, aliases: ["independence", "financial independence", "self reliant", "independent"] },
      { text: "UNSHAKEABLE SELF-CONFIDENCE", points: 18, aliases: ["confidence", "self belief", "dignity", "boldness", "poise"] },
      { text: "KNOWLEDGE, SKILLS & COMPETENCE", points: 12, aliases: ["knowledge", "competence", "education", "intelligence", "skills"] },
      { text: "EMPATHY & RESILIENT LEADERSHIP", points: 7, aliases: ["empathy", "leadership", "compassion", "emotional intelligence", "resilience"] }
    ]
  },
  {
    id: 'q4',
    roundId: 'r1',
    roundName: 'ROUND 1: SHAKTI & TRADITION',
    multiplier: 1,
    questionNumber: 4,
    question: "Beyond the dance and celebrations, what makes Navratri meaningful to young people?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "CULTURAL IDENTITY & HERITAGE", points: 32, aliases: ["culture", "cultural identity", "roots", "heritage", "tradition"] },
      { text: "FRIENDSHIP & SENSE OF BELONGING", points: 26, aliases: ["friends", "friendship", "community", "belonging", "togetherness"] },
      { text: "A CHANCE TO EXPRESS ONESELF", points: 20, aliases: ["expression", "dressing up", "dance", "creativity", "garba outfits"] },
      { text: "FAMILY BONDS & REUNION", points: 14, aliases: ["family", "home", "reunion", "parents", "relatives"] },
      { text: "SPIRITUAL DEVOTION & REFLECTION", points: 8, aliases: ["devotion", "faith", "spirituality", "pooja", "inner peace"] }
    ]
  },
  {
    id: 'q5',
    roundId: 'r1',
    roundName: 'ROUND 1: SHAKTI & TRADITION',
    multiplier: 1,
    questionNumber: 5,
    question: "If you could break one stereotype about women this Navratri, which would it be?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "LEADERSHIP IS NOT GENDER-SPECIFIC", points: 38, aliases: ["leadership", "women bosses", "leaders", "management", "boss"] },
      { text: "WOMEN CAN CHOOSE THEIR OWN PATH", points: 26, aliases: ["own path", "marriage vs career", "free will", "autonomy", "choices"] },
      { text: "AMBITION IS NOT SELFISH", points: 16, aliases: ["ambition", "career focused", "ambitious", "goals", "success"] },
      { text: "CAREERS & PASSIONS HAVE NO GENDER", points: 12, aliases: ["careers", "engineering", "tech", "roles", "sports"] },
      { text: "TRUE STRENGTH INCLUDES VULNERABILITY", points: 8, aliases: ["vulnerability", "emotional strength", "emotions", "softness"] }
    ]
  },

  // =========================================================================
  // ROUND 2: CAMPUS REALITY CHECK
  // =========================================================================
  {
    id: 'q6',
    roundId: 'r2',
    roundName: 'ROUND 2: CAMPUS REALITY CHECK',
    multiplier: 2,
    questionNumber: 6,
    question: "What is the one sentence that instantly changes the mood of an entire classroom?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "'ATTENDANCE WILL BE TAKEN NOW'", points: 38, aliases: ["attendance", "proxy", "roll call", "attendance will be checked", "erp"] },
      { text: "'SURPRISE TEST / QUIZ TODAY'", points: 29, aliases: ["surprise test", "quiz", "surprise quiz", "test", "pen and paper"] },
      { text: "'SUBMIT ASSIGNMENT BY MIDNIGHT'", points: 18, aliases: ["assignment", "submission", "submit tonight", "deadline", "lms upload"] },
      { text: "'THIS WILL DEFINITELY BE ON THE EXAM'", points: 10, aliases: ["in the exam", "important topic", "exam question", "finals"] },
      { text: "'THE DEADLINE HAS BEEN EXTENDED!'", points: 5, aliases: ["extended", "extension", "relaxed deadline", "relief", "extra time"] }
    ]
  },
  {
    id: 'q7',
    roundId: 'r2',
    roundName: 'ROUND 2: CAMPUS REALITY CHECK',
    multiplier: 2,
    questionNumber: 7,
    question: "If students and faculty could agree on one universal campus rule, what would it be?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "RESPECT EVERYONE'S TIME & PUNCTUALITY", points: 36, aliases: ["punctuality", "respect time", "start on time", "time management"] },
      { text: "KEEP DEADLINES REALISTIC & FAIR", points: 28, aliases: ["realistic deadlines", "fair deadlines", "reasonable submissions", "spacing"] },
      { text: "NO LAST-MINUTE TIMETABLE SURPRISES", points: 18, aliases: ["last minute changes", "no sudden classes", "fixed timetable", "schedule"] },
      { text: "CLEAR INSTRUCTIONS & RUBRICS", points: 11, aliases: ["clear instructions", "guidelines", "clarity", "rubric", "transparent"] },
      { text: "GIVE CREDIT WHERE CREDIT IS DUE", points: 7, aliases: ["give credit", "acknowledge effort", "recognition", "appreciation"] }
    ]
  },
  {
    id: 'q8',
    roundId: 'r2',
    roundName: 'ROUND 2: CAMPUS REALITY CHECK',
    multiplier: 2,
    questionNumber: 8,
    question: "What is the most universally recognised sign that someone is pretending to understand a lecture?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "AGGRESSIVE RAPID NODDING", points: 42, aliases: ["nodding", "head nod", "constant nodding", "serious nod", "agreeing"] },
      { text: "FRANTICALLY WRITING WITHOUT LOOKING UP", points: 24, aliases: ["writing notes", "scribbling", "pretending to write", "staring at notebook"] },
      { text: "SAYING 'YES, YES, SIR' TOO QUICKLY", points: 16, aliases: ["yes yes", "saying yes", "haan sir", "agreeing fast"] },
      { text: "PEEKING CONFUSED AT A FRIEND'S NOTES", points: 11, aliases: ["looking at friend", "friend's notes", "side eye", "what is he teaching"] },
      { text: "ASKING A QUESTION THAT EXPOSES CONFUSION", points: 7, aliases: ["silly question", "asking doubt", "wrong question", "lost doubt"] }
    ]
  },
  {
    id: 'q9',
    roundId: 'r2',
    roundName: 'ROUND 2: CAMPUS REALITY CHECK',
    multiplier: 2,
    questionNumber: 9,
    question: "What is one thing students and faculty both secretly wish the other side understood?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "WORKLOAD IS NOT ALWAYS VISIBLE", points: 37, aliases: ["hidden workload", "grading burden", "multiple subjects", "burnout", "stress"] },
      { text: "DEADLINES CAN BE OVERWHELMING", points: 26, aliases: ["pressure", "overwhelmed", "crunch", "exhaustion", "busy schedule"] },
      { text: "CLEAR COMMUNICATION MATTERS BOTH WAYS", points: 18, aliases: ["communication", "transparency", "listening", "two way talk"] },
      { text: "EVERYONE NEEDS OCCASIONAL FLEXIBILITY", points: 12, aliases: ["flexibility", "understanding", "benefit of doubt", "empathy"] },
      { text: "MUTUAL RESPECT CANNOT BE ONE-SIDED", points: 7, aliases: ["respect", "mutual respect", "dignity", "kindness", "professionalism"] }
    ]
  },
  {
    id: 'q10',
    roundId: 'r2',
    roundName: 'ROUND 2: CAMPUS REALITY CHECK',
    multiplier: 2,
    questionNumber: 10,
    question: "If college life had a customer-review section, what would receive the most reviews?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "THE 75% ATTENDANCE MANDATE", points: 44, aliases: ["attendance", "75 percent", "attendance criteria", "shortage", "biometric"] },
      { text: "CANTEEN FOOD & COFFEE QUALITY", points: 23, aliases: ["canteen", "mess food", "campus food", "maggi", "coffee", "cafeteria"] },
      { text: "ASSIGNMENT DEADLINES & PORTAL SUBMISSIONS", points: 16, aliases: ["submissions", "assignment load", "lms crash", "server down"] },
      { text: "TIMETABLE & EARLY 8 AM LECTURES", points: 10, aliases: ["8 am classes", "timetable", "free periods", "schedule", "long gaps"] },
      { text: "PLACEMENT STRESS & RESUME CRISIS", points: 7, aliases: ["placements", "packages", "interviews", "jobs", "internships"] }
    ]
  },

  // =========================================================================
  // ROUND 3: THE MEME MINDSET
  // =========================================================================
  {
    id: 'q11',
    roundId: 'r3',
    roundName: 'ROUND 3: THE MEME MINDSET',
    multiplier: 3,
    questionNumber: 11,
    question: "Which internet phrase best describes the collective mood during exam week?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "'WE ARE COOKED'", points: 42, aliases: ["cooked", "we are cooked", "properly cooked", "khatam", "it's over"] },
      { text: "'IT IS WHAT IT IS'", points: 26, aliases: ["it is what it is", "jo hoga dekha jayega", "acceptance", "fate"] },
      { text: "'ACADEMIC COMEBACK LOADING...'", points: 15, aliases: ["academic comeback", "comeback", "loading", "next semester"] },
      { text: "'DELULU IS THE ONLY SOLULU'", points: 11, aliases: ["delulu", "delusion", "solulu", "hopium"] },
      { text: "'TRUST THE PROCESS'", points: 6, aliases: ["trust the process", "god plan", "bhagwan bharose"] }
    ]
  },
  {
    id: 'q12',
    roundId: 'r3',
    roundName: 'ROUND 3: THE MEME MINDSET',
    multiplier: 3,
    questionNumber: 12,
    question: "What is the most believable reason someone gives for replying to a message six hours late?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "'I SAW IT AND COMPLETELY FORGOT TO HIT SEND'", points: 38, aliases: ["forgot", "typed in head", "forgot to send", "saw and forgot"] },
      { text: "'I THOUGHT I ALREADY REPLIED IN MY HEAD'", points: 28, aliases: ["replied in head", "swore i replied", "mental reply"] },
      { text: "'MY NOTIFICATIONS WERE TOTALLY OFF / DND'", points: 17, aliases: ["notifications off", "dnd", "silent mode", "do not disturb"] },
      { text: "'I WAS SWAMPED WITH LECTURES & LABS'", points: 11, aliases: ["busy", "lab", "college", "swamped", "classes"] },
      { text: "'I NEEDED TIME TO CRAFT THE PERFECT RESPONSE'", points: 6, aliases: ["overthinking", "needed time", "drafting", "hesitating"] }
    ]
  },
  {
    id: 'q13',
    roundId: 'r3',
    roundName: 'ROUND 3: THE MEME MINDSET',
    multiplier: 3,
    questionNumber: 13,
    question: "What is one thing people confidently say they will do, but rarely do on time?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "START STUDYING WEEKS BEFORE EXAMS", points: 40, aliases: ["start studying", "study early", "read syllabus", "prepare early"] },
      { text: "GO TO SLEEP AT A REASONABLE HOUR", points: 26, aliases: ["sleep on time", "sleep early", "healthy sleep", "no all nighters"] },
      { text: "STOP DOOMSCROLLING REELS & SHORTS", points: 16, aliases: ["stop scrolling", "screen time", "quit reels", "put phone down"] },
      { text: "FINISH ASSIGNMENTS AHEAD OF DEADLINE", points: 11, aliases: ["finish early", "assignments ahead", "no last minute"] },
      { text: "REPLY PROMPTLY TO IMPORTANT EMAILS", points: 7, aliases: ["reply email", "inbox zero", "check mail", "reply prompt"] }
    ]
  },
  {
    id: 'q14',
    roundId: 'r3',
    roundName: 'ROUND 3: THE MEME MINDSET',
    multiplier: 3,
    questionNumber: 14,
    question: "If campus Wi-Fi could expose one universal truth about its users, what would it reveal?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "EVERYONE IS STREAMING REELS & SOCIAL MEDIA", points: 43, aliases: ["instagram", "reels", "social media", "youtube", "scrolling"] },
      { text: "DESPERATELY DOWNLOADING NOTES AT 11:58 PM", points: 22, aliases: ["downloading notes", "last minute slides", "drive links", "pdf download"] },
      { text: "WATCHING STREAMING SHOWS IN BACK ROWS", points: 17, aliases: ["watching netflix", "anime", "cricket match", "streaming"] },
      { text: "CHAOTIC GROUP CHATS IN 40 OPEN TABS", points: 11, aliases: ["group chats", "tabs", "whatsapp web", "discord", "multitasking"] },
      { text: "REFRESHING ATTENDANCE PORTAL REPEATEDLY", points: 7, aliases: ["portal refresh", "erp", "checking attendance", "grades refresh"] }
    ]
  },
  {
    id: 'q15',
    roundId: 'r3',
    roundName: 'ROUND 3: THE MEME MINDSET',
    multiplier: 3,
    questionNumber: 15,
    question: "What is the one thing that instantly makes someone look genuinely competent in a group project?",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "ACTUALLY SUBMITTING QUALITY WORK ON TIME", points: 41, aliases: ["delivering on time", "meeting deadlines", "punctual work", "doing the work"] },
      { text: "TAKING REAL OWNERSHIP OF THE SLIDES / CODE", points: 27, aliases: ["ownership", "making slides", "writing code", "fixing errors", "lead"] },
      { text: "CLEAR, FAST COMMUNICATION IN GROUP CHAT", points: 16, aliases: ["fast reply", "clear communication", "updates", "responsive"] },
      { text: "SOLVING BOTTLENECKS INSTEAD OF BLAMING", points: 10, aliases: ["problem solving", "no blaming", "fixing bugs", "collaborative"] },
      { text: "GIVING HONEST CREDIT TO ALL TEAMMATES", points: 6, aliases: ["giving credit", "fairness", "appreciating team", "unselfish"] }
    ]
  },

  // =========================================================================
  // GRAND FINALE: THE SHOWDOWN
  // =========================================================================
  {
    id: 'q16',
    roundId: 'finale',
    roundName: 'FINALE: THE SHOWDOWN',
    multiplier: 3,
    questionNumber: 16,
    question: "Name the ultimate high-energy Dandiya & Garba track that instantly gets the entire campus jumping.",
    isProvisional: true,
    surveyNote: "PROVISIONAL DEMO DATA (5 Survey Answers | 100 Points Total - Subject to SOC campus survey collection)",
    answers: [
      { text: "CHOGADA TARA (LOVEYATRI)", points: 38, aliases: ["chogada", "chogada tara", "aaye hai", "darshan raval"] },
      { text: "DHOLIDA (GANGUBAI / LOVEYATRI)", points: 26, aliases: ["dholida", "gangubai", "dholida dhol re vagad"] },
      { text: "KAMARIYA (MITRON)", points: 18, aliases: ["kamariya", "kamariya re", "mitron"] },
      { text: "NAGADA SANG DHOL (RAM-LEELA)", points: 12, aliases: ["nagada sang dhol", "nagada", "ram leela", "shreya ghoshal"] },
      { text: "KHALASI / GOTILO (COKE STUDIO BHARAT)", points: 6, aliases: ["khalasi", "gotilo", "aditya gadhvi", "aravalli"] }
    ]
  }
];

const STORAGE_KEY = 'navshakti_2026_question_bank_v2';

export function loadNavshaktiQuestions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not load Navshakti questions from localStorage:", err);
  }
  return [...INITIAL_QUESTION_BANK];
}

export function saveNavshaktiQuestions(questions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.warn("Could not save Navshakti questions to localStorage:", err);
  }
}
