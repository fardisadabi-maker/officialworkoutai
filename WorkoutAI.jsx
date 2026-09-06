import { useEffect, useState } from 'react'
import GuidedWorkoutCoach from './GuidedWorkoutCoach.jsx'
import CameraFormCoach from './CameraFormCoach.jsx'
import NutritionPage from './NutritionPage.jsx'
import GroceryPage from './GroceryPage.jsx'
import AuthPage from './AuthPage.jsx'
import { supabase, supabaseConfigMissing } from './supabase.js'
import './workout.css'

const goals = ['Build Muscle', 'Get Stronger', 'Calisthenics', 'Get Fit', 'Learn a Skill']
const experiences = ['Beginner', 'Intermediate', 'Advanced']
const equipmentOptions = ['None', 'Home Equipment', 'Full Gym']
const durations = [15, 30, 45, 60]
const trainingStyles = ['Balanced', 'Strength', 'Hypertrophy', 'Circuit', 'Skill work']
const muscleGroups = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core']
const achievementDefinitions = [
  { id: 'first-workout', title: 'First Workout', description: 'Complete your first workout', icon: '✦', type: 'completed', target: 1 },
  { id: 'five-workouts', title: 'Getting Started', description: 'Complete 5 workouts', icon: '↗', type: 'completed', target: 5 },
  { id: 'ten-workouts', title: 'Finding Your Rhythm', description: 'Complete 10 workouts', icon: '◈', type: 'completed', target: 10 },
  { id: 'seven-day-streak', title: 'Week Warrior', description: 'Reach a 7 day streak', icon: '◷', type: 'streak', target: 7 },
  { id: 'thirty-day-streak', title: 'Unstoppable', description: 'Reach a 30 day streak', icon: '♨', type: 'streak', target: 30 },
  { id: 'fifty-workouts', title: 'Built Different', description: 'Complete 50 workouts', icon: '◆', type: 'completed', target: 50 },
  { id: 'hundred-workouts', title: 'Century Club', description: 'Complete 100 workouts', icon: '★', type: 'completed', target: 100 },
]

const exercises = [
  { id: 'push-ups', name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', equipment: 'None', description: 'A classic bodyweight press that builds your chest, shoulders, and triceps.', instructions: 'Brace your core, lower your chest with control, then press the floor away without letting your hips sag.', sets: 3, reps: '8-12', rest: 60 },
  { id: 'goblet-squat', name: 'Goblet Squat', category: 'Legs', difficulty: 'Beginner', equipment: 'Home Equipment', description: 'A front-loaded squat that builds strong, stable legs.', instructions: 'Hold the weight close to your chest, sit between your hips, then drive through your whole foot to stand.', sets: 4, reps: '8-10', rest: 90 },
  { id: 'pull-ups', name: 'Pull-ups', category: 'Back', difficulty: 'Advanced', equipment: 'Full Gym', description: 'A powerful vertical pull for your lats, upper back, and grip.', instructions: 'Start from a controlled hang, pull your elbows down toward your ribs, and clear the bar with your chin.', sets: 4, reps: '5-8', rest: 120 },
  { id: 'romanian-deadlift', name: 'Romanian Deadlift', category: 'Legs', difficulty: 'Intermediate', equipment: 'Full Gym', description: 'A hinge pattern that targets the hamstrings and glutes.', instructions: 'Keep your back neutral, push your hips back, and lower until your hamstrings are loaded.', sets: 3, reps: '8-12', rest: 90 },
  { id: 'pike-push-up', name: 'Pike Push-up', category: 'Shoulders', difficulty: 'Intermediate', equipment: 'None', description: 'A bodyweight shoulder press progression.', instructions: 'Make an inverted V, bend your elbows toward the floor, then push back to the starting position.', sets: 3, reps: '6-10', rest: 75 },
  { id: 'plank', name: 'Forearm Plank', category: 'Core', difficulty: 'Beginner', equipment: 'None', description: 'An isometric core hold for full-body tension.', instructions: 'Stack shoulders over elbows, squeeze glutes, and breathe steadily while keeping a straight line.', sets: 3, reps: '30-45 sec', rest: 45 },
  { id: 'dips', name: 'Bench Dips', category: 'Arms', difficulty: 'Beginner', equipment: 'Home Equipment', description: 'A simple triceps-focused pressing exercise.', instructions: 'Keep your shoulders down, lower with control, and press through your palms to extend your elbows.', sets: 3, reps: '10-15', rest: 60 },
  { id: 'hollow-hold', name: 'Hollow Body Hold', category: 'Calisthenics', difficulty: 'Intermediate', equipment: 'None', description: 'A foundational gymnastics shape for core control.', instructions: 'Press your lower back into the floor, extend arms and legs, and hold the shape without arching.', sets: 3, reps: '20-30 sec', rest: 45 },
  { id: 'barbell-row', name: 'Barbell Row', category: 'Back', difficulty: 'Intermediate', equipment: 'Full Gym', description: 'A horizontal pull for a thicker, stronger back.', instructions: 'Hinge forward with a flat back, pull the bar to your lower ribs, and pause before lowering.', sets: 4, reps: '6-10', rest: 90 },
  { id: 'walking-lunge', name: 'Walking Lunges', category: 'Legs', difficulty: 'Beginner', equipment: 'None', description: 'A unilateral leg exercise for balance and strength.', instructions: 'Step forward, lower your back knee toward the floor, then drive through the front foot into the next step.', sets: 3, reps: '10 / side', rest: 60 },
]

const initialPlan = [exercises[2], exercises[8], exercises[6], exercises[4], exercises[5]]
const workoutPresets = [
  { title: 'Quick full body', goal: 'Move, sweat, feel good', duration: '20 min', level: 'All levels', color: 'preset-orange', items: [exercises[0], exercises[9], exercises[5]] },
  { title: 'Push day power', goal: 'Chest, shoulders, triceps', duration: '35 min', level: 'Intermediate', color: 'preset-purple', items: [exercises[0], exercises[4], exercises[6]] },
  { title: 'Leg day builder', goal: 'Strengthen your foundation', duration: '45 min', level: 'Intermediate', color: 'preset-gold', items: [exercises[1], exercises[3], exercises[9], exercises[5]] },
  { title: 'No-equipment core', goal: 'Build control from the center', duration: '15 min', level: 'Beginner', color: 'preset-blue', items: [exercises[5], exercises[7], exercises[0]] },
]
const workoutCatalog = {
  'No Equipment': 'Beginner Full Body|Intermediate Full Body|Advanced Full Body|10-Minute Full Body|15-Minute Full Body|20-Minute Full Body|30-Minute Full Body|Upper Body No Equipment|Lower Body No Equipment|Push Workout|Pull Workout|Leg Workout|Core Workout|Chest Workout|Shoulder Workout|Arm Workout|Back Workout|Glute Workout|Explosive Full Body|Bodyweight Strength'.split('|'),
  Calisthenics: 'Calisthenics Beginner|Calisthenics Intermediate|Calisthenics Advanced|Push-Up Strength|Pull-Up Strength|Dip Strength|Muscle-Up Beginner|Muscle-Up Progression|Handstand Beginner|Handstand Strength|Handstand Push-Up Progression|L-Sit Beginner|L-Sit Progression|Front Lever Beginner|Front Lever Progression|Planche Beginner|Planche Progression|Pistol Squat Progression|Core Calisthenics|Full-Body Calisthenics'.split('|'),
  Gym: 'Beginner Gym Full Body|Intermediate Gym Full Body|Advanced Gym Full Body|Push Day|Pull Day|Leg Day|Upper Body|Lower Body|Chest + Triceps|Back + Biceps|Shoulders + Arms|Chest + Shoulders|Back + Shoulders|Arms|Quads|Hamstrings + Glutes|Calves|Back Thickness|Back Width|Full-Body Strength'.split('|'),
  'Muscle Building': 'Chest Muscle Builder|Back Muscle Builder|Shoulder Builder|Arm Builder|Biceps Builder|Triceps Builder|Leg Muscle Builder|Glute Builder|Upper-Body Hypertrophy|Lower-Body Hypertrophy|Full-Body Hypertrophy|Chest + Arms|Back + Arms|Shoulders + Arms|Leg Hypertrophy'.split('|'),
  Strength: 'Beginner Strength|Full-Body Strength|Upper-Body Strength|Lower-Body Strength|Push Strength|Pull Strength|Leg Strength|Core Strength|Grip Strength|Explosive Strength'.split('|'),
  Conditioning: 'Beginner Cardio|HIIT Beginner|HIIT Intermediate|HIIT Advanced|Full-Body Conditioning|Athletic Conditioning|Sprint Conditioning|Cardio + Strength|15-Minute HIIT|20-Minute Conditioning|Jump Training|Agility Workout|Speed Workout|Endurance Workout|At-Home Cardio'.split('|'),
  Goals: 'Get Stronger|Build Muscle|Improve Endurance|Improve Mobility|Improve Athleticism|Improve Core Strength|Improve Pull-Ups|Improve Push-Ups|Improve Dips|Learn Handstand|Learn Muscle-Up|Learn Front Lever|Learn Planche|Improve Flexibility|Beginner Fitness'.split('|'),
}

const defaultStats = { completed: 0, streak: 0, longestStreak: 0, totalMinutes: 0, xp: 0, weekly: [0, 0, 0, 0, 0, 0, 0], history: [] }

function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function dateDistance(firstDate, secondDate) {
  const first = new Date(`${firstDate}T00:00:00`)
  const second = new Date(`${secondDate}T00:00:00`)
  return Math.round((second - first) / 86400000)
}

function weeklyActivity(history) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    return todayKey(date)
  })
  return days.map((day) => history.some((workout) => workout.date === day) ? 1 : 0)
}

function normalizeStats(savedStats) {
  if (!savedStats || !Array.isArray(savedStats.history)) return defaultStats
  const history = savedStats.history
  const uniqueDates = [...new Set(history.map((workout) => workout.date))].sort()
  let streak = 0
  if (uniqueDates.length) {
    streak = 1
    for (let index = uniqueDates.length - 1; index > 0; index -= 1) {
      if (dateDistance(uniqueDates[index - 1], uniqueDates[index]) !== 1) break
      streak += 1
    }
    if (dateDistance(uniqueDates[uniqueDates.length - 1], todayKey()) > 1) streak = 0
  }
  return { ...defaultStats, ...savedStats, completed: history.length, streak, longestStreak: Math.max(savedStats.longestStreak || 0, streak), totalMinutes: history.reduce((total, workout) => total + workout.duration, 0), xp: savedStats.xp || history.reduce((total, workout) => total + (workout.xp || 0), 0), weekly: weeklyActivity(history), history }
}

function catalogPlan(title) {
  const lowerTitle = title.toLowerCase()
  const categoryOrder = lowerTitle.includes('leg') || lowerTitle.includes('quad') || lowerTitle.includes('glute') || lowerTitle.includes('hamstring') ? ['Legs', 'Core', 'Shoulders'] : lowerTitle.includes('back') || lowerTitle.includes('pull') || lowerTitle.includes('lever') ? ['Back', 'Arms', 'Core'] : lowerTitle.includes('shoulder') || lowerTitle.includes('handstand') || lowerTitle.includes('push') || lowerTitle.includes('chest') || lowerTitle.includes('tricep') ? ['Chest', 'Shoulders', 'Arms', 'Core'] : lowerTitle.includes('core') || lowerTitle.includes('l-sit') || lowerTitle.includes('planche') ? ['Core', 'Shoulders', 'Chest'] : ['Chest', 'Legs', 'Back', 'Core']
  const ordered = [...exercises].sort((first, second) => categoryOrder.indexOf(first.category) - categoryOrder.indexOf(second.category))
  const count = lowerTitle.includes('10-minute') || lowerTitle.includes('15-minute') ? 3 : lowerTitle.includes('20-minute') || lowerTitle.includes('30-minute') ? 4 : 5
  return ordered.slice(0, count)
}

function getStored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function setStored(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

function formatHeaderDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit' })
}

function formatHomeDate(date = new Date()) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' }).toUpperCase()
}

function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(!supabaseConfigMissing)
  const [view, setView] = useState('home')
  const [profile, setProfile] = useState(() => getStored('workoutai-profile', { name: 'Jordan', goal: 'Build Muscle' }))
  const [stats, setStats] = useState(() => normalizeStats(getStored('workoutai-stats', defaultStats)))
  const [plan, setPlan] = useState(() => getStored('workoutai-plan', initialPlan))
  const [generator, setGenerator] = useState(() => getStored('workoutai-preferences', { goal: profile.goal, experience: 'Intermediate', equipment: 'Full Gym', duration: 45, style: 'Balanced', muscles: ['Chest', 'Back', 'Legs'] }))
  const [planReason, setPlanReason] = useState(() => getStored('workoutai-plan-reason', 'A balanced session built around your current goal and equipment.'))
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => getStored('workoutai-achievements', achievementDefinitions.filter((achievement) => achievement.type === 'completed' ? stats.completed >= achievement.target : stats.streak >= achievement.target).map((achievement) => achievement.id)))
  const [achievementToast, setAchievementToast] = useState(null)
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [reminders, setReminders] = useState(() => getStored('workoutai-reminders', true))
  const [isGenerating, setIsGenerating] = useState(false)
  const [completionMessage, setCompletionMessage] = useState(null)
  const [completionSummary, setCompletionSummary] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setAuthLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])
  useEffect(() => {
    if (!session?.user) return
    const displayName = session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'Athlete'
    const userId = session.user.id
    const savedProfile = getStored(`workoutai-profile-${userId}`, null)
    setProfile(savedProfile || { name: displayName, goal: 'Build Muscle', email: session.user.email })
    const savedStats = getStored(`workoutai-stats-${userId}`, null)
    if (savedStats) setStats(normalizeStats(savedStats))
    const savedPlan = getStored(`workoutai-plan-${userId}`, null)
    if (savedPlan) setPlan(savedPlan)
    const savedPreferences = getStored(`workoutai-preferences-${userId}`, null)
    if (savedPreferences) setGenerator(savedPreferences)
    const savedReason = getStored(`workoutai-plan-reason-${userId}`, null)
    if (savedReason) setPlanReason(savedReason)
    const savedAchievements = getStored(`workoutai-achievements-${userId}`, null)
    if (savedAchievements) setUnlockedAchievements(savedAchievements)
    const savedReminders = getStored(`workoutai-reminders-${userId}`, null)
    if (savedReminders !== null) setReminders(savedReminders)
  }, [session])

  useEffect(() => { if (session?.user) setStored(`workoutai-stats-${session.user.id}`, stats) }, [stats, session])
  useEffect(() => { if (session?.user) setStored(`workoutai-plan-${session.user.id}`, plan) }, [plan, session])
  useEffect(() => { if (session?.user) setStored(`workoutai-preferences-${session.user.id}`, generator) }, [generator, session])
  useEffect(() => { if (session?.user) setStored(`workoutai-plan-reason-${session.user.id}`, planReason) }, [planReason, session])
  useEffect(() => { if (session?.user) setStored(`workoutai-achievements-${session.user.id}`, unlockedAchievements) }, [unlockedAchievements, session])
  useEffect(() => {
    const newlyUnlocked = achievementDefinitions.filter((achievement) => {
      const qualifies = achievement.type === 'completed' ? stats.completed >= achievement.target : stats.streak >= achievement.target
      return qualifies && !unlockedAchievements.includes(achievement.id)
    })
    if (!newlyUnlocked.length) return
    setUnlockedAchievements((current) => [...current, ...newlyUnlocked.map((achievement) => achievement.id)])
    setAchievementToast(newlyUnlocked[0])
    const timeout = setTimeout(() => setAchievementToast(null), 4800)
    return () => clearTimeout(timeout)
  }, [stats, unlockedAchievements])
  useEffect(() => { if (session?.user) setStored(`workoutai-profile-${session.user.id}`, profile) }, [profile, session])
  useEffect(() => { if (session?.user) setStored(`workoutai-reminders-${session.user.id}`, reminders) }, [reminders, session])

  const firstName = profile.name.split(' ')[0] || 'there'
  const headerDate = formatHeaderDate()
  const completedSets = activeWorkout?.completedSets ?? []
  const currentExercise = activeWorkout?.exercises[activeWorkout.exerciseIndex]
  const allSetsCompleted = activeWorkout ? activeWorkout.exercises.every((exercise, exerciseIndex) => Array.from({ length: exercise.sets }).every((_, setIndex) => completedSets.includes(`${exerciseIndex}-${setIndex}`))) : false

  function generateWorkout(event) {
    event?.preventDefault()
    if (isGenerating) return
    setIsGenerating(true)
    const compatible = exercises.filter((exercise) => generator.equipment === 'None' ? exercise.equipment === 'None' : generator.equipment === 'Home Equipment' ? exercise.equipment !== 'Full Gym' : true)
    const goalOrder = generator.goal === 'Calisthenics' || generator.goal === 'Learn a Skill' ? ['Calisthenics', 'Core', 'Shoulders', 'Back', 'Arms'] : generator.goal === 'Get Fit' ? ['Legs', 'Core', 'Chest', 'Back', 'Shoulders'] : generator.goal === 'Get Stronger' ? ['Back', 'Legs', 'Chest', 'Shoulders', 'Arms'] : ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms']
    const styleOrder = generator.style === 'Strength' ? ['Back', 'Legs', 'Chest', 'Shoulders'] : generator.style === 'Hypertrophy' ? ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'] : generator.style === 'Circuit' ? ['Legs', 'Core', 'Chest', 'Back'] : generator.style === 'Skill work' ? ['Calisthenics', 'Core', 'Shoulders', 'Back'] : goalOrder
    const experienceRank = { Beginner: 0, Intermediate: 1, Advanced: 2 }
    const targetRank = experienceRank[generator.experience]
    const selectedMuscles = generator.muscles || []
    const result = [...compatible].sort((a, b) => {
      const muscleScore = (exercise) => selectedMuscles.includes(exercise.category) ? -3 : 0
      const difficultyScore = (exercise) => Math.abs(experienceRank[exercise.difficulty] - targetRank)
      return muscleScore(a) + difficultyScore(a) * 2 + styleOrder.indexOf(a.category) - muscleScore(b) - difficultyScore(b) * 2 - styleOrder.indexOf(b.category)
    }).slice(0, generator.duration <= 30 ? 4 : 5)
    const muscleSummary = selectedMuscles.length ? selectedMuscles.join(', ') : 'your full body'
    setTimeout(() => {
      setPlanReason(`${generator.style} ${generator.goal.toLowerCase()} session using ${generator.equipment.toLowerCase()} for ${generator.duration} minutes, with extra attention on ${muscleSummary}. Exercises were matched to your ${generator.experience.toLowerCase()} experience level.`)
      setPlan(result.length ? result : initialPlan)
      setIsGenerating(false)
      setView('workouts')
    }, 350)
  }

  function startWorkout(workoutPlan = plan, metadata = {}) {
    setActiveWorkout({ exercises: workoutPlan, exerciseIndex: 0, completedSets: [], duration: metadata.duration || generator.duration, title: metadata.title || 'Personalized workout' })
  }

  function completeWorkout(workout) {
    const completedOn = todayKey()
    const completedWorkout = { id: `${completedOn}-${Date.now()}`, date: completedOn, title: workout.title || 'Custom workout', duration: workout.duration, exercises: workout.exercises.length, sets: workout.completedSets.length, xp: 50 + workout.completedSets.length * 10 }
    const history = [...stats.history, completedWorkout]
    const previousDate = stats.history.length ? stats.history[stats.history.length - 1].date : null
    const nextStreak = previousDate === completedOn ? stats.streak : previousDate && dateDistance(previousDate, completedOn) === 1 ? stats.streak + 1 : 1
    const nextStats = { ...stats, completed: history.length, streak: nextStreak, longestStreak: Math.max(stats.longestStreak, nextStreak), totalMinutes: stats.totalMinutes + completedWorkout.duration, xp: stats.xp + completedWorkout.xp, weekly: weeklyActivity(history), history }
    setStats(nextStats)
    setActiveWorkout(null)
    const newlyUnlocked = achievementDefinitions.filter((achievement) => {
      const qualifies = achievement.type === 'completed' ? nextStats.completed >= achievement.target : nextStats.streak >= achievement.target
      return qualifies && !unlockedAchievements.includes(achievement.id)
    })
    if (newlyUnlocked.length) setUnlockedAchievements((current) => [...current, ...newlyUnlocked.map((achievement) => achievement.id)])
    setCompletionSummary({ workout: completedWorkout, stats: nextStats, achievements: newlyUnlocked })
  }

  function toggleSet(setIndex) {
    if (!activeWorkout) return
    const key = `${activeWorkout.exerciseIndex}-${setIndex}`
    if (activeWorkout.completedSets.includes(key)) return
    const completedSetsForWorkout = [...activeWorkout.completedSets, key]
    const allCompleted = activeWorkout.exercises.every((exercise, exerciseIndex) => Array.from({ length: exercise.sets }).every((_, requiredSet) => completedSetsForWorkout.includes(`${exerciseIndex}-${requiredSet}`)))
    const nextWorkout = { ...activeWorkout, completedSets: completedSetsForWorkout }
    if (allCompleted) {
      completeWorkout(nextWorkout)
      return
    }
    setActiveWorkout(nextWorkout)
  }

  function handleAuth(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get('name') || data.get('email') || 'Athlete').split(/[ @]/)[0]
    setProfile((current) => ({ ...current, name }))
    setShowAuth(false)
  }

  async function logOut() {
    if (supabase) await supabase.auth.signOut()
    setSession(null)
  }

  if (authLoading) return <div className="auth-loading"><span className="loading-spinner" />Loading your training space...</div>
  if (!session) return <AuthPage />
  return <div className="fitness-app">
    <header className="app-header"><button className="wordmark" onClick={() => setView('home')}><span className="logo-symbol">W</span><span>workout<span>ai</span></span></button><div className="header-actions"><span className="header-date">{headerDate}</span><div className="notification-wrap"><button className="notification" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications((visible) => !visible)}>○<i /></button>{showNotifications && <div className="notification-panel"><strong>Your training space</strong><p>{stats.streak >= 7 ? 'You unlocked a new streak badge.' : 'Complete one more workout to grow your streak.'}</p></div>}</div><button className="profile-chip" onClick={() => setView('profile')}><span>{firstName.slice(0, 2).toUpperCase()}</span>{firstName}</button></div></header>

    <main className="screen-area">
      {view === 'home' && <HomeView firstName={firstName} stats={stats} plan={plan} onStart={() => startWorkout(plan, { title: 'Upper body pull', duration: 38 })} onView={setView} />}
      {view === 'workouts' && <><GuidedWorkoutCoach plan={plan} generator={generator} setGenerator={setGenerator} planReason={planReason} isGenerating={isGenerating} onGenerate={generateWorkout} onStart={startWorkout} /><WorkoutCatalog onStart={startWorkout} /></>}
      {view === 'nutrition' && <NutritionPage session={session} />}
      {view === 'grocery' && <GroceryPage session={session} />}
      {view === 'exercises' && <ExercisesView exercises={exercises} onSelect={setSelectedExercise} />}
      {view === 'progress' && <ProgressView stats={stats} unlockedAchievements={unlockedAchievements} />}
      {view === 'profile' && <ProfileView profile={profile} setProfile={setProfile} generator={generator} setGenerator={setGenerator} stats={stats} unlockedAchievements={unlockedAchievements} reminders={reminders} setReminders={setReminders} onAuth={() => setShowAuth(true)} onLogout={logOut} />}
    </main>

    <nav className="bottom-nav" aria-label="Primary navigation">{[['home', '⌂', 'Dashboard'], ['workouts', '▦', 'Workouts'], ['nutrition', '◒', 'Nutrition'], ['grocery', '🛒', 'Grocery'], ['exercises', '◌', 'Exercises'], ['progress', '↗', 'Progress'], ['profile', '○', 'Profile']].map(([id, icon, label]) => <button className={view === id ? 'nav-link active' : 'nav-link'} key={id} onClick={() => setView(id)}><span>{icon}</span>{label}</button>)}</nav>
    {activeWorkout && <WorkoutRunner workout={activeWorkout} currentExercise={currentExercise} completedSets={completedSets} allSetsCompleted={allSetsCompleted} onSet={toggleSet} onNext={() => setActiveWorkout((current) => ({ ...current, exerciseIndex: Math.min(current.exerciseIndex + 1, current.exercises.length - 1) }))} onClose={() => setActiveWorkout(null)} />}
    {selectedExercise && <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
    {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSubmit={handleAuth} />}
    {achievementToast && <AchievementToast achievement={achievementToast} onClose={() => setAchievementToast(null)} />}
    {completionMessage && <CompletionToast message={completionMessage} onClose={() => setCompletionMessage(null)} />}
    {completionSummary && <CompletionScreen summary={completionSummary} onBack={() => { setCompletionSummary(null); setView('home') }} />}
  </div>
}

function HomeView({ firstName, stats, plan, onStart, onView }) {
  const progress = Math.round((stats.weekly.reduce((sum, day) => sum + day, 0) / 5) * 100)
  return <div className="page home-page"><div className="hero-row"><div><p className="kicker">{formatHomeDate()}</p><h1>Good morning, {firstName}<b>.</b></h1><p className="muted">Small steps today. Noticeable strength tomorrow.</p></div><button className="icon-square" onClick={() => onView('workouts')} aria-label="Create workout">+</button></div><section className="today-card"><div className="today-copy"><p className="kicker orange-text">TODAY'S WORKOUT <span className="live-pill">READY</span></p><h2>Upper body pull</h2><p>Build a stronger back and powerful arms with a focused pull session.</p><div className="workout-meta"><span>◷ 38 min</span><span>◉ {plan.length} exercises</span><span>◈ Intermediate</span></div><button className="button-primary" onClick={onStart}>Start workout <span>→</span></button></div><div className="orbital-art"><div className="orbital-ring ring-one" /><div className="orbital-ring ring-two" /><strong>{stats.streak}</strong><span>DAY STREAK</span></div></section><div className="metric-grid"><Metric label="CURRENT STREAK" value={`${stats.streak}`} unit="days" detail={`Longest: ${stats.longestStreak} days`} accent /><Metric label="WEEKLY PROGRESS" value={`${progress}`} unit="%" detail={`${stats.weekly.reduce((sum, day) => sum + day, 0)} of 5 workouts`} /><Metric label="TOTAL WORKOUTS" value={`${stats.completed}`} unit="" detail={`${stats.totalMinutes} minutes trained`} /></div><div className="home-columns"><section className="panel"><SectionTitle eyebrow="THIS WEEK" title="Your rhythm" action="View progress" onClick={() => onView('progress')} /><div className="week-bars">{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => <div key={`${day}-${index}`}><div className={stats.weekly[index] ? 'bar filled' : 'bar'} style={{ height: `${stats.weekly[index] ? 72 : 28 + index * 3}px` }} /><span>{day}</span></div>)}</div></section><section className="panel recent-panel"><SectionTitle eyebrow="KEEP MOVING" title="Recent workouts" action="See all" onClick={() => onView('progress')} />{stats.history.slice(-3).reverse().map((workout, index) => <div className="recent-row" key={workout.id}><span className="recent-icon">{index === 0 ? '↗' : '✓'}</span><div><strong>{workout.title}</strong><small>{workout.date} · {workout.duration} min</small></div><span className="chevron">›</span></div>)}{!stats.history.length && <div className="empty-state">Complete your first workout to see it here.</div>}</section></div></div>
}

function LegacyGuidedWorkoutCoach({ plan, generator, setGenerator, planReason, isGenerating, onGenerate, onStart }) {
  const [step, setStepState] = useState(1)
  const setStep = (nextStep) => {
    if (step === 2 && nextStep === 3) return
    setStepState(nextStep)
  }
  const update = (changes) => setGenerator({ ...generator, ...changes })
  const goalOptions = [['Build Muscle', '💪', 'Build size and definition'], ['Get Stronger', '⚡', 'Lift, press, and pull with purpose'], ['Calisthenics', '🤸', 'Master your bodyweight'], ['Get Fit', '🏃', 'Move more and feel better'], ['Learn a Skill', '🎯', 'Build control and confidence']]
  const experienceOptions = [['Beginner', '🟢', 'New to structured training'], ['Intermediate', '🟡', 'Ready to challenge yourself'], ['Advanced', '🔴', 'Training with intention']]
  function generate() { onGenerate(); setStep(4) }
  function regenerate() { onGenerate(); setStep(4) }
  return <div className="page coach-page"><div className="coach-page-heading"><div><p className="kicker">AI WORKOUT COACH</p><h2>{step === 4 ? 'Your personalized workout' : 'Let’s build your workout'}</h2><p className="muted">{step === 4 ? 'Built from your answers and the WorkoutAI exercise library.' : 'A few quick answers. One workout that fits your day.'}</p></div><span className="ai-badge">✦ {step}/4</span></div><div className="coach-steps">{['Goal', 'Experience', 'Time', 'Preview'].map((label, index) => <span className={step >= index + 1 ? 'coach-step active' : 'coach-step'} key={label}><i>{index + 1}</i>{label}</span>)}</div>{step === 1 && <section className="coach-question"><p className="kicker orange-text">STEP 01</p><h3>What’s your goal?</h3><div className="coach-choice-grid">{goalOptions.map(([goal, icon, description]) => <button type="button" className={generator.goal === goal ? 'coach-choice selected' : 'coach-choice'} onClick={() => update({ goal })} key={goal}><span className="coach-choice-icon">{icon}</span><span><strong>{goal}</strong><small>{description}</small></span><b>→</b></button>)}</div><button className="button-primary coach-next" disabled={!generator.goal} onClick={() => setStep(2)}>Next <span>→</span></button></section>}{step === 2 && <section className="coach-question"><button className="back-link" onClick={() => setStep(1)}>← Back</button><p className="kicker orange-text">STEP 02</p><h3>What’s your experience?</h3><div className="coach-choice-grid">{experienceOptions.map(([experience, icon, description]) => <button className={generator.experience === experience ? 'coach-choice selected' : 'coach-choice'} onClick={() => { update({ experience }); setStep(3) }} key={experience}><span className="coach-choice-icon">{icon}</span><span><strong>{experience}</strong><small>{description}</small></span><b>→</b></button>)}</div></section>}{step === 3 && <section className="coach-question"><button className="back-link" onClick={() => setStep(2)}>← Back</button><p className="kicker orange-text">STEP 03</p><h3>How much time do you have?</h3><div className="time-choice-grid">{durations.map((duration) => <button className={generator.duration === duration ? 'time-choice selected' : 'time-choice'} onClick={() => update({ duration })} key={duration}><strong>{duration}</strong><span>minutes</span></button>)}</div><button className="button-primary coach-generate" disabled={!generator.goal || !generator.experience || !generator.duration || isGenerating} onClick={generate}>{isGenerating ? 'Building your workout...' : 'Generate My Workout'} <span>{isGenerating ? '...' : '⚡'}</span></button></section>}{step === 4 && <section className="preview-section"><div className="preview-topline"><div><p className="kicker orange-text">TODAY’S WORKOUT</p><h3>Your Personalized Workout</h3></div><span className="difficulty-pill">{generator.experience}</span></div>{isGenerating ? <div className="preview-loading"><span className="loading-spinner" />Choosing the right exercises for you...</div> : <><div className="preview-meta"><span>◷ {generator.duration} min</span><span>◈ {generator.experience}</span><span>◉ {plan.length} exercises</span></div><div className="preview-exercises">{plan.map((exercise, index) => <div className="preview-exercise" key={exercise.id}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{exercise.name}</strong><small>{exercise.sets} × {exercise.reps} · {exercise.rest}s rest</small></div><b>→</b></div>)}</div><section className="why-workout"><span className="why-icon">✦</span><div><p className="kicker orange-text">WHY THIS WORKOUT?</p><p>{planReason}</p></div></section><div className="preview-actions"><button className="button-outline" onClick={regenerate}>Regenerate workout <span>↻</span></button><button className="button-primary" onClick={() => onStart(plan)}>Start Workout <span>→</span></button></div></>}</section>}</div>
}

function WorkoutsView({ plan, generator, setGenerator, planReason, isGenerating, onGenerate, onStart }) {
  const update = (changes) => setGenerator({ ...generator, ...changes })
  const toggleMuscle = (muscle) => update({ muscles: generator.muscles.includes(muscle) ? generator.muscles.filter((item) => item !== muscle) : [...generator.muscles, muscle] })
  return <div className="page"><div className="page-heading"><div><p className="kicker">PERSONALIZED FOR YOU</p><h2>Workout builder</h2><p className="muted">Tell us what you want to achieve. We'll handle the rest.</p></div><span className="ai-badge">✦ AI POWERED</span></div><form className="generator-card" onSubmit={onGenerate}><div className="form-section"><label>What's your goal?</label><div className="choice-grid">{goals.map((goal) => <button type="button" className={generator.goal === goal ? 'choice selected' : 'choice'} key={goal} onClick={() => update({ goal })}>{goal}</button>)}</div></div><div className="form-section"><label>Experience level</label><div className="choice-grid compact">{experiences.map((level) => <button type="button" className={generator.experience === level ? 'choice selected' : 'choice'} key={level} onClick={() => update({ experience: level })}>{level}</button>)}</div></div><div className="form-section"><label>Preferred training style</label><div className="choice-grid style-grid">{trainingStyles.map((style) => <button type="button" className={generator.style === style ? 'choice selected' : 'choice'} key={style} onClick={() => update({ style })}>{style}</button>)}</div></div><div className="form-section"><label>Which muscle groups do you want to train?</label><div className="muscle-grid">{muscleGroups.map((muscle) => <button type="button" className={generator.muscles.includes(muscle) ? 'muscle selected' : 'muscle'} key={muscle} onClick={() => toggleMuscle(muscle)}>{generator.muscles.includes(muscle) ? '✓ ' : ''}{muscle}</button>)}</div></div><div className="form-row"><div className="form-section"><label>Equipment</label><select value={generator.equipment} onChange={(event) => update({ equipment: event.target.value })}>{equipmentOptions.map((item) => <option key={item}>{item}</option>)}</select></div><div className="form-section"><label>Workout time</label><div className="duration-row">{durations.map((duration) => <button type="button" className={generator.duration === duration ? 'duration selected' : 'duration'} key={duration} onClick={() => update({ duration })}>{duration}<small>min</small></button>)}</div></div></div><button className="button-primary generate-button" type="submit" disabled={isGenerating}>{isGenerating ? 'Building your plan...' : 'Generate my workout'} <span>{isGenerating ? '...' : '✦'}</span></button></form><section className="why-workout"><span className="why-icon">✦</span><div><p className="kicker orange-text">WHY THIS WORKOUT?</p><p>{planReason}</p></div></section><div className="plan-heading"><div><p className="kicker">YOUR NEXT SESSION</p><h3>{plan.length}-exercise {generator.goal.toLowerCase()} plan</h3></div><button className="button-outline" type="button" onClick={() => onStart(plan)}>Start plan <span>→</span></button></div><div className="exercise-plan-list">{plan.map((exercise, index) => <div className="plan-exercise" key={exercise.id}><span className="exercise-number">0{index + 1}</span><div><strong>{exercise.name}</strong><small>{exercise.category} · {exercise.sets} sets × {exercise.reps} · {exercise.rest}s rest</small></div><span className="exercise-arrow">→</span></div>)}</div><div className="preset-heading"><div><p className="kicker">READY WHEN YOU ARE</p><h3>More ways to train</h3></div><span className="muted">Curated sessions</span></div><div className="preset-grid">{workoutPresets.map((preset) => <article className={`preset-card ${preset.color}`} key={preset.title}><div className="preset-art"><span>✦</span></div><div className="preset-copy"><p>{preset.duration} · {preset.level}</p><h3>{preset.title}</h3><span>{preset.goal}</span><button type="button" onClick={() => onStart(preset.items, { title: preset.title, duration: Number.parseInt(preset.duration, 10) })}>Start workout <b>→</b></button></div></article>)}</div></div>
}

function WorkoutCatalog({ onStart }) {
  const [category, setCategory] = useState('No Equipment')
  const [query, setQuery] = useState('')
  const visiblePlans = workoutCatalog[category].filter((title) => title.toLowerCase().includes(query.toLowerCase()))
  return <section className="catalog-section"><div className="catalog-heading"><div><p className="kicker">EXPLORE PLANS</p><h3>More ways to train</h3><p className="muted">Every plan uses exercises from your library and opens the real workout tracker.</p></div><span className="library-count">{visiblePlans.length} plans</span></div><div className="catalog-tools"><div className="search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plans..." aria-label="Search workout plans" /></div><div className="category-scroll catalog-tabs">{Object.keys(workoutCatalog).map((item) => <button className={category === item ? 'category active' : 'category'} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div>{visiblePlans.length ? <div className="catalog-grid">{visiblePlans.map((title) => <article className="catalog-card" key={title}><div><span className="catalog-icon">✦</span><div><h4>{title}</h4><p>{catalogPlan(title).length} exercises · Library plan</p></div></div><button className="catalog-start" onClick={() => onStart(catalogPlan(title), { title, duration: title.match(/(10|15|20|30|45|60)-Minute|(15|20|30|45|60)/)?.[1] || 30 })}>Start <span>→</span></button></article>)}</div> : <div className="catalog-empty">No plans match that search. Try another name or category.</div>}</section>
}

function ExercisesView({ exercises: allExercises, onSelect }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Calisthenics']
  const filtered = allExercises.filter((exercise) => exercise.name.toLowerCase().includes(query.toLowerCase()) && (category === 'All' || exercise.category === category))
  return <div className="page"><div className="page-heading"><div><p className="kicker">MOVE BETTER</p><h2>Exercise library</h2><p className="muted">Find your next favorite movement.</p></div><span className="library-count">{filtered.length} exercises</span></div><div className="search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exercises..." /></div><div className="category-scroll">{categories.map((item) => <button className={category === item ? 'category active' : 'category'} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><div className="library-grid">{filtered.map((exercise) => <button className="library-card" key={exercise.id} onClick={() => onSelect(exercise)}><div className={`exercise-art art-${exercise.category.toLowerCase()}`}><span>{exercise.category === 'Core' ? '◉' : exercise.category === 'Legs' ? '⌁' : '↗'}</span></div><div className="library-card-copy"><div><span className="difficulty">{exercise.difficulty}</span><span className="library-category">{exercise.category}</span></div><h3>{exercise.name}</h3><p>{exercise.sets} sets · {exercise.reps}</p></div><span className="card-chevron">›</span></button>)}</div></div>
}

function ProgressView({ stats, unlockedAchievements }) {
  const chart = stats.weekly.map((completed, index) => completed ? 72 + (index % 3) * 8 : 22 + index * 3)
  const streakTarget = stats.streak < 7 ? 7 : stats.streak < 30 ? 30 : 100
  const milestoneRemaining = Math.max(streakTarget - stats.streak, 0)
  return <div className="page"><div className="page-heading"><div><p className="kicker">YOUR DATA</p><h2>Progress</h2><p className="muted">Consistency is the real superpower.</p></div><span className="period-chip">This week</span></div><div className="progress-stats"><Metric label="WORKOUTS COMPLETED" value={stats.completed} unit="" detail="All-time total" accent /><Metric label="CURRENT STREAK" value={stats.streak} unit=" days" detail="Keep it going" /><Metric label="TOTAL TIME" value={Math.round(stats.totalMinutes / 60)} unit=" hrs" detail="In the zone" /></div><section className="chart-card"><div className="chart-heading"><div><p className="kicker">WEEKLY ACTIVITY</p><h3>You're building momentum</h3></div><strong>{stats.weekly.filter(Boolean).length}/5 complete</strong></div><div className="chart"><div className="chart-grid"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-bars">{chart.map((height, index) => <div className="chart-bar-wrap" key={`${height}-${index}`}><div className="chart-bar" style={{ height: `${height}%` }} /><span>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span></div>)}</div></div></section><section className="achievement"><span className="achievement-icon">✦</span><div><p className="kicker">NEXT MILESTONE</p><h3>{milestoneRemaining ? `${milestoneRemaining} more day${milestoneRemaining === 1 ? '' : 's'} to reach a ${streakTarget}-day streak` : 'Streak milestone reached'}</h3><div className="milestone-track"><span style={{ width: `${Math.min(stats.streak / streakTarget * 100, 100)}%` }} /></div></div><strong>{stats.streak}/{streakTarget}</strong></section><section className="achievements-section"><div className="section-title"><div><p className="kicker">KEEP SHOWING UP</p><h3>Achievements</h3></div><span className="achievement-count">{unlockedAchievements.length}/{achievementDefinitions.length} unlocked</span></div><div className="achievement-grid">{achievementDefinitions.map((achievement) => <AchievementCard key={achievement.id} achievement={achievement} unlocked={unlockedAchievements.includes(achievement.id)} />)}</div></section></div>
}

function ProfileView({ profile, setProfile, generator, setGenerator, stats, unlockedAchievements, reminders, setReminders, onAuth, onLogout }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState({ name: profile.name, goal: profile.goal, experience: generator.experience, duration: generator.duration, equipment: generator.equipment, style: generator.style })
  const saveProfile = (event) => {
    event.preventDefault()
    setProfile({ ...profile, name: draft.name.trim() || profile.name, goal: draft.goal })
    setGenerator({ ...generator, goal: draft.goal, experience: draft.experience, duration: draft.duration, equipment: draft.equipment, style: draft.style })
    setEditing(false)
  }
  const achievementPreview = achievementDefinitions.filter((achievement) => unlockedAchievements.includes(achievement.id)).slice(0, 4)
  return <div className="page profile-page"><div className="profile-topline"><div><p className="kicker">YOUR SPACE</p><h2>Profile</h2><p className="muted">Make your training feel like yours.</p></div><button className="button-primary edit-profile-button" onClick={() => setEditing((open) => !open)}>{editing ? 'Close editor' : 'Edit profile'} <span>{editing ? '×' : '↗'}</span></button></div><section className="profile-hero profile-card"><div className="large-avatar">{profile.name.slice(0, 2).toUpperCase()}</div><div><p className="kicker orange-text">WORKOUTAI MEMBER</p><h2>{profile.name}</h2><p className="muted">{profile.email || 'Authenticated member'} · {profile.goal}</p></div><div className="profile-hero-stats"><div><strong>{stats.streak}</strong><span>day streak</span></div><div><strong>{stats.completed}</strong><span>workouts</span></div></div></section>{editing ? <form className="profile-editor" onSubmit={saveProfile}><div className="editor-heading"><div><p className="kicker">PERSONAL DETAILS</p><h3>Edit your training profile</h3></div><span className="saved-note">Saved on this device</span></div><label>Profile name<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></label><div className="profile-form-grid"><label>Fitness goal<select value={draft.goal} onChange={(event) => setDraft({ ...draft, goal: event.target.value })}>{goals.map((goal) => <option key={goal}>{goal}</option>)}</select></label><label>Experience level<select value={draft.experience} onChange={(event) => setDraft({ ...draft, experience: event.target.value })}>{experiences.map((level) => <option key={level}>{level}</option>)}</select></label><label>Preferred duration<select value={draft.duration} onChange={(event) => setDraft({ ...draft, duration: Number(event.target.value) })}>{durations.map((duration) => <option value={duration} key={duration}>{duration} minutes</option>)}</select></label><label>Equipment<select value={draft.equipment} onChange={(event) => setDraft({ ...draft, equipment: event.target.value })}>{equipmentOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label>Favorite training style<select value={draft.style} onChange={(event) => setDraft({ ...draft, style: event.target.value })}>{trainingStyles.map((style) => <option key={style}>{style}</option>)}</select></label></div><button className="button-primary save-profile-button" type="submit">Save changes <span>✓</span></button></form> : <><section className="profile-details"><ProfileDetail label="Fitness goal" value={profile.goal} icon="◎" /><ProfileDetail label="Experience level" value={generator.experience} icon="↗" /><ProfileDetail label="Preferred duration" value={`${generator.duration} minutes`} icon="◷" /><ProfileDetail label="Equipment" value={generator.equipment} icon="◇" /><ProfileDetail label="Favorite training style" value={generator.style} icon="✦" /><button className="profile-detail reminder-detail" onClick={() => setReminders((enabled) => !enabled)}><span className="detail-icon">◌</span><span><small>Reminders</small><strong>{reminders ? 'Workout reminders on' : 'Workout reminders off'}</strong></span><span className={reminders ? 'toggle on' : 'toggle'} /></button></section><section className="profile-achievements"><div className="profile-section-heading"><div><p className="kicker">MILESTONES</p><h3>Achievements</h3></div><span>{unlockedAchievements.length}/{achievementDefinitions.length} unlocked</span></div><div className="profile-badges">{achievementPreview.map((achievement) => <div className="profile-badge" key={achievement.id}><span>{achievement.icon}</span><small>{achievement.title}</small></div>)}{!achievementPreview.length && <p className="muted">Complete your first workout to unlock a badge.</p>}</div></section><button className="sign-out" onClick={onLogout}>Log out</button></>}</div>
}

function ProfileDetail({ label, value, icon }) { return <div className="profile-detail"><span className="detail-icon">{icon}</span><span><small>{label}</small><strong>{value}</strong></span></div> }

function WorkoutRunner({ workout, currentExercise, completedSets, allSetsCompleted, onSet, onNext, onFinish, onClose }) {
  const [seconds, setSeconds] = useState(0)
  const [restSeconds, setRestSeconds] = useState(0)
  const [showCameraCoach, setShowCameraCoach] = useState(false)
  const totalSets = currentExercise.sets
  const isLast = workout.exerciseIndex === workout.exercises.length - 1
  const currentSet = Array.from({ length: totalSets }).findIndex((_, index) => !completedSets.includes(`${workout.exerciseIndex}-${index}`))
  useEffect(() => { const timer = setInterval(() => setSeconds((value) => value + 1), 1000); return () => clearInterval(timer) }, [])
  useEffect(() => { if (!restSeconds) return undefined; const timer = setInterval(() => setRestSeconds((value) => Math.max(value - 1, 0)), 1000); return () => clearInterval(timer) }, [restSeconds])
  function handleSet(index) { onSet(index); setRestSeconds(currentExercise.rest) }
  const completedCount = completedSets.length
  const totalSetCount = workout.exercises.reduce((total, exercise) => total + exercise.sets, 0)
  return <div className="runner-backdrop"><section className="runner" role="dialog" aria-modal="true" aria-labelledby="runner-title"><header className="runner-header"><button className="close-runner" onClick={onClose} aria-label="Exit workout">×</button><div><p className="kicker">WORKOUT IN PROGRESS</p><strong id="runner-title">{workout.title}</strong></div><span>{workout.exerciseIndex + 1}/{workout.exercises.length}</span></header><div className="runner-progress"><span style={{ width: `${(completedCount / totalSetCount) * 100}%` }} /></div><div className="runner-body"><p className="kicker orange-text">EXERCISE {String(workout.exerciseIndex + 1).padStart(2, '0')}</p><h2>{currentExercise.name}</h2><p className="runner-instruction">{currentExercise.instructions}</p><div className="runner-target"><div><small>SETS COMPLETE</small><strong>{completedCount}/{totalSetCount}</strong></div><div><small>REST</small><strong>{currentExercise.rest}s</strong></div><div><small>{restSeconds ? 'REST TIMER' : 'WORKOUT TIMER'}</small><strong>{restSeconds ? `${Math.floor(restSeconds / 60)}:${String(restSeconds % 60).padStart(2, '0')}` : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}</strong></div></div>{restSeconds > 0 && <button className="skip-rest" onClick={() => setRestSeconds(0)}>Skip rest</button>}{currentExercise.name.toLowerCase().includes('squat') && currentSet >= 0 && <button className="form-coach-launch" onClick={() => setShowCameraCoach(true)}>◉ Open AI Form Coach <span>Squats</span></button>}<div className="set-list">{Array.from({ length: totalSets }).map((_, index) => { const checked = completedSets.includes(`${workout.exerciseIndex}-${index}`); return <button className={checked ? 'set-row checked' : 'set-row'} onClick={() => handleSet(index)} key={index}><span className="set-check">{checked ? '✓' : index + 1}</span><span>Set {index + 1}</span><strong>{currentExercise.reps}</strong><span className="set-status">{checked ? 'DONE' : 'COMPLETE SET'}</span></button> })}</div></div><footer className="runner-footer">{isLast ? <p className="runner-auto-complete">{allSetsCompleted ? 'All sets logged. Finishing workout...' : `${totalSetCount - completedCount} sets remaining`}</p> : <button className="button-primary" disabled={!Array.from({ length: totalSets }).every((_, index) => completedSets.includes(`${workout.exerciseIndex}-${index}`))} onClick={onNext}>{Array.from({ length: totalSets }).every((_, index) => completedSets.includes(`${workout.exerciseIndex}-${index}`)) ? 'Next Exercise' : 'Complete all sets'} <span>→</span></button>}</footer></section>{showCameraCoach && <CameraFormCoach targetReps={Number.parseInt(currentExercise.reps, 10) || 10} currentSet={currentSet} onSet={(setIndex) => { handleSet(setIndex); setShowCameraCoach(false) }} onClose={() => setShowCameraCoach(false)} />}</div>
}

function ExerciseModal({ exercise, onClose }) { return <div className="modal-backdrop" onClick={onClose}><section className="exercise-modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={onClose}>×</button><div className={`exercise-modal-art art-${exercise.category.toLowerCase()}`}><span>↗</span></div><p className="kicker orange-text">{exercise.category} · {exercise.difficulty}</p><h2>{exercise.name}</h2><p>{exercise.description}</p><div className="detail-stats"><span><strong>{exercise.sets}</strong> sets</span><span><strong>{exercise.reps}</strong> reps</span><span><strong>{exercise.rest}s</strong> rest</span></div><h3>How to do it</h3><p className="instruction-copy">{exercise.instructions}</p></section></div> }

function AuthModal({ onClose, onSubmit }) { return <div className="modal-backdrop" onClick={onClose}><section className="auth-modal" onClick={(event) => event.stopPropagation()}><button className="close-button" onClick={onClose}>×</button><div className="auth-brand"><span className="logo-symbol">W</span>workout<span className="orange-text">ai</span></div><p className="kicker">WELCOME TO WORKOUTAI</p><h2>Keep your momentum.</h2><p className="muted">Log in to save your workouts and keep your plan synced.</p><form onSubmit={onSubmit} className="auth-form"><label>Name or email<input name="name" required placeholder="Jordan or you@example.com" /></label><label>Password<input name="password" required type="password" placeholder="Your password" /></label><button className="button-primary" type="submit">Continue <span>→</span></button></form><small className="auth-note">Your progress is saved securely on this device.</small></section></div> }

function AchievementCard({ achievement, unlocked }) { return <article className={unlocked ? 'achievement-card unlocked' : 'achievement-card locked'}><span className="badge-icon">{unlocked ? achievement.icon : '·'}</span><div><h4>{achievement.title}</h4><p>{unlocked ? 'Unlocked' : achievement.description}</p></div><span className="badge-state">{unlocked ? '✓' : 'LOCKED'}</span></article> }
function AchievementToast({ achievement, onClose }) { return <div className="achievement-toast" role="status"><span className="toast-badge">{achievement.icon}</span><div><p className="kicker">ACHIEVEMENT UNLOCKED</p><strong>{achievement.title}</strong><span>You showed up and made it happen.</span></div><button onClick={onClose} aria-label="Dismiss achievement notification">×</button></div> }
function CompletionToast({ message, onClose }) { return <div className="completion-toast" role="status"><span className="completion-check">✓</span><div><strong>{message.title}</strong><span>{message.detail}</span></div><button onClick={onClose} aria-label="Dismiss completion notification">×</button></div> }
function CompletionScreen({ summary, onBack }) { return <div className="completion-screen"><div className="completion-glow" /><section className="completion-card"><div className="completion-celebration">🎉</div><p className="kicker orange-text">WORKOUT COMPLETE</p><h1>Great work!</h1><p className="completion-copy">You completed {summary.workout.sets} sets in {summary.workout.duration} minutes. That work counts.</p><div className="completion-metrics"><div><strong>{summary.workout.exercises}</strong><span>Exercises</span></div><div><strong>{summary.workout.sets}</strong><span>Sets logged</span></div><div><strong>{summary.workout.duration}</strong><span>Minutes</span></div></div><div className="completion-rewards"><span>🔥 +{summary.workout.xp} XP</span><span>🔥 {summary.stats.streak} Day Streak</span></div>{summary.achievements.length > 0 && <div className="new-achievements"><p className="kicker">NEW ACHIEVEMENT{summary.achievements.length > 1 ? 'S' : ''}</p>{summary.achievements.map((achievement) => <div key={achievement.id}><b>{achievement.icon}</b><strong>{achievement.title}</strong><span>Unlocked</span></div>)}</div>}<button className="button-primary completion-back" onClick={onBack}>Back to Dashboard <span>→</span></button></section></div> }

function Metric({ label, value, unit, detail, accent }) { return <div className={accent ? 'metric accent' : 'metric'}><p>{label}</p><strong>{value}<small>{unit}</small></strong><span>{detail}</span></div> }
function SectionTitle({ eyebrow, title, action, onClick }) { return <div className="section-title"><div><p className="kicker">{eyebrow}</p><h3>{title}</h3></div><button onClick={onClick}>{action} <span>→</span></button></div> }

export default App
