// types/index.ts

// ─── EXISTANTS (inchangés) ─────────────────────────────────────────────────

/** Compte connecté (GET /auth/me). Le rôle dépend de l'école : il viendra des adhésions. */
export interface User {
  id: number
  email: string
  pseudo: string
  isSuperadmin: boolean
  createdAt: string
}

export type ModuleType = 'vocab' | 'dialogue' | 'quiz'

/** Statut d'une leçon POUR UN ÉLÈVE : calculé depuis sa progression (lib/progress.ts), pas fourni par l'API */
export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: string
  unlockedAt?: string
}

// ─── Lesson (mise à jour) ──────────────────────────────────────────────────

export interface Lesson {
  id: number
  levelId: string          // ← ajouter
  unitId: number           // ← ajouter
  unitTitle: string  
  chinese: string        // hanzi du thème ex: "问候"
  pinyin: string         // ex: "wèn hòu"
  title: string          // ex: "Salutations"
  description: string
  language: string  
  modules: ModuleType[]      // 'chinese' — extensible
  color: string
  // ↓ Nouveau : les 3 parties de la leçon
  vocabulaire: VocabItem[]
  dialogue: DialogueLine[]
  quiz: QuizQuestion[]
}

// ─── NOUVEAUX TYPES ────────────────────────────────────────────────────────

/**
 * Un mot/expression de la leçon
 * Affiché en card dans la Partie 1 (Vocab)
 */
export interface VocabItem {
  id: string
  hanzi: string          // ex: "你好"
  pinyin: string         // ex: "nǐ hǎo"
  french: string         // ex: "Bonjour"
  audioUrl?: string      // optionnel — sera rempli plus tard avec tes fichiers audio
  example?: {            // phrase d'exemple (optionnel)
    hanzi: string
    pinyin: string
    french: string
  }
}

/**
 * Une réplique du dialogue
 * Affichée séquentiellement dans la Partie 2 (Dialogue)
 */
export interface DialogueLine {
  id: string
  speaker: string
  hanzi: string
  pinyin: string
  french: string
  audioUrl?: string
}

/**
 * Une question du quiz final
 * Partie 3 (Quiz)
 */
export type QuizType =
  | 'hanzi-to-french'    // vois 你好 → choisis "Bonjour"
  | 'french-to-hanzi'    // vois "Bonjour" → choisis 你好
  | 'pinyin-to-hanzi'    // vois "nǐ hǎo" → choisis 你好
  | 'audio'              // entends l'audio → choisis la traduction

export interface QuizQuestion {
  id: string
  type: string
  hanzi: string
  pinyin: string
  french: string
  options: string[]      // 4 choix (incluant la bonne réponse)
  answer: string         // la bonne réponse (doit être dans options)
}

// ─── Progression ──────────────────────────────────────────────────────────

export interface LessonProgress {
  lessonId: number
  vocabDone: boolean
  dialogueDone: boolean
  quizDone: boolean
  stars: number          // 0 à 3 (une étoile par partie)
  xp: number
  completedAt?: string
}

// Ancienne interface Progress (conservée pour compatibilité)
export interface Progress {
  userId: string
  lessonId: number
  xp: number
  stars: number
  completedModules: ModuleType[]
  completedAt?: string
}
// ─── Cursus (GET /curriculum) ─────────────────────────────────────────────

export interface CurriculumUnit {
  number: number
  title: string
  lessonIds: number[]
}

export interface CurriculumLevel {
  code: string
  label: string
  subtitle: string
  tag: string
  units: CurriculumUnit[]
}
