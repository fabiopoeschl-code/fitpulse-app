export type ExerciseCategory = 'isometrisch' | 'geraete' | 'koerpergewicht' | 'dehnung';
export type TrainingGoal = 'blutdruck' | 'muskelaufbau' | 'fit_im_alter' | 'ausdauer';
export type FitnessLevel = 'anfaenger' | 'fortgeschritten' | 'profi';
export type DayPlanType = 'kraft' | 'isometrie' | 'ausdauer' | 'mobility' | 'ruhetag';

export type AnimationPose =
  | 'wall_sit'
  | 'iso_squat_hold'
  | 'l_sit'
  | 'superman_hold'
  | 'calf_hold'
  | 'handgrip_iso'
  | 'plank'
  | 'side_plank'
  | 'glute_bridge_hold'
  | 'hollow_hold'
  | 'dead_hang'
  | 'pullup'
  | 'bench_press'
  | 'barbell_squat'
  | 'leg_press'
  | 'deadlift'
  | 'seated_row'
  | 'bicep_curl'
  | 'lat_pulldown'
  | 'shoulder_press'
  | 'pushup'
  | 'mountain_climber'
  | 'lunge'
  | 'dips'
  | 'hip_flexor_stretch'
  | 'pigeon_stretch'
  | 'childs_pose'
  | 'hamstring_stretch'
  | 'cat_cow'
  | 'chest_opener'
  | 'chest_press'
  | 'machine_shoulder_press'
  | 'leg_curl'
  | 'leg_extension'
  | 'back_extension'
  | 'cable_crunch'
  | 'worlds_greatest_stretch'
  | 'calf_wall_stretch'
  | 'quad_stretch'
  | 'neck_stretch'
  | 'toe_touch';

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;
  equipment: string;
  isTimed: boolean;
  defaultWeightKg: number;
  defaultSets: number;
  defaultReps: number;
  defaultSeconds: number;
  restSeconds: number;
  goals: TrainingGoal[];
  levels: FitnessLevel[];
  primaryMuscles: string[];
  healthBenefits: string;
  instructions: string[];
  breathingTip: string;
  animationPose: AnimationPose;
  progressionStepKg: number;
  progressionStepSeconds: number;
  progressionStepReps: number;
}

export interface PlanExerciseItem {
  exerciseId: string;
  sets: number;
  targetWeightKg: number;
  targetReps: number;
  targetSeconds: number;
  restSeconds: number;
  notes?: string;
}

export interface PlannedCardioBlock {
  discipline: 'laufen' | 'radfahren';
  targetDistanceKm: number;
  targetDurationMinutes: number;
  targetElevationMeters?: number;
  intensityZone: string;
  coachingNote: string;
}

export interface DayPlan {
  dayIndex: number; // 0 = Montag ... 6 = Sonntag
  dayShort: string; // Mo, Di, Mi, Do, Fr, Sa, So
  dayName: string; // Montag, Dienstag...
  dayType: DayPlanType;
  title: string;
  subtitle: string;
  cardioBlock?: PlannedCardioBlock;
  items: PlanExerciseItem[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  goal: TrainingGoal;
  level: FitnessLevel;
  description: string;
  autoProgression: boolean;
  days: DayPlan[];
  updatedAt: string;
}

export interface StrengthLogEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  weightKg: number;
  sets: number;
  reps: number;
  durationSeconds: number;
  restSeconds?: number;
  performedAt: string;
  notes?: string;
}

export interface CardioLogEntry {
  id: string;
  discipline: 'laufen' | 'radfahren';
  distanceKm: number;
  durationMinutes: number;
  elevationMeters: number;
  performedAt: string;
  notes?: string;
}

export interface WeightLogEntry {
  id: string;
  weightKg: number;
  systolicBp?: number;
  diastolicBp?: number;
  measuredAt: string;
  notes?: string;
}

export const GOAL_LABELS: Record<TrainingGoal, { title: string; subtitle: string; badgeColor: string }> = {
  blutdruck: {
    title: 'Blutdruck senken',
    subtitle: 'Evidenzbasiertes Isometrie-Wochenprotokoll, moderates Ausdauertraining & Vagus-Dehnung',
    badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
  muskelaufbau: {
    title: 'Muskelaufbau (Split)',
    subtitle: 'Wochen-Split (Oberkörper, Unterkörper, Push/Pull, Core-Isometrie & aktives Cardio)',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  fit_im_alter: {
    title: 'Fit im Alter (Longevity)',
    subtitle: 'Gelenkschonende Haltekraft, Griffstärke, Gleichgewicht, Ausdauer & tägliche Mobilität',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  ausdauer: {
    title: 'Ausdauer & Athletik',
    subtitle: 'Strukturierte Lauf- & Rad-Tage kombiniert mit Läufer-Krafttraining, Core & Stretching',
    badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
};

export const LEVEL_LABELS: Record<FitnessLevel, { title: string; factor: number }> = {
  anfaenger: { title: 'Anfänger', factor: 0.75 },
  fortgeschritten: { title: 'Fortgeschritten', factor: 1.0 },
  profi: { title: 'Profi', factor: 1.3 },
};

export const CATEGORY_LABELS: Record<ExerciseCategory, { title: string; badge: string }> = {
  isometrisch: {
    title: 'Isometrisch (Haltekraft)',
    badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  },
  geraete: {
    title: 'Kraft mit Geräten',
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  koerpergewicht: {
    title: 'Kraft ohne Geräte',
    badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  },
  dehnung: {
    title: 'Dehnung & Mobility',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
};

export const DAY_TYPE_LABELS: Record<DayPlanType, { label: string; color: string }> = {
  isometrie: {
    label: 'Isometrie & Gefäß-Tag',
    color: 'bg-violet-500/15 text-violet-300 border-violet-500/35',
  },
  kraft: {
    label: 'Kraft & Muskel-Tag',
    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35',
  },
  ausdauer: {
    label: 'Ausdauer-Tag (Laufen / Rad)',
    color: 'bg-sky-500/15 text-sky-300 border-sky-500/35',
  },
  mobility: {
    label: 'Mobility & Dehn-Tag',
    color: 'bg-amber-500/15 text-amber-300 border-amber-500/35',
  },
  ruhetag: {
    label: 'Regeneration & Ruhetag',
    color: 'bg-slate-800 text-slate-300 border-slate-700',
  },
};

export const EXERCISES: ExerciseDefinition[] = [
  // ============================================================================
  // 1. ISOMETRISCHE ÜBUNGEN (15 Übungen – Blutdruck, Core, Sehnen & Gelenkschutz)
  // ============================================================================
  {
    id: 'iso-wall-sit',
    name: 'Wandsitz (Isometric Wall Sit)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (Wand)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 4,
    defaultReps: 1,
    defaultSeconds: 90,
    restSeconds: 120,
    goals: ['blutdruck', 'fit_im_alter', 'ausdauer', 'muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps', 'Gesäß', 'Rumpf'],
    healthBenefits:
      'Studien-Goldstandard (British Journal of Sports Medicine) zur natürlichen Senkung des Ruheblutdrucks um bis zu 8/4 mmHg durch gezielten Gefäß-Rebound-Effekt.',
    instructions: [
      'Lehne deinen gesamten Rücken flach an eine stabile Wand.',
      'Gleite nach unten, bis Ober- und Unterschenkel einen Winkel von 90° (oder 110° für Einsteiger) bilden.',
      'Füße stehen schulterbreit fest auf dem Boden, Knie zeigen exakt in Richtung Fußspitzen.',
      'Halte die Spannung konstant über die gesamte Countdown-Zeit.',
    ],
    breathingTip:
      'WICHTIG bei Blutdruck-Fokus: Niemals die Luft anhalten (keine Pressatmung)! Atme 4 Sekunden ruhig durch die Nase ein und 4 Sekunden durch den Mund aus.',
    animationPose: 'wall_sit',
    progressionStepKg: 5,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-handgrip',
    name: 'Isometrisches Handkraft-Drücken (Handgrip / Towel Squeeze)',
    category: 'isometrisch',
    equipment: 'Handtrainer, Tennisball oder aufgerolltes Handtuch',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 4,
    defaultReps: 1,
    defaultSeconds: 120,
    restSeconds: 60,
    goals: ['blutdruck', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Unterarm-Flexoren', 'Griffkraft', 'Arterielle Gefäßregulation'],
    healthBenefits:
      'Von der American Heart Association als evidenzbasierte Begleittherapie zur Blutdrucksenkung empfohlen (4×2 Min. bei ca. 30 % Maximalkraft).',
    instructions: [
      'Umgreife ein fest zusammengerolltes Handtuch, einen Tennisball oder Handtrainer mit einer Hand.',
      'Drücke mit moderater, konstanter Kraft (ca. 30–40 % deiner Maximalkraft) zu.',
      'Halte den Druck konstant über 2 Minuten, wechsle im nächsten Satz die Hand.',
    ],
    breathingTip: 'Entspannte Schultern, ruhige Bauchatmung während der gesamten Haltezeit.',
    animationPose: 'handgrip_iso',
    progressionStepKg: 0,
    progressionStepSeconds: 15,
    progressionStepReps: 0,
  },
  {
    id: 'iso-plank',
    name: 'Unterarmstütz (Isometric Plank)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 60,
    goals: ['blutdruck', 'fit_im_alter', 'muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Tiefe Bauchmuskulatur (Transversus)', 'Unterer Rücken', 'Schultergürtel'],
    healthBenefits:
      'Schützt die Lendenwirbelsäule, kräftigt das gesamte Rumpfkorsett ohne Bandscheibenbelastung und verbessert die Gefäßspannung.',
    instructions: [
      'Ellbogen direkt unter den Schultern aufsetzen, Unterarme parallel.',
      'Körper bildet von den Fersen bis zum Hinterkopf eine schnurgerade Linie.',
      'Bauchnabel leicht nach innen ziehen und Gesäß aktiv anspannen.',
    ],
    breathingTip: 'Gleichmäßig in den Brustkorb atmen, während die Bauchdecke fest bleibt.',
    animationPose: 'plank',
    progressionStepKg: 5,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-side-plank',
    name: 'Seitstütz (Side Plank Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 45,
    restSeconds: 45,
    goals: ['fit_im_alter', 'blutdruck', 'muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Schräge Bauchmuskeln (Obliques)', 'Quadratus Lumborum', 'Hüftabduktoren'],
    healthBenefits:
      'Stärkt die seitliche Rumpfkette für eine aufrechte Haltung und stabilisiert das Becken beim Laufen.',
    instructions: [
      'Auf die Seite legen, unteren Ellbogen exakt unter der Schulter platzieren.',
      'Hüfte vom Boden anheben, bis Oberkörper und Beine eine gerade Linie bilden.',
      'Nach der Hälfte oder im nächsten Satz die Seite wechseln.',
    ],
    breathingTip: 'Fließend weiteratmen, Schulter aktiv weg vom Ohr drücken.',
    animationPose: 'side_plank',
    progressionStepKg: 2.5,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-glute-bridge-hold',
    name: 'Isometrische Schulterbrücke (Glute Bridge Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (optional Kurzhantel)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 60,
    goals: ['blutdruck', 'fit_im_alter', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Gesäßmuskulatur (Gluteus Maximus)', 'Beinrückseite', 'Rückenstrecker'],
    healthBenefits:
      'Ideale Übung gegen langes Sitzen und für gesunden Blutdruck in Rückenlage – entlastet die Kniegelenke vollständig.',
    instructions: [
      'In Rückenlage die Füße hüftbreit nah am Gesäß aufstellen.',
      'Becken kraftvoll anheben, bis Knie, Hüfte und Schultern eine Diagonale bilden.',
      'Gesäß oben fest zusammenkneifen und die Position ruhig halten.',
    ],
    breathingTip: 'Tief in den Bauch ein- und ausatmen, Nacken bleibt völlig entspannt am Boden.',
    animationPose: 'glute_bridge_hold',
    progressionStepKg: 5,
    progressionStepSeconds: 15,
    progressionStepReps: 0,
  },
  {
    id: 'iso-single-leg-bridge',
    name: 'Einbeinige Isometrische Brücke (Single-Leg Glute Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 40,
    restSeconds: 45,
    goals: ['ausdauer', 'fit_im_alter', 'muskelaufbau'],
    levels: ['fortgeschritten', 'profi'],
    primaryMuscles: ['Gesäß (Gluteus Medius & Maximus)', 'Beinbizeps', 'Beckenstabilisatoren'],
    healthBenefits:
      'Verhindert das Abkippen der Hüfte beim Laufen (Runner’s Knee Prävention) und gleicht muskuläre Dysbalancen aus.',
    instructions: [
      'Aus der Schulterbrücke ein Bein gestreckt in Verlängerung des Oberschenkels anheben.',
      'Beide Beckenhälften exakt auf gleicher Höhe halten – nicht absinken lassen.',
      'Nach Ablauf der Zeit direkt das andere Bein halten.',
    ],
    breathingTip: 'Ruhig durchatmen, Druck fest über die Standferse in den Boden geben.',
    animationPose: 'glute_bridge_hold',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-hollow-hold',
    name: 'Hollow Body Hold (Schiffchen halten)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 40,
    restSeconds: 60,
    goals: ['muskelaufbau', 'ausdauer'],
    levels: ['fortgeschritten', 'profi'],
    primaryMuscles: ['Gerader Bauchmuskel', 'Tiefe Core-Muskulatur', 'Hüftbeuger'],
    healthBenefits:
      'Maximale isometrische Rumpfspannung aus dem Turnsport für eiserne Körpermitte und optimale Kraftübertragung.',
    instructions: [
      'Auf den Rücken legen und die Lendenwirbelsäule fest in die Matte drücken.',
      'Schulterblätter und gestreckte Beine leicht vom Boden abheben.',
      'Der untere Rücken darf sich keinen Millimeter vom Boden lösen!',
    ],
    breathingTip: 'Kurze, kontrollierte Atemzüge ohne den Kontakt der LWS zum Boden zu verlieren.',
    animationPose: 'hollow_hold',
    progressionStepKg: 2.5,
    progressionStepSeconds: 5,
    progressionStepReps: 0,
  },
  {
    id: 'iso-dead-hang',
    name: 'Aktives Aushängen (Isometric Dead Hang)',
    category: 'isometrisch',
    equipment: 'Klimmzugstange',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 45,
    restSeconds: 60,
    goals: ['fit_im_alter', 'muskelaufbau', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Unterarme & Griffkraft', 'Schultergürtel', 'Wirbelsäulen-Dekompression'],
    healthBenefits:
      'Griffkraft ist einer der stärksten Biomarker für gesundes Altern (Longevity); gleichzeitig werden Schulterdach und Bandscheiben dekomprimiert.',
    instructions: [
      'Stange schulterbreit im Obergriff fest umfassen.',
      'Füße vom Boden lösen (oder bei Bedarf leicht auf einem Stuhl abstützen).',
      'Schultern minimal aktivieren und ruhig halten.',
    ],
    breathingTip: 'Tiefe Bauchatmung lässt die Rippenbögen und die Brustwirbelsäule sanft weiten.',
    animationPose: 'dead_hang',
    progressionStepKg: 5,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-squat-hold',
    name: 'Freie Isometrische Kniebeuge (90° Squat Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (frei im Raum)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 75,
    goals: ['blutdruck', 'fit_im_alter', 'muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps', 'Gesäß', 'Rückenstrecker', 'Fußgewölbe'],
    healthBenefits:
      'Kombiniert die blutdrucksenkende Wirkung des Wandsitzes mit aktiver Fuß-, Knie- und Rumpfstabilisation.',
    instructions: [
      'Schulterbreiter Stand, Hüfte nach hinten-unten senken bis die Oberschenkel nahezu parallel zum Boden sind.',
      'Arme als Gegengewicht lang nach vorn strecken, Brustbein stolz aufrichten.',
      'Position ruhig und ohne Wippen halten.',
    ],
    breathingTip: 'Gleichmäßig weiteratmen – kein Pressen im Bauchraum.',
    animationPose: 'iso_squat_hold',
    progressionStepKg: 5,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-split-squat-hold',
    name: 'Isometrischer Ausfallschritt (Split Squat Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (optional Kurzhanteln)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 45,
    restSeconds: 60,
    goals: ['ausdauer', 'muskelaufbau', 'fit_im_alter', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps', 'Patellasehne', 'Gesäß', 'Gleichgewicht'],
    healthBenefits:
      'Stärkt gezielt die Patella- und Quadrizepssehne (ideal bei Kniebeschwerden beim Laufen) und verbessert die Einbein-Stabilität.',
    instructions: [
      'In eine weite Schrittstellung gehen und das hintere Knie bis ca. 5 cm über den Boden absenken.',
      'Oberkörper aufrecht halten, 80 % des Gewichts ruhen auf dem vorderen Fuß.',
      'Position über die Zeit halten, danach Beinwechsel.',
    ],
    breathingTip: 'Blick auf einen festen Punkt richten und ruhig durch die Nase einatmen.',
    animationPose: 'lunge',
    progressionStepKg: 2.5,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-calf-hold',
    name: 'Isometrisches Wadenheben (Achilles Tendon Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte / Treppenstufe',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 4,
    defaultReps: 1,
    defaultSeconds: 45,
    restSeconds: 45,
    goals: ['ausdauer', 'fit_im_alter', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Zwillingswadenmuskel (Gastrocnemius)', 'Schollenmuskel (Soleus)', 'Achillessehne'],
    healthBenefits:
      'Aktiviert die Muskel-Venen-Pumpe der Waden („zweites Herz“ für den venösen Rückstrom) und kräftigt die Achillessehne für Läufer.',
    instructions: [
      'Auf die Fußballen drücken, bis die Fersen maximal vom Boden abgehoben sind.',
      'Oben am höchsten Punkt einfrieren und die Spannung halten (bei Bedarf leicht an einer Wand abstützen).',
    ],
    breathingTip: 'Schultern locker lassen und entspannt weiteratmen.',
    animationPose: 'calf_hold',
    progressionStepKg: 5,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-superman-hold',
    name: 'Isometrischer Rückenstrecker (Superman / Arch Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 40,
    restSeconds: 45,
    goals: ['fit_im_alter', 'muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Rückenstrecker (Erector Spinae)', 'Gesäß', 'Hintere Schulter'],
    healthBenefits:
      'Kräftigt die gesamte Aufrichtungsmuskulatur der Wirbelsäule als Gegenspieler zum Sitzen.',
    instructions: [
      'Flach auf den Bauch legen, Blick bleibt zum Boden gerichtet (Nacken lang lassen).',
      'Brustkorb, Arme und gestreckte Beine gleichzeitig wenige Zentimeter vom Boden abheben.',
      'Schulterblätter aktiv nach hinten-unten ziehen und halten.',
    ],
    breathingTip: 'Gleichmäßig in die Flanken atmen.',
    animationPose: 'superman_hold',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'iso-pushup-hold',
    name: 'Tiefer Liegestütz-Hold (Isometric Chaturanga Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 30,
    restSeconds: 60,
    goals: ['muskelaufbau', 'ausdauer'],
    levels: ['fortgeschritten', 'profi'],
    primaryMuscles: ['Brustmuskulatur', 'Trizeps', 'Vordere Schulter', 'Core'],
    healthBenefits:
      'Baut enorme statische Druckkraft im schwierigsten Gelenkwinkel (90° Ellbogenbeugung) auf.',
    instructions: [
      'In die Liegestützposition gehen und den Körper halb absenken (Ellbogen im 90°-Winkel eng am Rumpf).',
      'Körper brettfest knapp über dem Boden schwebend halten.',
    ],
    breathingTip: 'Keinesfalls die Luft anhalten – flache, schnelle Atemzüge in den Brustkorb.',
    animationPose: 'pushup',
    progressionStepKg: 0,
    progressionStepSeconds: 5,
    progressionStepReps: 0,
  },
  {
    id: 'iso-l-sit',
    name: 'L-Sit Hold (Stütz-Winkelstütz)',
    category: 'isometrisch',
    equipment: 'Stühle, Parallettes oder Boden',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 25,
    restSeconds: 60,
    goals: ['muskelaufbau', 'fit_im_alter'],
    levels: ['fortgeschritten', 'profi'],
    primaryMuscles: ['Untere Bauchmuskeln', 'Hüftbeuger', 'Trizeps', 'Schulterblattsenker'],
    healthBenefits:
      'Hochintensive Ganzkörper-Isometrie für Schulterstabilität, Stützkraft und Rumpfkontrolle.',
    instructions: [
      'Hände neben den Hüften auf zwei Stühlen, Griffen oder dem Boden aufstützen.',
      'Arme durchdrücken, Schultern aktiv weg von den Ohren drücken.',
      'Beine angewinkelt (Tuck L-Sit) oder gestreckt im 90°-Winkel vor dem Körper schwebend halten.',
    ],
    breathingTip: 'Kontrolliert weiteratmen.',
    animationPose: 'l_sit',
    progressionStepKg: 0,
    progressionStepSeconds: 5,
    progressionStepReps: 0,
  },
  {
    id: 'iso-wall-angel-hold',
    name: 'Isometrischer Wand-Engel (Wall Angel Hold)',
    category: 'isometrisch',
    equipment: 'Ohne Geräte (Wand)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 45,
    restSeconds: 45,
    goals: ['fit_im_alter', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Unterer & mittlerer Trapez', 'Außenrotatoren der Schulter', 'Halswirbelsäule'],
    healthBenefits:
      'Korrigiert den Rundrücken (Witwenbuckel-Prävention) und öffnet den Brustkorb für freie Atmung.',
    instructions: [
      'Mit Rücken, Gesäß und Hinterkopf flach an eine Wand stellen.',
      'Arme in U-Form (Kaktus-Position, 90° im Ellbogen) komplett gegen die Wand drücken.',
      'Lendenwirbelsäule flach halten und den Druck der Unterarme gegen die Wand konstant halten.',
    ],
    breathingTip: 'Tiefe Zwerchfellatmung (4 Sek. ein, 6 Sek. aus).',
    animationPose: 'chest_opener',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },

  // ============================================================================
  // 2. KRAFTÜBUNGEN MIT GERÄTEN (16 Übungen – Hypertrophie, Grundübungen & Maschinen)
  // ============================================================================
  {
    id: 'eq-bench-press',
    name: 'Bankdrücken (Langhantel / Kurzhanteln)',
    category: 'geraete',
    equipment: 'Hantelbank & Lang-/Kurzhantel',
    isTimed: false,
    defaultWeightKg: 55,
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 0,
    restSeconds: 90,
    goals: ['muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Brustmuskel (Pectoralis)', 'Vordere Schulter', 'Trizeps'],
    healthBenefits:
      'Grundübung für Oberkörper-Druckkraft, Knochendichte im Schultergürtel und Muskelquerschnitt.',
    instructions: [
      'Flach auf die Bank legen, Schulterblätter hinten zusammenziehen und Füße fest am Boden verankern.',
      'Hantel kontrolliert (ca. 2–3 Sek.) bis knapp über das Brustbein absenken.',
      'Ohne Schwung kraftvoll nach oben drücken.',
    ],
    breathingTip: 'Beim Absenken tief einatmen, beim Hochdrücken gleichmäßig ausatmen.',
    animationPose: 'bench_press',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-incline-db-press',
    name: 'Schrägbankdrücken mit Kurzhanteln',
    category: 'geraete',
    equipment: 'Schrägbank (30°) & Kurzhanteln',
    isTimed: false,
    defaultWeightKg: 40,
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 0,
    restSeconds: 90,
    goals: ['muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Obere Brust (Claviculäre Fasern)', 'Vordere Schulter', 'Trizeps'],
    healthBenefits:
      'Gelenkschonender Winkel für die Schulter bei maximaler Dehnung und Kräftigung der oberen Brustmuskulatur.',
    instructions: [
      'Bank auf ca. 30° Neigung einstellen, Schulterblätter fest in das Polster drücken.',
      'Kurzhanteln kontrolliert neben der oberen Brust absenken.',
      'Im leichten Bogen über der Brust zusammenführen.',
    ],
    breathingTip: 'Unten einatmen, beim Hochdrücken ausatmen.',
    animationPose: 'bench_press',
    progressionStepKg: 2,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-barbell-squat',
    name: 'Kniebeugen mit Zusatzgewicht (Squats)',
    category: 'geraete',
    equipment: 'Langhantel / Kurzhantel (Goblet)',
    isTimed: false,
    defaultWeightKg: 65,
    defaultSets: 3,
    defaultReps: 8,
    defaultSeconds: 0,
    restSeconds: 120,
    goals: ['muskelaufbau', 'fit_im_alter', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps', 'Gesäß', 'Rumpfmuskulatur'],
    healthBenefits:
      'Königsdisziplin für Beinkraft, Hormonhaushalt, Knochendichte und Treppensteig-Kraft bis ins hohe Alter.',
    instructions: [
      'Stand etwas breiter als hüftbreit, Fußspitzen zeigen leicht nach außen.',
      'Brust stolz aufrichten, Rumpf anspannen und Hüfte kontrolliert nach hinten-unten senken.',
      'Aus der vollen Fußsohle kraftvoll wieder in den aufrechten Stand drücken.',
    ],
    breathingTip: 'Vor dem Absenken in den Bauch einatmen, beim Aufrichten kräftig ausatmen.',
    animationPose: 'barbell_squat',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-leg-press',
    name: 'Beinpresse',
    category: 'geraete',
    equipment: 'Beinpresse-Maschine',
    isTimed: false,
    defaultWeightKg: 110,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 90,
    goals: ['muskelaufbau', 'fit_im_alter', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Beine (Quadrizeps)', 'Po (Gesäß)', 'Beinbizeps'],
    healthBenefits:
      'Ermöglicht sicheres Beinkrafttraining mit geführter Rückenlehne ohne Belastung der Wirbelsäule.',
    instructions: [
      'Rücken und Gesäß bleiben während der gesamten Bewegung fest am Polster.',
      'Plattform kontrolliert absenken bis ca. 90° Kniewinkel.',
      'Über die Fersen wegdrücken, Knie am obersten Punkt niemals komplett durchschlagen!',
    ],
    breathingTip: 'Gleichmäßig ausatmen beim Wegdrücken – niemals die Luft anhalten.',
    animationPose: 'leg_press',
    progressionStepKg: 5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-romanian-deadlift',
    name: 'Rumänisches Kreuzheben (RDL)',
    category: 'geraete',
    equipment: 'Langhantel oder Kurzhanteln',
    isTimed: false,
    defaultWeightKg: 60,
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 0,
    restSeconds: 90,
    goals: ['muskelaufbau', 'fit_im_alter', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Beinbizeps (Hamstrings)', 'Gesäß', 'Rückenstrecker'],
    healthBenefits:
      'Kräftigt die gesamte hintere Muskelkette und schützt vor Rückenschmerzen durch sauberes Hüftbeugen (Hip Hinge).',
    instructions: [
      'Hantel eng an den Oberschenkeln halten, Knie leicht gebeugt lassen.',
      'Hüfte weit nach hinten schieben, während der Rücken absolut gerade bleibt.',
      'Sobald eine deutliche Dehnung in der Beinrückseite spürbar ist, Hüfte wieder nach vorn strecken.',
    ],
    breathingTip: 'Beim Absenken einatmen, beim Aufrichten ausatmen.',
    animationPose: 'deadlift',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-lat-pulldown',
    name: 'Latzug zur Brust',
    category: 'geraete',
    equipment: 'Latzug-Maschine',
    isTimed: false,
    defaultWeightKg: 50,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 75,
    goals: ['muskelaufbau', 'fit_im_alter', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Rücken (Latissimus)', 'Unterer Trapez', 'Bizeps'],
    healthBenefits:
      'Richtet die Brustwirbelsäule auf, zieht nach vorn fallende Schultern zurück und stärkt den gesamten oberen Rücken.',
    instructions: [
      'Griff etwas breiter als schulterbreit fassen, Brustbein leicht anheben.',
      'Bewegung aus den Schulterblättern einleiten und Stange kontrolliert Richtung oberer Brust ziehen.',
      'Am unteren Punkt 1 Sekunde halten und langsam wieder nach oben führen.',
    ],
    breathingTip: 'Beim Heranziehen ausatmen, beim Nachgeben tief einatmen.',
    animationPose: 'lat_pulldown',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-seated-cable-row',
    name: 'Rudern sitzend am Gerät oder Kabel',
    category: 'geraete',
    equipment: 'Rudermaschine oder Kabelzug',
    isTimed: false,
    defaultWeightKg: 50,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 75,
    goals: ['muskelaufbau', 'fit_im_alter', 'blutdruck', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Rücken (Rhomboiden & Latissimus)', 'Haltung (Mittlerer Trapez)', 'Hintere Schulter'],
    healthBenefits:
      'Perfekte Haltungsübung gegen Schreibtischarbeit – stabilisiert die Schulterblätter und entlastet den Nacken.',
    instructions: [
      'Aufrecht sitzen, Knie leicht gebeugt, Brustbein stolz anheben.',
      'Griff eng am Körper zum unteren Rippenbogen ziehen, Schulterblätter hinten zusammenkneifen.',
      'Langsam über 3 Sekunden wieder nach vorn lassen, ohne den unteren Rücken rund zu machen.',
    ],
    breathingTip: 'Beim Ziehen ausatmen, beim Strecken der Arme einatmen.',
    animationPose: 'seated_row',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-dumbbell-row',
    name: 'Einarmiges Kurzhantel-Rudern',
    category: 'geraete',
    equipment: 'Kurzhantel & Bank',
    isTimed: false,
    defaultWeightKg: 22.5,
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Latissimus', 'Oberer Rücken', 'Rumpf-Antirotation'],
    healthBenefits:
      'Rückenschonendes Krafttraining durch Abstützen auf der Bank; gleicht Kraftunterschiede zwischen links und rechts aus.',
    instructions: [
      'Mit einer Hand und einem Knie auf einer Flachbank abstützen, Rücken parallel zum Boden.',
      'Kurzhantel im Bogen Richtung Hüftgelenk (Hosentasche) ziehen.',
      'Kontrolliert absenken und anschließend die Seite wechseln.',
    ],
    breathingTip: 'Gleichmäßig im Takt der Wiederholungen atmen.',
    animationPose: 'seated_row',
    progressionStepKg: 2,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-shoulder-press',
    name: 'Kurzhantel-Schulterdrücken',
    category: 'geraete',
    equipment: 'Kurzhanteln',
    isTimed: false,
    defaultWeightKg: 28,
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 0,
    restSeconds: 75,
    goals: ['muskelaufbau', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Deltamuskel (Schulter)', 'Trizeps', 'Oberer Trapez'],
    healthBenefits: 'Erhält die Überkopf-Kraft und Schulterstabilität im Alltag und Sport.',
    instructions: [
      'Aufrecht sitzen oder stehen, Kurzhanteln auf Kinnhöhe halten, Ellbogen leicht vor dem Körper.',
      'Hanteln kontrolliert über Kopf zusammenführen, ohne ins Hohlkreuz zu fallen.',
      'Langsam über 2 Sekunden wieder in die Ausgangsposition senken.',
    ],
    breathingTip: 'Beim Hochdrücken ausatmen, keine Pressatmung.',
    animationPose: 'shoulder_press',
    progressionStepKg: 2,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-lateral-raise',
    name: 'Seitheben mit Kurzhanteln (Lateral Raises)',
    category: 'geraete',
    equipment: 'Leichte Kurzhanteln',
    isTimed: false,
    defaultWeightKg: 16,
    defaultSets: 3,
    defaultReps: 15,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Seitlicher Deltamuskel', 'Supraspinatus'],
    healthBenefits: 'Kräftigt die seitliche Schulterkappe und verbessert die Schultergelenk-Führung.',
    instructions: [
      'Aufrechter Stand, Arme leicht gebeugt seitlich am Körper.',
      'Hanteln in der Scapula-Ebene (leicht schräg nach vorn) bis auf Schulterhöhe anheben.',
      'Langsam und ohne Schwung wieder absenken.',
    ],
    breathingTip: 'Beim Anheben ausatmen, Nacken entspannt lassen.',
    animationPose: 'shoulder_press',
    progressionStepKg: 1,
    progressionStepSeconds: 0,
    progressionStepReps: 2,
  },
  {
    id: 'eq-face-pulls',
    name: 'Face Pulls am Kabelzug (Rotatorenmanschette)',
    category: 'geraete',
    equipment: 'Kabelzug mit Seil oder Widerstandsband',
    isTimed: false,
    defaultWeightKg: 20,
    defaultSets: 3,
    defaultReps: 15,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['fit_im_alter', 'muskelaufbau', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Hintere Schulter', 'Außenrotatoren (Infraspinatus)', 'Trapez'],
    healthBenefits:
      'Beste Präventionsübung gegen Schulter-Impingement, Nackenverspannungen und Rundrücken.',
    instructions: [
      'Seil auf Stirnhöhe einstellen und im Obergriff fassen.',
      'Seilenden Richtung Stirn/Ohren ziehen und dabei die Daumen aktiv nach hinten außen drehen.',
      'Endposition 1 Sekunde halten und kontrolliert nachgeben.',
    ],
    breathingTip: 'Beim Heranziehen ruhig ausatmen.',
    animationPose: 'seated_row',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 2,
  },
  {
    id: 'eq-leg-extension',
    name: 'Beinstrecker an der Maschine (Leg Extension)',
    category: 'geraete',
    equipment: 'Beinstrecker-Maschine',
    isTimed: false,
    defaultWeightKg: 45,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps (insb. Vastus Medialis)'],
    healthBenefits: 'Isolierte Kräftigung der kniestabilisierenden Oberschenkelvorderseite.',
    instructions: [
      'Polster knapp oberhalb der Fußgelenke einstellen, Kniegelenk auf Höhe der Drehachse.',
      'Beine kontrolliert bis zur vollen Streckung anheben und oben 1 Sekunde anspannen.',
      'Langsam über 3 Sekunden wieder absenken.',
    ],
    breathingTip: 'Beim Strecken ausatmen, beim Absenken einatmen.',
    animationPose: 'leg_extension',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-leg-curl',
    name: 'Beinbeuger',
    category: 'geraete',
    equipment: 'Beinbeuger-Maschine',
    isTimed: false,
    defaultWeightKg: 40,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'ausdauer', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Hintere Oberschenkel (Hamstrings)', 'Wadenansatz'],
    healthBenefits:
      'Schützt das vordere Kreuzband (ACL) und beugt Zerrungen der Oberschenkelrückseite beim Sprinten und Laufen vor.',
    instructions: [
      'Beinrolle an der unteren Wade positionieren, Fußspitzen leicht heranziehen.',
      'Unterschenkel kraftvoll nach hinten-unten beugen.',
      'Ohne Schwung langsam wieder in die Streckung führen.',
    ],
    breathingTip: 'Beim Beugen ausatmen.',
    animationPose: 'leg_curl',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-bicep-curl',
    name: 'Kurzhantel-Bizeps-Curls (Supiniert / Hammer Curls)',
    category: 'geraete',
    equipment: 'Kurzhanteln oder SZ-Stange',
    isTimed: false,
    defaultWeightKg: 24,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Bizeps Brachii', 'Brachialis', 'Unterarme'],
    healthBenefits: 'Stärkt Armbeuger und Ellbogengelenk für Hebe- und Tragebewegungen im Alltag.',
    instructions: [
      'Aufrecht stehen, Ellbogen bleiben eng an den Rippen fixiert.',
      'Hanteln ohne Schwung aus dem Rücken nach oben beugen.',
      'Kontrolliert bis zur vollen Armstreckung absenken.',
    ],
    breathingTip: 'Beim Hochführen ausatmen, beim Absenken einatmen.',
    animationPose: 'bicep_curl',
    progressionStepKg: 1,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-tricep-pushdown',
    name: 'Trizepsdrücken am Kabelzug (Rope Pushdowns)',
    category: 'geraete',
    equipment: 'Kabelzug mit Seil oder Stange',
    isTimed: false,
    defaultWeightKg: 25,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Trizeps (alle 3 Köpfe)'],
    healthBenefits: 'Gezielte Kräftigung des Oberarmstreckers für stabile Ellbogen.',
    instructions: [
      'Oberarme eng am Oberkörper fixieren, nur die Unterarme bewegen sich.',
      'Seil kraftvoll nach unten drücken und am Ende leicht nach außen spreizen.',
      'Kontrolliert wieder bis kurz über 90° Ellbogenwinkel nachgeben.',
    ],
    breathingTip: 'Beim Runterdrücken ausatmen.',
    animationPose: 'bicep_curl',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-farmers-walk',
    name: 'Farmers Walk (Schweres Gehen auf Zeit)',
    category: 'geraete',
    equipment: '2 Kurzhanteln oder Kettlebells',
    isTimed: true,
    defaultWeightKg: 32,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 45,
    restSeconds: 60,
    goals: ['fit_im_alter', 'muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Griffkraft', 'Trapez & Schultergürtel', 'Rumpfstabilität', 'Herz-Kreislauf'],
    healthBenefits:
      'Eine der besten Longevity-Übungen überhaupt: verbindet Griffkraft, aufrechte Haltung, Knochendichte und Rumpfstabilität.',
    instructions: [
      'In jede Hand eine Kurzhantel oder Kettlebell nehmen.',
      'Brustbein stolz aufrichten, Schultern leicht nach hinten-unten ziehen.',
      'Mit kontrollierten, stabilen Schritten über die gesamte Countdown-Zeit gehen.',
    ],
    breathingTip: 'Ruhig durch die Nase ein- und durch den Mund ausatmen.',
    animationPose: 'bicep_curl',
    progressionStepKg: 2.5,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },

  {
    id: 'eq-chest-press',
    name: 'Brustpresse',
    category: 'geraete',
    equipment: 'Brustpresse-Maschine',
    isTimed: false,
    defaultWeightKg: 40,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 75,
    goals: ['muskelaufbau', 'fit_im_alter', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Brust', 'Schultern', 'Trizeps'],
    healthBenefits:
      'Geführte Druckbewegung für Brust, vordere Schulter und Trizeps – ideal für Einsteiger und schulterschonend, da die Maschine die Bahn vorgibt.',
    instructions: [
      'Sitzhöhe so einstellen, dass die Griffe auf Höhe der mittleren Brust liegen.',
      'Rücken fest an das Polster, Schulterblätter leicht zusammen und nach unten ziehen.',
      'Griffe kontrolliert nach vorn drücken, ohne die Ellbogen ganz durchzustrecken.',
      'Langsam (ca. 2–3 Sek.) zurückführen, bis eine leichte Dehnung in der Brust spürbar ist.',
    ],
    breathingTip: 'Beim Wegdrücken ausatmen, beim Zurückführen einatmen – keine Pressatmung.',
    animationPose: 'chest_press',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-machine-shoulder-press',
    name: 'Schulterpresse',
    category: 'geraete',
    equipment: 'Schulterpresse-Maschine',
    isTimed: false,
    defaultWeightKg: 25,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 75,
    goals: ['muskelaufbau', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Schultern (Deltamuskel)', 'Trizeps'],
    healthBenefits:
      'Kräftigt die Schultern in einer geführten Überkopfbewegung – stabil, rückenfreundlich und gut dosierbar.',
    instructions: [
      'Sitz so einstellen, dass die Griffe etwa auf Schulterhöhe starten.',
      'Rücken und Hinterkopf am Polster, Bauch leicht anspannen (kein Hohlkreuz).',
      'Griffe kontrolliert nach oben drücken, Ellbogen oben nicht ganz durchstrecken.',
      'Langsam wieder bis auf Schulterhöhe absenken.',
    ],
    breathingTip: 'Beim Hochdrücken ausatmen, beim Absenken einatmen.',
    animationPose: 'machine_shoulder_press',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-back-extension',
    name: 'Rückenstrecker am Gerät',
    category: 'geraete',
    equipment: 'Rückenstrecker-Maschine / 45°-Bank',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 15,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['fit_im_alter', 'muskelaufbau', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Unterer Rücken (Rückenstrecker)', 'Gesäß', 'Hintere Oberschenkel'],
    healthBenefits:
      'Stärkt den unteren Rücken und die gesamte hintere Kette – eine der wichtigsten Übungen gegen Rückenschmerzen durch langes Sitzen.',
    instructions: [
      'Polster knapp unterhalb des Hüftknochens einstellen, Fersen fest unter die Rolle.',
      'Arme vor der Brust kreuzen, Rücken gerade halten.',
      'Oberkörper kontrolliert aus der Hüfte nach unten senken.',
      'Langsam wieder aufrichten, bis Oberkörper und Beine eine Linie bilden – nicht ins Hohlkreuz überstrecken.',
    ],
    breathingTip: 'Beim Aufrichten ausatmen, beim Absenken einatmen.',
    animationPose: 'back_extension',
    progressionStepKg: 0,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'eq-cable-crunch',
    name: 'Bauchgerät oder Crunch am Kabel',
    category: 'geraete',
    equipment: 'Bauchmaschine oder Kabelzug mit Seil',
    isTimed: false,
    defaultWeightKg: 25,
    defaultSets: 3,
    defaultReps: 15,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'fit_im_alter', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Bauch (Gerader Bauchmuskel)', 'Schräge Bauchmuskeln'],
    healthBenefits:
      'Trainiert die Bauchmuskulatur gezielt mit dosierbarem Widerstand – stabilisiert die Körpermitte und entlastet die Wirbelsäule.',
    instructions: [
      'Am Kabelzug knien (oder ins Bauchgerät setzen), Seilenden neben dem Kopf halten.',
      'Hüfte bleibt ruhig – die Bewegung kommt nur aus dem Oberkörper.',
      'Wirbelsäule einrollen und die Ellbogen Richtung Oberschenkel führen.',
      'Kontrolliert wieder aufrichten, ohne die Spannung im Bauch zu verlieren.',
    ],
    breathingTip: 'Beim Einrollen kräftig ausatmen, beim Aufrichten einatmen.',
    animationPose: 'cable_crunch',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },

  // ============================================================================
  // 3. KRAFTÜBUNGEN OHNE GERÄTE (13 Übungen – Bodyweight & Calisthenics)
  // ============================================================================
  {
    id: 'bw-pushup',
    name: 'Liegestütze (Clean Push-Ups)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 15,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'ausdauer', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Brust', 'Trizeps', 'Vordere Schulter', 'Core'],
    healthBenefits:
      'Funktionelle Ganzkörper-Druckübung – Studien zeigen eine direkte Korrelation zwischen Liegestütz-Kapazität und Herz-Kreislauf-Gesundheit.',
    instructions: [
      'Hände etwas breiter als schulterbreit aufsetzen, Finger leicht gespreizt.',
      'Körper bildet ein stabiles Brett – Brustkorb senkt sich geschlossen bis kurz über den Boden.',
      'Kraftvoll wieder nach oben drücken (Einsteiger können Hände erhöht auf einer Bank platzieren).',
    ],
    breathingTip: 'Beim Absenken einatmen, beim Hochdrücken ausatmen.',
    animationPose: 'pushup',
    progressionStepKg: 0,
    progressionStepSeconds: 0,
    progressionStepReps: 2,
  },
  {
    id: 'bw-diamond-pushup',
    name: 'Enge / Diamant-Liegestütze (Diamond Push-Ups)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau'],
    levels: ['fortgeschritten', 'profi'],
    primaryMuscles: ['Trizeps', 'Innere Brust', 'Vordere Schulter'],
    healthBenefits: 'Maximale Trizeps- und Brustaktivierung ganz ohne Hanteln.',
    instructions: [
      'Hände eng unter dem Brustbein aufsetzen (Daumen und Zeigefinger nähern sich an).',
      'Ellbogen eng am Körper entlang nach hinten beugen und kraftvoll hochdrücken.',
    ],
    breathingTip: 'Beim Hochdrücken kräftig ausatmen.',
    animationPose: 'pushup',
    progressionStepKg: 0,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'bw-pike-pushup',
    name: 'Schulter-Liegestütze (Pike Push-Ups)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'fit_im_alter'],
    levels: ['fortgeschritten', 'profi'],
    primaryMuscles: ['Vordere & seitliche Schulter', 'Trizeps', 'Oberer Trapez'],
    healthBenefits: 'Ersetzt das Überkopf-Schulterdrücken komplett mit dem eigenen Körpergewicht.',
    instructions: [
      'Aus dem Liegestütz die Hüfte hoch zur Decke schieben, sodass der Körper ein umgekehrtes V bildet.',
      'Scheitel kontrolliert schräg nach vorn zwischen die Hände absenken und wieder hochdrücken.',
    ],
    breathingTip: 'Gleichmäßig weiteratmen.',
    animationPose: 'pushup',
    progressionStepKg: 0,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'bw-pullup',
    name: 'Klimmzüge (Pull-Ups / Chin-Ups)',
    category: 'koerpergewicht',
    equipment: 'Klimmzugstange (optional Widerstandsband)',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 8,
    defaultSeconds: 0,
    restSeconds: 90,
    goals: ['muskelaufbau', 'ausdauer'],
    levels: ['fortgeschritten', 'profi'],
    primaryMuscles: ['Latissimus', 'Bizeps', 'Oberer Rücken', 'Core'],
    healthBenefits: 'Königsübung für die Zugkraft des gesamten Oberkörpers und Griffstärke.',
    instructions: [
      'Aus dem aktiven Hang die Schulterblätter nach unten ziehen.',
      'Brustbein kraftvoll Richtung Stange ziehen, bis das Kinn über der Stange ist.',
      'Kontrolliert wieder bis in den gestreckten Hang ablassen.',
    ],
    breathingTip: 'Beim Hochziehen ausatmen, beim Ablassen einatmen.',
    animationPose: 'pullup',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'bw-inverted-row',
    name: 'Körperrudern an Stange / Tisch (Australian Pull-Ups)',
    category: 'koerpergewicht',
    equipment: 'Niedrige Stange, Schlingentrainer oder stabiler Tisch',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'fit_im_alter', 'blutdruck', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Oberer Rücken (Rhomboiden)', 'Hintere Schulter', 'Bizeps'],
    healthBenefits:
      'Perfekte Zugübung ohne Fitnessstudio – Schwierigkeitsgrad lässt sich stufenlos über den Fußwinkel anpassen.',
    instructions: [
      'Unter eine hüfthohe Stange oder einen Schlingentrainer hängen, Körper bildet eine gerade Linie.',
      'Brustbein bis zur Stange hochziehen und Schulterblätter hinten zusammenkneifen.',
      'Langsam wieder absenken.',
    ],
    breathingTip: 'Beim Hochziehen ausatmen.',
    animationPose: 'seated_row',
    progressionStepKg: 0,
    progressionStepSeconds: 0,
    progressionStepReps: 2,
  },
  {
    id: 'bw-air-squat',
    name: 'Körpergewichts-Kniebeugen (Tempo Air Squats)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 20,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['blutdruck', 'fit_im_alter', 'ausdauer', 'muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps', 'Gesäß', 'Herz-Kreislauf'],
    healthBenefits:
      'Fördert die Durchblutung der größten Muskelgruppen des Körpers, senkt den Gefäßwiderstand und schmiert Hüft- und Kniegelenke.',
    instructions: [
      'Hüft- bis schulterbreiter Stand, Arme beim Absenken nach vorn nehmen.',
      '3 Sekunden kontrolliert absenken, unten kurz halten und zügig wieder aufstehen.',
    ],
    breathingTip: 'Unten einatmen, beim Aufstehen durch den Mund ausatmen.',
    animationPose: 'iso_squat_hold',
    progressionStepKg: 0,
    progressionStepSeconds: 0,
    progressionStepReps: 3,
  },
  {
    id: 'bw-lunges',
    name: 'Ausfallschritte (Controlled Lunges)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte (optional Kurzhanteln)',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['fit_im_alter', 'ausdauer', 'blutdruck', 'muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps', 'Gesäß', 'Gleichgewicht & Fußgelenke'],
    healthBenefits:
      'Trainiert einbeinige Stabilität, Sturzprophylaxe, Hüftmobilität und große Muskelgruppen für den Stoffwechsel.',
    instructions: [
      'Aus dem hüftbreiten Stand einen weiten Schritt nach vorn oder hinten machen.',
      'Hinteres Knie kontrolliert Richtung Boden senken, vorderes Knie bleibt stabil über dem Fuß.',
      'Über die vordere Ferse kraftvoll zurück in den Stand drücken.',
    ],
    breathingTip: 'Gleichmäßig im Rhythmus der Schritte atmen.',
    animationPose: 'lunge',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 2,
  },
  {
    id: 'bw-bulgarian-split-squat',
    name: 'Bulgarische Kniebeugen (Rear-Foot Elevated Split Squat)',
    category: 'koerpergewicht',
    equipment: 'Stuhl, Sofa oder Bank (optional Kurzhanteln)',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 10,
    defaultSeconds: 0,
    restSeconds: 75,
    goals: ['muskelaufbau', 'ausdauer'],
    levels: ['fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps', 'Gesäß (Gluteus Maximus)', 'Hüftstabilisatoren'],
    healthBenefits:
      'Maximales einbeiniges Bein- und Gesäßtraining ohne schwere Wirbelsäulenbelastung – Goldstandard für Läufer und Radsportler.',
    instructions: [
      'Einen Fußrücken hinten auf einer Bank oder Sofakante ablegen.',
      'Standbein kontrolliert beugen, bis das hintere Knie fast den Boden berührt.',
      'Kraftvoll aus dem vorderen Bein wieder hochdrücken.',
    ],
    breathingTip: 'Beim Absenken einatmen, beim Hochdrücken ausatmen.',
    animationPose: 'lunge',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 1,
  },
  {
    id: 'bw-dips',
    name: 'Stütz-Dips (Bench / Bar Dips)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte (Bank / Stuhl / Barren)',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Trizeps', 'Untere Brust', 'Vordere Schulter'],
    healthBenefits: 'Effektiver Aufbau der Armstrecker und Schulterblatt-Depressoren ohne Fitnessstudio.',
    instructions: [
      'Hände schulterbreit an der Kante einer stabilen Bank oder am Barren abstützen.',
      'Ellbogen eng nach hinten beugen, bis die Oberarme etwa parallel zum Boden stehen.',
      'Schultern weg von den Ohren halten und wieder nach oben drücken.',
    ],
    breathingTip: 'Unten einatmen, beim Strecken der Arme ausatmen.',
    animationPose: 'dips',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 2,
  },
  {
    id: 'bw-step-ups',
    name: 'Hohes Aufsteigen (Step-Ups auf Bank / Stufe)',
    category: 'koerpergewicht',
    equipment: 'Stabile Bank, Box oder Treppenstufe',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 60,
    goals: ['fit_im_alter', 'blutdruck', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps', 'Gesäß', 'Waden', 'Gleichgewicht'],
    healthBenefits:
      'Alltagsnahe funktionelle Kraft für müheloses Treppensteigen, Bergwandern und sicheres Gleichgewicht.',
    instructions: [
      'Einen Fuß vollständig auf die Stufe oder Bank setzen.',
      'Ohne Abstoßen des hinteren Beins rein aus der Kraft des oberen Beins nach oben drücken.',
      'Langsam und kontrolliert über 3 Sekunden wieder absteigen.',
    ],
    breathingTip: 'Beim Aufsteigen ausatmen.',
    animationPose: 'lunge',
    progressionStepKg: 2,
    progressionStepSeconds: 0,
    progressionStepReps: 2,
  },
  {
    id: 'bw-bird-dog',
    name: 'Diagonalstrecken im Vierfüßler (Bird-Dog Core)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 12,
    defaultSeconds: 0,
    restSeconds: 45,
    goals: ['fit_im_alter', 'blutdruck', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Tiefe Rückenmuskeln (Multifidi)', 'Gesäß', 'Rumpfstabilität'],
    healthBenefits:
      'Von Rückenspezialisten (Prof. Stuart McGill „Big 3“) empfohlen für eine schmerzfreie, stabile Wirbelsäule.',
    instructions: [
      'Im Vierfüßlerstand gleichzeitig den rechten Arm nach vorn und das linke Bein nach hinten strecken.',
      'Becken und unterer Rücken bleiben völlig ruhig und waagerecht.',
      'Gestreckte Position 2 Sekunden halten, dann unter dem Bauch zusammenführen.',
    ],
    breathingTip: 'Beim Strecken ruhig ausatmen.',
    animationPose: 'cat_cow',
    progressionStepKg: 0,
    progressionStepSeconds: 0,
    progressionStepReps: 2,
  },
  {
    id: 'bw-mountain-climbers',
    name: 'Bergsteiger (Controlled Mountain Climbers)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 1,
    defaultSeconds: 45,
    restSeconds: 45,
    goals: ['ausdauer', 'muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Bauchmuskulatur', 'Hüftbeuger', 'Schultergürtel', 'Herz-Kreislauf'],
    healthBenefits:
      'Verbindet dynamische Rumpfstabilität mit intensivem Kraftausdauer-Impuls für Läufer und Athleten.',
    instructions: [
      'In die hohe Liegestützposition gehen, Hände direkt unter den Schultern.',
      'Abwechselnd das linke und rechte Knie kontrolliert Richtung Brust ziehen.',
      'Hüfte bleibt flach in einer Linie mit den Schultern.',
    ],
    breathingTip: 'Gleichmäßig im Rhythmus weiteratmen.',
    animationPose: 'mountain_climber',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'bw-calf-raises',
    name: 'Dynamisches Wadenheben (Single / Double Calf Raises)',
    category: 'koerpergewicht',
    equipment: 'Ohne Geräte / Stufe',
    isTimed: false,
    defaultWeightKg: 0,
    defaultSets: 3,
    defaultReps: 20,
    defaultSeconds: 0,
    restSeconds: 45,
    goals: ['ausdauer', 'fit_im_alter', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Wadenmuskulatur', 'Fußgewölbe'],
    healthBenefits: 'Fördert den venösen Rückfluss zum Herzen und sorgt für elastischen Laufabdruck.',
    instructions: [
      'Langsam bis auf die Zehenspitzen hochdrücken, oben 1 Sekunde halten.',
      'Fersen kontrolliert wieder bis leicht unter Stufenniveau absenken.',
    ],
    breathingTip: 'Ruhig und rhythmisch atmen.',
    animationPose: 'calf_hold',
    progressionStepKg: 2.5,
    progressionStepSeconds: 0,
    progressionStepReps: 3,
  },

  // ============================================================================
  // 4. DEHNÜBUNGEN & MOBILITY (12 Übungen – Fest in jedem Wochenplan integriert)
  // ============================================================================
  {
    id: 'str-hip-flexor',
    name: 'Hüftbeuger- & Psoas-Dehnung (Couch Stretch)',
    category: 'dehnung',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 20,
    goals: ['blutdruck', 'fit_im_alter', 'muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Hüftbeuger (Iliopsoas)', 'Vorderer Oberschenkel', 'Beckenaufrichtung'],
    healthBenefits:
      'Öffnet verkürzte Hüftbeuger vom vielen Sitzen, entlastet sofort die Lendenwirbelsäule und verbessert den Laufstil.',
    instructions: [
      'In den Einbein-Kniestand gehen (ein Knie am Boden auf einem Kissen, der andere Fuß vorn aufgestellt).',
      'Becken leicht nach hinten kippen (Gesäß der hinteren Seite anspannen).',
      'Oberkörper aufrecht halten und Hüfte sanft nach vorn schieben.',
    ],
    breathingTip: 'Mit jedem langen Ausatmen (6 Sekunden) die Hüfte ein Stück weiter entspannen.',
    animationPose: 'hip_flexor_stretch',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-hamstring',
    name: 'Beinrückseiten- & Waden-Stretch (Hamstring Stretch)',
    category: 'dehnung',
    equipment: 'Ohne Geräte',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 20,
    goals: ['fit_im_alter', 'ausdauer', 'blutdruck', 'muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Beinbizeps (Hamstrings)', 'Waden', 'Unterer Rücken'],
    healthBenefits:
      'Fördert die arterielle Flexibilität der unteren Extremitäten und schützt vor Zerrungen beim Laufen und Radfahren.',
    instructions: [
      'Eine Ferse mit gestrecktem Bein vor dem Körper aufstellen (oder im Sitzen ein Bein strecken).',
      'Mit geradem Rücken aus dem Hüftgelenk leicht nach vorn neigen, Fußspitze sanft heranziehen.',
    ],
    breathingTip: 'Ruhige Parasympathikus-Atmung (4 Sek. ein, 6 Sek. aus) zur Senkung der Herzfrequenz.',
    animationPose: 'hamstring_stretch',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-cat-cow',
    name: 'Wirbelsäulen-Welle (Cat-Cow Mobility)',
    category: 'dehnung',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 20,
    goals: ['fit_im_alter', 'blutdruck', 'muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Gesamte Wirbelsäule', 'Brustkorb', 'Nacken'],
    healthBenefits:
      'Versorgt die Bandscheiben mit Nährflüssigkeit und mobilisiert jeden einzelnen Wirbel.',
    instructions: [
      'In den Vierfüßlerstand begeben: Hände unter den Schultern, Knie unter den Hüften.',
      'Beim Ausatmen den Rücken rund wie einen Katzenbuckel nach oben wölben, Kinn Richtung Brust.',
      'Beim Einatmen das Brustbein sanft nach vorn-oben heben.',
    ],
    breathingTip: 'Bewegung exakt an den eigenen Atemrhythmus koppeln.',
    animationPose: 'cat_cow',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-chest-opener',
    name: 'Brust- & Schulteröffner (Thoracic Stretch)',
    category: 'dehnung',
    equipment: 'Ohne Geräte (Wand / Türrahmen)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 20,
    goals: ['blutdruck', 'muskelaufbau', 'fit_im_alter', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Großer & kleiner Brustmuskel', 'Vordere Schulter', 'Atemhilfsmuskulatur'],
    healthBenefits:
      'Befreit den Brustkorb für tieferes Atemvolumen, korrigiert Bildschirm-Haltung und aktiviert den Vagusnerv.',
    instructions: [
      'Unterarm im 90°-Winkel an einen Türrahmen oder eine Wand legen.',
      'Brustbein sanft anheben und den Oberkörper langsam vom Arm wegdrehen.',
    ],
    breathingTip: 'Tief in den gedehnten Brustbereich einatmen, beim Ausatmen Schultern sinken lassen.',
    animationPose: 'chest_opener',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-pigeon',
    name: 'Taube-Dehnung für Gesäß & Piriformis (Pigeon Pose)',
    category: 'dehnung',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 20,
    goals: ['ausdauer', 'fit_im_alter', 'muskelaufbau', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Piriformis', 'Tiefe Gesäßmuskulatur', 'Hüftkapsel'],
    healthBenefits:
      'Löst tiefe Sitzbein- und Ischias-Spannungen nach dem Laufen, Radfahren oder Beintraining.',
    instructions: [
      'Ein Bein angewinkelt vor dem Becken ablegen, das andere Bein lang nach hinten ausstrecken (oder in Rückenlage als Nadelöhr-Dehnung ausführen).',
      'Oberkörper sanft über das vordere Bein neigen und die Hüfte schwer in die Matte sinken lassen.',
    ],
    breathingTip: 'Tief in das Gesäß einatmen und mit jedem Ausatmen Spannung loslassen.',
    animationPose: 'pigeon_stretch',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-worlds-greatest',
    name: 'Rotations-Ausfallschritt (World’s Greatest Stretch)',
    category: 'dehnung',
    equipment: 'Ohne Geräte',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 20,
    goals: ['ausdauer', 'muskelaufbau', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Hüftgelenk', 'Brustwirbelsäule', 'Beinrückseite', 'Schultergürtel'],
    healthBenefits:
      'Mobilisiert in einer einzigen fließenden Bewegung Sprunggelenk, Hüfte und Brustwirbelsäule.',
    instructions: [
      'Großen Ausfallschritt nach vorn machen, hintere Hand flach am Boden abstützen.',
      'Den vorderen Ellbogen erst tief zum Innenknöchel führen und anschließend den Arm weit zur Decke aufdrehen.',
    ],
    breathingTip: 'Beim Aufdrehen zur Decke tief einatmen, beim Absenken ausatmen.',
    animationPose: 'worlds_greatest_stretch',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-childs-pose',
    name: 'Kindeshaltung & Lat-Stretch (Child’s Pose)',
    category: 'dehnung',
    equipment: 'Ohne Geräte (Matte)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 75,
    restSeconds: 15,
    goals: ['blutdruck', 'fit_im_alter', 'muskelaufbau', 'ausdauer'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Unterer Rücken', 'Latissimus', 'Hüfte', 'Vegetatives Nervensystem'],
    healthBenefits:
      'Senkt unmittelbar den Sympathikus-Tonus (Stresslevel & Puls) nach dem Workout und längt den gesamten Rücken.',
    instructions: [
      'Aus dem Fersensitz die Knie leicht öffnen und den Oberkörper weit nach vorn zwischen die Oberschenkel legen.',
      'Arme lang nach vorn ausstrecken, Stirn entspannt auf der Matte ablegen.',
    ],
    breathingTip: 'Bewusst in den unteren Rücken atmen – 4 Sek. ein, 7 Sek. langsam aus.',
    animationPose: 'childs_pose',
    progressionStepKg: 0,
    progressionStepSeconds: 15,
    progressionStepReps: 0,
  },
  {
    id: 'str-calf-wall',
    name: 'Waden- & Achillessehnen-Wanddehnung',
    category: 'dehnung',
    equipment: 'Ohne Geräte (Wand)',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 15,
    goals: ['ausdauer', 'fit_im_alter', 'blutdruck'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Gastrocnemius', 'Soleus', 'Plantarfaszie'],
    healthBenefits:
      'Unverzichtbar nach jedem Lauftraining und zum Erhalt der Sprunggelenks-Beweglichkeit beim Kniebeugen.',
    instructions: [
      'Hände gegen eine Wand stützen, ein Bein weit nach hinten stellen.',
      'Hintere Ferse fest am Boden lassen und die Hüfte langsam Richtung Wand schieben.',
      'Nach 30 Sekunden das hintere Knie leicht beugen, um auch den tiefen Schollenmuskel zu erreichen.',
    ],
    breathingTip: 'Gleichmäßig weiteratmen.',
    animationPose: 'calf_wall_stretch',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-quad-stand',
    name: 'Oberschenkelvorderseiten-Dehnung im Stand (Quad Stretch)',
    category: 'dehnung',
    equipment: 'Ohne Geräte',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 15,
    goals: ['ausdauer', 'fit_im_alter', 'muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Quadrizeps (Rectus Femoris)', 'Kniegelenk-Entlastung'],
    healthBenefits: 'Reduziert Zugspannung auf die Kniescheibe nach Wandsitz, Kniebeugen, Laufen und Radfahren.',
    instructions: [
      'Aufrecht auf einem Bein stehen (bei Bedarf an einer Wand festhalten).',
      'Das andere Sprunggelenk fassen und die Ferse sanft zum Gesäß ziehen.',
      'Knie eng nebeneinander halten und das Becken leicht aufrichten.',
    ],
    breathingTip: 'Ruhig durchatmen.',
    animationPose: 'quad_stretch',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-neck-trapezius',
    name: 'Nacken-, Schulter- & Vagus-Entspannung',
    category: 'dehnung',
    equipment: 'Ohne Geräte',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 60,
    restSeconds: 15,
    goals: ['blutdruck', 'fit_im_alter'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Oberer Trapez', 'Levator Scapulae', 'Skalenus-Muskeln'],
    healthBenefits:
      'Löst Spannungskopfschmerzen und Nackensteifigkeit und beruhigt die Halsschlagader-Barorezeptoren.',
    instructions: [
      'Aufrecht sitzen oder stehen, rechte Schulter aktiv nach unten sinken lassen.',
      'Kopf sanft zur linken Schulter neigen, bis ein milder Zug an der rechten Halsseite spürbar ist.',
      'Nach 30 Sekunden sanft die Seite wechseln.',
    ],
    breathingTip: 'Verlängertes Ausatmen (4 Sek. ein, 6 Sek. aus).',
    animationPose: 'neck_stretch',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
  {
    id: 'str-toe-touch',
    name: 'Vorbeuge im Stand (Fingerspitzen zu den Fußspitzen)',
    category: 'dehnung',
    equipment: 'Ohne Geräte',
    isTimed: true,
    defaultWeightKg: 0,
    defaultSets: 2,
    defaultReps: 1,
    defaultSeconds: 45,
    restSeconds: 15,
    goals: ['fit_im_alter', 'ausdauer', 'blutdruck', 'muskelaufbau'],
    levels: ['anfaenger', 'fortgeschritten', 'profi'],
    primaryMuscles: ['Beinrückseite (Hamstrings)', 'Waden', 'Unterer Rücken'],
    healthBenefits:
      'Dehnt die gesamte hintere Kette von den Waden bis zum unteren Rücken und verbessert die Beweglichkeit beim Bücken im Alltag.',
    instructions: [
      'Hüftbreit aufrecht stehen, Arme zuerst lang nach oben strecken.',
      'Mit dem Ausatmen langsam aus der Hüfte nach vorn-unten beugen, Knie bleiben gestreckt (bei Bedarf minimal gebeugt).',
      'Mit den Fingerspitzen Richtung Fußspitzen greifen und den Kopf locker hängen lassen.',
      'Position halten, ohne zu wippen – zum Aufrichten Wirbel für Wirbel langsam hochrollen.',
    ],
    breathingTip: 'Ruhig weiteratmen und mit jedem Ausatmen ein kleines Stück tiefer sinken lassen.',
    animationPose: 'toe_touch',
    progressionStepKg: 0,
    progressionStepSeconds: 10,
    progressionStepReps: 0,
  },
];

// Hilfsfunktion um einzelne Übungs-Items mit Level-Faktor zu erstellen
export function buildPlanItems(exerciseIds: string[], level: FitnessLevel): PlanExerciseItem[] {
  const factor = LEVEL_LABELS[level].factor;
  const round5 = (val: number) => Math.max(5, Math.round(val / 5) * 5);
  const round25 = (val: number) => Math.max(0, Math.round(val / 2.5) * 2.5);

  return exerciseIds
    .map((id) => {
      const ex = EXERCISES.find((e) => e.id === id);
      if (!ex) return null;
      const sets =
        ex.category === 'dehnung'
          ? 2
          : level === 'anfaenger'
          ? Math.max(2, ex.defaultSets - 1)
          : level === 'profi'
          ? ex.defaultSets + 1
          : ex.defaultSets;

      return {
        exerciseId: ex.id,
        sets,
        targetWeightKg: ex.defaultWeightKg > 0 ? round25(ex.defaultWeightKg * factor) : 0,
        targetReps: ex.isTimed ? 1 : Math.max(6, Math.round(ex.defaultReps * factor)),
        targetSeconds: ex.isTimed ? round5(ex.defaultSeconds * factor) : 0,
        restSeconds: ex.restSeconds,
      };
    })
    .filter(Boolean) as PlanExerciseItem[];
}

// Erstellt einen kompletten, abwechslungsreichen 7-Tage-Wochenplan (Montag bis Sonntag) inkl. Ausdauertagen & Dehnung!
export function generatePlanForGoalAndLevel(goal: TrainingGoal, level: FitnessLevel): TrainingPlan {
  const factor = LEVEL_LABELS[level].factor;
  const roundKm = (km: number) => Number((km * factor).toFixed(1));
  const roundMin = (m: number) => Math.round((m * factor) / 5) * 5;

  const weekMeta: Record<TrainingGoal, { name: string; description: string; days: DayPlan[] }> = {
    // =========================================================================
    // WOCHENPLAN 1: BLUTDRUCK SENKEN (Isometrie + Zone-2 Ausdauer + Vagus-Dehnung)
    // =========================================================================
    blutdruck: {
      name: `7-Tage Herz & Gefäß-Wochenplan (${LEVEL_LABELS[level].title})`,
      description:
        'Abwechslungsreicher Wochenplan nach sportkardiologischen Leitlinien: 3× gezieltes Isometrie- & moderates Krafttraining (mit wechselnden Übungen), 2× Zone-2 Ausdauertage (Laufen & Radfahren) sowie tägliche Gefäß- & Atem-Dehnung.',
      days: [
        {
          dayIndex: 0,
          dayShort: 'Mo',
          dayName: 'Montag',
          dayType: 'isometrie',
          title: 'Isometrie Fokus A: Beine, Gefäße & Brustöffnung',
          subtitle: 'Klassisches 4×2 Min. Wall-Sit Protokoll + Handkraft + Rumpf & Dehnung',
          items: buildPlanItems(
            [
              'iso-wall-sit',
              'iso-handgrip',
              'iso-glute-bridge-hold',
              'eq-seated-cable-row',
              'str-chest-opener',
              'str-hip-flexor',
            ],
            level
          ),
        },
        {
          dayIndex: 1,
          dayShort: 'Di',
          dayName: 'Dienstag',
          dayType: 'ausdauer',
          title: 'Ausdauer-Tag 1: Lockerer Zone-2 Lauf & Bein-Stretch',
          subtitle: 'Moderater Dauerlauf im Wohlfühlpuls + anschließendes Waden- & Hamstring-Dehnen',
          cardioBlock: {
            discipline: 'laufen',
            targetDistanceKm: roundKm(5.5),
            targetDurationMinutes: roundMin(35),
            targetElevationMeters: 40,
            intensityZone: 'Zone 2 (65–75 % HFmax – Unterhaltung problemlos möglich)',
            coachingNote:
              'Gleichmäßiges Tempo wählen; fördert die Stickstoffmonoxid-Ausschüttung (NO) in den Arterienwänden zur Blutdrucksenkung.',
          },
          items: buildPlanItems(['str-calf-wall', 'str-hamstring', 'str-childs-pose'], level),
        },
        {
          dayIndex: 2,
          dayShort: 'Mi',
          dayName: 'Mittwoch',
          dayType: 'isometrie',
          title: 'Isometrie Fokus B: Rumpf, Haltung & Oberkörper',
          subtitle: 'Plank-Varianten, Freie Kniebeuge-Isometrie, Latziehen & Nacken-Entspannung',
          items: buildPlanItems(
            [
              'iso-plank',
              'iso-squat-hold',
              'iso-wall-angel-hold',
              'eq-lat-pulldown',
              'bw-lunges',
              'str-neck-trapezius',
              'str-cat-cow',
            ],
            level
          ),
        },
        {
          dayIndex: 3,
          dayShort: 'Do',
          dayName: 'Donnerstag',
          dayType: 'mobility',
          title: 'Aktive Regeneration & Vagus-Mobility Flow',
          subtitle: 'Sanfte Gelenkmobilisation, tiefe Bauchatmung und Dehnung aller Engstellen',
          items: buildPlanItems(
            [
              'str-cat-cow',
              'str-hip-flexor',
              'str-pigeon',
              'str-chest-opener',
              'str-childs-pose',
            ],
            level
          ),
        },
        {
          dayIndex: 4,
          dayShort: 'Fr',
          dayName: 'Freitag',
          dayType: 'isometrie',
          title: 'Isometrie Fokus C: Waden-Venenpumpe & Ganzkörper',
          subtitle: 'Wandsitz, Achillessehnen-Hold, Dead Hang, Beinpresse & Cool-down Stretch',
          items: buildPlanItems(
            [
              'iso-wall-sit',
              'iso-calf-hold',
              'iso-dead-hang',
              'eq-leg-press',
              'eq-face-pulls',
              'str-quad-stand',
              'str-hamstring',
            ],
            level
          ),
        },
        {
          dayIndex: 5,
          dayShort: 'Sa',
          dayName: 'Samstag',
          dayType: 'ausdauer',
          title: 'Ausdauer-Tag 2: Gelenkschonende Rad-Ausfahrt',
          subtitle: 'Ausgiebige Herz-Kreislauf-Einheit auf dem Rad + Hüftöffner danach',
          cardioBlock: {
            discipline: 'radfahren',
            targetDistanceKm: roundKm(28),
            targetDurationMinutes: roundMin(70),
            targetElevationMeters: 200,
            intensityZone: 'Zone 2 (flüssige Trittfrequenz 80–90 U/min)',
            coachingNote:
              'Hohe Trittfrequenz mit moderatem Widerstand schont die Knie und vermeidet Blutdruckspitzen.',
          },
          items: buildPlanItems(['str-hip-flexor', 'str-pigeon', 'str-chest-opener'], level),
        },
        {
          dayIndex: 6,
          dayShort: 'So',
          dayName: 'Sonntag',
          dayType: 'ruhetag',
          title: 'Sonntags-Check-in (Gewicht & RR) + Entspannungs-Stretch',
          subtitle: 'Wöchentliches Wiegen & Blutdruckmessen am Morgen + 10 Min. sanftes Dehnen',
          items: buildPlanItems(['str-childs-pose', 'str-neck-trapezius', 'str-cat-cow'], level),
        },
      ],
    },

    // =========================================================================
    // WOCHENPLAN 2: MUSKELAUFBAU (Push / Pull / Beine / Ganzkörper + Cardio-Tag)
    // =========================================================================
    muskelaufbau: {
      name: `7-Tage Hypertrophie & Kraft-Split (${LEVEL_LABELS[level].title})`,
      description:
        'Durchdachter 7-Tage-Split mit unterschiedlichen Übungen an jedem Trainingstag: Push (Brust/Schulter/Trizeps), Pull (Rücken/Bizeps/Griffkraft), Legs (Beine/Gesäß), Upper/Core-Mix sowie 1 Cardio-Tag für Herzgesundheit & Regeneration.',
      days: [
        {
          dayIndex: 0,
          dayShort: 'Mo',
          dayName: 'Montag',
          dayType: 'kraft',
          title: 'Tag 1 – Push (Brust, Schulter, Trizeps & Core)',
          subtitle: 'Schwere Druckübungen mit Geräten + isometrisches Finish & Brust-Dehnung',
          items: buildPlanItems(
            [
              'eq-bench-press',
              'eq-chest-press',
              'eq-machine-shoulder-press',
              'eq-lateral-raise',
              'bw-dips',
              'iso-plank',
              'str-chest-opener',
            ],
            level
          ),
        },
        {
          dayIndex: 1,
          dayShort: 'Di',
          dayName: 'Dienstag',
          dayType: 'kraft',
          title: 'Tag 2 – Pull (Rückenbreite, Rückendichte & Bizeps)',
          subtitle: 'Zugübungen am Gerät und Körpergewicht + Dead Hang & Rücken-Stretch',
          items: buildPlanItems(
            [
              'eq-lat-pulldown',
              'eq-seated-cable-row',
              'eq-dumbbell-row',
              'eq-back-extension',
              'eq-bicep-curl',
              'iso-dead-hang',
              'str-childs-pose',
            ],
            level
          ),
        },
        {
          dayIndex: 2,
          dayShort: 'Mi',
          dayName: 'Mittwoch',
          dayType: 'ausdauer',
          title: 'Tag 3 – Aktives Cardio & Hüft-Mobility',
          subtitle: 'Lockerer Regenerationslauf oder Rad-Einheit für Kapillarisierung & Erholung',
          cardioBlock: {
            discipline: 'laufen',
            targetDistanceKm: roundKm(5.0),
            targetDurationMinutes: roundMin(30),
            targetElevationMeters: 50,
            intensityZone: 'Lockerer Grundlagenbereich (Zone 2)',
            coachingNote:
              'Fördert den Laktatabbau und die Nährstoffversorgung der Muskulatur zwischen den schweren Krafttagen.',
          },
          items: buildPlanItems(['str-hip-flexor', 'str-pigeon', 'str-calf-wall'], level),
        },
        {
          dayIndex: 3,
          dayShort: 'Do',
          dayName: 'Donnerstag',
          dayType: 'kraft',
          title: 'Tag 4 – Beine & Gesäß (Quadrizeps, Hamstrings & Waden)',
          subtitle: 'Kniebeugen, Rumänisches Kreuzheben, Beinpresse & Wall-Sit Finisher',
          items: buildPlanItems(
            [
              'eq-barbell-squat',
              'eq-romanian-deadlift',
              'eq-leg-press',
              'eq-leg-curl',
              'iso-wall-sit',
              'iso-calf-hold',
              'str-quad-stand',
              'str-toe-touch',
            ],
            level
          ),
        },
        {
          dayIndex: 4,
          dayShort: 'Fr',
          dayName: 'Freitag',
          dayType: 'kraft',
          title: 'Tag 5 – Athletischer Oberkörper & Isometrischer Core',
          subtitle: 'Klimmzüge, Liegestütz-Varianten, Farmers Walk, Hollow Hold & L-Sit',
          items: buildPlanItems(
            [
              'bw-pullup',
              'bw-pushup',
              'eq-tricep-pushdown',
              'eq-cable-crunch',
              'iso-hollow-hold',
              'iso-l-sit',
              'str-worlds-greatest',
            ],
            level
          ),
        },
        {
          dayIndex: 5,
          dayShort: 'Sa',
          dayName: 'Samstag',
          dayType: 'ausdauer',
          title: 'Tag 6 – Wochenend-Ausdauer (Rad oder Lauf) + Stretch',
          subtitle: 'Konditions-Boost am Samstag inklusive Bein- & Rücken-Dehnung',
          cardioBlock: {
            discipline: 'radfahren',
            targetDistanceKm: roundKm(25),
            targetDurationMinutes: roundMin(60),
            targetElevationMeters: 180,
            intensityZone: 'Zone 2 bis moderates Tempo',
            coachingNote: 'Stärkt das Schlagvolumen des Herzens ohne Muskelabbau-Risiko.',
          },
          items: buildPlanItems(['str-hip-flexor', 'str-hamstring', 'str-cat-cow'], level),
        },
        {
          dayIndex: 6,
          dayShort: 'So',
          dayName: 'Sonntag',
          dayType: 'ruhetag',
          title: 'Tag 7 – Ruhetag, Sonntags-Wiegen & Full-Body Stretch',
          subtitle: 'Muskelwachstum findet in der Regeneration statt – Sonntags-Gewicht eintragen!',
          items: buildPlanItems(['str-childs-pose', 'str-chest-opener', 'str-pigeon'], level),
        },
      ],
    },

    // =========================================================================
    // WOCHENPLAN 3: FIT IM ALTER (Longevity, Gelenkschutz, Balance & Ausdauer)
    // =========================================================================
    fit_im_alter: {
      name: `7-Tage Longevity & Gelenkschutz-Plan (${LEVEL_LABELS[level].title})`,
      description:
        'Ganzheitlicher Wochenplan für lebenslange Kraft, Standfestigkeit, Knochendichte und Beweglichkeit: Wechselnde Kraft- & Isometrie-Einheiten, sanfte Ausdauertage und tägliche Wirbelsäulen-Pflege.',
      days: [
        {
          dayIndex: 0,
          dayShort: 'Mo',
          dayName: 'Montag',
          dayType: 'kraft',
          title: 'Beinkraft, Treppen-Sicherheit & Hüftstreckung',
          subtitle: 'Wandsitz, Step-Ups, Beinpresse und Hüftbeuger-Öffnung',
          items: buildPlanItems(
            [
              'iso-wall-sit',
              'bw-step-ups',
              'eq-leg-press',
              'iso-glute-bridge-hold',
              'str-hip-flexor',
              'str-quad-stand',
            ],
            level
          ),
        },
        {
          dayIndex: 1,
          dayShort: 'Di',
          dayName: 'Dienstag',
          dayType: 'ausdauer',
          title: 'Herz-Kreislauf-Tag: Gelenkschonendes Radfahren',
          subtitle: 'Schmiert die Kniegelenke durch zyklische Bewegung ohne Stoßbelastung',
          cardioBlock: {
            discipline: 'radfahren',
            targetDistanceKm: roundKm(18),
            targetDurationMinutes: roundMin(50),
            targetElevationMeters: 100,
            intensityZone: 'Wohlfühl-Ausdauerbereich',
            coachingNote: 'Fördert die Gelenkflüssigkeit (Synovia) in Hüfte und Knien.',
          },
          items: buildPlanItems(['str-cat-cow', 'str-hamstring', 'str-calf-wall'], level),
        },
        {
          dayIndex: 2,
          dayShort: 'Mi',
          dayName: 'Mittwoch',
          dayType: 'kraft',
          title: 'Aufrechte Haltung, Rücken & Griffkraft (Longevity)',
          subtitle: 'Aktives Aushängen, Kabelrudern, Face Pulls, Wand-Engel & Brust-Stretch',
          items: buildPlanItems(
            [
              'iso-dead-hang',
              'eq-seated-cable-row',
              'eq-face-pulls',
              'iso-wall-angel-hold',
              'eq-farmers-walk',
              'str-chest-opener',
              'str-neck-trapezius',
            ],
            level
          ),
        },
        {
          dayIndex: 3,
          dayShort: 'Do',
          dayName: 'Donnerstag',
          dayType: 'mobility',
          title: 'Gelenk-Mobility & Wirbelsäulen-Tag',
          subtitle: 'Durchbewegen aller Gelenke von Nacken über Brustwirbelsäule bis Hüfte',
          items: buildPlanItems(
            [
              'str-cat-cow',
              'str-worlds-greatest',
              'str-pigeon',
              'str-hip-flexor',
              'str-childs-pose',
            ],
            level
          ),
        },
        {
          dayIndex: 4,
          dayShort: 'Fr',
          dayName: 'Freitag',
          dayType: 'isometrie',
          title: 'Rumpfkorsett, Gleichgewicht & Sturzprophylaxe',
          subtitle: 'Plank, Seitstütz, Bird-Dog, Ausfallschritte & Waden-Stabilität',
          items: buildPlanItems(
            [
              'iso-plank',
              'iso-side-plank',
              'bw-bird-dog',
              'bw-lunges',
              'iso-calf-hold',
              'str-hamstring',
              'str-childs-pose',
            ],
            level
          ),
        },
        {
          dayIndex: 5,
          dayShort: 'Sa',
          dayName: 'Samstag',
          dayType: 'ausdauer',
          title: 'Frische-Luft-Ausdauer: Zügiger Lauf / Power-Walk',
          subtitle: 'Knochendichte-Reiz und Ausdauer-Training am Wochenende',
          cardioBlock: {
            discipline: 'laufen',
            targetDistanceKm: roundKm(4.5),
            targetDurationMinutes: roundMin(35),
            targetElevationMeters: 40,
            intensityZone: 'Moderates Tempo',
            coachingNote: 'Regt den Knochenstoffwechsel (Osteoblasten) und das Gleichgewicht an.',
          },
          items: buildPlanItems(['str-calf-wall', 'str-quad-stand', 'str-hip-flexor'], level),
        },
        {
          dayIndex: 6,
          dayShort: 'So',
          dayName: 'Sonntag',
          dayType: 'ruhetag',
          title: 'Sonntags-Check-in & Entspannungs-Routine',
          subtitle: 'Gewicht loggen + sanftes Durchatmen und Nacken-Entspannung',
          items: buildPlanItems(['str-neck-trapezius', 'str-chest-opener', 'str-childs-pose'], level),
        },
      ],
    },

    // =========================================================================
    // WOCHENPLAN 4: AUSDAUER & ATHLETIK (Laufen, Radfahren & Runner's Strength)
    // =========================================================================
    ausdauer: {
      name: `7-Tage Ausdauer- & Athletik-Wochenplan (${LEVEL_LABELS[level].title})`,
      description:
        'Perfekt abgestimmte Woche für Läufer & Radsportler: 3 strukturierte Ausdauertage (Grundlagenlauf, Rad-Ausdauer, Tempolauf) gepaart mit 3 gezielten Kraft-, Sehnen- & Core-Einheiten für verletzungsfreie Bestzeiten.',
      days: [
        {
          dayIndex: 0,
          dayShort: 'Mo',
          dayName: 'Montag',
          dayType: 'kraft',
          title: 'Läufer- & Rad-Kraft A: Knie-, Sehnen- & Hüftstabilität',
          subtitle: 'Einbein-Kraft & Sehnen-Isometrie gegen Runner’s Knee und Hüftabkippen',
          items: buildPlanItems(
            [
              'iso-split-squat-hold',
              'bw-bulgarian-split-squat',
              'iso-single-leg-bridge',
              'iso-calf-hold',
              'iso-plank',
              'str-hip-flexor',
              'str-pigeon',
            ],
            level
          ),
        },
        {
          dayIndex: 1,
          dayShort: 'Di',
          dayName: 'Dienstag',
          dayType: 'ausdauer',
          title: 'Ausdauer-Tag 1: Lockerer Grundlagenlauf (Zone 2)',
          subtitle: 'Ökonomisierung des Laufstils + anschließendes Waden- & Hüftbeuger-Dehnen',
          cardioBlock: {
            discipline: 'laufen',
            targetDistanceKm: roundKm(6.5),
            targetDurationMinutes: roundMin(38),
            targetElevationMeters: 65,
            intensityZone: 'Zone 2 (Aerobe Schwelle)',
            coachingNote: 'Kurze Bodenkontaktzeit, aufrechte Hüfte und lockere Schultern.',
          },
          items: buildPlanItems(['str-calf-wall', 'str-hip-flexor', 'str-hamstring'], level),
        },
        {
          dayIndex: 2,
          dayShort: 'Mi',
          dayName: 'Mittwoch',
          dayType: 'kraft',
          title: 'Athletik & Oberkörper-Stabilität B',
          subtitle: 'Rumpf-Antirotation, Rücken-Aufrichtung und Kraftausdauer',
          items: buildPlanItems(
            [
              'bw-pushup',
              'bw-inverted-row',
              'bw-mountain-climbers',
              'iso-side-plank',
              'iso-hollow-hold',
              'str-worlds-greatest',
              'str-chest-opener',
            ],
            level
          ),
        },
        {
          dayIndex: 3,
          dayShort: 'Do',
          dayName: 'Donnerstag',
          dayType: 'ausdauer',
          title: 'Ausdauer-Tag 2: Dynamische Rad-Einheit (Cross-Training)',
          subtitle: 'Hohes aerobes Volumen ohne Gelenk-Aufprallkräfte',
          cardioBlock: {
            discipline: 'radfahren',
            targetDistanceKm: roundKm(32),
            targetDurationMinutes: roundMin(75),
            targetElevationMeters: 280,
            intensityZone: 'Zone 2–3 (Inkl. Hügel-Abschnitte)',
            coachingNote:
              'Ideales Cross-Training zur Steigerung der maximalen Sauerstoffaufnahme (VO2max).',
          },
          items: buildPlanItems(['str-quad-stand', 'str-hip-flexor', 'str-cat-cow'], level),
        },
        {
          dayIndex: 4,
          dayShort: 'Fr',
          dayName: 'Freitag',
          dayType: 'isometrie',
          title: 'Isometrische Kraft & Mobility C (Vorbereitung aufs Wochenende)',
          subtitle: 'Wall Sit, Rumänisches Kreuzheben, Glute Hold & tiefe Bein-Dehnung',
          items: buildPlanItems(
            [
              'iso-wall-sit',
              'eq-romanian-deadlift',
              'iso-glute-bridge-hold',
              'bw-calf-raises',
              'str-hamstring',
              'str-pigeon',
            ],
            level
          ),
        },
        {
          dayIndex: 5,
          dayShort: 'Sa',
          dayName: 'Samstag',
          dayType: 'ausdauer',
          title: 'Ausdauer-Tag 3: Langer Wochenend-Lauf (Long Run)',
          subtitle: 'Schlüsseleinheit für Fettstoffwechsel und mentale Ausdauer-Härte',
          cardioBlock: {
            discipline: 'laufen',
            targetDistanceKm: roundKm(9.0),
            targetDurationMinutes: roundMin(52),
            targetElevationMeters: 110,
            intensityZone: 'Ruhig starten, die letzten 2 km leicht steigern',
            coachingNote: 'Nach dem Lauf mindestens 5 Minuten locker austrapen und gründlich dehnen.',
          },
          items: buildPlanItems(
            ['str-calf-wall', 'str-quad-stand', 'str-hip-flexor', 'str-childs-pose'],
            level
          ),
        },
        {
          dayIndex: 6,
          dayShort: 'So',
          dayName: 'Sonntag',
          dayType: 'ruhetag',
          title: 'Regenerationstag & Sonntags-Gewichts-Check',
          subtitle: 'Gewicht eintragen, Beine hochlegen & 10 Min. Parasympathikus-Dehnung',
          items: buildPlanItems(['str-childs-pose', 'str-pigeon', 'str-neck-trapezius'], level),
        },
      ],
    },
  };

  const chosen = weekMeta[goal];

  return {
    id: `plan-${goal}-${level}-v2`,
    name: chosen.name,
    goal,
    level,
    description: chosen.description,
    autoProgression: true,
    days: chosen.days,
    updatedAt: new Date().toISOString(),
  };
}

// Erzeugt realistische 12-Wochen-Verlaufsdaten für den sofortigen Einstieg (Line-Charts & "Letztes Mal"-Prefill)
export function getInitialSeedData() {
  const today = new Date();
  const daysAgo = (d: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() - d);
    return dt.toISOString().split('T')[0];
  };

  const strengthLogs: StrengthLogEntry[] = [
    // Wandsitz (Isometrisch) Progression über 10 Wochen
    { id: 's-1', exerciseId: 'iso-wall-sit', exerciseName: 'Wandsitz (Isometric Wall Sit)', category: 'isometrisch', weightKg: 0, sets: 4, reps: 1, durationSeconds: 60, performedAt: daysAgo(70) },
    { id: 's-2', exerciseId: 'iso-wall-sit', exerciseName: 'Wandsitz (Isometric Wall Sit)', category: 'isometrisch', weightKg: 0, sets: 4, reps: 1, durationSeconds: 70, performedAt: daysAgo(56) },
    { id: 's-3', exerciseId: 'iso-wall-sit', exerciseName: 'Wandsitz (Isometric Wall Sit)', category: 'isometrisch', weightKg: 0, sets: 4, reps: 1, durationSeconds: 80, performedAt: daysAgo(42) },
    { id: 's-4', exerciseId: 'iso-wall-sit', exerciseName: 'Wandsitz (Isometric Wall Sit)', category: 'isometrisch', weightKg: 0, sets: 4, reps: 1, durationSeconds: 95, performedAt: daysAgo(28) },
    { id: 's-5', exerciseId: 'iso-wall-sit', exerciseName: 'Wandsitz (Isometric Wall Sit)', category: 'isometrisch', weightKg: 0, sets: 4, reps: 1, durationSeconds: 110, performedAt: daysAgo(14) },
    { id: 's-6', exerciseId: 'iso-wall-sit', exerciseName: 'Wandsitz (Isometric Wall Sit)', category: 'isometrisch', weightKg: 5, sets: 4, reps: 1, durationSeconds: 120, performedAt: daysAgo(3) },

    // Plank (Isometrisch) Progression
    { id: 's-7', exerciseId: 'iso-plank', exerciseName: 'Unterarmstütz (Isometric Plank)', category: 'isometrisch', weightKg: 0, sets: 3, reps: 1, durationSeconds: 45, performedAt: daysAgo(65) },
    { id: 's-8', exerciseId: 'iso-plank', exerciseName: 'Unterarmstütz (Isometric Plank)', category: 'isometrisch', weightKg: 0, sets: 3, reps: 1, durationSeconds: 55, performedAt: daysAgo(48) },
    { id: 's-9', exerciseId: 'iso-plank', exerciseName: 'Unterarmstütz (Isometric Plank)', category: 'isometrisch', weightKg: 0, sets: 3, reps: 1, durationSeconds: 65, performedAt: daysAgo(32) },
    { id: 's-10', exerciseId: 'iso-plank', exerciseName: 'Unterarmstütz (Isometric Plank)', category: 'isometrisch', weightKg: 0, sets: 3, reps: 1, durationSeconds: 75, performedAt: daysAgo(16) },
    { id: 's-11', exerciseId: 'iso-plank', exerciseName: 'Unterarmstütz (Isometric Plank)', category: 'isometrisch', weightKg: 0, sets: 3, reps: 1, durationSeconds: 90, performedAt: daysAgo(2) },

    // Bankdrücken (Geräte) Progression
    { id: 's-12', exerciseId: 'eq-bench-press', exerciseName: 'Bankdrücken (Langhantel / Kurzhanteln)', category: 'geraete', weightKg: 50, sets: 3, reps: 10, durationSeconds: 0, performedAt: daysAgo(68) },
    { id: 's-13', exerciseId: 'eq-bench-press', exerciseName: 'Bankdrücken (Langhantel / Kurzhanteln)', category: 'geraete', weightKg: 52.5, sets: 3, reps: 10, durationSeconds: 0, performedAt: daysAgo(50) },
    { id: 's-14', exerciseId: 'eq-bench-press', exerciseName: 'Bankdrücken (Langhantel / Kurzhanteln)', category: 'geraete', weightKg: 55, sets: 3, reps: 10, durationSeconds: 0, performedAt: daysAgo(35) },
    { id: 's-15', exerciseId: 'eq-bench-press', exerciseName: 'Bankdrücken (Langhantel / Kurzhanteln)', category: 'geraete', weightKg: 57.5, sets: 3, reps: 10, durationSeconds: 0, performedAt: daysAgo(18) },
    { id: 's-16', exerciseId: 'eq-bench-press', exerciseName: 'Bankdrücken (Langhantel / Kurzhanteln)', category: 'geraete', weightKg: 60, sets: 3, reps: 10, durationSeconds: 0, performedAt: daysAgo(4) },

    // Kniebeugen (Geräte) Progression
    { id: 's-17', exerciseId: 'eq-barbell-squat', exerciseName: 'Kniebeugen mit Zusatzgewicht (Squats)', category: 'geraete', weightKg: 60, sets: 3, reps: 8, durationSeconds: 0, performedAt: daysAgo(60) },
    { id: 's-18', exerciseId: 'eq-barbell-squat', exerciseName: 'Kniebeugen mit Zusatzgewicht (Squats)', category: 'geraete', weightKg: 65, sets: 3, reps: 8, durationSeconds: 0, performedAt: daysAgo(40) },
    { id: 's-19', exerciseId: 'eq-barbell-squat', exerciseName: 'Kniebeugen mit Zusatzgewicht (Squats)', category: 'geraete', weightKg: 70, sets: 3, reps: 8, durationSeconds: 0, performedAt: daysAgo(21) },
    { id: 's-20', exerciseId: 'eq-barbell-squat', exerciseName: 'Kniebeugen mit Zusatzgewicht (Squats)', category: 'geraete', weightKg: 75, sets: 3, reps: 8, durationSeconds: 0, performedAt: daysAgo(5) },

    // Latziehen
    { id: 's-21', exerciseId: 'eq-lat-pulldown', exerciseName: 'Breites Latziehen zur Brust', category: 'geraete', weightKg: 45, sets: 3, reps: 12, durationSeconds: 0, performedAt: daysAgo(45) },
    { id: 's-22', exerciseId: 'eq-lat-pulldown', exerciseName: 'Breites Latziehen zur Brust', category: 'geraete', weightKg: 50, sets: 3, reps: 12, durationSeconds: 0, performedAt: daysAgo(22) },
    { id: 's-23', exerciseId: 'eq-lat-pulldown', exerciseName: 'Breites Latziehen zur Brust', category: 'geraete', weightKg: 55, sets: 3, reps: 12, durationSeconds: 0, performedAt: daysAgo(6) },

    // Dehnung Hüftbeuger
    { id: 's-24', exerciseId: 'str-hip-flexor', exerciseName: 'Hüftbeuger- & Psoas-Dehnung (Couch Stretch)', category: 'dehnung', weightKg: 0, sets: 2, reps: 1, durationSeconds: 60, performedAt: daysAgo(2) },
  ];

  const cardioLogs: CardioLogEntry[] = [
    // Laufen
    { id: 'c-1', discipline: 'laufen', distanceKm: 5.0, durationMinutes: 31.5, elevationMeters: 45, performedAt: daysAgo(75), notes: 'Lockerer Einstiegslauf' },
    { id: 'c-2', discipline: 'laufen', distanceKm: 5.5, durationMinutes: 33.0, elevationMeters: 60, performedAt: daysAgo(61), notes: 'Guter Rhythmus' },
    { id: 'c-3', discipline: 'laufen', distanceKm: 6.2, durationMinutes: 36.0, elevationMeters: 85, performedAt: daysAgo(47), notes: 'Waldlauf mit Steigung' },
    { id: 'c-4', discipline: 'laufen', distanceKm: 7.0, durationMinutes: 39.5, elevationMeters: 90, performedAt: daysAgo(33), notes: 'Neue Distanz-Bestleistung' },
    { id: 'c-5', discipline: 'laufen', distanceKm: 7.5, durationMinutes: 41.0, elevationMeters: 110, performedAt: daysAgo(19), notes: 'Tempodauerlauf' },
    { id: 'c-6', discipline: 'laufen', distanceKm: 8.4, durationMinutes: 44.5, elevationMeters: 135, performedAt: daysAgo(4), notes: 'Starke Pace am Ende' },

    // Radfahren
    { id: 'c-7', discipline: 'radfahren', distanceKm: 22.0, durationMinutes: 58.0, elevationMeters: 180, performedAt: daysAgo(68), notes: 'Feierabendrunde' },
    { id: 'c-8', discipline: 'radfahren', distanceKm: 28.5, durationMinutes: 72.0, elevationMeters: 260, performedAt: daysAgo(52), notes: 'Hügelige Strecke' },
    { id: 'c-9', discipline: 'radfahren', distanceKm: 34.0, durationMinutes: 82.0, elevationMeters: 340, performedAt: daysAgo(36), notes: 'Gute Beinkraft dank Wall Sits' },
    { id: 'c-10', discipline: 'radfahren', distanceKm: 41.5, durationMinutes: 96.0, elevationMeters: 420, performedAt: daysAgo(15), notes: 'Wochenend-Ausfahrt' },
    { id: 'c-11', discipline: 'radfahren', distanceKm: 46.0, durationMinutes: 102.0, elevationMeters: 490, performedAt: daysAgo(1), notes: 'Schneller Schnitt (27 km/h)' },
  ];

  const weightLogs: WeightLogEntry[] = [
    { id: 'w-1', weightKg: 84.6, systolicBp: 136, diastolicBp: 86, measuredAt: daysAgo(77), notes: 'Sonntags-Check-in' },
    { id: 'w-2', weightKg: 84.1, systolicBp: 134, diastolicBp: 85, measuredAt: daysAgo(63), notes: 'Sonntags-Check-in' },
    { id: 'w-3', weightKg: 83.5, systolicBp: 131, diastolicBp: 83, measuredAt: daysAgo(49), notes: 'Sonntags-Check-in' },
    { id: 'w-4', weightKg: 82.9, systolicBp: 128, diastolicBp: 81, measuredAt: daysAgo(35), notes: 'Sonntags-Check-in' },
    { id: 'w-5', weightKg: 82.3, systolicBp: 125, diastolicBp: 79, measuredAt: daysAgo(21), notes: 'Sonntags-Check-in' },
    { id: 'w-6', weightKg: 81.8, systolicBp: 122, diastolicBp: 78, measuredAt: daysAgo(7), notes: 'Sonntags-Check-in' },
  ];

  return { strengthLogs, cardioLogs, weightLogs };
}
