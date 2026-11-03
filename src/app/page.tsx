'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dumbbell,
  Activity,
  BarChart3,
  HeartPulse,
  ShieldCheck,
  Timer,
  Bike,
  Footprints,
  Scale,
  Bell,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  LogIn,
  LogOut,
  Cloud,
  Smartphone,
  Search,
  Info,
  Calendar,
} from 'lucide-react';
import {
  EXERCISES,
  GOAL_LABELS,
  LEVEL_LABELS,
  CATEGORY_LABELS,
  DAY_TYPE_LABELS,
  generatePlanForGoalAndLevel,
  getInitialSeedData,
  type ExerciseCategory,
  type TrainingGoal,
  type FitnessLevel,
  type DayPlanType,
  type TrainingPlan,
  type StrengthLogEntry,
  type CardioLogEntry,
  type WeightLogEntry,
  type ExerciseDefinition,
  type AnimationPose,
} from '@/data/exercises';
import { ExerciseAnimation } from '@/components/ExerciseAnimation';
import { CountdownTimer } from '@/components/CountdownTimer';
import { InteractiveLineChart, type ChartDataPoint } from '@/components/InteractiveLineChart';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  type User,
} from '@/lib/supabase';

type MainTab = 'pillar1' | 'pillar2' | 'pillar3';
type Pillar1SubTab = 'plan' | 'library';
type Pillar2SubTab = 'strength' | 'cardio' | 'weight';
type DashboardDomain = 'kraft' | 'ausdauer' | 'gewicht';
type TimeRangePreset = '7d' | '30d' | '90d' | '365d' | 'all' | 'custom';

const STORAGE_KEYS = {
  plan: 'fitpulse_weekly_plan_v2',
  strengthLogs: 'fitpulse_strength_logs_v1',
  cardioLogs: 'fitpulse_cardio_logs_v1',
  weightLogs: 'fitpulse_weight_logs_v1',
  reminderEnabled: 'fitpulse_sunday_reminder_v1',
  customExercises: 'fitpulse_custom_exercises_v1',
};

const PRESET_MUSCLE_TAGS = [
  'Quadrizeps',
  'Gesäß (Gluteus)',
  'Beinbizeps (Hamstrings)',
  'Waden',
  'Brust',
  'Oberer Rücken',
  'Latissimus',
  'Unterer Rücken',
  'Vordere & seitliche Schulter',
  'Hintere Schulter',
  'Bizeps',
  'Trizeps',
  'Unterarme & Griffkraft',
  'Core & Bauchmuskeln',
  'Schräge Bauchmuskeln',
  'Hüftbeuger (Iliopsoas)',
  'Nacken & Trapez',
  'Ganzkörper / Herz-Kreislauf',
];

const PRESET_EQUIPMENT_TAGS = [
  'Ohne Geräte',
  'Kurzhanteln',
  'Langhantel',
  'Kabelzug',
  'Maschine',
  'Klimmzugstange',
  'Kettlebell',
  'Widerstandsband',
  'Ohne Geräte (Matte)',
  'Ohne Geräte (Wand)',
];

const ANIMATION_POSE_OPTIONS: { id: AnimationPose; label: string }[] = [
  { id: 'wall_sit', label: 'Wandsitz (Wall Sit)' },
  { id: 'plank', label: 'Unterarmstütz (Plank)' },
  { id: 'side_plank', label: 'Seitstütz (Side Plank)' },
  { id: 'glute_bridge_hold', label: 'Beckenheben / Glute Bridge' },
  { id: 'hollow_hold', label: 'Hollow Body Hold' },
  { id: 'superman_hold', label: 'Rückenstrecker / Superman' },
  { id: 'iso_squat_hold', label: 'Kniebeuge (Air / Iso Squat)' },
  { id: 'barbell_squat', label: 'Langhantel-Kniebeuge' },
  { id: 'leg_press', label: 'Beinpresse / Beinmaschine' },
  { id: 'deadlift', label: 'Kreuzheben (Deadlift)' },
  { id: 'bench_press', label: 'Bankdrücken (Bench Press)' },
  { id: 'shoulder_press', label: 'Schulterdrücken (Overhead Press)' },
  { id: 'lat_pulldown', label: 'Latzug (Lat Pulldown)' },
  { id: 'seated_row', label: 'Rudern (Seated / Cable Row)' },
  { id: 'bicep_curl', label: 'Bizeps-Curls / Kurzhanteln' },
  { id: 'pushup', label: 'Liegestütze (Push-Ups)' },
  { id: 'pullup', label: 'Klimmzüge (Pull-Ups)' },
  { id: 'dips', label: 'Stütz-Dips (Dips)' },
  { id: 'lunge', label: 'Ausfallschritte (Lunges)' },
  { id: 'mountain_climber', label: 'Mountain Climbers' },
  { id: 'dead_hang', label: 'Aushängen (Dead Hang)' },
  { id: 'l_sit', label: 'L-Sit Hold' },
  { id: 'calf_hold', label: 'Wadenheben (Calf Raise / Hold)' },
  { id: 'handgrip_iso', label: 'Isometrische Handkraft (Grip)' },
  { id: 'hip_flexor_stretch', label: 'Hüftbeuger-Dehnung' },
  { id: 'hamstring_stretch', label: 'Beinrückseiten-Dehnung' },
  { id: 'pigeon_stretch', label: 'Taube-Dehnung (Gesäß)' },
  { id: 'cat_cow', label: 'Katze-Kuh / Vierfüßler' },
  { id: 'chest_opener', label: 'Brust- & Schulteröffner' },
  { id: 'childs_pose', label: 'Kindeshaltung (Child’s Pose)' },
];

export default function FitPulseApp() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<MainTab>('pillar1');
  const [p1SubTab, setP1SubTab] = useState<Pillar1SubTab>('plan');
  const [p2SubTab, setP2SubTab] = useState<Pillar2SubTab>('strength');

  // Determine current weekday index (0 = Monday ... 6 = Sunday)
  const todayWeekdayIndex = useMemo(() => {
    const jsDay = new Date().getDay(); // 0 = Sun, 1 = Mon ...
    return jsDay === 0 ? 6 : jsDay - 1;
  }, []);

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Set default selected day to today after mount
  useEffect(() => {
    setSelectedDayIndex(todayWeekdayIndex);
  }, [todayWeekdayIndex]);

  // Data State (initialized with 7-day weekly plan & 12-week history)
  const [plan, setPlan] = useState<TrainingPlan>(() =>
    generatePlanForGoalAndLevel('blutdruck', 'fortgeschritten')
  );
  const [customExercises, setCustomExercises] = useState<ExerciseDefinition[]>([]);
  const [strengthLogs, setStrengthLogs] = useState<StrengthLogEntry[]>([]);
  const [cardioLogs, setCardioLogs] = useState<CardioLogEntry[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLogEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Combined Exercise List (User's Custom Exercises + Built-in Exercises)
  const allExercises = useMemo(
    () => [...customExercises, ...EXERCISES],
    [customExercises]
  );

  // Custom Exercise Creator Modal State
  const [showCreateExerciseModal, setShowCreateExerciseModal] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExCategory, setNewExCategory] = useState<ExerciseCategory>('geraete');
  const [newExEquipment, setNewExEquipment] = useState('Kurzhanteln');
  const [newExIsTimed, setNewExIsTimed] = useState(false);
  const [newExDefaultSets, setNewExDefaultSets] = useState(3);
  const [newExDefaultWeightKg, setNewExDefaultWeightKg] = useState(15);
  const [newExDefaultReps, setNewExDefaultReps] = useState(12);
  const [newExDefaultSeconds, setNewExDefaultSeconds] = useState(45);
  const [newExRestSeconds, setNewExRestSeconds] = useState(60);
  const [newExGoals, setNewExGoals] = useState<TrainingGoal[]>(['muskelaufbau', 'fit_im_alter']);
  const [newExLevels, setNewExLevels] = useState<FitnessLevel[]>([
    'anfaenger',
    'fortgeschritten',
    'profi',
  ]);
  const [newExMuscles, setNewExMuscles] = useState<string[]>([
    'Vordere & seitliche Schulter',
  ]);
  const [newExCustomMuscleInput, setNewExCustomMuscleInput] = useState('');
  const [newExDescription, setNewExDescription] = useState('');
  const [newExInstructionsText, setNewExInstructionsText] = useState(
    'Aufrecht und stabil positionieren, Rumpf leicht anspannen.\nBewegung kontrolliert über den vollen Bewegungsradius ausführen.\nOhne Schwung langsam in die Ausgangsposition zurückkehren.'
  );
  const [newExBreathingTip, setNewExBreathingTip] = useState(
    'Bei der Anstrengung ruhig ausatmen, beim Nachgeben einatmen (Pressatmung vermeiden).'
  );
  const [newExAnimationPose, setNewExAnimationPose] =
    useState<AnimationPose>('shoulder_press');
  const [newExAddToSelectedDay, setNewExAddToSelectedDay] = useState(true);

  // Auth & Cloud Sync State (Einstiegsseite + Multi-User Support für dich & deine Freundin)
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authDisplayName, setAuthDisplayName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'local' | 'syncing' | 'synced'>('local');
  const [cloudDataLoadedForUser, setCloudDataLoadedForUser] = useState<string | null>(null);

  // Sunday Weight Reminder State
  const [sundayReminderEnabled, setSundayReminderEnabled] = useState(true);
  const [showSundayModal, setShowSundayModal] = useState(false);

  // Pillar 1: Library Filter & Exercise Detail Modal
  const [categoryFilter, setCategoryFilter] = useState<ExerciseCategory | 'alle'>('alle');
  const [goalFilter, setGoalFilter] = useState<TrainingGoal | 'alle'>('alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDetailExercise, setSelectedDetailExercise] =
    useState<ExerciseDefinition | null>(null);
  const [addExerciseIdToPlan, setAddExerciseIdToPlan] = useState<string>(EXERCISES[0].id);

  // Pillar 2: Strength / Isometric Tracker State
  const [trackedExerciseId, setTrackedExerciseId] = useState<string>('iso-wall-sit');
  const [inputWeightKg, setInputWeightKg] = useState<number>(5);
  const [inputSets, setInputSets] = useState<number>(4);
  const [inputReps, setInputReps] = useState<number>(1);
  const [inputSeconds, setInputSeconds] = useState<number>(120);
  const [inputRestSeconds, setInputRestSeconds] = useState<number>(90);
  const [inputDate, setInputDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [inputNotes, setInputNotes] = useState<string>('');
  const [prefillBanner, setPrefillBanner] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Pillar 2: Cardio Tracker State
  const [cardioDiscipline, setCardioDiscipline] = useState<'laufen' | 'radfahren'>('laufen');
  const [cardioDistanceKm, setCardioDistanceKm] = useState<number>(6.5);
  const [cardioDurationMin, setCardioDurationMin] = useState<number>(36);
  const [cardioElevationM, setCardioElevationM] = useState<number>(80);
  const [cardioDate, setCardioDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [cardioNotes, setCardioNotes] = useState<string>('');

  // Pillar 2: Weight & BP Tracker State
  const [weightKgInput, setWeightKgInput] = useState<number>(81.5);
  const [systolicInput, setSystolicInput] = useState<number>(122);
  const [diastolicInput, setDiastolicInput] = useState<number>(78);
  const [weightDate, setWeightDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );

  // Pillar 3: Interactive Dashboard State
  const [dashboardDomain, setDashboardDomain] = useState<DashboardDomain>('kraft');
  const [timeRange, setTimeRange] = useState<TimeRangePreset>('90d');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() =>
    new Date().toISOString().split('T')[0]
  );
  const [chartExerciseId, setChartExerciseId] = useState<string>('iso-wall-sit');
  const [chartStrengthMetric, setChartStrengthMetric] = useState<
    'auto' | 'seconds' | 'weight' | 'volume'
  >('auto');
  const [chartCardioDiscipline, setChartCardioDiscipline] = useState<'laufen' | 'radfahren'>(
    'laufen'
  );
  const [chartCardioMetric, setChartCardioMetric] = useState<
    'distance' | 'pace_speed' | 'duration' | 'elevation'
  >('distance');
  const [chartWeightMetric, setChartWeightMetric] = useState<'weight' | 'bp'>('weight');

  // Track manual check-offs for daily plan items in addition to logged workouts on inputDate
  const [manualCheckedMap, setManualCheckedMap] = useState<Record<string, boolean>>({});

  // Scoped storage key helper so multiple accounts (e.g. you & your girlfriend) never mix local cache
  const getScopedKey = useCallback(
    (baseKey: string, uid?: string | null) => {
      const scope = uid || user?.id || 'guest';
      return `${baseKey}_${scope}`;
    },
    [user?.id]
  );

  // Load local data for a specific scope (guest or user.id)
  const loadLocalScopeData = useCallback((uid?: string | null) => {
    try {
      const seed = getInitialSeedData();
      const scope = uid || 'guest';
      const savedPlan = localStorage.getItem(`${STORAGE_KEYS.plan}_${scope}`);
      const savedCustomEx = localStorage.getItem(`${STORAGE_KEYS.customExercises}_${scope}`);
      const savedStrength = localStorage.getItem(`${STORAGE_KEYS.strengthLogs}_${scope}`);
      const savedCardio = localStorage.getItem(`${STORAGE_KEYS.cardioLogs}_${scope}`);
      const savedWeight = localStorage.getItem(`${STORAGE_KEYS.weightLogs}_${scope}`);
      const savedChecked = localStorage.getItem(`fitpulse_checked_map_v1_${scope}`);
      const savedReminder = localStorage.getItem(STORAGE_KEYS.reminderEnabled);

      setCustomExercises(savedCustomEx ? JSON.parse(savedCustomEx) : []);
      setManualCheckedMap(savedChecked ? JSON.parse(savedChecked) : {});

      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed && Array.isArray(parsed.days) && parsed.days.length === 7) {
          setPlan(parsed);
        } else {
          setPlan(generatePlanForGoalAndLevel('blutdruck', 'fortgeschritten'));
        }
      } else {
        setPlan(generatePlanForGoalAndLevel('blutdruck', 'fortgeschritten'));
      }

      setStrengthLogs(savedStrength ? JSON.parse(savedStrength) : seed.strengthLogs);
      setCardioLogs(savedCardio ? JSON.parse(savedCardio) : seed.cardioLogs);
      setWeightLogs(savedWeight ? JSON.parse(savedWeight) : seed.weightLogs);
      if (savedReminder !== null) setSundayReminderEnabled(savedReminder === 'true');
    } catch {
      const seed = getInitialSeedData();
      setStrengthLogs(seed.strengthLogs);
      setCardioLogs(seed.cardioLogs);
      setWeightLogs(seed.weightLogs);
    } finally {
      setHydrated(true);
    }
  }, []);

  // Load user's personal data from Supabase Cloud (isolated via RLS auth.uid() = user_id)
  const loadUserCloudData = useCallback(
    async (activeUser: User) => {
      // First load any cached local state for this user ID for instant UI response
      loadLocalScopeData(activeUser.id);

      const client = getSupabaseClient();
      if (!client) return;

      setSyncStatus('syncing');
      try {
        const [planRes, strengthRes, cardioRes, weightRes] = await Promise.all([
          client
            .from('training_plans')
            .select('*')
            .eq('user_id', activeUser.id)
            .maybeSingle(),
          client
            .from('strength_logs')
            .select('*')
            .eq('user_id', activeUser.id)
            .order('performed_at', { ascending: false }),
          client
            .from('cardio_logs')
            .select('*')
            .eq('user_id', activeUser.id)
            .order('performed_at', { ascending: false }),
          client
            .from('weight_logs')
            .select('*')
            .eq('user_id', activeUser.id)
            .order('measured_at', { ascending: false }),
        ]);

        if (planRes.data) {
          const row = planRes.data;
          if (Array.isArray(row.exercises) && row.exercises.length === 7) {
            setPlan({
              id: row.id,
              name: row.name || '7-Tage Wochenplan',
              goal: (row.goal as TrainingGoal) || 'blutdruck',
              level: (row.level as FitnessLevel) || 'fortgeschritten',
              description: row.description || '',
              autoProgression: Boolean(row.auto_progression ?? true),
              days: row.exercises,
              updatedAt: row.updated_at || new Date().toISOString(),
            });
          }
          if (Array.isArray(row.custom_exercises)) {
            setCustomExercises(row.custom_exercises);
          }
          if (row.checked_map && typeof row.checked_map === 'object') {
            setManualCheckedMap(row.checked_map as Record<string, boolean>);
          }
        }

        if (strengthRes.data && strengthRes.data.length > 0) {
          setStrengthLogs(
            strengthRes.data.map((r) => ({
              id: r.id,
              exerciseId: r.exercise_id,
              exerciseName: r.exercise_name,
              category: r.category as ExerciseCategory,
              weightKg: Number(r.weight_kg) || 0,
              sets: Number(r.sets) || 3,
              reps: Number(r.reps) || 0,
              durationSeconds: Number(r.duration_seconds) || 0,
              restSeconds: Number(r.rest_seconds) || 60,
              performedAt: String(r.performed_at).split('T')[0],
              notes: r.notes || undefined,
            }))
          );
        }

        if (cardioRes.data && cardioRes.data.length > 0) {
          setCardioLogs(
            cardioRes.data.map((r) => ({
              id: r.id,
              discipline: r.discipline as 'laufen' | 'radfahren',
              distanceKm: Number(r.distance_km) || 0,
              durationMinutes: Number(r.duration_minutes) || 0,
              elevationMeters: Number(r.elevation_meters) || 0,
              performedAt: String(r.performed_at).split('T')[0],
              notes: r.notes || undefined,
            }))
          );
        }

        if (weightRes.data && weightRes.data.length > 0) {
          setWeightLogs(
            weightRes.data.map((r) => ({
              id: r.id,
              weightKg: Number(r.weight_kg) || 80,
              systolicBp: r.systolic_bp ? Number(r.systolic_bp) : undefined,
              diastolicBp: r.diastolic_bp ? Number(r.diastolic_bp) : undefined,
              measuredAt: String(r.measured_at).split('T')[0],
              notes: r.notes || undefined,
            }))
          );
        }

        setCloudDataLoadedForUser(activeUser.id);
        setSyncStatus('synced');
      } catch {
        setCloudDataLoadedForUser(activeUser.id);
        setSyncStatus('local');
      }
    },
    [loadLocalScopeData]
  );

  // Supabase Auth Session Listener + Initial Load
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      loadLocalScopeData('guest');
      setAuthChecked(true);
      return;
    }

    client.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUser(data.session.user);
        loadUserCloudData(data.session.user);
      } else {
        loadLocalScopeData('guest');
      }
      setAuthChecked(true);
    });

    const { data: sub } = client.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        loadUserCloudData(nextUser);
      } else {
        setCloudDataLoadedForUser(null);
        setSyncStatus('local');
      }
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadLocalScopeData, loadUserCloudData]);

  // Save to user-scoped localStorage whenever state updates
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(getScopedKey(STORAGE_KEYS.plan), JSON.stringify(plan));
  }, [plan, hydrated, getScopedKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      getScopedKey(STORAGE_KEYS.customExercises),
      JSON.stringify(customExercises)
    );
  }, [customExercises, hydrated, getScopedKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      getScopedKey('fitpulse_checked_map_v1'),
      JSON.stringify(manualCheckedMap)
    );
  }, [manualCheckedMap, hydrated, getScopedKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      getScopedKey(STORAGE_KEYS.strengthLogs),
      JSON.stringify(strengthLogs)
    );
  }, [strengthLogs, hydrated, getScopedKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(getScopedKey(STORAGE_KEYS.cardioLogs), JSON.stringify(cardioLogs));
  }, [cardioLogs, hydrated, getScopedKey]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(getScopedKey(STORAGE_KEYS.weightLogs), JSON.stringify(weightLogs));
  }, [weightLogs, hydrated, getScopedKey]);

  // Automatically sync 7-day plan, custom exercises, and daily check-offs to Supabase for the logged-in user
  useEffect(() => {
    if (!hydrated || !user || cloudDataLoadedForUser !== user.id) return;
    const client = getSupabaseClient();
    if (!client) return;

    const timer = setTimeout(async () => {
      setSyncStatus('syncing');
      await client.from('training_plans').upsert(
        {
          user_id: user.id,
          name: plan.name,
          goal: plan.goal,
          level: plan.level,
          description: plan.description,
          auto_progression: plan.autoProgression,
          exercises: plan.days,
          custom_exercises: customExercises,
          checked_map: manualCheckedMap,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
      setSyncStatus('synced');
    }, 500);

    return () => clearTimeout(timer);
  }, [plan, customExercises, manualCheckedMap, hydrated, user, cloudDataLoadedForUser]);

  // Currently selected DayPlan (Montag .. Sonntag)
  const selectedDayPlan = useMemo(() => {
    return plan.days[selectedDayIndex] || plan.days[0];
  }, [plan.days, selectedDayIndex]);

  // Total unique exercises across the 7-day week
  const totalWeeklyExercisesCount = useMemo(() => {
    return plan.days.reduce((sum, d) => sum + d.items.length, 0);
  }, [plan.days]);

  // Smart Auto-Prefill: Whenever trackedExerciseId changes, look up the most recent log entry for that exercise!
  const applySmartPrefillForExercise = useCallback(
    (exerciseId: string, logsList: StrengthLogEntry[], currentPlan: TrainingPlan) => {
      const exDef = allExercises.find((e) => e.id === exerciseId) || allExercises[0];
      const matchingLogs = logsList
        .filter((l) => l.exerciseId === exerciseId)
        .sort((a, b) => b.performedAt.localeCompare(a.performedAt));

      if (matchingLogs.length > 0) {
        const last = matchingLogs[0];
        const restVal = last.restSeconds ?? exDef.restSeconds;
        setInputWeightKg(last.weightKg);
        setInputSets(last.sets);
        setInputReps(last.reps);
        setInputSeconds(last.durationSeconds);
        setInputRestSeconds(restVal);
        setPrefillBanner(
          `Voreingestellt vom letzten Training (${last.performedAt}): ${
            last.weightKg > 0 ? `${last.weightKg} kg · ` : ''
          }${last.sets} Sätze · ${
            exDef.isTimed ? `${last.durationSeconds} Sek. Haltedauer` : `${last.reps} Wdh.`
          } · ${restVal}s Pause`
        );
      } else {
        // Search across all 7 days of the weekly plan for target values
        let foundPlanItem = null;
        for (const d of currentPlan.days) {
          const it = d.items.find((i) => i.exerciseId === exerciseId);
          if (it) {
            foundPlanItem = it;
            break;
          }
        }
        if (foundPlanItem) {
          setInputWeightKg(foundPlanItem.targetWeightKg);
          setInputSets(foundPlanItem.sets);
          setInputReps(foundPlanItem.targetReps);
          setInputSeconds(foundPlanItem.targetSeconds);
          setInputRestSeconds(foundPlanItem.restSeconds || exDef.restSeconds);
          setPrefillBanner(
            `Noch kein Log vorhanden – Zielwerte & Pausenzeit (${
              foundPlanItem.restSeconds || exDef.restSeconds
            }s) aus deinem 7-Tage-Wochenplan voreingestellt.`
          );
        } else {
          setInputWeightKg(exDef.defaultWeightKg);
          setInputSets(exDef.defaultSets);
          setInputReps(exDef.defaultReps);
          setInputSeconds(exDef.defaultSeconds);
          setInputRestSeconds(exDef.restSeconds);
          setPrefillBanner(
            `Erste Ausführung – Empfohlene Startwerte & ${exDef.restSeconds}s Pause für ${exDef.name} voreingestellt.`
          );
        }
      }
    },
    [allExercises]
  );

  useEffect(() => {
    if (!hydrated) return;
    applySmartPrefillForExercise(trackedExerciseId, strengthLogs, plan);
  }, [trackedExerciseId, hydrated, strengthLogs, plan, applySmartPrefillForExercise]);

  // Check if Sunday Weight Check-In is due
  const isSundayOrWeightDue = useMemo(() => {
    if (!sundayReminderEnabled) return false;
    const today = new Date();
    const isSunday = today.getDay() === 0;
    if (weightLogs.length === 0) return true;
    const latestWeight = [...weightLogs].sort((a, b) =>
      b.measuredAt.localeCompare(a.measuredAt)
    )[0];
    const diffDays =
      (today.getTime() - new Date(latestWeight.measuredAt).getTime()) /
      (1000 * 60 * 60 * 24);
    return isSunday || diffDays >= 7;
  }, [sundayReminderEnabled, weightLogs]);

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 4000);
  };

  // Handle Login / Registration on Einstiegsseite & Cloud Modal (for you & your girlfriend)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Bitte gib deine Gmail-/E-Mail-Adresse und ein Passwort ein.');
      return;
    }
    if (authPassword.trim().length < 6) {
      setAuthError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'register') {
        const res = await signUpWithEmail(authEmail, authPassword, authDisplayName);
        if (res.user) {
          setUser(res.user);
          setGuestMode(false);
          setShowCloudModal(false);
          triggerToast(
            `Willkommen bei FitPulse, ${
              res.user.user_metadata?.display_name || res.user.email?.split('@')[0]
            }!`
          );
        }
      } else {
        try {
          const res = await signInWithEmail(authEmail, authPassword);
          if (res.user) {
            setUser(res.user);
            setGuestMode(false);
            setShowCloudModal(false);
            triggerToast(
              `Willkommen zurück, ${
                res.user.user_metadata?.display_name || res.user.email?.split('@')[0]
              }!`
            );
          }
        } catch (loginErr) {
          const msg = loginErr instanceof Error ? loginErr.message : '';
          if (msg.toLowerCase().includes('invalid login credentials')) {
            setAuthError(
              'Konto noch nicht vorhanden oder Passwort falsch. Tipp: Falls du dich zum ersten Mal anmeldest, wechsle oben auf „Neues Konto anlegen“!'
            );
          } else {
            throw loginErr;
          }
        }
      }
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // Check if an exercise in the selected day plan is completed for inputDate
  const isDayExerciseCompleted = useCallback(
    (exerciseId: string, itemIdx: number) => {
      const key = `${inputDate}:${selectedDayIndex}:${itemIdx}:${exerciseId}`;
      if (manualCheckedMap[key] !== undefined) {
        return manualCheckedMap[key];
      }
      return strengthLogs.some(
        (l) => l.exerciseId === exerciseId && l.performedAt === inputDate
      );
    },
    [inputDate, selectedDayIndex, manualCheckedMap, strengthLogs]
  );

  // Advance to the next uncompleted exercise in selectedDayPlan
  const advanceToNextDayExercise = useCallback(
    (justCompletedExerciseId: string, updatedLogs: StrengthLogEntry[], updatedChecked: Record<string, boolean>) => {
      const items = selectedDayPlan.items;
      if (items.length === 0) return;

      const currentIdx = items.findIndex((i) => i.exerciseId === justCompletedExerciseId);
      const orderedIndices = [
        ...items.map((_, idx) => idx).slice(currentIdx + 1),
        ...items.map((_, idx) => idx).slice(0, currentIdx + 1),
      ];

      for (const idx of orderedIndices) {
        const candidate = items[idx];
        if (candidate.exerciseId === justCompletedExerciseId) continue;
        const key = `${inputDate}:${selectedDayIndex}:${idx}:${candidate.exerciseId}`;
        const done =
          updatedChecked[key] !== undefined
            ? updatedChecked[key]
            : updatedLogs.some(
                (l) => l.exerciseId === candidate.exerciseId && l.performedAt === inputDate
              );
        if (!done) {
          setTrackedExerciseId(candidate.exerciseId);
          return;
        }
      }
    },
    [selectedDayPlan.items, inputDate, selectedDayIndex]
  );

  // Toggle check-off directly from the Smart-Tracker training plan checklist
  const toggleChecklistExercise = async (exerciseId: string, itemIdx: number) => {
    const key = `${inputDate}:${selectedDayIndex}:${itemIdx}:${exerciseId}`;
    const currentlyDone = isDayExerciseCompleted(exerciseId, itemIdx);

    if (currentlyDone) {
      // Uncheck and remove today's quick-logged entry if present
      const nextChecked = { ...manualCheckedMap, [key]: false };
      setManualCheckedMap(nextChecked);
      setStrengthLogs((prev) =>
        prev.filter((l) => !(l.exerciseId === exerciseId && l.performedAt === inputDate))
      );
      triggerToast('Häkchen entfernt.');
      return;
    }

    // Check off and log with smart prefill / plan target values
    const exDef = allExercises.find((e) => e.id === exerciseId) || allExercises[0];
    const planItem = selectedDayPlan.items[itemIdx];
    const lastLog = [...strengthLogs]
      .filter((l) => l.exerciseId === exerciseId)
      .sort((a, b) => b.performedAt.localeCompare(a.performedAt))[0];

    const newEntry: StrengthLogEntry = {
      id: `s-${Date.now()}-${itemIdx}`,
      exerciseId: exDef.id,
      exerciseName: exDef.name,
      category: exDef.category,
      weightKg: lastLog ? lastLog.weightKg : planItem?.targetWeightKg ?? exDef.defaultWeightKg,
      sets: lastLog ? lastLog.sets : planItem?.sets ?? exDef.defaultSets,
      reps: exDef.isTimed
        ? 1
        : lastLog
        ? lastLog.reps
        : planItem?.targetReps ?? exDef.defaultReps,
      durationSeconds: exDef.isTimed
        ? lastLog
          ? lastLog.durationSeconds
          : planItem?.targetSeconds ?? exDef.defaultSeconds
        : 0,
      restSeconds: lastLog?.restSeconds ?? planItem?.restSeconds ?? exDef.restSeconds,
      performedAt: inputDate,
      notes: `Im Trainingsplan (${selectedDayPlan.dayName}) abgehakt`,
    };

    const nextChecked = { ...manualCheckedMap, [key]: true };
    setManualCheckedMap(nextChecked);
    const nextLogs = [newEntry, ...strengthLogs];
    setStrengthLogs(nextLogs);

    const client = getSupabaseClient();
    if (client && user) {
      setSyncStatus('syncing');
      client
        .from('strength_logs')
        .insert({
          user_id: user.id,
          exercise_id: newEntry.exerciseId,
          exercise_name: newEntry.exerciseName,
          category: newEntry.category,
          weight_kg: newEntry.weightKg,
          sets: newEntry.sets,
          reps: newEntry.reps,
          duration_seconds: newEntry.durationSeconds,
          rest_seconds: newEntry.restSeconds,
          notes: newEntry.notes,
          performed_at: new Date(newEntry.performedAt).toISOString(),
        })
        .then(() => setSyncStatus('synced'));
    }

    advanceToNextDayExercise(exerciseId, nextLogs, nextChecked);
    triggerToast(`✓ "${exDef.name}" abgehakt & geloggt!`);
  };

  // Start an exercise directly in the Tracker from Pillar 1
  const startExerciseInTracker = (exerciseId: string) => {
    setTrackedExerciseId(exerciseId);
    setActiveTab('pillar2');
    setP2SubTab('strength');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start a planned Cardio Day directly in the Cardio Tracker with pre-filled values
  const startPlannedCardioInTracker = (
    discipline: 'laufen' | 'radfahren',
    km: number,
    minutes: number,
    hm = 50,
    note = ''
  ) => {
    setCardioDiscipline(discipline);
    setCardioDistanceKm(km);
    setCardioDurationMin(minutes);
    setCardioElevationM(hm);
    setCardioNotes(note);
    setActiveTab('pillar2');
    setP2SubTab('cardio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Log Strength / Isometric / Stretch Workout + Auto-Progression across the 7-day plan
  const handleSaveStrengthLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const exDef = allExercises.find((ex) => ex.id === trackedExerciseId) || allExercises[0];
    const newEntry: StrengthLogEntry = {
      id: `s-${Date.now()}`,
      exerciseId: exDef.id,
      exerciseName: exDef.name,
      category: exDef.category,
      weightKg: Number(inputWeightKg) || 0,
      sets: Math.max(1, Number(inputSets) || 1),
      reps: exDef.isTimed ? 1 : Math.max(1, Number(inputReps) || 1),
      durationSeconds: exDef.isTimed ? Math.max(5, Number(inputSeconds) || 30) : 0,
      restSeconds: Math.max(5, Number(inputRestSeconds) || exDef.restSeconds),
      performedAt: inputDate,
      notes: inputNotes.trim() || undefined,
    };

    const nextLogs = [newEntry, ...strengthLogs];
    setStrengthLogs(nextLogs);
    setInputNotes('');

    // Mark matching item(s) in selectedDayPlan as checked off and advance to next open exercise
    const nextChecked = { ...manualCheckedMap };
    selectedDayPlan.items.forEach((it, idx) => {
      if (it.exerciseId === exDef.id) {
        nextChecked[`${inputDate}:${selectedDayIndex}:${idx}:${exDef.id}`] = true;
      }
    });
    setManualCheckedMap(nextChecked);
    advanceToNextDayExercise(exDef.id, nextLogs, nextChecked);

    // Check Adaptive Plan Auto-Progression across all 7 weekdays
    let progressionMsg = '';
    if (plan.autoProgression) {
      let progressed = false;
      const updatedDays = plan.days.map((day) => {
        const idx = day.items.findIndex((i) => i.exerciseId === exDef.id);
        if (idx === -1) return day;
        const item = day.items[idx];
        const newItems = [...day.items];

        if (exDef.isTimed && newEntry.durationSeconds >= item.targetSeconds) {
          const nextSec = newEntry.durationSeconds + exDef.progressionStepSeconds;
          newItems[idx] = { ...item, targetSeconds: nextSec };
          progressionMsg = ` · Wochenplan-Ziel automatisch auf ${nextSec} Sek. erhöht!`;
          progressed = true;
        } else if (
          !exDef.isTimed &&
          exDef.progressionStepKg > 0 &&
          newEntry.weightKg >= item.targetWeightKg &&
          newEntry.reps >= item.targetReps
        ) {
          const nextKg = Number((newEntry.weightKg + exDef.progressionStepKg).toFixed(1));
          newItems[idx] = { ...item, targetWeightKg: nextKg };
          progressionMsg = ` · Wochenplan-Ziel automatisch auf ${nextKg} kg erhöht!`;
          progressed = true;
        } else if (
          !exDef.isTimed &&
          exDef.progressionStepKg === 0 &&
          newEntry.reps >= item.targetReps
        ) {
          const nextReps = newEntry.reps + exDef.progressionStepReps;
          newItems[idx] = { ...item, targetReps: nextReps };
          progressionMsg = ` · Wochenplan-Ziel automatisch auf ${nextReps} Wdh. erhöht!`;
          progressed = true;
        }
        return { ...day, items: newItems };
      });

      if (progressed) {
        setPlan({ ...plan, days: updatedDays, updatedAt: new Date().toISOString() });
      }
    }

    // Optional Cloud Sync with Supabase
    const client = getSupabaseClient();
    if (client && user) {
      setSyncStatus('syncing');
      await client.from('strength_logs').insert({
        user_id: user.id,
        exercise_id: newEntry.exerciseId,
        exercise_name: newEntry.exerciseName,
        category: newEntry.category,
        weight_kg: newEntry.weightKg,
        sets: newEntry.sets,
        reps: newEntry.reps,
        duration_seconds: newEntry.durationSeconds,
        rest_seconds: newEntry.restSeconds,
        notes: newEntry.notes,
        performed_at: new Date(newEntry.performedAt).toISOString(),
      });
      setSyncStatus('synced');
    }

    triggerToast(`"${exDef.name}" gespeichert${progressionMsg}`);
  };

  // Log Cardio Workout (Running / Cycling)
  const handleSaveCardioLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: CardioLogEntry = {
      id: `c-${Date.now()}`,
      discipline: cardioDiscipline,
      distanceKm: Math.max(0.1, Number(cardioDistanceKm) || 1),
      durationMinutes: Math.max(1, Number(cardioDurationMin) || 10),
      elevationMeters: Math.max(0, Number(cardioElevationM) || 0),
      performedAt: cardioDate,
      notes: cardioNotes.trim() || undefined,
    };

    setCardioLogs((prev) => [newEntry, ...prev]);
    setCardioNotes('');

    const client = getSupabaseClient();
    if (client && user) {
      setSyncStatus('syncing');
      await client.from('cardio_logs').insert({
        user_id: user.id,
        discipline: newEntry.discipline,
        distance_km: newEntry.distanceKm,
        duration_minutes: newEntry.durationMinutes,
        elevation_meters: newEntry.elevationMeters,
        notes: newEntry.notes,
        performed_at: new Date(newEntry.performedAt).toISOString(),
      });
      setSyncStatus('synced');
    }

    triggerToast(
      `${cardioDiscipline === 'laufen' ? 'Laufeinheit' : 'Radeinheit'} (${newEntry.distanceKm} km) gespeichert!`
    );
  };

  // Log Body Weight & Blood Pressure (Sunday Check-In)
  const handleSaveWeightLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: WeightLogEntry = {
      id: `w-${Date.now()}`,
      weightKg: Number(weightKgInput) || 80,
      systolicBp: systolicInput ? Number(systolicInput) : undefined,
      diastolicBp: diastolicInput ? Number(diastolicInput) : undefined,
      measuredAt: weightDate,
      notes: 'Sonntags-Check-in',
    };

    setWeightLogs((prev) => [newEntry, ...prev]);
    setShowSundayModal(false);

    const client = getSupabaseClient();
    if (client && user) {
      setSyncStatus('syncing');
      await client.from('weight_logs').insert({
        user_id: user.id,
        weight_kg: newEntry.weightKg,
        systolic_bp: newEntry.systolicBp,
        diastolic_bp: newEntry.diastolicBp,
        measured_at: new Date(newEntry.measuredAt).toISOString(),
      });
      setSyncStatus('synced');
    }

    triggerToast(`Sonntags-Gewicht (${newEntry.weightKg} kg) gespeichert!`);
  };

  const enableBrowserSundayNotification = async () => {
    setSundayReminderEnabled(true);
    localStorage.setItem(STORAGE_KEYS.reminderEnabled, 'true');

    // 1. Native Android (Capacitor LocalNotifications) weekly Sunday schedule
    try {
      const { Capacitor } = await import('@capacitor/core');
      if (Capacitor.isNativePlatform()) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display === 'granted') {
          await LocalNotifications.schedule({
            notifications: [
              {
                id: 7001,
                title: 'FitPulse Sonntags-Check-in',
                body: 'Zeit für deinen wöchentlichen Gewichts- & Blutdruck-Eintrag!',
                schedule: {
                  on: {
                    weekday: 1, // 1 = Sonntag in Capacitor LocalNotifications
                    hour: 9,
                    minute: 30,
                  },
                  repeats: true,
                },
              },
            ],
          });
          triggerToast('Native Android Sonntags-Erinnerung (So, 09:30 Uhr) aktiviert!');
          return;
        }
      }
    } catch {
      // Fallback to Web Notification API below
    }

    // 2. Web / PWA Notification fallback
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('FitPulse Sonntags-Erinnerung aktiv', {
          body: 'Du wirst jeden Sonntag erinnert, dein aktuelles Gewicht einzutragen.',
          icon: '/icon.svg',
        });
      }
    }
    triggerToast('Sonntags-Gewichts-Erinnerung aktiviert!');
  };

  // Helper to update the currently selected day in the 7-day plan
  const updateSelectedDay = (updater: (day: typeof selectedDayPlan) => typeof selectedDayPlan) => {
    setPlan((prev) => {
      const copyDays = [...prev.days];
      copyDays[selectedDayIndex] = updater(copyDays[selectedDayIndex]);
      return {
        ...prev,
        days: copyDays,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Create a new user-defined Exercise with custom description and all tags
  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newExName.trim();
    if (!trimmedName) return;

    const instructionsList = newExInstructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const createdExercise: ExerciseDefinition = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      category: newExCategory,
      equipment: newExEquipment.trim() || 'Ohne Geräte',
      isTimed: newExIsTimed,
      defaultWeightKg: Math.max(0, Number(newExDefaultWeightKg) || 0),
      defaultSets: Math.max(1, Number(newExDefaultSets) || 3),
      defaultReps: newExIsTimed ? 1 : Math.max(1, Number(newExDefaultReps) || 10),
      defaultSeconds: newExIsTimed ? Math.max(5, Number(newExDefaultSeconds) || 45) : 0,
      restSeconds: Math.max(5, Number(newExRestSeconds) || 60),
      goals: newExGoals.length > 0 ? newExGoals : ['muskelaufbau'],
      levels: newExLevels.length > 0 ? newExLevels : ['anfaenger', 'fortgeschritten', 'profi'],
      primaryMuscles:
        newExMuscles.length > 0 ? newExMuscles : ['Ganzkörper / Herz-Kreislauf'],
      healthBenefits:
        newExDescription.trim() ||
        'Individuell erstellte Übung zur gezielten Kräftigung und Gesundheitsförderung.',
      instructions:
        instructionsList.length > 0
          ? instructionsList
          : ['Übung kontrolliert und mit sauberer Haltung ausführen.'],
      breathingTip:
        newExBreathingTip.trim() ||
        'Gleichmäßig und kontrolliert weiteratmen (keine Pressatmung).',
      animationPose: newExAnimationPose,
      progressionStepKg: newExDefaultWeightKg > 0 ? 2.5 : 0,
      progressionStepSeconds: newExIsTimed ? 10 : 0,
      progressionStepReps: newExIsTimed ? 0 : 1,
    };

    setCustomExercises((prev) => [createdExercise, ...prev]);

    if (newExAddToSelectedDay) {
      updateSelectedDay((d) => ({
        ...d,
        items: [
          ...d.items,
          {
            exerciseId: createdExercise.id,
            sets: createdExercise.defaultSets,
            targetWeightKg: createdExercise.defaultWeightKg,
            targetReps: createdExercise.defaultReps,
            targetSeconds: createdExercise.defaultSeconds,
            restSeconds: createdExercise.restSeconds,
          },
        ],
      }));
    }

    setNewExName('');
    setNewExDescription('');
    setShowCreateExerciseModal(false);
    triggerToast(
      `Eigene Übung "${createdExercise.name}" zur Bibliothek${
        newExAddToSelectedDay ? ` & zum ${selectedDayPlan.dayName}` : ''
      } hinzugefügt!`
    );
  };

  const handleDeleteCustomExercise = (exerciseId: string, exerciseName: string) => {
    setCustomExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    setPlan((prev) => ({
      ...prev,
      days: prev.days.map((d) => ({
        ...d,
        items: d.items.filter((it) => it.exerciseId !== exerciseId),
      })),
    }));
    triggerToast(`Eigene Übung "${exerciseName}" entfernt.`);
  };

  // Filtered Exercises for Pillar 1 Library
  const filteredExercises = useMemo(() => {
    return allExercises.filter((ex) => {
      if (categoryFilter !== 'alle' && ex.category !== categoryFilter) return false;
      if (goalFilter !== 'alle' && !ex.goals.includes(goalFilter)) return false;
      if (
        searchQuery.trim() &&
        !ex.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ex.primaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) &&
        !ex.equipment.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ex.healthBenefits.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [allExercises, categoryFilter, goalFilter, searchQuery]);

  // Date Cutoff Helper for Pillar 3 Dashboard X-Axis
  const filterByTimeRange = useCallback(
    (isoDate: string) => {
      if (timeRange === 'all') return true;
      if (timeRange === 'custom') {
        return isoDate >= customStartDate && isoDate <= customEndDate;
      }
      const daysMap: Record<Exclude<TimeRangePreset, 'all' | 'custom'>, number> = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '365d': 365,
      };
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysMap[timeRange]);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      return isoDate >= cutoffStr;
    },
    [timeRange, customStartDate, customEndDate]
  );

  // Build Chart Data for Pillar 3
  const activeChartConfig = useMemo(() => {
    if (dashboardDomain === 'kraft') {
      const exDef = allExercises.find((e) => e.id === chartExerciseId) || allExercises[0];
      const effectiveMetric =
        chartStrengthMetric === 'auto'
          ? exDef.isTimed
            ? 'seconds'
            : exDef.defaultWeightKg > 0
            ? 'weight'
            : 'volume'
          : chartStrengthMetric;

      const points: ChartDataPoint[] = strengthLogs
        .filter((l) => l.exerciseId === exDef.id && filterByTimeRange(l.performedAt))
        .map((l) => {
          let val = 0;
          if (effectiveMetric === 'seconds') val = l.durationSeconds;
          else if (effectiveMetric === 'weight') val = l.weightKg;
          else {
            val =
              l.durationSeconds > 0
                ? l.sets * l.durationSeconds
                : l.weightKg > 0
                ? l.sets * l.reps * l.weightKg
                : l.sets * l.reps;
          }
          return {
            id: l.id,
            date: l.performedAt,
            value: Number(val.toFixed(1)),
            label: exDef.name,
            subLabel: exDef.isTimed
              ? `${l.sets} Sätze × ${l.durationSeconds}s${l.weightKg > 0 ? ` (+${l.weightKg}kg)` : ''}`
              : `${l.sets}×${l.reps} @ ${l.weightKg} kg`,
          };
        });

      const unitMap = {
        seconds: 'Sek.',
        weight: 'kg',
        volume: exDef.isTimed ? 'Gesamt-Sek.' : 'kg·Vol',
      };

      return {
        title: `${exDef.name}`,
        subtitle: `Kraft- & Isometrie-Fortschritt (${CATEGORY_LABELS[exDef.category].title})`,
        unit: unitMap[effectiveMetric],
        color: exDef.category === 'isometrisch' ? '#a78bfa' : '#10b981',
        lowerIsBetter: false,
        data: points,
      };
    }

    if (dashboardDomain === 'ausdauer') {
      const isRun = chartCardioDiscipline === 'laufen';
      const points: ChartDataPoint[] = cardioLogs
        .filter((c) => c.discipline === chartCardioDiscipline && filterByTimeRange(c.performedAt))
        .map((c) => {
          let val = c.distanceKm;
          if (chartCardioMetric === 'pace_speed') {
            val = isRun
              ? Number((c.durationMinutes / c.distanceKm).toFixed(2))
              : Number(((c.distanceKm / c.durationMinutes) * 60).toFixed(1));
          } else if (chartCardioMetric === 'duration') {
            val = c.durationMinutes;
          } else if (chartCardioMetric === 'elevation') {
            val = c.elevationMeters;
          }
          return {
            id: c.id,
            date: c.performedAt,
            value: val,
            label: isRun ? 'Laufen' : 'Radfahren',
            subLabel: `${c.distanceKm} km in ${c.durationMinutes} Min · ${c.elevationMeters} hm`,
          };
        });

      const metricLabels = {
        distance: { name: 'Distanz', unit: 'km', lower: false },
        pace_speed: {
          name: isRun ? 'Pace (min/km)' : 'Ø Tempo (km/h)',
          unit: isRun ? 'min/km' : 'km/h',
          lower: isRun,
        },
        duration: { name: 'Trainingsdauer', unit: 'Min.', lower: false },
        elevation: { name: 'Höhenmeter', unit: 'hm', lower: false },
      }[chartCardioMetric];

      return {
        title: `${isRun ? 'Laufen' : 'Radfahren'} – ${metricLabels.name}`,
        subtitle: 'Ausdauer-Entwicklung über deinen gewählten Zeitraum',
        unit: metricLabels.unit,
        color: isRun ? '#38bdf8' : '#f59e0b',
        lowerIsBetter: metricLabels.lower,
        data: points,
      };
    }

    const isBp = chartWeightMetric === 'bp';
    const points: ChartDataPoint[] = weightLogs
      .filter((w) => filterByTimeRange(w.measuredAt) && (!isBp || w.systolicBp))
      .map((w) => ({
        id: w.id,
        date: w.measuredAt,
        value: isBp ? w.systolicBp || 120 : w.weightKg,
        label: isBp ? 'Systolischer Blutdruck' : 'Körpergewicht',
        subLabel: w.systolicBp
          ? `${w.weightKg} kg · RR ${w.systolicBp}/${w.diastolicBp} mmHg`
          : `${w.weightKg} kg`,
      }));

    return {
      title: isBp
        ? 'Ruhe-Blutdruck (Systolisch in mmHg)'
        : 'Körpergewicht (Sonntags-Check-in)',
      subtitle: isBp
        ? 'Positive Auswirkung deines isometrischen & Ausdauer-Trainings'
        : 'Wöchentlicher Gewichtsverlauf',
      unit: isBp ? 'mmHg' : 'kg',
      color: isBp ? '#f43f5e' : '#34d399',
      lowerIsBetter: true,
      data: points,
    };
  }, [
    allExercises,
    dashboardDomain,
    chartExerciseId,
    chartStrengthMetric,
    chartCardioDiscipline,
    chartCardioMetric,
    chartWeightMetric,
    strengthLogs,
    cardioLogs,
    weightLogs,
    filterByTimeRange,
  ]);

  const currentTrackedExercise = useMemo(
    () => allExercises.find((e) => e.id === trackedExerciseId) || allExercises[0],
    [allExercises, trackedExerciseId]
  );

  const liveCardioSpeedInfo = useMemo(() => {
    const dist = Number(cardioDistanceKm) || 0;
    const dur = Number(cardioDurationMin) || 0;
    if (dist <= 0 || dur <= 0) return '–';
    if (cardioDiscipline === 'laufen') {
      const paceDec = dur / dist;
      const mins = Math.floor(paceDec);
      const secs = Math.round((paceDec - mins) * 60);
      return `${mins}:${String(secs).padStart(2, '0')} min/km`;
    } else {
      const kmh = ((dist / dur) * 60).toFixed(1);
      return `${kmh} km/h`;
    }
  }, [cardioDiscipline, cardioDistanceKm, cardioDurationMin]);

  // Count exercises per category in library
  const categoryCounts = useMemo(() => {
    return {
      alle: allExercises.length,
      isometrisch: allExercises.filter((e) => e.category === 'isometrisch').length,
      geraete: allExercises.filter((e) => e.category === 'geraete').length,
      koerpergewicht: allExercises.filter((e) => e.category === 'koerpergewicht').length,
      dehnung: allExercises.filter((e) => e.category === 'dehnung').length,
    };
  }, [allExercises]);

  const activeUserDisplayName =
    user?.user_metadata?.display_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Gast';

  // Wait briefly while checking existing session so logged-in users don't see a flash
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#070a12] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
            <HeartPulse className="w-8 h-8 text-slate-950" />
          </div>
          <div className="text-sm font-bold text-white">FitPulse wird geladen…</div>
          <div className="text-xs text-slate-400">Cloud-Profil & Trainingsplan werden geprüft</div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // EINSTIEGSSEITE (LOGIN / KONTO ANLEGEN VOR DER ÜBERSICHTSSEITE)
  // ============================================================================
  if (!user && !guestMode) {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Hero / Branding Column */}
          <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <HeartPulse className="w-6 h-6 text-slate-950" />
              </div>
              <div className="text-left">
                <div className="text-base font-extrabold text-white tracking-tight">
                  FitPulse Cloud
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold">
                  Persönliches Trainings- & Gesundheits-Portal
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Dein 7-Tage-Trainingsplan, Smart-Tracker & Statistik-Dashboard.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Melde dich mit deiner <strong>Gmail- oder E-Mail-Adresse</strong> an. Jeder Account
              (z.B. für dich und deine Freundin) erhält seinen <strong>komplett eigenen, geschützten Bereich</strong> für Wochenplan, eigene Übungen, abgehakte Trainings und Fortschritts-Kurven.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/90">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Dumbbell className="w-4 h-4" />
                  1. Wochenplan
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  54+ Übungen mit 60-FPS-Animationen + eigene Übungen & Tags anlegen.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/90">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                  <Timer className="w-4 h-4" />
                  2. Smart-Tracker
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Tagesplan-Checkliste zum Abhaken, Auto-Prefill & Pausen-Countdown.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/90">
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400">
                  <BarChart3 className="w-4 h-4" />
                  3. Live-Charts
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Interaktive Line-Charts für Kraft, Laufen, Radfahren, Gewicht & Blutdruck.
                </p>
              </div>
            </div>
          </div>

          {/* Right Auth Card */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
              {/* Mode Switcher: Anmelden vs. Neues Konto anlegen */}
              <div className="grid grid-cols-2 gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                    authMode === 'login'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Anmelden
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className={`py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition ${
                    authMode === 'register'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Neues Konto anlegen
                </button>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white">
                  {authMode === 'login'
                    ? 'Mit deinem Account anmelden'
                    : 'Eigenes Konto erstellen (Sofort-Start)'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {authMode === 'login'
                    ? 'Gib deine Gmail-/E-Mail-Adresse und dein Passwort ein, um deinen persönlichen Trainingsplan zu laden.'
                    : 'Ideal für dich oder deine Freundin: Einfach Namen, Gmail-Adresse und Wunsch-Passwort eingeben – du bist sofort eingeloggt!'}
                </p>
              </div>

              {authError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-xs text-rose-200 leading-relaxed">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Dein Vorname / Anzeigename
                    </label>
                    <input
                      type="text"
                      placeholder="z.B. Fabio oder Name deiner Freundin"
                      value={authDisplayName}
                      onChange={(e) => setAuthDisplayName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Gmail- / E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="dein.name@gmail.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Passwort (mind. 6 Zeichen)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                >
                  <LogIn className="w-4 h-4" />
                  {authLoading
                    ? 'Wird angemeldet…'
                    : authMode === 'login'
                    ? 'Jetzt anmelden & Trainingsplan öffnen'
                    : 'Konto erstellen & direkt starten'}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
                <span>
                  {authMode === 'login' ? 'Noch kein Konto angelegt?' : 'Bereits registriert?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError(null);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-4"
                >
                  {authMode === 'login'
                    ? 'Hier in 5 Sekunden neues Konto anlegen →'
                    : 'Zum Login wechseln →'}
                </button>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setGuestMode(true)}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition"
                >
                  Ohne Anmeldung im lokalen Gast-Modus fortfahren
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-12 flex flex-col">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#090d16]/90 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <HeartPulse className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  FitPulse
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {allExercises.length} Übungen · 7-Tage-Plan
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {user ? `Eingeloggt als ${activeUserDisplayName}` : 'Gast-Modus (lokal)'}
              </p>
            </div>
          </div>

          {/* Desktop Pillar Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('pillar1')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'pillar1'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
              1. Wochenplan & Bibliothek
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pillar2')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'pillar2'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Timer className="w-4 h-4" />
              2. Smart-Tracker
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pillar3')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'pillar3'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              3. Statistik-Charts
            </button>
          </nav>

          {/* Right Actions: Sunday Check-In & Account / Cloud Sync */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSundayModal(true)}
              className={`relative px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                isSundayOrWeightDue
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
              title="Sonntags-Gewichts-Check-in"
            >
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Sonntags-Wiegen</span>
              {isSundayOrWeightDue && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowCloudModal(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 flex items-center gap-1.5 transition"
            >
              <Cloud
                className={`w-4 h-4 ${
                  user ? 'text-emerald-400' : 'text-sky-400'
                }`}
              />
              <span className="hidden sm:inline">
                {user ? activeUserDisplayName : 'Anmelden'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-md bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Sunday Weight Reminder Banner if due */}
      {isSundayOrWeightDue && (
        <div className="bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border-b border-amber-500/30">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-amber-200">
              <Bell className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <span>
                <strong>Sonntags-Check-in:</strong> Zeit für deinen wöchentlichen Gewichts- & Blutdruck-Eintrag!
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSundayModal(true)}
              className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition"
            >
              Jetzt Gewicht eintragen
            </button>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* =========================================================
            SÄULE 1: 7-TAGE-WOCHENPLAN & GROSSE ANIMIERTE BIBLIOTHEK
           ========================================================= */}
        {activeTab === 'pillar1' && (
          <div className="space-y-6">
            {/* Sub-Navigation: 7-Tage-Wochenplan vs. Übungsbibliothek */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800/90 p-4 rounded-2xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Säule 1 · Intelligente Wochenplanung & {allExercises.length} animierte Übungen
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  7-Tage-Trainingsplan & Übungsbibliothek
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setP1SubTab('plan')}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                      p1SubTab === 'plan'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    7-Tage-Wochenplan ({totalWeeklyExercisesCount} Einheiten)
                  </button>
                  <button
                    type="button"
                    onClick={() => setP1SubTab('library')}
                    className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                      p1SubTab === 'library'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Übungsbibliothek ({allExercises.length} Übungen)
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateExerciseModal(true)}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  Eigene Übung hinzufügen
                </button>
              </div>
            </div>

            {p1SubTab === 'plan' ? (
              <div className="space-y-6">
                {/* Plan Generator Configuration (Goal & Level) */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        Deinen 7-Tage-Wochenplan nach Ziel & Level generieren
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        Jeder Wochentag (Mo–So) hat einen eigenen Schwerpunkt mit unterschiedlichen Kraft-, Isometrie- und Dehnübungen sowie perfekt abgestimmten Ausdauertagen.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 cursor-pointer self-start">
                      <input
                        type="checkbox"
                        checked={plan.autoProgression}
                        onChange={(e) =>
                          setPlan({ ...plan, autoProgression: e.target.checked })
                        }
                        className="rounded accent-emerald-500 w-4 h-4"
                      />
                      <span>Automatische Fortschritts-Anpassung aktiv</span>
                    </label>
                  </div>

                  {/* Goal Cards */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      1. Dein Hauptziel wählen
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((g) => {
                        const info = GOAL_LABELS[g];
                        const isSelected = plan.goal === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() =>
                              setPlan(generatePlanForGoalAndLevel(g, plan.level))
                            }
                            className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-500/10'
                                : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-sm text-white">
                                {info.title}
                              </span>
                              {isSelected && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                              {info.subtitle}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Level Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        2. Dein Trainingslevel wählen
                      </label>
                      <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                        {(Object.keys(LEVEL_LABELS) as FitnessLevel[]).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() =>
                              setPlan(generatePlanForGoalAndLevel(plan.goal, lvl))
                            }
                            className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition ${
                              plan.level === lvl
                                ? 'bg-emerald-500 text-slate-950'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {LEVEL_LABELS[lvl].title}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-slate-400">
                      Aktiver Plan: <strong className="text-white">{plan.name}</strong>
                    </div>
                  </div>
                </div>

                {/* =========================================================
                    7-DAY WEEK OVERVIEW & INTERACTIVE DAY SELECTOR (Mo - So)
                   ========================================================= */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                    <div>
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-400" />
                        Wochenübersicht (Montag bis Sonntag)
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        Wähle einen Wochentag aus, um dessen Übungen oder Ausdauer-Einheit anzusehen, zu starten oder individuell anzupassen.
                      </p>
                    </div>
                  </div>

                  {/* 7 Weekday Cards Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {plan.days.map((day, idx) => {
                      const isSelected = selectedDayIndex === idx;
                      const isToday = todayWeekdayIndex === idx;
                      const typeMeta = DAY_TYPE_LABELS[day.dayType];
                      return (
                        <button
                          key={day.dayIndex}
                          type="button"
                          onClick={() => setSelectedDayIndex(idx)}
                          className={`text-left p-3 rounded-2xl border transition flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-emerald-500/15 border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg'
                              : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-extrabold text-white">
                              {day.dayName}
                            </span>
                            {isToday && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950">
                                Heute
                              </span>
                            )}
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit ${typeMeta.color}`}
                          >
                            {day.dayType === 'ausdauer'
                              ? day.cardioBlock?.discipline === 'radfahren'
                                ? 'Rad-Ausdauer'
                                : 'Lauf-Ausdauer'
                              : day.dayType === 'isometrie'
                              ? 'Isometrie & Kraft'
                              : day.dayType === 'kraft'
                              ? 'Kraft-Split'
                              : day.dayType === 'mobility'
                              ? 'Mobility & Stretch'
                              : 'Ruhe & Check-in'}
                          </span>

                          <div className="text-[11px] text-slate-300 font-medium line-clamp-2 leading-snug">
                            {day.title}
                          </div>

                          <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                            <span>
                              {day.cardioBlock
                                ? `${day.cardioBlock.targetDistanceKm} km + ${day.items.length} Dehnung`
                                : `${day.items.length} Übungen`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Day Header & Customizer */}
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs">
                            {selectedDayPlan.dayName}
                          </span>
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-xl border ${
                              DAY_TYPE_LABELS[selectedDayPlan.dayType].color
                            }`}
                          >
                            {DAY_TYPE_LABELS[selectedDayPlan.dayType].label}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={selectedDayPlan.title}
                          onChange={(e) =>
                            updateSelectedDay((d) => ({ ...d, title: e.target.value }))
                          }
                          className="w-full bg-transparent text-lg sm:text-xl font-extrabold text-white focus:outline-none focus:underline pt-1"
                        />
                        <p className="text-xs sm:text-sm text-slate-400">
                          {selectedDayPlan.subtitle}
                        </p>
                      </div>

                      {/* Day Type Switcher + Add Exercise to this Day */}
                      <div className="flex flex-wrap items-end gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Tagestyp ändern (z.B. Ausdauertag einfügen)
                          </label>
                          <select
                            value={selectedDayPlan.dayType}
                            onChange={(e) => {
                              const newType = e.target.value as DayPlanType;
                              updateSelectedDay((d) => ({
                                ...d,
                                dayType: newType,
                                cardioBlock:
                                  newType === 'ausdauer' && !d.cardioBlock
                                    ? {
                                        discipline: 'laufen',
                                        targetDistanceKm: 6.0,
                                        targetDurationMinutes: 35,
                                        targetElevationMeters: 50,
                                        intensityZone: 'Zone 2 (Grundlagenausdauer)',
                                        coachingNote:
                                          'Lockeres Tempo, anschließend 5 Min. Dehnen.',
                                      }
                                    : newType !== 'ausdauer'
                                    ? undefined
                                    : d.cardioBlock,
                              }));
                              triggerToast(
                                `${selectedDayPlan.dayName} auf "${DAY_TYPE_LABELS[newType].label}" umgestellt!`
                              );
                            }}
                            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-white"
                          >
                            <option value="kraft">Kraft & Muskel-Tag</option>
                            <option value="isometrie">Isometrie & Gefäß-Tag</option>
                            <option value="ausdauer">Ausdauer-Tag (Laufen / Radfahren)</option>
                            <option value="mobility">Mobility & Dehn-Tag</option>
                            <option value="ruhetag">Regeneration & Ruhetag</option>
                          </select>
                        </div>

                        <div className="flex items-end gap-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                              Übung zu {selectedDayPlan.dayName} hinzufügen
                            </label>
                            <select
                              value={addExerciseIdToPlan}
                              onChange={(e) => setAddExerciseIdToPlan(e.target.value)}
                              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-white max-w-[230px]"
                            >
                              {allExercises.map((ex) => (
                                <option key={ex.id} value={ex.id}>
                                  [{CATEGORY_LABELS[ex.category].title.split(' ')[0]}] {ex.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const ex = allExercises.find((e) => e.id === addExerciseIdToPlan);
                              if (!ex) return;
                              updateSelectedDay((d) => ({
                                ...d,
                                items: [
                                  ...d.items,
                                  {
                                    exerciseId: ex.id,
                                    sets: ex.defaultSets,
                                    targetWeightKg: ex.defaultWeightKg,
                                    targetReps: ex.defaultReps,
                                    targetSeconds: ex.defaultSeconds,
                                    restSeconds: ex.restSeconds,
                                  },
                                ],
                              }));
                              triggerToast(
                                `"${ex.name}" am ${selectedDayPlan.dayName} hinzugefügt!`
                              );
                            }}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            Ergänzen
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* DEDICATED CARDIO BLOCK IF DAY IS AN AUSDAUERTAG */}
                    {selectedDayPlan.cardioBlock && (
                      <div className="rounded-2xl bg-gradient-to-r from-sky-500/15 via-slate-950 to-amber-500/10 border border-sky-500/40 p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
                              {selectedDayPlan.cardioBlock.discipline === 'radfahren' ? (
                                <Bike className="w-6 h-6" />
                              ) : (
                                <Footprints className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-300">
                                Geplante Ausdauer-Einheit am {selectedDayPlan.dayName}
                              </span>
                              <h4 className="text-base sm:text-lg font-extrabold text-white">
                                {selectedDayPlan.cardioBlock.discipline === 'radfahren'
                                  ? 'Radfahren / Cycling'
                                  : 'Laufen / Running'}{' '}
                                ({selectedDayPlan.cardioBlock.targetDistanceKm} km ·{' '}
                                {selectedDayPlan.cardioBlock.targetDurationMinutes} Min.)
                              </h4>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const cb = selectedDayPlan.cardioBlock!;
                              startPlannedCardioInTracker(
                                cb.discipline,
                                cb.targetDistanceKm,
                                cb.targetDurationMinutes,
                                cb.targetElevationMeters || 50,
                                `${selectedDayPlan.dayName}: ${selectedDayPlan.title}`
                              );
                            }}
                            className="px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto shadow-lg"
                          >
                            <Activity className="w-4 h-4" />
                            Im Ausdauer-Tracker starten / loggen
                          </button>
                        </div>

                        {/* Editable Cardio Day Targets */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
                            <label className="block text-[10px] uppercase text-slate-400">
                              Disziplin
                            </label>
                            <select
                              value={selectedDayPlan.cardioBlock.discipline}
                              onChange={(e) =>
                                updateSelectedDay((d) => ({
                                  ...d,
                                  cardioBlock: d.cardioBlock
                                    ? {
                                        ...d.cardioBlock,
                                        discipline: e.target.value as 'laufen' | 'radfahren',
                                      }
                                    : undefined,
                                }))
                              }
                              className="w-full bg-transparent text-sm font-bold text-white focus:outline-none mt-1"
                            >
                              <option value="laufen" className="bg-slate-900">
                                Laufen
                              </option>
                              <option value="radfahren" className="bg-slate-900">
                                Radfahren
                              </option>
                            </select>
                          </div>

                          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
                            <label className="block text-[10px] uppercase text-slate-400">
                              Ziel-Distanz (km)
                            </label>
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={selectedDayPlan.cardioBlock.targetDistanceKm}
                              onChange={(e) =>
                                updateSelectedDay((d) => ({
                                  ...d,
                                  cardioBlock: d.cardioBlock
                                    ? {
                                        ...d.cardioBlock,
                                        targetDistanceKm: Number(e.target.value) || 5,
                                      }
                                    : undefined,
                                }))
                              }
                              className="w-full bg-transparent text-sm font-bold text-sky-300 focus:outline-none mt-1"
                            />
                          </div>

                          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
                            <label className="block text-[10px] uppercase text-slate-400">
                              Ziel-Dauer (Min.)
                            </label>
                            <input
                              type="number"
                              step="5"
                              min="5"
                              value={selectedDayPlan.cardioBlock.targetDurationMinutes}
                              onChange={(e) =>
                                updateSelectedDay((d) => ({
                                  ...d,
                                  cardioBlock: d.cardioBlock
                                    ? {
                                        ...d.cardioBlock,
                                        targetDurationMinutes: Number(e.target.value) || 30,
                                      }
                                    : undefined,
                                }))
                              }
                              className="w-full bg-transparent text-sm font-bold text-white focus:outline-none mt-1"
                            />
                          </div>

                          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
                            <label className="block text-[10px] uppercase text-slate-400">
                              Höhenmeter (opt.)
                            </label>
                            <input
                              type="number"
                              step="10"
                              min="0"
                              value={selectedDayPlan.cardioBlock.targetElevationMeters || 0}
                              onChange={(e) =>
                                updateSelectedDay((d) => ({
                                  ...d,
                                  cardioBlock: d.cardioBlock
                                    ? {
                                        ...d.cardioBlock,
                                        targetElevationMeters: Number(e.target.value) || 0,
                                      }
                                    : undefined,
                                }))
                              }
                              className="w-full bg-transparent text-sm font-bold text-white focus:outline-none mt-1"
                            />
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 pt-1">
                          <span>
                            <strong className="text-sky-300">Intensität:</strong>{' '}
                            {selectedDayPlan.cardioBlock.intensityZone}
                          </span>
                          <span className="text-slate-400">
                            {selectedDayPlan.cardioBlock.coachingNote}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Exercises for the Selected Weekday */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {selectedDayPlan.items.map((item, idx) => {
                        const ex = allExercises.find((e) => e.id === item.exerciseId);
                        if (!ex) return null;

                        const lastLog = strengthLogs
                          .filter((l) => l.exerciseId === ex.id)
                          .sort((a, b) => b.performedAt.localeCompare(a.performedAt))[0];

                        return (
                          <div
                            key={`${item.exerciseId}-${idx}`}
                            className="rounded-2xl bg-slate-950/85 border border-slate-800/90 p-4 flex flex-col justify-between gap-4 hover:border-slate-700 transition"
                          >
                            <div className="space-y-3">
                              {/* Top Row: Index, Category Badge & Reorder/Delete buttons */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <span
                                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                      CATEGORY_LABELS[ex.category].badge
                                    }`}
                                  >
                                    {CATEGORY_LABELS[ex.category].title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      updateSelectedDay((d) => {
                                        const copy = [...d.items];
                                        const temp = copy[idx - 1];
                                        copy[idx - 1] = copy[idx];
                                        copy[idx] = temp;
                                        return { ...d, items: copy };
                                      });
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                                    title="Nach oben"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === selectedDayPlan.items.length - 1}
                                    onClick={() => {
                                      updateSelectedDay((d) => {
                                        const copy = [...d.items];
                                        const temp = copy[idx + 1];
                                        copy[idx + 1] = copy[idx];
                                        copy[idx] = temp;
                                        return { ...d, items: copy };
                                      });
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 disabled:opacity-30"
                                    title="Nach unten"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateSelectedDay((d) => ({
                                        ...d,
                                        items: d.items.filter((_, i) => i !== idx),
                                      }));
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                                    title="Aus diesem Wochentag entfernen"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Animated Exercise Preview */}
                              <ExerciseAnimation
                                pose={ex.animationPose}
                                category={ex.category}
                                size="sm"
                              />

                              {/* Exercise Name & Health / Muscle Info */}
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-white text-base">
                                    {ex.name}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedDetailExercise(ex)}
                                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
                                  >
                                    <Info className="w-3.5 h-3.5" />
                                    Anleitung
                                  </button>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                  {ex.healthBenefits}
                                </p>
                              </div>

                              {/* Editable Target Parameters (Sets, Weight, Duration/Reps, Pause) */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                                  <label className="block text-[10px] uppercase text-slate-400">
                                    Sätze
                                  </label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={item.sets}
                                    onChange={(e) => {
                                      const val = Math.max(1, Number(e.target.value) || 1);
                                      updateSelectedDay((d) => {
                                        const copy = [...d.items];
                                        copy[idx] = { ...item, sets: val };
                                        return { ...d, items: copy };
                                      });
                                    }}
                                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none mt-0.5"
                                  />
                                </div>

                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                                  <label className="block text-[10px] uppercase text-slate-400">
                                    Gewicht (kg)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min={0}
                                    value={item.targetWeightKg}
                                    onChange={(e) => {
                                      const val = Math.max(0, Number(e.target.value) || 0);
                                      updateSelectedDay((d) => {
                                        const copy = [...d.items];
                                        copy[idx] = { ...item, targetWeightKg: val };
                                        return { ...d, items: copy };
                                      });
                                    }}
                                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none mt-0.5"
                                  />
                                </div>

                                {ex.isTimed ? (
                                  <div className="bg-slate-900 border border-violet-500/30 rounded-xl p-2">
                                    <label className="block text-[10px] uppercase text-violet-300">
                                      Dauer (Sek.)
                                    </label>
                                    <input
                                      type="number"
                                      step="5"
                                      min={5}
                                      value={item.targetSeconds}
                                      onChange={(e) => {
                                        const val = Math.max(5, Number(e.target.value) || 30);
                                        updateSelectedDay((d) => {
                                          const copy = [...d.items];
                                          copy[idx] = { ...item, targetSeconds: val };
                                          return { ...d, items: copy };
                                        });
                                      }}
                                      className="w-full bg-transparent text-sm font-bold text-violet-200 focus:outline-none mt-0.5"
                                    />
                                  </div>
                                ) : (
                                  <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-2">
                                    <label className="block text-[10px] uppercase text-emerald-300">
                                      Wiederholungen
                                    </label>
                                    <input
                                      type="number"
                                      min={1}
                                      value={item.targetReps}
                                      onChange={(e) => {
                                        const val = Math.max(1, Number(e.target.value) || 8);
                                        updateSelectedDay((d) => {
                                          const copy = [...d.items];
                                          copy[idx] = { ...item, targetReps: val };
                                          return { ...d, items: copy };
                                        });
                                      }}
                                      className="w-full bg-transparent text-sm font-bold text-emerald-200 focus:outline-none mt-0.5"
                                    />
                                  </div>
                                )}

                                <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-2">
                                  <label className="block text-[10px] uppercase text-amber-300">
                                    Pause (Sek.)
                                  </label>
                                  <input
                                    type="number"
                                    step="5"
                                    min={5}
                                    value={item.restSeconds}
                                    onChange={(e) => {
                                      const val = Math.max(5, Number(e.target.value) || 30);
                                      updateSelectedDay((d) => {
                                        const copy = [...d.items];
                                        copy[idx] = { ...item, restSeconds: val };
                                        return { ...d, items: copy };
                                      });
                                    }}
                                    className="w-full bg-transparent text-sm font-bold text-amber-200 focus:outline-none mt-0.5"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Bottom Row: Last Logged Info & Start in Tracker Button */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                              <div className="text-[11px] text-slate-400">
                                {lastLog ? (
                                  <span>
                                    Letztes Mal ({lastLog.performedAt}):{' '}
                                    <strong className="text-slate-200">
                                      {ex.isTimed
                                        ? `${lastLog.durationSeconds}s`
                                        : `${lastLog.weightKg}kg × ${lastLog.reps}`}
                                    </strong>
                                  </span>
                                ) : (
                                  <span>Noch nicht geloggt</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => startExerciseInTracker(ex.id)}
                                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md"
                              >
                                <Timer className="w-3.5 h-3.5" />
                                Übung starten
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SUB-VIEW B: COMPLETE ANIMATED EXERCISE LIBRARY (56+ Exercises + Custom Exercises) */
              <div className="space-y-5">
                {/* Filter Bar + Create Custom Exercise CTA */}
                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`In ${allExercises.length} Übungen nach Name, Beschreibung, Gerät oder Muskel-Tag suchen...`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <select
                      value={goalFilter}
                      onChange={(e) =>
                        setGoalFilter(e.target.value as TrainingGoal | 'alle')
                      }
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                    >
                      <option value="alle">Alle Trainingsziele</option>
                      <option value="blutdruck">Ziel: Blutdruck senken</option>
                      <option value="muskelaufbau">Ziel: Muskelaufbau</option>
                      <option value="fit_im_alter">Ziel: Fit im Alter</option>
                      <option value="ausdauer">Ziel: Ausdauer</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCreateExerciseModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shrink-0 shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      Eigene Übung anlegen
                    </button>
                  </div>

                  {/* Category Filter Pills with Counts */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {(
                      [
                        { id: 'alle', label: `Alle (${categoryCounts.alle})` },
                        {
                          id: 'isometrisch',
                          label: `Isometrisch (${categoryCounts.isometrisch})`,
                        },
                        {
                          id: 'geraete',
                          label: `Kraft mit Geräten (${categoryCounts.geraete})`,
                        },
                        {
                          id: 'koerpergewicht',
                          label: `Kraft ohne Geräte (${categoryCounts.koerpergewicht})`,
                        },
                        {
                          id: 'dehnung',
                          label: `Dehnung & Mobility (${categoryCounts.dehnung})`,
                        },
                      ] as const
                    ).map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategoryFilter(cat.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap border transition ${
                          categoryFilter === cat.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exercise Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExercises.map((ex) => {
                    const isCustom = ex.id.startsWith('custom-');
                    return (
                      <div
                        key={ex.id}
                        className={`rounded-2xl bg-slate-900/85 border p-4 flex flex-col justify-between gap-4 hover:border-slate-700 transition ${
                          isCustom
                            ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                            : 'border-slate-800/90'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                                  CATEGORY_LABELS[ex.category].badge
                                }`}
                              >
                                {CATEGORY_LABELS[ex.category].title}
                              </span>
                              {isCustom && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                  Eigene Übung
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] text-slate-400 truncate max-w-[130px]">
                                {ex.equipment}
                              </span>
                              {isCustom && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomExercise(ex.id, ex.name)}
                                  className="p-1 rounded-lg bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800"
                                  title="Eigene Übung löschen"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <ExerciseAnimation
                            pose={ex.animationPose}
                            category={ex.category}
                            size="md"
                          />

                          <div>
                            <h3 className="font-bold text-white text-base">
                              {ex.name}
                            </h3>

                            {/* Muscle Tags */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {ex.primaryMuscles.map((m) => (
                                <span
                                  key={m}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-200 border border-slate-800 font-medium"
                                >
                                  {m}
                                </span>
                              ))}
                            </div>

                            {/* Goal & Level Tags */}
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {ex.goals.map((g) => (
                                <span
                                  key={g}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-semibold"
                                >
                                  {GOAL_LABELS[g].title.split(' ')[0]}
                                </span>
                              ))}
                              {ex.levels.map((lvl) => (
                                <span
                                  key={lvl}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/25"
                                >
                                  {LEVEL_LABELS[lvl].title}
                                </span>
                              ))}
                            </div>

                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                              {ex.healthBenefits}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailExercise(ex)}
                              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition"
                            >
                              Technik & Atmung
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                updateSelectedDay((d) => ({
                                  ...d,
                                  items: [
                                    ...d.items,
                                    {
                                      exerciseId: ex.id,
                                      sets: ex.defaultSets,
                                      targetWeightKg: ex.defaultWeightKg,
                                      targetReps: ex.defaultReps,
                                      targetSeconds: ex.defaultSeconds,
                                      restSeconds: ex.restSeconds,
                                    },
                                  ],
                                }));
                                triggerToast(
                                  `"${ex.name}" zum ${selectedDayPlan.dayName} hinzugefügt!`
                                );
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-bold transition"
                              title={`Zu ${selectedDayPlan.dayName} hinzufügen`}
                            >
                              + {selectedDayPlan.dayShort}
                            </button>
                            <button
                              type="button"
                              onClick={() => startExerciseInTracker(ex.id)}
                              className="flex-1 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1"
                            >
                              <Timer className="w-3.5 h-3.5" />
                              Tracken
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            SÄULE 2: SMART-TRACKER (KRAFT/ISOMETRIE, AUSDAUER, GEWICHT)
           ========================================================= */}
        {activeTab === 'pillar2' && (
          <div className="space-y-6">
            {/* Sub-Nav Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/70 border border-slate-800/90 p-4 rounded-2xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Säule 2 · Smart-Logging mit Auto-Prefill & Countdown
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                  Workout-, Cardio- & Gewichts-Tracker
                </h2>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setP2SubTab('strength')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                    p2SubTab === 'strength'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Dumbbell className="w-4 h-4" />
                  Kraft & Isometrie
                </button>
                <button
                  type="button"
                  onClick={() => setP2SubTab('cardio')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                    p2SubTab === 'cardio'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Laufen & Rad
                </button>
                <button
                  type="button"
                  onClick={() => setP2SubTab('weight')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                    p2SubTab === 'weight'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  Sonntags-Gewicht
                </button>
              </div>
            </div>

            {/* SUB-TAB 1: STRENGTH, ISOMETRIC & STRETCH TRACKER */}
            {p2SubTab === 'strength' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Exercise Selector, Animation, Countdown & Form */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="rounded-2xl bg-slate-900/85 border border-slate-800 p-5 space-y-5">
                    {/* Exercise Picker */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Übung auswählen (Werte vom letzten Mal werden automatisch geladen)
                      </label>
                      <select
                        value={trackedExerciseId}
                        onChange={(e) => setTrackedExerciseId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm sm:text-base font-bold text-white focus:outline-none focus:border-emerald-500"
                      >
                        {allExercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name} ({CATEGORY_LABELS[ex.category].title})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Smart Prefill Notification Banner */}
                    {prefillBanner && (
                      <div className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{prefillBanner}</span>
                      </div>
                    )}

                    {/* Live Animation of Selected Exercise */}
                    <ExerciseAnimation
                      pose={currentTrackedExercise.animationPose}
                      category={currentTrackedExercise.category}
                      size="md"
                    />

                    {/* Breathing Coaching Alert */}
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                      <strong className="text-sky-400">Atem- & Technik-Fokus: </strong>
                      {currentTrackedExercise.breathingTip}
                    </div>

                    {/* Integrated Countdown Timer */}
                    <CountdownTimer
                      targetSeconds={
                        currentTrackedExercise.isTimed
                          ? inputSeconds
                          : inputRestSeconds
                      }
                      restSeconds={inputRestSeconds}
                      onRestSecondsChange={(newRest) => setInputRestSeconds(newRest)}
                      totalSets={inputSets}
                      exerciseName={currentTrackedExercise.name}
                      onCompleteAllSets={() =>
                        triggerToast(
                          `Alle ${inputSets} Sätze ${currentTrackedExercise.name} geschafft! Jetzt unten speichern.`
                        )
                      }
                    />

                    {/* Input Form: kg, sets, seconds, reps, restSeconds */}
                    <form onSubmit={handleSaveStrengthLog} className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                        {/* Weight (kg) */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                          <label className="block text-[11px] font-semibold text-slate-400">
                            Gewicht (kg)
                          </label>
                          <div className="flex items-center justify-between mt-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setInputWeightKg((w) => Math.max(0, Number((w - 2.5).toFixed(1))))
                              }
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={inputWeightKg}
                              onChange={(e) => setInputWeightKg(Number(e.target.value))}
                              className="w-12 text-center bg-transparent text-sm sm:text-base font-extrabold text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setInputWeightKg((w) => Number((w + 2.5).toFixed(1)))
                              }
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Sets */}
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                          <label className="block text-[11px] font-semibold text-slate-400">
                            Sätze
                          </label>
                          <div className="flex items-center justify-between mt-1.5">
                            <button
                              type="button"
                              onClick={() => setInputSets((s) => Math.max(1, s - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={inputSets}
                              onChange={(e) => setInputSets(Number(e.target.value))}
                              className="w-10 text-center bg-transparent text-sm sm:text-base font-extrabold text-white focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setInputSets((s) => s + 1)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Seconds */}
                        <div
                          className={`bg-slate-950 border rounded-xl p-2.5 ${
                            currentTrackedExercise.isTimed
                              ? 'border-violet-500/50'
                              : 'border-slate-800'
                          }`}
                        >
                          <label className="block text-[11px] font-semibold text-violet-300">
                            Sekunden (Dauer)
                          </label>
                          <div className="flex items-center justify-between mt-1.5">
                            <button
                              type="button"
                              onClick={() => setInputSeconds((s) => Math.max(0, s - 5))}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="5"
                              min="0"
                              value={inputSeconds}
                              onChange={(e) => setInputSeconds(Number(e.target.value))}
                              className="w-12 text-center bg-transparent text-sm sm:text-base font-extrabold text-violet-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setInputSeconds((s) => s + 5)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Reps */}
                        <div
                          className={`bg-slate-950 border rounded-xl p-2.5 ${
                            !currentTrackedExercise.isTimed
                              ? 'border-emerald-500/50'
                              : 'border-slate-800'
                          }`}
                        >
                          <label className="block text-[11px] font-semibold text-emerald-300">
                            Wiederholungen
                          </label>
                          <div className="flex items-center justify-between mt-1.5">
                            <button
                              type="button"
                              onClick={() => setInputReps((r) => Math.max(1, r - 1))}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={inputReps}
                              onChange={(e) => setInputReps(Number(e.target.value))}
                              className="w-10 text-center bg-transparent text-sm sm:text-base font-extrabold text-emerald-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setInputReps((r) => r + 1)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Pause / Rest Seconds */}
                        <div className="bg-slate-950 border border-amber-500/50 rounded-xl p-2.5 col-span-2 sm:col-span-1">
                          <label className="block text-[11px] font-semibold text-amber-300">
                            Pause (Sek.)
                          </label>
                          <div className="flex items-center justify-between mt-1.5">
                            <button
                              type="button"
                              onClick={() => setInputRestSeconds((r) => Math.max(5, r - 10))}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="5"
                              min="5"
                              value={inputRestSeconds}
                              onChange={(e) => setInputRestSeconds(Number(e.target.value))}
                              className="w-12 text-center bg-transparent text-sm sm:text-base font-extrabold text-amber-200 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setInputRestSeconds((r) => r + 10)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Datum der Einheit
                          </label>
                          <input
                            type="date"
                            value={inputDate}
                            onChange={(e) => setInputDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            Notiz (optional)
                          </label>
                          <input
                            type="text"
                            value={inputNotes}
                            onChange={(e) => setInputNotes(e.target.value)}
                            placeholder="z.B. Saubere Haltung, ruhige Atmung"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Übung abhaken, loggen & nächste Übung laden
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right Column: Interactive Daily Training Plan Checklist & Recent Strength Logs */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="rounded-2xl bg-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 space-y-4 shadow-xl">
                    {/* Header + Weekday Selector */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          Dein Trainingsplan im Tracker
                        </span>
                        <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                          {selectedDayPlan.dayName}: {selectedDayPlan.title}
                        </h3>
                      </div>
                      {selectedDayIndex !== todayWeekdayIndex && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDayIndex(todayWeekdayIndex);
                            const todayItems = plan.days[todayWeekdayIndex]?.items || [];
                            if (todayItems.length > 0) {
                              setTrackedExerciseId(todayItems[0].exerciseId);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 hover:bg-emerald-500/25 shrink-0"
                        >
                          Zu Heute springen
                        </button>
                      )}
                    </div>

                    {/* 7-Day Compact Switcher Pills */}
                    <div className="grid grid-cols-7 gap-1">
                      {plan.days.map((d, idx) => {
                        const isSelected = idx === selectedDayIndex;
                        const isToday = idx === todayWeekdayIndex;
                        const doneCount = d.items.filter((it, i) =>
                          manualCheckedMap[`${inputDate}:${idx}:${i}:${it.exerciseId}`] !==
                          undefined
                            ? manualCheckedMap[`${inputDate}:${idx}:${i}:${it.exerciseId}`]
                            : strengthLogs.some(
                                (l) =>
                                  l.exerciseId === it.exerciseId &&
                                  l.performedAt === inputDate
                              )
                        ).length;
                        const allDone = d.items.length > 0 && doneCount === d.items.length;

                        return (
                          <button
                            key={d.dayIndex}
                            type="button"
                            onClick={() => {
                              setSelectedDayIndex(idx);
                              const firstOpen = d.items.find(
                                (it, i) =>
                                  !(manualCheckedMap[
                                    `${inputDate}:${idx}:${i}:${it.exerciseId}`
                                  ] !== undefined
                                    ? manualCheckedMap[
                                        `${inputDate}:${idx}:${i}:${it.exerciseId}`
                                      ]
                                    : strengthLogs.some(
                                        (l) =>
                                          l.exerciseId === it.exerciseId &&
                                          l.performedAt === inputDate
                                      ))
                              );
                              if (firstOpen) {
                                setTrackedExerciseId(firstOpen.exerciseId);
                              } else if (d.items[0]) {
                                setTrackedExerciseId(d.items[0].exerciseId);
                              }
                            }}
                            className={`py-1.5 px-1 rounded-xl border text-center transition flex flex-col items-center ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md'
                                : allDone
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 font-bold'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 font-semibold'
                            }`}
                          >
                            <span className="text-[11px]">{d.dayShort}</span>
                            <span
                              className={`text-[9px] mt-0.5 ${
                                isSelected ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            >
                              {isToday ? 'HEUTE' : `${doneCount}/${d.items.length}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Daily Progress Bar */}
                    {(() => {
                      const totalItems = selectedDayPlan.items.length;
                      const completedCount = selectedDayPlan.items.filter((it, idx) =>
                        isDayExerciseCompleted(it.exerciseId, idx)
                      ).length;
                      const pct =
                        totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

                      return (
                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-semibold">
                              Tages-Fortschritt ({selectedDayPlan.dayName})
                            </span>
                            <span className="font-extrabold text-emerald-400">
                              {completedCount} / {totalItems} Übungen abgehakt ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {totalItems > 0 && completedCount === totalItems && (
                            <div className="pt-1 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                              Stark! Du hast alle geplanten Übungen für {selectedDayPlan.dayName} erledigt!
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Optional Planned Cardio Block for Endurance Days */}
                    {selectedDayPlan.dayType === 'ausdauer' && selectedDayPlan.cardioBlock && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                        <div className="text-xs">
                          <div className="font-bold text-amber-300 flex items-center gap-1.5">
                            {selectedDayPlan.cardioBlock.discipline === 'laufen' ? (
                              <Footprints className="w-3.5 h-3.5" />
                            ) : (
                              <Bike className="w-3.5 h-3.5" />
                            )}
                            Geplante Ausdauer-Einheit:{' '}
                            {selectedDayPlan.cardioBlock.discipline === 'laufen'
                              ? 'Laufen'
                              : 'Radfahren'}
                          </div>
                          <div className="text-slate-300 mt-0.5">
                            {selectedDayPlan.cardioBlock.targetDistanceKm} km ·{' '}
                            {selectedDayPlan.cardioBlock.targetDurationMinutes} Min. (
                            {selectedDayPlan.cardioBlock.intensityZone})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            startPlannedCardioInTracker(
                              selectedDayPlan.cardioBlock!.discipline,
                              selectedDayPlan.cardioBlock!.targetDistanceKm,
                              selectedDayPlan.cardioBlock!.targetDurationMinutes,
                              selectedDayPlan.cardioBlock!.targetElevationMeters || 50,
                              selectedDayPlan.cardioBlock!.intensityZone
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shrink-0 transition"
                        >
                          Cardio loggen
                        </button>
                      </div>
                    )}

                    {/* Step-by-Step Checkable Exercise List */}
                    <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {selectedDayPlan.items.map((item, idx) => {
                        const ex = allExercises.find((e) => e.id === item.exerciseId);
                        if (!ex) return null;
                        const active = trackedExerciseId === ex.id;
                        const completed = isDayExerciseCompleted(ex.id, idx);

                        return (
                          <div
                            key={`${ex.id}-${idx}`}
                            onClick={() => setTrackedExerciseId(ex.id)}
                            className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                              active
                                ? 'bg-emerald-500/15 border-emerald-400 shadow-md'
                                : completed
                                ? 'bg-slate-950/60 border-emerald-500/30 opacity-80'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Checkbox button to check/uncheck directly */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleChecklistExercise(ex.id, idx);
                                }}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center border transition shrink-0 ${
                                  completed
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold shadow-sm shadow-emerald-500/30'
                                    : 'bg-slate-900 border-slate-700 text-transparent hover:border-emerald-400'
                                }`}
                                title={
                                  completed
                                    ? 'Erledigt – Klicken zum Rückgängigmachen'
                                    : 'Direkt als erledigt abhaken & nächste Übung wählen'
                                }
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-extrabold text-slate-400">
                                    #{idx + 1}
                                  </span>
                                  <span
                                    className={`text-xs sm:text-sm font-bold truncate ${
                                      completed
                                        ? 'line-through text-slate-400'
                                        : 'text-white'
                                    }`}
                                  >
                                    {ex.name}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                  <span className="text-slate-300 font-semibold">
                                    {item.sets} Sätze ×{' '}
                                    {ex.isTimed
                                      ? `${item.targetSeconds}s Halten`
                                      : `${item.targetReps} Wdh.`}
                                    {item.targetWeightKg > 0
                                      ? ` · ${item.targetWeightKg} kg`
                                      : ''}
                                  </span>
                                  <span>· {item.restSeconds}s Pause</span>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1.5">
                              {completed ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  ✓ Erledigt
                                </span>
                              ) : active ? (
                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500 text-slate-950">
                                  ▶ Aktiv
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                                  Laden
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Logs List */}
                  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
                    <h3 className="text-sm font-bold text-white">
                      Zuletzt geloggte Kraft- & Isometrie-Einheiten
                    </h3>
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {strengthLogs.slice(0, 12).map((log) => (
                        <div
                          key={log.id}
                          onClick={() => setTrackedExerciseId(log.exerciseId)}
                          className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between gap-2 cursor-pointer hover:border-slate-700 transition"
                        >
                          <div>
                            <div className="text-xs font-bold text-white">
                              {log.exerciseName}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {log.performedAt} ·{' '}
                              <span className="text-emerald-300 font-semibold">
                                {log.sets} Sätze ×{' '}
                                {log.durationSeconds > 0
                                  ? `${log.durationSeconds} Sek.`
                                  : `${log.reps} Wdh.`}
                                {log.weightKg > 0 ? ` @ ${log.weightKg} kg` : ''}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStrengthLogs((prev) =>
                                prev.filter((item) => item.id !== log.id)
                              );
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400"
                            title="Eintrag löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 2: CARDIO TRACKER (LAUFEN & RADFAHREN) */}
            {p2SubTab === 'cardio' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl bg-slate-900/85 border border-slate-800 p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">
                      Ausdauer-Einheit eintragen
                    </h3>
                    <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setCardioDiscipline('laufen')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                          cardioDiscipline === 'laufen'
                            ? 'bg-sky-400 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Footprints className="w-4 h-4" />
                        Laufen
                      </button>
                      <button
                        type="button"
                        onClick={() => setCardioDiscipline('radfahren')}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                          cardioDiscipline === 'radfahren'
                            ? 'bg-amber-400 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <Bike className="w-4 h-4" />
                        Radfahren
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleSaveCardioLog} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                        <label className="block text-xs text-slate-400">
                          Distanz (km)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          required
                          value={cardioDistanceKm}
                          onChange={(e) => setCardioDistanceKm(Number(e.target.value))}
                          className="w-full bg-transparent text-xl font-extrabold text-white focus:outline-none mt-1"
                        />
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                        <label className="block text-xs text-slate-400">
                          Zeit (Minuten)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          required
                          value={cardioDurationMin}
                          onChange={(e) => setCardioDurationMin(Number(e.target.value))}
                          className="w-full bg-transparent text-xl font-extrabold text-white focus:outline-none mt-1"
                        />
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                        <label className="block text-xs text-slate-400">
                          Höhenmeter (hm, optional)
                        </label>
                        <input
                          type="number"
                          step="5"
                          min="0"
                          value={cardioElevationM}
                          onChange={(e) => setCardioElevationM(Number(e.target.value))}
                          className="w-full bg-transparent text-xl font-extrabold text-white focus:outline-none mt-1"
                        />
                      </div>
                    </div>

                    {/* Live Calculated Pace / Speed */}
                    <div className="px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-400">
                        Automatisch berechnete{' '}
                        {cardioDiscipline === 'laufen'
                          ? 'Pace (min/km)'
                          : 'Durchschnittsgeschwindigkeit'}
                        :
                      </span>
                      <span className="font-extrabold text-emerald-400 text-base">
                        {liveCardioSpeedInfo}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Datum
                        </label>
                        <input
                          type="date"
                          value={cardioDate}
                          onChange={(e) => setCardioDate(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">
                          Strecke / Notiz
                        </label>
                        <input
                          type="text"
                          value={cardioNotes}
                          onChange={(e) => setCardioNotes(e.target.value)}
                          placeholder="z.B. Waldrunde, lockerer Puls"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-slate-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {cardioDiscipline === 'laufen'
                        ? 'Laufeinheit speichern'
                        : 'Radeinheit speichern'}
                    </button>
                  </form>
                </div>

                {/* Recent Cardio Logs */}
                <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    Letzte Lauf- & Radeinheiten
                  </h3>
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {cardioLogs.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                c.discipline === 'laufen'
                                  ? 'bg-sky-500/15 text-sky-300'
                                  : 'bg-amber-500/15 text-amber-300'
                              }`}
                            >
                              {c.discipline === 'laufen' ? 'Laufen' : 'Radfahren'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {c.performedAt}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-bold text-white mt-1">
                            {c.distanceKm} km in {c.durationMinutes} Min.{' '}
                            {c.elevationMeters > 0 && (
                              <span className="text-slate-400 font-normal">
                                ({c.elevationMeters} hm)
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setCardioLogs((prev) =>
                              prev.filter((item) => item.id !== c.id)
                            )
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: SUNDAY WEIGHT & BLOOD PRESSURE TRACKER */}
            {p2SubTab === 'weight' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-2xl bg-slate-900/85 border border-slate-800 p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Scale className="w-5 h-5 text-amber-400" />
                        Sonntags-Gewicht & Ruhe-Blutdruck loggen
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Jeden Sonntag wirst du automatisch erinnert, dein aktuelles Körpergewicht einzutragen.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={enableBrowserSundayNotification}
                      className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 self-start"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      Sonntags-Push testen / aktivieren
                    </button>
                  </div>

                  <form onSubmit={handleSaveWeightLog} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3.5">
                        <label className="block text-xs text-amber-300 font-semibold">
                          Aktuelles Gewicht (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="30"
                          max="300"
                          required
                          value={weightKgInput}
                          onChange={(e) => setWeightKgInput(Number(e.target.value))}
                          className="w-full bg-transparent text-2xl font-extrabold text-white focus:outline-none mt-1"
                        />
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                        <label className="block text-xs text-slate-400">
                          Systolisch (mmHg, opt.)
                        </label>
                        <input
                          type="number"
                          min="70"
                          max="240"
                          value={systolicInput}
                          onChange={(e) => setSystolicInput(Number(e.target.value))}
                          className="w-full bg-transparent text-2xl font-extrabold text-rose-300 focus:outline-none mt-1"
                        />
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                        <label className="block text-xs text-slate-400">
                          Diastolisch (mmHg, opt.)
                        </label>
                        <input
                          type="number"
                          min="40"
                          max="150"
                          value={diastolicInput}
                          onChange={(e) => setDiastolicInput(Number(e.target.value))}
                          className="w-full bg-transparent text-2xl font-extrabold text-rose-300 focus:outline-none mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-400 mb-1">
                        Messdatum
                      </label>
                      <input
                        type="date"
                        value={weightDate}
                        onChange={(e) => setWeightDate(e.target.value)}
                        className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm sm:text-base transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      Sonntags-Messung speichern
                    </button>
                  </form>
                </div>

                <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-white">
                    Bisherige Sonntags-Messungen
                  </h3>
                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {weightLogs.map((w) => (
                      <div
                        key={w.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-sm font-bold text-white">
                            {w.weightKg} kg
                            {w.systolicBp && (
                              <span className="ml-2 text-xs text-rose-300 font-semibold">
                                · RR {w.systolicBp}/{w.diastolicBp} mmHg
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{w.measuredAt}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setWeightLogs((prev) =>
                              prev.filter((item) => item.id !== w.id)
                            )
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            SÄULE 3: INTERAKTIVES STATISTIK-DASHBOARD (LINE CHARTS)
           ========================================================= */}
        {activeTab === 'pillar3' && (
          <div className="space-y-6">
            {/* Top Controls: Domain Selection & X-Axis Time Window */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Säule 3 · Interaktive Fortschritts-Analyse
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                    Statistik-Dashboard & Dynamische Line-Charts
                  </h2>
                </div>

                {/* X-Axis Time Selector */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    X-Achse (Zeitraum flexibel anpassen)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    {(
                      [
                        { id: '7d', label: '7 Tage' },
                        { id: '30d', label: '30 Tage' },
                        { id: '90d', label: '3 Monate' },
                        { id: '365d', label: '1 Jahr' },
                        { id: 'all', label: 'Gesamt' },
                        { id: 'custom', label: 'Eigener Zeitraum' },
                      ] as const
                    ).map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setTimeRange(preset.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          timeRange === preset.id
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Date Range Picker when timeRange === 'custom' */}
              {timeRange === 'custom' && (
                <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Von:</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-slate-400">Bis:</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Discipline / Exercise Selector Bar */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    1. Bereich wählen
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDashboardDomain('kraft')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        dashboardDomain === 'kraft'
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Dumbbell className="w-4 h-4" />
                      Kraft / Isometrie
                    </button>
                    <button
                      type="button"
                      onClick={() => setDashboardDomain('ausdauer')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        dashboardDomain === 'ausdauer'
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Ausdauer
                    </button>
                    <button
                      type="button"
                      onClick={() => setDashboardDomain('gewicht')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                        dashboardDomain === 'gewicht'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Scale className="w-4 h-4" />
                      Gewicht & Blutdruck
                    </button>
                  </div>
                </div>

                {dashboardDomain === 'kraft' && (
                  <>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        2. Kraft- / Isometrie-Übung auswählen
                      </label>
                      <select
                        value={chartExerciseId}
                        onChange={(e) => setChartExerciseId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white"
                      >
                        {allExercises.map((ex) => (
                          <option key={ex.id} value={ex.id}>
                            {ex.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        3. Y-Achsen-Metrik
                      </label>
                      <select
                        value={chartStrengthMetric}
                        onChange={(e) =>
                          setChartStrengthMetric(
                            e.target.value as 'auto' | 'seconds' | 'weight' | 'volume'
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white"
                      >
                        <option value="auto">Automatisch (Sek. / kg)</option>
                        <option value="seconds">Haltedauer (Sekunden)</option>
                        <option value="weight">Max. Gewicht (kg)</option>
                        <option value="volume">Gesamtvolumen</option>
                      </select>
                    </div>
                  </>
                )}

                {dashboardDomain === 'ausdauer' && (
                  <>
                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        2. Ausdauer-Disziplin wählen
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setChartCardioDiscipline('laufen')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                            chartCardioDiscipline === 'laufen'
                              ? 'bg-sky-400 text-slate-950 border-sky-300'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <Footprints className="w-4 h-4" />
                          Laufen
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartCardioDiscipline('radfahren')}
                          className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                            chartCardioDiscipline === 'radfahren'
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <Bike className="w-4 h-4" />
                          Radfahren
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                        3. Y-Achsen-Metrik
                      </label>
                      <select
                        value={chartCardioMetric}
                        onChange={(e) =>
                          setChartCardioMetric(
                            e.target.value as
                              | 'distance'
                              | 'pace_speed'
                              | 'duration'
                              | 'elevation'
                          )
                        }
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white"
                      >
                        <option value="distance">Distanz (km)</option>
                        <option value="pace_speed">
                          {chartCardioDiscipline === 'laufen'
                            ? 'Pace (min/km)'
                            : 'Ø Geschwindigkeit (km/h)'}
                        </option>
                        <option value="duration">Trainingszeit (Min.)</option>
                        <option value="elevation">Höhenmeter (hm)</option>
                      </select>
                    </div>
                  </>
                )}

                {dashboardDomain === 'gewicht' && (
                  <div className="md:col-span-7">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      2. Gesundheits-Metrik wählen
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setChartWeightMetric('weight')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                          chartWeightMetric === 'weight'
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        Körpergewicht (kg)
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartWeightMetric('bp')}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                          chartWeightMetric === 'bp'
                            ? 'bg-rose-500 text-white border-rose-400'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        Systolischer Blutdruck (mmHg)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive SVG Line Chart */}
            <InteractiveLineChart
              title={activeChartConfig.title}
              subtitle={activeChartConfig.subtitle}
              unit={activeChartConfig.unit}
              color={activeChartConfig.color}
              data={activeChartConfig.data}
              lowerIsBetter={activeChartConfig.lowerIsBetter}
            />

            {/* Quick Exercise Chips for fast switching in Strength Chart mode */}
            {dashboardDomain === 'kraft' && (
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Schnellwechsel zwischen Übungen ({allExercises.length} verfügbar)
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                  {allExercises.map((ex) => {
                    const count = strengthLogs.filter(
                      (l) => l.exerciseId === ex.id
                    ).length;
                    return (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => setChartExerciseId(ex.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                          chartExerciseId === ex.id
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{ex.name.split(' (')[0]}</span>
                        {count > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-slate-800/80 text-[10px] text-emerald-300">
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800 px-2 py-2 flex items-center justify-around">
        <button
          type="button"
          onClick={() => setActiveTab('pillar1')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'pillar1' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          <span>1. Wochenplan</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pillar2')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'pillar2' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <Timer className="w-5 h-5" />
          <span>2. Tracker</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pillar3')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'pillar3' ? 'text-emerald-400' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span>3. Statistiken</span>
        </button>
      </nav>

      {/* =========================================================
          MODAL 1: EXERCISE STEP-BY-STEP INSTRUCTIONS & ANIMATION
         ========================================================= */}
      {selectedDetailExercise && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedDetailExercise(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    CATEGORY_LABELS[selectedDetailExercise.category].badge
                  }`}
                >
                  {CATEGORY_LABELS[selectedDetailExercise.category].title}
                </span>
                <h3 className="text-lg font-extrabold text-white mt-1.5">
                  {selectedDetailExercise.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailExercise(null)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Schließen
              </button>
            </div>

            <ExerciseAnimation
              pose={selectedDetailExercise.animationPose}
              category={selectedDetailExercise.category}
              size="lg"
            />

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Gesundheits- & Trainingswirkung
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedDetailExercise.healthBenefits}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Schritt-für-Schritt-Ausführung
              </h4>
              <ol className="space-y-1.5 text-xs sm:text-sm text-slate-200 list-decimal list-inside">
                {selectedDetailExercise.instructions.map((step, i) => (
                  <li key={i} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs text-sky-200">
              <strong>Wichtiger Atem-Hinweis:</strong>{' '}
              {selectedDetailExercise.breathingTip}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const exId = selectedDetailExercise.id;
                  setSelectedDetailExercise(null);
                  startExerciseInTracker(exId);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2"
              >
                <Timer className="w-4 h-4" />
                Jetzt im Tracker mit Countdown starten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: SUNDAY WEIGHT CHECK-IN MODAL
         ========================================================= */}
      {showSundayModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowSundayModal(false)}
        >
          <div
            className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-extrabold text-white">
                  Sonntags-Gewichts-Check-in
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSundayModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Schließen
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300">
              Trage dein aktuelles Sonntags-Gewicht (und optional deinen Ruhe-Blutdruck) ein. Die Werte erscheinen sofort in deinem interaktiven Line-Chart.
            </p>

            <form onSubmit={handleSaveWeightLog} className="space-y-3">
              <div>
                <label className="block text-xs text-amber-300 font-semibold mb-1">
                  Körpergewicht (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKgInput}
                  onChange={(e) => setWeightKgInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-lg font-bold text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Systolisch (optional)
                  </label>
                  <input
                    type="number"
                    value={systolicInput}
                    onChange={(e) => setSystolicInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Diastolisch (optional)
                  </label>
                  <input
                    type="number"
                    value={diastolicInput}
                    onChange={(e) => setDiastolicInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm"
              >
                Speichern
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: ACCOUNT, MULTI-USER PROFIL & CLOUD SYNC INFO
         ========================================================= */}
      {showCloudModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCloudModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-extrabold text-white">
                  Dein FitPulse Account & Cloud-Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCloudModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Schließen
              </button>
            </div>

            {user ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-emerald-300 font-semibold">
                    Aktiver Account ({syncStatus === 'syncing' ? 'Synchronisiert…' : 'Cloud Synchronisiert ✓'})
                  </div>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    {activeUserDisplayName}
                  </div>
                  <div className="text-xs text-slate-300">{user.email}</div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await signOutUser();
                    setUser(null);
                    setGuestMode(false);
                    setShowCloudModal(false);
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Abmelden / Konto wechseln
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                  Du befindest dich aktuell im lokalen Gast-Modus. Melde dich mit deiner Gmail-/E-Mail-Adresse an, um deinen persönlichen Trainingsplan in der Cloud zu synchronisieren.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCloudModal(false);
                    setGuestMode(false);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition"
                >
                  <LogIn className="w-4 h-4" />
                  Zur Einstiegsseite (Anmelden / Konto erstellen)
                </button>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-sky-400" />
                Getrennte Profile (z.B. für dich & deine Freundin)
              </div>
              <p>
                Jedes Konto speichert seinen 7-Tage-Wochenplan, eigene Übungen, abgehakte Trainings und Statistik-Kurven komplett getrennt in eurer Supabase-Datenbank (`auth.uid() = user_id`). Über <strong>„Abmelden / Konto wechseln“</strong> gelangst du jederzeit zurück zur Einstiegsseite.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-400">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Status: {isSupabaseConfigured ? 'Supabase Cloud aktiv verbunden' : 'Lokaler Modus'}
              </div>
              <p>
                Alle Änderungen am Trainingsplan und alle geloggten Einheiten werden automatisch mit deinem Account synchronisiert.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: EIGENE ÜBUNG ZUR BIBLIOTHEK HINZUFÜGEN (MIT ALLEN TAGS & BESCHREIBUNG)
         ========================================================= */}
      {showCreateExerciseModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowCreateExerciseModal(false)}
        >
          <div
            className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Eigene Übung in der Bibliothek anlegen
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                  Neue Übung mit Beschreibung & allen Tags erstellen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateExerciseModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                Schließen
              </button>
            </div>

            <form onSubmit={handleCreateCustomExercise} className="space-y-5">
              {/* 1. Name & Kategorie-Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    1. Name der Übung *
                  </label>
                  <input
                    type="text"
                    required
                    value={newExName}
                    onChange={(e) => setNewExName(e.target.value)}
                    placeholder="z.B. Kurzhantel-Seitheben, Wandsitz einbeinig..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    2. Kategorie-Tag auswählen *
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(CATEGORY_LABELS) as ExerciseCategory[]).map((cat) => {
                      const active = newExCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setNewExCategory(cat);
                            if (cat === 'isometrisch' || cat === 'dehnung') {
                              setNewExIsTimed(true);
                            }
                          }}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold border text-left transition ${
                            active
                              ? CATEGORY_LABELS[cat].badge + ' ring-2 ring-emerald-400/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {CATEGORY_LABELS[cat].title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Beschreibung (Gesundheits- & Trainingsnutzen) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  3. Beschreibung & Trainings-/Gesundheitsnutzen *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newExDescription}
                  onChange={(e) => setNewExDescription(e.target.value)}
                  placeholder="z.B. Kräftigt gezielt die seitliche Schultermuskulatur, verbessert die Schulterstabilität und entlastet den Nacken..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* 4. Equipment / Gerät-Tag */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  4. Equipment / Gerät-Tag markieren oder eingeben
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_EQUIPMENT_TAGS.map((eq) => {
                    const active = newExEquipment === eq;
                    return (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => setNewExEquipment(eq)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                          active
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {eq}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={newExEquipment}
                  onChange={(e) => setNewExEquipment(e.target.value)}
                  placeholder="Oder eigenes Gerät eintippen (z.B. Schlingentrainer / TRX)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              {/* 5. Muskelgruppen-Tags (Mehrfachauswahl + eigener Tag) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    5. Beanspruchte Muskelgruppen-Tags markieren (Mehrfachauswahl)
                  </label>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    {newExMuscles.length} ausgewählt
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                  {Array.from(new Set([...PRESET_MUSCLE_TAGS, ...newExMuscles])).map(
                    (muscle) => {
                      const active = newExMuscles.includes(muscle);
                      return (
                        <button
                          key={muscle}
                          type="button"
                          onClick={() =>
                            setNewExMuscles((prev) =>
                              prev.includes(muscle)
                                ? prev.filter((m) => m !== muscle)
                                : [...prev, muscle]
                            )
                          }
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                            active
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                          }`}
                        >
                          {active && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {muscle}
                        </button>
                      );
                    }
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExCustomMuscleInput}
                    onChange={(e) => setNewExCustomMuscleInput(e.target.value)}
                    placeholder="Weiteren Muskel-Tag ergänzen (z.B. Rotatorenmanschette)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newExCustomMuscleInput.trim();
                      if (val && !newExMuscles.includes(val)) {
                        setNewExMuscles((prev) => [...prev, val]);
                      }
                      setNewExCustomMuscleInput('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-slate-700"
                  >
                    + Tag hinzufügen
                  </button>
                </div>
              </div>

              {/* 6. Trainingsziel-Tags & Level-Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    6. Trainingsziel-Tags markieren
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(GOAL_LABELS) as TrainingGoal[]).map((g) => {
                      const active = newExGoals.includes(g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() =>
                            setNewExGoals((prev) =>
                              prev.includes(g) ? prev.filter((item) => item !== g) : [...prev, g]
                            )
                          }
                          className={`p-2 rounded-xl text-xs font-bold border text-left transition flex items-center justify-between ${
                            active
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{GOAL_LABELS[g].title.split(' ')[0]}</span>
                          {active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    7. Level-Tags markieren
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(Object.keys(LEVEL_LABELS) as FitnessLevel[]).map((lvl) => {
                      const active = newExLevels.includes(lvl);
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() =>
                            setNewExLevels((prev) =>
                              prev.includes(lvl)
                                ? prev.filter((item) => item !== lvl)
                                : [...prev, lvl]
                            )
                          }
                          className={`p-2 rounded-xl text-xs font-bold border text-center transition ${
                            active
                              ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {LEVEL_LABELS[lvl].title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 8. Mess-Modus & Standardwerte (Sätze, kg, Sek./Wdh., Pause) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    8. Trainings-Modus & Standardwerte (für Tracker & Wochenplan)
                  </span>
                  <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNewExIsTimed(false)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        !newExIsTimed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Nach Wiederholungen
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewExIsTimed(true)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        newExIsTimed
                          ? 'bg-violet-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Auf Zeit (Sekunden)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                    <label className="block text-[10px] uppercase text-slate-400">
                      Standard-Sätze
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={newExDefaultSets}
                      onChange={(e) => setNewExDefaultSets(Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none mt-0.5"
                    />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                    <label className="block text-[10px] uppercase text-slate-400">
                      Start-Gewicht (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min={0}
                      value={newExDefaultWeightKg}
                      onChange={(e) => setNewExDefaultWeightKg(Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none mt-0.5"
                    />
                  </div>
                  {newExIsTimed ? (
                    <div className="bg-slate-900 border border-violet-500/40 rounded-xl p-2">
                      <label className="block text-[10px] uppercase text-violet-300">
                        Dauer (Sekunden)
                      </label>
                      <input
                        type="number"
                        step="5"
                        min={5}
                        value={newExDefaultSeconds}
                        onChange={(e) => setNewExDefaultSeconds(Number(e.target.value))}
                        className="w-full bg-transparent text-sm font-bold text-violet-200 focus:outline-none mt-0.5"
                      />
                    </div>
                  ) : (
                    <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-2">
                      <label className="block text-[10px] uppercase text-emerald-300">
                        Wiederholungen
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={newExDefaultReps}
                        onChange={(e) => setNewExDefaultReps(Number(e.target.value))}
                        className="w-full bg-transparent text-sm font-bold text-emerald-200 focus:outline-none mt-0.5"
                      />
                    </div>
                  )}
                  <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-2">
                    <label className="block text-[10px] uppercase text-amber-300">
                      Pause (Sek.)
                    </label>
                    <input
                      type="number"
                      step="5"
                      min={5}
                      value={newExRestSeconds}
                      onChange={(e) => setNewExRestSeconds(Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-bold text-amber-200 focus:outline-none mt-0.5"
                    />
                  </div>
                </div>
              </div>

              {/* 9. Ausführungsschritte, Atem-Tipp & Animations-Vorschau */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      9. Ausführungsanleitung (1 Schritt pro Zeile)
                    </label>
                    <textarea
                      rows={3}
                      value={newExInstructionsText}
                      onChange={(e) => setNewExInstructionsText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Atem- & Technik-Hinweis
                    </label>
                    <input
                      type="text"
                      value={newExBreathingTip}
                      onChange={(e) => setNewExBreathingTip(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    10. Passende 3D-Animations-Vorlage wählen
                  </label>
                  <select
                    value={newExAnimationPose}
                    onChange={(e) => setNewExAnimationPose(e.target.value as AnimationPose)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white"
                  >
                    {ANIMATION_POSE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ExerciseAnimation
                    pose={newExAnimationPose}
                    category={newExCategory}
                    size="sm"
                  />
                </div>
              </div>

              {/* Option: Direkt zum aktuellen Wochentag hinzufügen */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer text-xs sm:text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={newExAddToSelectedDay}
                  onChange={(e) => setNewExAddToSelectedDay(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
                <span>
                  Direkt auch zu meinem aktuellen Wochentag (
                  <strong className="text-emerald-400">{selectedDayPlan.dayName}</strong>) im Trainingsplan hinzufügen
                </span>
              </label>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreateExerciseModal(false)}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-5 h-5" />
                  Eigene Übung in Bibliothek speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
