/* ========================================
   Gemini AI Prompt Templates v2
   ======================================== */

const TODAY = new Date().toISOString().split('T')[0];

export const PROMPTS = {
  GENERATE_STUDY_PLAN: (syllabus, examDates, availableTime, planType = 'daily') => `
You are an expert academic planner and placement preparation mentor for B.Tech. CSE students specializing in Artificial Intelligence and Machine Learning.

Design a highly structured, realistic, and fatigue-aware preparation schedule for a 6th semester student, covering the period starting from ${TODAY} up to their final exams.

Context and Constraints:
- Weekdays: Late evenings only
- Weekends (Saturday and Sunday): High-utilization days
- The user has uploaded their Syllabus context and Exam constraints. Be extremely mindful of their explicit exams and note their syllabus.

Target Subjects & Priorities:
1. Pattern Recognition (PR) – HIGHEST priority
2. Deep Learning (DL) – SECOND HIGHEST priority
3. Computer Vision (CV) – Technical + moderate depth
4. Brain Computer Interface (BCI) – Theory + ML overlap
5. Wireless Networks – Pure theory
6. ARP (Quant + Reasoning) – Light but scoring

Additional Focus/Guidance:
${syllabus}
Exam Deadlines:
${examDates}

Return ONLY valid JSON matching this schema:
{
  "planTitle": "Master B.Tech Placements & Exam Schedule",
  "subjectSyllabusCompletion": [
    { "subject": "Pattern Recognition (PR)", "completionPercentage": 0, "status": "Not Started" },
    { "subject": "Deep Learning (DL)", "completionPercentage": 0, "status": "Not Started" },
    { "subject": "Computer Vision (CV)", "completionPercentage": 0, "status": "Not Started" },
    { "subject": "Brain Computer Interface (BCI)", "completionPercentage": 0, "status": "Not Started" },
    { "subject": "Wireless Networks", "completionPercentage": 0, "status": "Not Started" },
    { "subject": "ARP", "completionPercentage": 0, "status": "Not Started" }
  ],
  "dailyPlans": [
    {
      "date": "DD-MM-YYYY",
      "academicNotes": "Summary of classes, labs, deadlines",
      "placementNotes": "Primary placement objective",
      "adaptationTip": "How to recover if missed",
      "blocks": [
        { 
          "time": "Evening 7PM-9PM", 
          "activityType": "Study", 
          "topic": "string (Subject Name)", 
          "resources": "string",
          "duration": 120,
          "toDoList": ["Task 1", "Task 2", "Task 3"]
        }
      ]
    }
  ],
  "weeklyResources": [
    { "week": "Week 1", "resources": [{ "name": "string", "type": "string", "topic": "string", "link": "string" }] }
  ]
}
RULES:
1. Return ONLY valid JSON block.
2. Do NOT wrap output in markdown \`\`\`json.
3. Balance placement preparation vs academic workloads realistically. Ensure the 6 target subjects are covered per the specific priority order and depth requested.
4. Fill subjectSyllabusCompletion with an ESTIMATED current completion rate based on what the student should have done by today, or generally set to 0. It is a starting point tracker.
`,

  ADAPTIVE_REPLAN: (completedTasks, pendingTasks, daysRemaining, weakAreas) => `
You are an adaptive study planner. Replan based on progress starting from ${TODAY}:

**Completed Tasks:** ${JSON.stringify(completedTasks)}
**Pending Tasks:** ${JSON.stringify(pendingTasks)}
**Days Remaining:** ${daysRemaining}
**Weak Areas:** ${JSON.stringify(weakAreas)}

Create an adjusted schedule balancing academic and placement load.
Return JSON in the same format as the initial study plan. Return ONLY valid JSON, NO markdown wrappers formatting.
`,

  DSA_DAILY_CHALLENGE: (solvedProblems, weakTopics, currentLevel) => `
You are a world-class adaptive DSA Coach. Your job is to deeply understand this student's learning patterns and recommend THE single most impactful problem for them right now.

**Student Profile:**
- Current Level: ${currentLevel}
- Total Problems Solved: ${solvedProblems.length}
- Problems Solved (recent 30): ${JSON.stringify(solvedProblems.slice(-30).map(p => ({ title: p.title, topic: p.topic, difficulty: p.difficulty, date: p.solvedAt })))}
- Weak/Undertrained Patterns: ${JSON.stringify(weakTopics)}

**Your Adaptive Strategy:**
1. ANALYZE what topics/patterns the student has practiced vs what they haven't touched at all.
2. ASSESS their difficulty progression — are they stuck on Easy? Ready for Medium? Already doing Hard?
3. IF they have solved ZERO problems: Start with the absolute foundation — "Two Sum" (Arrays & Hashing, Easy). Non-negotiable.
4. IF they've only done Easy: Introduce their first Medium on a topic they've practiced.
5. IF they have gaps: Target the weakest pattern they haven't touched (e.g., if no Sliding Window problems, suggest one).
6. IF they're progressing well: Introduce the NEXT logical pattern (Striver order: Arrays → Binary Search → Strings → Linked Lists → Recursion → Stacks → Greedy → Trees → Graphs → DP).
7. Occasionally suggest a REVIEW problem from a previously solved pattern at slightly higher difficulty (spaced repetition).
8. Always explain WHY you chose this specific problem for them.

Recommend ONE problem in JSON:
{
  "title": "string (exact problem name)",
  "topic": "string (pattern category, e.g. 'Sliding Window', 'Two Pointers', 'Dynamic Programming')",
  "difficulty": "easy|medium|hard",
  "description": "string (clear problem statement)",
  "whyThisProblem": "string (2-3 sentences explaining why this is the right problem for the student right now based on their history)",
  "hints": ["string", "string"],
  "approach": "string (high-level approach without giving code)",
  "concepts": ["string"],
  "estimatedTime": 30,
  "similarProblems": ["string"],
  "leetcodeLink": "string (LeetCode URL if applicable, otherwise empty string)"
}

Return ONLY valid JSON, NO markdown wrappers formatting.
`,
  GENERATE_MCQ_QUIZ: (context, subject, count = 5) => `
You are an expert examiner. Generate a ${count}-question Multiple Choice Quiz based primarily on the following material:

Material:
${context ? context.substring(0, 10000) : 'Standard AI/ML & CSE B.Tech syllabus.'}

Target Subject: ${subject}

Return JSON strictly matching this schema:
{
  "title": "string (A catchy title for the quiz)",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string (Must exactly match one of the options)",
      "explanation": "string (Why this is the correct answer)"
    }
  ]
}

Return ONLY valid JSON, NO markdown formatted wrappers.
`
};

export default PROMPTS;
