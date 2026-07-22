import type {
  BodyweightLog,
  CoachConversation,
  Equipment,
  GuideResource,
  InjuryHistory,
  MobilityItem,
  NutritionCheckin,
  PlanDay,
  Profile,
  ReadinessLog,
  SkillDefinition,
  SkillTest,
  SwimLog,
  TrainingBlock,
  UserPreferences,
  UserSkillState,
  Workout,
} from './types'

export const profile: Profile = {
  id: 'daniel',
  name: 'Daniel',
  context:
    'Stanford undergraduate doing summer research. Schedule shifts with school, research, and travel.',
  bodyweightLb: 168,
  timezone: 'America/Los_Angeles',
}

export const preferences: UserPreferences = {
  id: 'pref-1',
  activeMode: 'summer',
  nutritionMode: 'performance_maintenance',
  advancedMacros: false,
  units: 'imperial',
}

export const equipment: Equipment[] = [
  { id: 'eq-1', name: 'Benches', available: true, location: 'gym' },
  { id: 'eq-2', name: 'Dumbbells', available: true, location: 'gym' },
  { id: 'eq-3', name: 'Cables', available: true, location: 'gym' },
  { id: 'eq-4', name: 'Pull-up stations', available: true, location: 'gym' },
  { id: 'eq-5', name: 'Dip equipment', available: true, location: 'gym' },
  { id: 'eq-6', name: 'Machines', available: true, location: 'gym' },
  { id: 'eq-7', name: 'Parallettes', available: true, location: 'home' },
  { id: 'eq-8', name: 'Open floor space', available: true, location: 'outdoor' },
  { id: 'eq-9', name: 'Pool', available: true, location: 'pool' },
  { id: 'eq-10', name: 'Rings', available: false, location: 'gym' },
  {
    id: 'eq-11',
    name: 'Suitable flag pole',
    available: false,
    location: 'outdoor',
  },
]

export const injuries: InjuryHistory[] = [
  {
    id: 'inj-1',
    area: 'Shoulders',
    status: 'historical',
    notes: 'History of shoulder injuries. Keep overhead loading controlled.',
  },
  {
    id: 'inj-2',
    area: 'Forearms',
    status: 'monitoring',
    notes: 'Current forearm discomfort. Monitor during planche and wrist load.',
  },
]

export const currentBlock: TrainingBlock = {
  id: 'block-1',
  name: 'Summer Skill Base',
  focus: 'Open tuck planche consolidation + handstand entry consistency',
  startDate: '2026-06-01',
  endDate: '2026-07-12',
  weekIndex: 3,
  totalWeeks: 6,
}

export const weekPlan: PlanDay[] = [
  {
    id: 'day-mon',
    weekday: 0,
    title: 'Handstand & Compression',
    primaryFocus: 'Handstand entries + active compression',
    estimatedMinutes: 70,
    intensity: 'moderate',
    swimStatus: 'optional',
    flexibilityEmphasis: 'Pike & pancake',
    versions: ['standard', 'short', 'light'],
    exercises: [
      {
        id: 'pe-1',
        name: 'Wrist & shoulder prep',
        target: '8 min',
        section: 'warmup',
        cue: 'Slow loaded wrist circles, no sharp pain.',
      },
      {
        id: 'pe-2',
        name: 'Wall handstand line drills',
        target: '4 x 30s',
        section: 'primary',
        cue: 'Posterior pelvic tilt, push tall.',
      },
      {
        id: 'pe-3',
        name: 'Freestanding kick-up practice',
        target: '10 attempts',
        section: 'primary',
        cue: 'Commit hips over shoulders.',
      },
      {
        id: 'pe-4',
        name: 'Seated pike compression lifts',
        target: '4 x 8',
        section: 'secondary',
        cue: 'Actively lift heels, no rounding.',
      },
    ],
  },
  {
    id: 'day-tue',
    weekday: 1,
    title: 'Heavy Planche + Swim Lesson',
    primaryFocus: 'Maximal planche tension',
    estimatedMinutes: 60,
    intensity: 'hard',
    swimStatus: 'lesson',
    flexibilityEmphasis: 'Wrist decompression',
    versions: ['standard', 'short', 'light'],
    exercises: [
      {
        id: 'pe-5',
        name: 'Straight-arm scap prep',
        target: '3 x 10',
        section: 'warmup',
        cue: 'Full protraction, elbows locked.',
      },
      {
        id: 'pe-6',
        name: 'Open tuck planche holds',
        target: '6 x max',
        section: 'primary',
        cue: 'Lean until shoulders pass wrists.',
      },
      {
        id: 'pe-7',
        name: 'Advanced tuck negatives',
        target: '4 x 5s',
        section: 'primary',
        cue: 'Open hips slightly each set.',
      },
      {
        id: 'pe-8',
        name: 'Swim lesson',
        target: '3:30-4:20 PM',
        section: 'swim',
        cue: 'Freestyle technique focus.',
      },
    ],
  },
  {
    id: 'day-wed',
    weekday: 2,
    title: 'Gym Upper Size & Strength',
    primaryFocus: 'Hypertrophy: chest, back, delts',
    estimatedMinutes: 75,
    intensity: 'moderate',
    swimStatus: 'none',
    flexibilityEmphasis: 'Thoracic',
    versions: ['standard', 'short', 'light'],
    exercises: [
      {
        id: 'pe-9',
        name: 'Incline dumbbell press',
        target: '4 x 8-10',
        section: 'strength',
        cue: 'Controlled stretch, keep chest full.',
      },
      {
        id: 'pe-10',
        name: 'Weighted pull-ups',
        target: '4 x 6-8',
        section: 'strength',
        cue: 'Around +55 lb working sets.',
      },
      {
        id: 'pe-11',
        name: 'Cable lateral raises',
        target: '3 x 12-15',
        section: 'strength',
        cue: 'Lead with elbow, side delt focus.',
      },
      {
        id: 'pe-12',
        name: 'Rear delt + upper back',
        target: '3 x 15',
        section: 'strength',
        cue: 'Pause at peak contraction.',
      },
    ],
  },
  {
    id: 'day-thu',
    weekday: 3,
    title: 'Handstand & Press Pathway + Swim',
    primaryFocus: 'Press negatives + line work',
    estimatedMinutes: 65,
    intensity: 'moderate',
    swimStatus: 'lesson',
    flexibilityEmphasis: 'Hamstrings & hip flexors',
    versions: ['standard', 'short', 'light'],
    exercises: [
      {
        id: 'pe-13',
        name: 'Shoulder/wrist warm-up',
        target: '8 min',
        section: 'warmup',
        cue: 'Build to full flexion gradually.',
      },
      {
        id: 'pe-14',
        name: 'Box press negatives',
        target: '5 x 3',
        section: 'primary',
        cue: 'Slow lower, straddle wide.',
      },
      {
        id: 'pe-15',
        name: 'Wall press negatives',
        target: '4 x 4',
        section: 'secondary',
        cue: 'Lift hips before shoulders.',
      },
      {
        id: 'pe-16',
        name: 'Swim lesson',
        target: '3:30-4:20 PM',
        section: 'swim',
        cue: 'Breathing rhythm.',
      },
    ],
  },
  {
    id: 'day-fri',
    weekday: 4,
    title: 'Planche Volume & Shape',
    primaryFocus: 'Submaximal planche volume',
    estimatedMinutes: 60,
    intensity: 'moderate',
    swimStatus: 'none',
    flexibilityEmphasis: 'Wrists & shoulders',
    versions: ['standard', 'short', 'light'],
    exercises: [
      {
        id: 'pe-17',
        name: 'Frog stand to tuck flow',
        target: '4 x 20s',
        section: 'warmup',
        cue: 'Find balance point early.',
      },
      {
        id: 'pe-18',
        name: 'Open tuck volume holds',
        target: '8 x 6-8s',
        section: 'primary',
        cue: 'Quality over duration.',
      },
      {
        id: 'pe-19',
        name: 'Tuck planche push-up progression',
        target: '4 x 4',
        section: 'secondary',
        cue: 'Maintain protraction throughout.',
      },
      {
        id: 'pe-20',
        name: 'Planche lean holds',
        target: '3 x 20s',
        section: 'strength',
        cue: 'Maximum forward lean.',
      },
    ],
  },
  {
    id: 'day-sat',
    weekday: 5,
    title: 'Flexible Choice',
    primaryFocus: 'Pick: physique, assisted planche, rings, flexibility, swim',
    estimatedMinutes: 60,
    intensity: 'light',
    swimStatus: 'easy',
    flexibilityEmphasis: 'Full body',
    versions: ['standard', 'short', 'light'],
    exercises: [
      {
        id: 'pe-21',
        name: 'Choose focus for today',
        target: 'flexible',
        section: 'primary',
        cue: 'Match to weekly fatigue and goals.',
      },
    ],
  },
  {
    id: 'day-sun',
    weekday: 6,
    title: 'Rest & Weekly Review',
    primaryFocus: 'Recovery and planning',
    estimatedMinutes: 20,
    intensity: 'light',
    swimStatus: 'none',
    flexibilityEmphasis: 'Light mobility only',
    isRest: true,
    versions: ['standard'],
    exercises: [
      {
        id: 'pe-22',
        name: 'Weekly review with Coach',
        target: '15 min',
        section: 'primary',
        cue: 'Log wins, adjust next week.',
      },
    ],
  },
]

export const todayWorkout: Workout = {
  id: 'wk-today',
  date: '2026-06-16',
  title: 'Heavy Planche + Swim Lesson',
  blockId: 'block-1',
  focus: 'Maximal planche tension with controlled forearm load',
  estimatedMinutes: 60,
  intensity: 'hard',
  status: 'planned',
  exercises: [
    {
      id: 'we-1',
      name: 'Straight-arm scap prep',
      section: 'warmup',
      target: '3 x 10',
      previousResult: '3 x 10 clean',
      actualResult: '',
      cue: 'Full protraction, elbows locked.',
      done: false,
      sets: [
        { id: 's1', setNumber: 1, target: '10', result: '', done: false },
        { id: 's2', setNumber: 2, target: '10', result: '', done: false },
        { id: 's3', setNumber: 3, target: '10', result: '', done: false },
      ],
    },
    {
      id: 'we-2',
      name: 'Open tuck planche holds',
      section: 'primary',
      target: '6 x max hold',
      previousResult: 'Best 9s, avg 7s',
      actualResult: '',
      cue: 'Lean until shoulders pass wrists. Stop if forearm pain > 2.',
      done: false,
      sets: [
        { id: 's4', setNumber: 1, target: 'max', result: '', done: false },
        { id: 's5', setNumber: 2, target: 'max', result: '', done: false },
        { id: 's6', setNumber: 3, target: 'max', result: '', done: false },
        { id: 's7', setNumber: 4, target: 'max', result: '', done: false },
        { id: 's8', setNumber: 5, target: 'max', result: '', done: false },
        { id: 's9', setNumber: 6, target: 'max', result: '', done: false },
      ],
    },
    {
      id: 'we-3',
      name: 'Advanced tuck negatives',
      section: 'secondary',
      target: '4 x 5s',
      previousResult: '4 x 4s',
      actualResult: '',
      cue: 'Open hips slightly each set.',
      done: false,
      sets: [
        { id: 's10', setNumber: 1, target: '5s', result: '', done: false },
        { id: 's11', setNumber: 2, target: '5s', result: '', done: false },
        { id: 's12', setNumber: 3, target: '5s', result: '', done: false },
        { id: 's13', setNumber: 4, target: '5s', result: '', done: false },
      ],
    },
    {
      id: 'we-4',
      name: 'L-sit hold',
      section: 'strength',
      target: '3 x max',
      previousResult: 'Best 45s',
      actualResult: '',
      cue: 'Point toes, depress shoulders.',
      done: false,
      sets: [
        { id: 's14', setNumber: 1, target: 'max', result: '', done: false },
        { id: 's15', setNumber: 2, target: 'max', result: '', done: false },
        { id: 's16', setNumber: 3, target: 'max', result: '', done: false },
      ],
    },
    {
      id: 'we-5',
      name: 'Wrist decompression flow',
      section: 'flexibility',
      target: '5 min',
      previousResult: 'Done',
      actualResult: '',
      cue: 'Gentle, relieve forearm tension.',
      done: false,
      sets: [{ id: 's17', setNumber: 1, target: '5 min', result: '', done: false }],
    },
    {
      id: 'we-6',
      name: 'Swim lesson',
      section: 'swim',
      target: '3:30-4:20 PM',
      previousResult: 'Freestyle drills',
      actualResult: '',
      cue: 'Technique focus, easy effort.',
      done: false,
      sets: [{ id: 's18', setNumber: 1, target: '50 min', result: '', done: false }],
    },
  ],
}

export const readinessHistory: ReadinessLog[] = [
  { id: 'r1', date: '2026-06-16', energy: 7, sleep: 7, wrist: 1, forearm: 2, elbow: 0, shoulder: 1 },
  { id: 'r2', date: '2026-06-15', energy: 8, sleep: 8, wrist: 0, forearm: 1, elbow: 0, shoulder: 0 },
  { id: 'r3', date: '2026-06-13', energy: 6, sleep: 6, wrist: 1, forearm: 2, elbow: 1, shoulder: 1 },
]

export const skills: SkillDefinition[] = [
  {
    id: 'skill-planche',
    name: 'Planche',
    priority: 'primary',
    active: true,
    category: 'Straight-arm strength',
    prerequisites: ['Solid L-sit', 'Healthy wrists', 'Straight-arm scap strength'],
    supportingQualities: ['Scapular protraction', 'Anterior delt strength', 'Active straddle'],
    recommendedFrequency: '2-3x / week',
    currentWeeklyFrequency: 3,
    equipment: ['Parallettes', 'Floor'],
    stages: [
      { id: 'pl-1', name: 'Wrist & straight-arm prep', order: 1, description: 'Build wrist tolerance and locked-elbow strength.', exercises: ['Wrist push-ups', 'Scap protractions'], commonFaults: ['Bent elbows'], timelineRange: 'Ongoing' },
      { id: 'pl-2', name: 'Frog stand', order: 2, description: 'Balance on bent arms.', exercises: ['Frog stand holds'], commonFaults: ['Resting knees on elbows'], timelineRange: '2-4 weeks' },
      { id: 'pl-3', name: 'Compressed tuck', order: 3, description: 'Knees tight to chest, straight arms.', exercises: ['Compressed tuck holds'], commonFaults: ['Piking hips too high'], timelineRange: '1-2 months' },
      { id: 'pl-4', name: 'Tuck', order: 4, description: 'Hips at shoulder height.', exercises: ['Tuck holds'], commonFaults: ['Sagging hips'], timelineRange: '1-2 months' },
      { id: 'pl-5', name: 'Open tuck', order: 5, description: 'Open the hip angle past 90 degrees.', exercises: ['Open tuck holds'], commonFaults: ['Reverting to closed tuck under fatigue'], timelineRange: 'Current' },
      { id: 'pl-6', name: 'Advanced tuck', order: 6, description: 'Back flat, hips fully open, knees tucked.', exercises: ['Advanced tuck negatives', 'Advanced tuck holds'], commonFaults: ['Rounding upper back'], timelineRange: '2-4 months' },
      { id: 'pl-7', name: 'One-leg / half-lay', order: 7, description: 'Extend one leg or half straddle.', exercises: ['One-leg holds'], commonFaults: ['Hip rotation'], timelineRange: '3-6 months' },
      { id: 'pl-8', name: 'Straddle', order: 8, description: 'Both legs extended, straddled.', exercises: ['Straddle attempts'], commonFaults: ['Insufficient lean'], timelineRange: '6-12 months' },
      { id: 'pl-9', name: 'Full', order: 9, description: 'Full planche, legs together.', exercises: ['Full holds'], commonFaults: ['Loss of protraction'], timelineRange: '12+ months' },
      { id: 'pl-10', name: 'Planche push-up', order: 10, description: 'Press strength in planche.', exercises: ['Planche push-up progressions'], commonFaults: ['Piking up'], timelineRange: 'Long-term' },
    ],
  },
  {
    id: 'skill-handstand',
    name: 'Handstand',
    priority: 'primary',
    active: true,
    category: 'Balance & overhead',
    prerequisites: ['Shoulder flexion mobility', 'Wrist tolerance'],
    supportingQualities: ['Overhead stability', 'Body line awareness'],
    recommendedFrequency: '3-5x / week (short)',
    currentWeeklyFrequency: 3,
    equipment: ['Floor', 'Wall'],
    stages: [
      { id: 'hs-1', name: 'Chest-to-wall line', order: 1, description: 'Build a straight line facing the wall.', exercises: ['Chest-to-wall holds'], commonFaults: ['Arching'], timelineRange: 'Ongoing' },
      { id: 'hs-2', name: 'Toe & heel pulls', order: 2, description: 'Find balance off the wall.', exercises: ['Toe pulls', 'Heel pulls'], commonFaults: ['Falling early'], timelineRange: '2-4 weeks' },
      { id: 'hs-3', name: 'Freestanding balance', order: 3, description: 'Hold without wall.', exercises: ['Freestanding holds'], commonFaults: ['Over-correcting'], timelineRange: 'Current' },
      { id: 'hs-4', name: 'Kick-up consistency', order: 4, description: 'Reliable entries.', exercises: ['Kick-up practice'], commonFaults: ['Under/over kicking'], timelineRange: 'Current' },
      { id: 'hs-5', name: 'Clean floor line', order: 5, description: 'Straight line freestanding.', exercises: ['Line drills'], commonFaults: ['Arching from floor'], timelineRange: '2-4 months' },
      { id: 'hs-6', name: 'Shoulder taps', order: 6, description: 'Weight shifts and control.', exercises: ['Shoulder taps'], commonFaults: ['Loss of balance'], timelineRange: '3-5 months' },
      { id: 'hs-7', name: 'HSPU pathway', order: 7, description: 'Handstand push-up strength.', exercises: ['Wall HSPU'], commonFaults: ['Partial ROM'], timelineRange: 'Long-term' },
      { id: 'hs-8', name: 'Press to handstand', order: 8, description: 'Press up without kicking.', exercises: ['Box press', 'Straddle press'], commonFaults: ['Insufficient compression'], timelineRange: 'Long-term' },
      { id: 'hs-9', name: 'One-arm prep', order: 9, description: 'Weight to one arm.', exercises: ['Lean drills'], commonFaults: ['Hip shift'], timelineRange: '12+ months' },
    ],
  },
  {
    id: 'skill-press',
    name: 'Press-to-Handstand & Compression',
    priority: 'primary',
    active: true,
    category: 'Compression & strength',
    prerequisites: ['Pike compression', 'Handstand hold'],
    supportingQualities: ['Active straddle', 'Hip flexor strength', 'Pancake mobility'],
    recommendedFrequency: '2x / week',
    currentWeeklyFrequency: 2,
    equipment: ['Floor', 'Box', 'Wall'],
    stages: [
      { id: 'pr-1', name: 'Pike compression', order: 1, description: 'Active pike lift strength.', exercises: ['Seated pike lifts'], commonFaults: ['Rounding back'], timelineRange: 'Current' },
      { id: 'pr-2', name: 'Straddle compression', order: 2, description: 'Straddle lift strength.', exercises: ['Straddle lifts'], commonFaults: ['Bent knees'], timelineRange: 'Current' },
      { id: 'pr-3', name: 'Pancake mobility', order: 3, description: 'Passive + active straddle range.', exercises: ['Pancake stretch'], commonFaults: ['Rounding'], timelineRange: 'Ongoing' },
      { id: 'pr-4', name: 'Hip lift / frogger', order: 4, description: 'Lifting hips over hands.', exercises: ['Frogger'], commonFaults: ['No hip lift'], timelineRange: '2-3 months' },
      { id: 'pr-5', name: 'Box press negative', order: 5, description: 'Lower from handstand to box.', exercises: ['Box press negatives'], commonFaults: ['Falling fast'], timelineRange: 'Current' },
      { id: 'pr-6', name: 'Wall press negative', order: 6, description: 'Eccentric press control.', exercises: ['Wall press negatives'], commonFaults: ['Shoulders before hips'], timelineRange: '3-4 months' },
      { id: 'pr-7', name: 'Tuck press', order: 7, description: 'Press from tuck.', exercises: ['Tuck press'], commonFaults: ['Jumping'], timelineRange: '4-6 months' },
      { id: 'pr-8', name: 'Straddle press', order: 8, description: 'Full straddle press.', exercises: ['Straddle press'], commonFaults: ['Insufficient lean'], timelineRange: '6-12 months' },
      { id: 'pr-9', name: 'Press to handstand', order: 9, description: 'Complete press.', exercises: ['Full press'], commonFaults: ['Compression limit'], timelineRange: 'Long-term' },
    ],
  },
  {
    id: 'skill-swim',
    name: 'Swimming',
    priority: 'primary',
    active: true,
    category: 'Cardio & technique',
    prerequisites: ['Comfort in water'],
    supportingQualities: ['Breathing rhythm', 'Body position'],
    recommendedFrequency: '2-3x / week',
    currentWeeklyFrequency: 2,
    equipment: ['Pool'],
    stages: [
      { id: 'sw-1', name: 'Lesson consistency', order: 1, description: 'Attend Tue/Thu lessons.', exercises: ['Lessons'], commonFaults: ['Skipping'], timelineRange: 'Current' },
      { id: 'sw-2', name: 'Freestyle efficiency', order: 2, description: 'Smooth, efficient stroke.', exercises: ['Catch drills'], commonFaults: ['Crossover'], timelineRange: 'Current' },
      { id: 'sw-3', name: 'Breathing', order: 3, description: 'Bilateral breathing rhythm.', exercises: ['Breathing drills'], commonFaults: ['Lifting head'], timelineRange: '1-2 months' },
      { id: 'sw-4', name: 'Backstroke', order: 4, description: 'Add backstroke.', exercises: ['Backstroke drills'], commonFaults: ['Sinking hips'], timelineRange: '2-3 months' },
      { id: 'sw-5', name: 'Breaststroke', order: 5, description: 'Add breaststroke.', exercises: ['Breaststroke drills'], commonFaults: ['Timing'], timelineRange: '3-4 months' },
      { id: 'sw-6', name: 'Butterfly intro', order: 6, description: 'Introduce butterfly.', exercises: ['Fly drills'], commonFaults: ['Timing'], timelineRange: '4-6 months' },
      { id: 'sw-7', name: 'Endurance & pacing', order: 7, description: 'Build continuous distance.', exercises: ['Interval sets'], commonFaults: ['Going out too fast'], timelineRange: 'Ongoing' },
    ],
  },
  {
    id: 'skill-physique',
    name: 'Physique Support',
    priority: 'primary',
    active: true,
    category: 'Strength & hypertrophy',
    prerequisites: ['Consistent gym access or dumbbells'],
    supportingQualities: ['Chest fullness', 'Side and rear delts', 'Lats', 'Upper back', 'Arms'],
    recommendedFrequency: '1-2x / week',
    currentWeeklyFrequency: 1,
    equipment: ['Bench', 'Dumbbells', 'Cables', 'Pull-up station'],
    stages: [
      { id: 'ph-1', name: 'Maintenance baseline', order: 1, description: 'Keep one high-quality weekly upper-body session.', exercises: ['Bench press', 'Weighted pull-ups', 'Delt and arm work'], commonFaults: ['Dropping pressing entirely'], timelineRange: 'Ongoing' },
      { id: 'ph-2', name: 'Consistent weekly volume', order: 2, description: 'Cover chest, back, delts, and arms without displacing skills.', exercises: ['Upper-body size and strength'], commonFaults: ['Adding junk volume'], timelineRange: 'Current' },
      { id: 'ph-3', name: 'Double progression', order: 3, description: 'Advance repetitions before adding load.', exercises: ['Rep-range progression'], commonFaults: ['Changing load and reps together'], timelineRange: 'Ongoing' },
      { id: 'ph-4', name: 'Slow lean gain', order: 4, description: 'Add muscle gradually while keeping planche leverage manageable.', exercises: ['Bodyweight and performance review'], commonFaults: ['Gaining too quickly'], timelineRange: 'Long-term' },
    ],
  },
  // Optional / inactive skills
  optionalSkill('skill-muscleup', 'Muscle-up', 'Pull + dip combo', ['Strong pull-ups', 'Strong dips'], ['Rings', 'Pull-up bar'], 'Achieved on bar; refine form and add rings.'),
  optionalSkill('skill-ringstrength', 'Ring Support & Ring Dips', 'Ring strength', ['Ring support hold'], ['Rings'], 'Requires gym to provide rings.'),
  optionalSkill('skill-ringmu', 'Ring Muscle-up', 'Advanced rings', ['Ring dips', 'Ring pull-ups'], ['Rings'], 'Depends on ring access.'),
  optionalSkill('skill-flag', 'Human Flag', 'Lateral core + grip', ['Side plank strength'], ['Vertical pole'], 'Limited: available poles are not ideal.'),
  optionalSkill('skill-dragon', 'Dragon Flag', 'Anterior core', ['Strong hollow body'], ['Bench'], 'Low interference with planche.'),
  optionalSkill('skill-frontlever', 'Front Lever', 'Straight-arm pull', ['Tuck front lever'], ['Pull-up bar'], 'Low priority; mild interference with planche recovery.'),
  optionalSkill('skill-backlever', 'Back Lever', 'Straight-arm', ['German hang comfort'], ['Pull-up bar'], 'Watch shoulder history.'),
  optionalSkill('skill-vsit', 'V-sit & Manna', 'Compression strength', ['Strong L-sit'], ['Parallettes'], 'Synergistic with compression goals.'),
  optionalSkill('skill-hspu', 'Handstand Push-up', 'Vertical press', ['Solid handstand'], ['Floor', 'Wall'], 'Supports press pathway.'),
  optionalSkill('skill-90push', '90-Degree Push-up', 'Planche press', ['Advanced tuck planche'], ['Parallettes'], 'Builds on planche.'),
  optionalSkill('skill-oapullup', 'One-Arm Pull-up', 'Max pulling', ['Weighted pull-ups +bw'], ['Pull-up bar'], 'High elbow demand; monitor.'),
  optionalSkill('skill-oahs', 'One-Arm Handstand', 'Elite balance', ['Solid freestanding handstand'], ['Floor'], 'Long-term aspiration.'),
]

function optionalSkill(
  id: string,
  name: string,
  category: string,
  prerequisites: string[],
  equipment: string[],
  interference: string,
): SkillDefinition {
  return {
    id,
    name,
    priority: 'optional',
    active: false,
    category,
    prerequisites,
    supportingQualities: [],
    recommendedFrequency: 'When prioritized',
    currentWeeklyFrequency: 0,
    equipment,
    interference,
    stages: [
      { id: id + '-s1', name: 'Foundation', order: 1, description: 'Build prerequisites.', exercises: [], commonFaults: [], timelineRange: 'Varies' },
      { id: id + '-s2', name: 'Progression', order: 2, description: 'Work the main progression.', exercises: [], commonFaults: [], timelineRange: 'Varies' },
      { id: id + '-s3', name: 'Skill', order: 3, description: 'Achieve the skill.', exercises: [], commonFaults: [], timelineRange: 'Varies' },
    ],
  }
}

export const skillStates: UserSkillState[] = [
  {
    skillId: 'skill-planche',
    currentStageId: 'pl-5',
    bestResult: 'Open tuck 10s; compressed tuck historical best ~30s',
    nextMilestone: 'Repeatable 10-12s clean open tuck, then advanced tuck 3-5s',
    history: [
      { date: '2026-06-13', note: 'Open tuck 9s clean on parallettes.' },
      { date: '2026-06-06', note: 'Advanced tuck negatives felt strong.' },
      { date: '2026-05-20', note: 'Open tuck consistent at 7-8s.' },
    ],
  },
  {
    skillId: 'skill-handstand',
    currentStageId: 'hs-4',
    bestResult: 'Max hold ~40s; kick-up ~3/10',
    nextMilestone: '5/10 kick-up success, then repeatable 30s holds and cleaner floor line',
    history: [
      { date: '2026-06-15', note: 'Kick-ups 3/10, wall line good.' },
      { date: '2026-06-08', note: 'Freestanding line arches from floor.' },
    ],
  },
  {
    skillId: 'skill-press',
    currentStageId: 'pr-5',
    bestResult: 'Box press negatives 5 x 3',
    nextMilestone: 'Controlled wall press negatives',
    history: [{ date: '2026-06-12', note: 'Pike compression improving.' }],
  },
  {
    skillId: 'skill-swim',
    currentStageId: 'sw-2',
    bestResult: '2-3 sessions/week, freestyle developing',
    nextMilestone: 'Consistent bilateral breathing',
    history: [{ date: '2026-06-11', note: 'Freestyle technique lesson.' }],
  },
  {
    skillId: 'skill-physique',
    currentStageId: 'ph-2',
    bestResult: 'Bench 185 × 8 across 3 sets; weighted pull-up +55 × 6–8',
    nextMilestone: 'Maintain weekly chest/back/delt/arm coverage while skills progress',
    history: [{ date: '2026-06-11', note: 'Upper-body size and strength session completed.' }],
  },
]

export const skillTests: SkillTest[] = [
  { id: 't1', skillId: 'skill-planche', date: '2026-05-01', variation: 'Open tuck', metric: 'hold', value: 6, formScore: 6, surface: 'floor', pain: 1, type: 'monthly_test' },
  { id: 't2', skillId: 'skill-planche', date: '2026-05-15', variation: 'Open tuck', metric: 'hold', value: 8, formScore: 7, surface: 'parallettes', pain: 1, type: 'best_set' },
  { id: 't3', skillId: 'skill-planche', date: '2026-06-01', variation: 'Open tuck', metric: 'hold', value: 9, formScore: 7, surface: 'parallettes', pain: 2, type: 'monthly_test' },
  { id: 't4', skillId: 'skill-planche', date: '2026-06-13', variation: 'Open tuck', metric: 'hold', value: 10, formScore: 8, surface: 'parallettes', pain: 1, type: 'best_set' },
  { id: 't5', skillId: 'skill-planche', date: '2026-05-15', variation: 'Advanced tuck', metric: 'hold', value: 3, formScore: 6, surface: 'floor', pain: 1, type: 'best_set' },
  { id: 't6', skillId: 'skill-planche', date: '2026-06-13', variation: 'Advanced tuck', metric: 'hold', value: 5, formScore: 6, surface: 'floor', pain: 1, type: 'best_set' },
  { id: 't7', skillId: 'skill-handstand', date: '2026-05-01', variation: 'Freestanding', metric: 'hold', value: 32, surface: 'floor', type: 'monthly_test' },
  { id: 't8', skillId: 'skill-handstand', date: '2026-06-01', variation: 'Freestanding', metric: 'hold', value: 40, surface: 'floor', type: 'monthly_test' },
  { id: 't9', skillId: 'skill-handstand', date: '2026-05-01', variation: 'Kick-up', metric: 'success_pct', value: 20, type: 'practice' },
  { id: 't10', skillId: 'skill-handstand', date: '2026-05-20', variation: 'Kick-up', metric: 'success_pct', value: 25, type: 'practice' },
  { id: 't11', skillId: 'skill-handstand', date: '2026-06-15', variation: 'Kick-up', metric: 'success_pct', value: 30, type: 'practice' },
]

export const swimLogs: SwimLog[] = [
  { id: 'sl1', date: '2026-06-10', type: 'lesson', durationMin: 50, notes: 'Freestyle drills' },
  { id: 'sl2', date: '2026-06-12', type: 'lesson', durationMin: 50, notes: 'Breathing focus' },
  { id: 'sl3', date: '2026-06-14', type: 'easy', durationMin: 30, notes: 'Recovery swim' },
]

export const bodyweightLogs: BodyweightLog[] = [
  { id: 'bw1', date: '2026-05-19', weightLb: 167 },
  { id: 'bw2', date: '2026-05-26', weightLb: 167.5 },
  { id: 'bw3', date: '2026-06-02', weightLb: 168 },
  { id: 'bw4', date: '2026-06-09', weightLb: 168.5 },
  { id: 'bw5', date: '2026-06-16', weightLb: 168 },
]

export const nutritionCheckins: NutritionCheckin[] = [
  { id: 'n1', date: '2026-06-15', bodyweightLb: 168, protein: 'adequate', meals: 4, hunger: 3, energy: 4, hydration: 4, notes: 'Dining hall chicken bowl twice.' },
  { id: 'n2', date: '2026-06-14', protein: 'low', meals: 3, hunger: 2, energy: 3, hydration: 3 },
]

export const mobilityItems: MobilityItem[] = [
  { id: 'm1', area: 'Pike / Hamstrings', name: 'Active pike lifts', duration: '60s', sets: '3', cue: 'Lift heels actively, no rounding.', purpose: 'Active compression for press.', progression: 'Add elevation under hands.' },
  { id: 'm2', area: 'Pancake / Straddle', name: 'Pancake good mornings', duration: '60s', sets: '3', cue: 'Hinge from hips, flat back.', purpose: 'Straddle range for planche & press.', progression: 'Increase forward reach.' },
  { id: 'm3', area: 'Shoulder flexion', name: 'Wall slides + dowel', duration: '45s', sets: '3', cue: 'Ribs down, reach overhead.', purpose: 'Handstand line.', contraindication: 'Stop if shoulder pinches.', progression: 'Reduce wall distance.' },
  { id: 'm4', area: 'Wrists', name: 'Loaded wrist rocks', duration: '45s', sets: '2', cue: 'Slow, controlled, pain-free.', purpose: 'Wrist tolerance for planche.', contraindication: 'Avoid if forearm pain > 2.', progression: 'Add bodyweight gradually.' },
  { id: 'm5', area: 'Forearms', name: 'Forearm decompression', duration: '60s', sets: '2', cue: 'Gentle stretch + massage.', purpose: 'Manage forearm discomfort.', contraindication: 'Reduce volume if flaring up.', progression: 'Add eccentric loading when pain-free.' },
  { id: 'm6', area: 'Hip flexors / Quads', name: 'Couch stretch', duration: '60s', sets: '2 / side', cue: 'Posterior tilt, tall torso.', purpose: 'Counter sitting, support line.', progression: 'Increase knee elevation.' },
  { id: 'm7', area: 'Thoracic', name: 'Thoracic extensions', duration: '45s', sets: '3', cue: 'Extend over support, ribs down.', purpose: 'Overhead position.', progression: 'Lower support height.' },
  { id: 'm8', area: 'Active compression', name: 'Seated compression holds', duration: '20s', sets: '4', cue: 'Hands lift, legs stay straight.', purpose: 'Press-to-handstand requirement.', progression: 'Lift hips off floor.' },
]

export interface FlexibilityRoutine {
  id: string
  name: string
  duration: '8 min' | '15 min' | '25 min' | string
  description: string
  focusAreas: string[]
  itemIds: string[]
}

// Guided follow-along routines. itemIds map into mobilityItems above.
export const flexibilityRoutines: FlexibilityRoutine[] = [
  {
    id: 'daily-quick',
    name: 'Daily Quick Routine',
    duration: '8 min',
    description: 'The everyday essentials to stay loose and pain-free.',
    focusAreas: ['Wrists', 'Shoulder flexion', 'Pike'],
    itemIds: ['m4', 'm3', 'm1'],
  },
  {
    id: 'daily-standard',
    name: 'Daily Standard Routine',
    duration: '15 min',
    description: 'A balanced daily reset for wrists, shoulders, hips, and compression.',
    focusAreas: ['Wrists', 'Shoulder flexion', 'Hip flexors', 'Pike'],
    itemIds: ['m4', 'm3', 'm6', 'm1', 'm8'],
  },
  {
    id: 'full-flexibility',
    name: 'Full Flexibility Routine',
    duration: '25 min',
    description: 'A complete session for pike, pancake, shoulders, hips, and thoracic range.',
    focusAreas: ['Pike', 'Pancake', 'Shoulder flexion', 'Hip flexors', 'Thoracic'],
    itemIds: ['m1', 'm2', 'm3', 'm6', 'm7', 'm8'],
  },
  {
    id: 'press-handstand',
    name: 'Press-to-Handstand Routine',
    duration: '25 min',
    description: 'Active compression and straddle range for the press.',
    focusAreas: ['Active compression', 'Pancake', 'Pike', 'Hip flexors'],
    itemIds: ['m8', 'm2', 'm1', 'm6'],
  },
  {
    id: 'pre-planche-wrist',
    name: 'Pre-Planche Wrist Routine',
    duration: '8 min',
    description: 'Warm and prepare the wrists before planche loading.',
    focusAreas: ['Wrists', 'Forearms'],
    itemIds: ['m4', 'm5'],
  },
  {
    id: 'pre-handstand',
    name: 'Pre-Handstand Shoulder & Wrist Routine',
    duration: '8 min',
    description: 'Open the shoulders and prime the wrists before handstands.',
    focusAreas: ['Shoulder flexion', 'Wrists', 'Thoracic'],
    itemIds: ['m3', 'm4', 'm7'],
  },
  {
    id: 'post-swim',
    name: 'Post-Swim Shoulder Routine',
    duration: '15 min',
    description: 'Decompress the shoulders and thoracic spine after swimming.',
    focusAreas: ['Shoulder flexion', 'Thoracic'],
    itemIds: ['m3', 'm7', 'm5'],
  },
  {
    id: 'recovery',
    name: 'Recovery Routine',
    duration: '15 min',
    description: 'Gentle full-body flexibility for rest and recovery days.',
    focusAreas: ['Hip flexors', 'Forearms', 'Thoracic', 'Pike'],
    itemIds: ['m6', 'm5', 'm7', 'm1'],
  },
]

export const resources: GuideResource[] = [
  { id: 'g1', title: 'Open Tuck to Advanced Tuck Planche', skill: 'Planche', stage: 'Open tuck', contentType: 'program', source: 'Daniel Training OS', url: '', summary: 'Progression cues from open to advanced tuck.', relevance: 'Matches current planche stage.', saved: true, completed: false, bodyArea: 'Shoulders', equipment: 'Parallettes', durationMin: 14 },
  { id: 'g2', title: 'Consistent Handstand Kick-ups', skill: 'Handstand', stage: 'Kick-up consistency', contentType: 'drill', source: 'Daniel Training OS', url: '', summary: 'Drills to improve entry success rate.', relevance: 'Directly targets your kick-up limiter.', saved: true, completed: false, bodyArea: 'Full body', equipment: 'Floor', durationMin: 10 },
  { id: 'g3', title: 'Press-to-Handstand Compression Blueprint', skill: 'Press-to-Handstand', stage: 'Compression', contentType: 'program', source: 'Daniel Training OS', url: '', summary: 'Building active compression for the press.', relevance: 'Long-term press goal foundation.', saved: false, completed: false, bodyArea: 'Hips', equipment: 'Floor', durationMin: 8 },
  { id: 'g4', title: 'Pancake & Pike Mobility Routine', skill: 'Mobility', stage: 'Pike/pancake', contentType: 'drill', source: 'Daniel Training OS', url: '', summary: 'Daily routine for straddle and pike range.', relevance: 'Supports press and planche.', saved: false, completed: false, bodyArea: 'Hips', equipment: 'Floor', durationMin: 12 },
  { id: 'g5', title: 'Wrist Preparation for Hand Balancing', skill: 'Wrist prep', stage: 'Prep', contentType: 'drill', source: 'Daniel Training OS', url: '', summary: 'Progressive wrist preparation without training through pain.', relevance: 'Relevant to forearm monitoring.', saved: true, completed: true, bodyArea: 'Wrists', equipment: 'Floor', durationMin: 9 },
  { id: 'g6', title: 'Freestyle Technique Fundamentals', skill: 'Swimming', stage: 'Freestyle efficiency', contentType: 'drill', source: 'Daniel Training OS', url: '', summary: 'Catch, body position, and rotation.', relevance: 'Supports swim lessons.', saved: false, completed: false, bodyArea: 'Full body', equipment: 'Pool', durationMin: 16 },
  { id: 'g7', title: 'Hypertrophy Support for Calisthenics', skill: 'Hypertrophy', stage: 'Size', contentType: 'program', source: 'Daniel Training OS', url: '', summary: 'Adding size gradually without displacing primary skill work.', relevance: 'Supports physique goals.', saved: true, completed: false, bodyArea: 'Full body', equipment: 'Dumbbells', durationMin: 11 },
]

export const coachConversation: CoachConversation = {
  id: 'conv-1',
  title: 'Weekly review',
  messages: [
    {
      id: 'cm-1',
      role: 'coach',
      content:
        "I'm ready when you are. I can review today, plan next week, or troubleshoot a stalling skill. Pick a quick action or ask me anything.",
      createdAt: '2026-06-16T08:00:00-07:00',
    },
  ],
}

export const proposedChangesSample = {
  noticed: [
    'Open tuck planche improved from 6s to 10s over 6 weeks.',
    'Kick-up success holding around 3/10 — entry is the main limiter.',
    'Forearm discomfort logged at 2/5 on two recent sessions.',
  ],
  keep: [
    'Current planche frequency (3x/week) is working.',
    'Swim lesson consistency on Tue/Thu.',
  ],
  change: [
    'Add 1 short daily handstand kick-up practice (5 min) to accelerate entries.',
    'Cap heavy planche forearm load when discomfort is 2+.',
  ],
  warnings: [
    'Monitor forearm — reduce wrist-loaded volume if it climbs to 3/5.',
    'Keep overhead pressing controlled given shoulder history.',
  ],
  nextFocus: ['Repeatable 10-12s clean open tuck', '5/10 kick-up success'],
  dataUsed: [
    'recent workouts',
    'current plan',
    'current skills',
    'pain logs',
    'bodyweight',
    'swim load',
  ],
}
