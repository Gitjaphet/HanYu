// lib/constants.ts


import type { Lesson } from "@/types";

export const LEVEL_META: Record<string, { label: string; subtitle: string; tag: string }> = {
  A: { label: "Initiation",    subtitle: "Premiers pas en mandarin",     tag: "Débutant" },
  B: { label: "Intermédiaire", subtitle: "Consolider les fondamentaux",  tag: "Intermédiaire" },
  C: { label: "Avancé",        subtitle: "Maîtriser la langue courante", tag: "Avancé" },
};

export const MOCK_LESSONS: Lesson[] = [

  /* ==========================================
     NIVEAU A — UNITÉ 1 : LES BASES
     ========================================== */

  // ── LEÇON 1 : Salutations ──────────────────
  {
    id: 1,
    levelId: "A",
    unitId: 1,
    unitTitle: "Les bases",
    chinese: "问候",
    pinyin: "wèn hòu",
    title: "Salutations",
    description: "Apprendre à saluer correctement.",
    language: "chinese",
    modules: ['vocab', 'dialogue', 'quiz'],
    status: 'completed',
    color: "var(--color-primary)",

    // ── PARTIE 1 : Vocabulaire ──
    vocabulaire: [
      {
        id: "1-v1",
        hanzi: "你好",
        pinyin: "nǐ hǎo",
        french: "Bonjour",
        example: {
          hanzi: "你好，我叫李明。",
          pinyin: "Nǐ hǎo, wǒ jiào Lǐ Míng.",
          french: "Bonjour, je m'appelle Li Ming."
        }
      },
      {
        id: "1-v2",
        hanzi: "你好吗",
        pinyin: "nǐ hǎo ma",
        french: "Comment vas-tu ?",
        example: {
          hanzi: "你好吗？我很好！",
          pinyin: "Nǐ hǎo ma? Wǒ hěn hǎo!",
          french: "Comment vas-tu ? Je vais très bien !"
        }
      },
      {
        id: "1-v3",
        hanzi: "早上好",
        pinyin: "zǎo shang hǎo",
        french: "Bonjour (matin)",
        example: {
          hanzi: "早上好，老师！",
          pinyin: "Zǎo shang hǎo, lǎo shī!",
          french: "Bonjour professeur (le matin) !"
        }
      },
      {
        id: "1-v4",
        hanzi: "晚上好",
        pinyin: "wǎn shang hǎo",
        french: "Bonsoir",
        example: {
          hanzi: "晚上好，吃饭了吗？",
          pinyin: "Wǎn shang hǎo, chī fàn le ma?",
          french: "Bonsoir, tu as mangé ?"
        }
      },
      {
        id: "1-v5",
        hanzi: "再见",
        pinyin: "zài jiàn",
        french: "Au revoir",
        example: {
          hanzi: "再见，明天见！",
          pinyin: "Zài jiàn, míng tiān jiàn!",
          french: "Au revoir, à demain !"
        }
      },
      {
        id: "1-v6",
        hanzi: "拜拜",
        pinyin: "bái bái",
        french: "Bye bye",
        example: {
          hanzi: "好的，拜拜！",
          pinyin: "Hǎo de, bái bái!",
          french: "Ok, bye bye !"
        }
      },
    ],

    // ── PARTIE 2 : Dialogue ──
    dialogue: [
      {
        id: "1-d1",
        
        speaker: "A",
        hanzi: "早上好！",
        pinyin: "Zǎo shang hǎo!",
        french: "Bonjour (ce matin) !"
      },
      {
        id: "1-d2",
        speaker: "B",
        hanzi: "早上好！你好吗？",
        pinyin: "Zǎo shang hǎo! Nǐ hǎo ma?",
        french: "Bonjour ! Comment vas-tu ?"
      },
      {
        id: "1-d3",
        speaker: "A",
        hanzi: "我很好，谢谢！你呢？",
        pinyin: "Wǒ hěn hǎo, xiè xie! Nǐ ne?",
        french: "Je vais très bien, merci ! Et toi ?"
      },
      {
        id: "1-d4",
        speaker: "B",
        hanzi: "我也很好！再见！",
        pinyin: "Wǒ yě hěn hǎo! Zài jiàn!",
        french: "Je vais bien aussi ! Au revoir !"
      },
      {
        id: "1-d5",
        speaker: "A",
        hanzi: "再见，拜拜！",
        pinyin: "Zài jiàn, bái bái!",
        french: "Au revoir, bye bye !"
      },
    ],

    // ── PARTIE 3 : Quiz ──
    quiz: [
      {
        id: "1-q1",
        type: "hanzi-to-french",
        hanzi: "你好",
        pinyin: "nǐ hǎo",
        french: "Bonjour",
        options: ["Bonjour", "Au revoir", "Bonsoir", "Merci"],
        answer: "Bonjour"
      },
      {
        id: "1-q2",
        type: "french-to-hanzi",
        hanzi: "再见",
        pinyin: "zài jiàn",
        french: "Au revoir",
        options: ["你好", "再见", "早上好", "拜拜"],
        answer: "再见"
      },
      {
        id: "1-q3",
        type: "pinyin-to-hanzi",
        hanzi: "晚上好",
        pinyin: "wǎn shang hǎo",
        french: "Bonsoir",
        options: ["早上好", "你好吗", "晚上好", "再见"],
        answer: "晚上好"
      },
      {
        id: "1-q4",
        type: "hanzi-to-french",
        hanzi: "早上好",
        pinyin: "zǎo shang hǎo",
        french: "Bonjour (matin)",
        options: ["Bonsoir", "Bonjour (matin)", "Au revoir", "Bye bye"],
        answer: "Bonjour (matin)"
      },
      {
        id: "1-q5",
        type: "french-to-hanzi",
        hanzi: "拜拜",
        pinyin: "bái bái",
        french: "Bye bye",
        options: ["再见", "你好", "拜拜", "晚上好"],
        answer: "拜拜"
      },
    ],
  },

  // ── LEÇON 2 : Politesse ───────────────────
  {
    id: 2,
    levelId: "A",
    unitId: 1,
    unitTitle: "Les bases",
    chinese: "礼貌",
    pinyin: "lǐ mào",
    title: "Politesse",
    description: "Remercier et s'excuser.",
    language: "chinese",
    modules: ['vocab', 'dialogue', 'quiz'],
    status: 'completed',
    color: "var(--color-tertiary)",

    vocabulaire: [
      {
        id: "2-v1",
        hanzi: "谢谢",
        pinyin: "xiè xie",
        french: "Merci",
        example: {
          hanzi: "谢谢你的帮助！",
          pinyin: "Xiè xie nǐ de bāng zhù!",
          french: "Merci pour ton aide !"
        }
      },
      {
        id: "2-v2",
        hanzi: "不客气",
        pinyin: "bù kè qì",
        french: "De rien",
        example: {
          hanzi: "谢谢！— 不客气！",
          pinyin: "Xiè xie! — Bù kè qì!",
          french: "Merci ! — De rien !"
        }
      },
      {
        id: "2-v3",
        hanzi: "对不起",
        pinyin: "duì bu qǐ",
        french: "Pardon / Désolé",
        example: {
          hanzi: "对不起，我迟到了。",
          pinyin: "Duì bu qǐ, wǒ chí dào le.",
          french: "Pardon, je suis en retard."
        }
      },
      {
        id: "2-v4",
        hanzi: "没关系",
        pinyin: "méi guān xi",
        french: "Ce n'est rien",
        example: {
          hanzi: "对不起！— 没关系！",
          pinyin: "Duì bu qǐ! — Méi guān xi!",
          french: "Pardon ! — Ce n'est rien !"
        }
      },
      {
        id: "2-v5",
        hanzi: "请",
        pinyin: "qǐng",
        french: "S'il vous plaît",
        example: {
          hanzi: "请坐！",
          pinyin: "Qǐng zuò!",
          french: "Asseyez-vous s'il vous plaît !"
        }
      },
    ],

    dialogue: [
      {
        id: "2-d1",
        speaker: "A",
        hanzi: "对不起，我迟到了！",
        pinyin: "Duì bu qǐ, wǒ chí dào le!",
        french: "Pardon, je suis en retard !"
      },
      {
        id: "2-d2",
        speaker: "B",
        hanzi: "没关系，请坐！",
        pinyin: "Méi guān xi, qǐng zuò!",
        french: "Ce n'est rien, asseyez-vous !"
      },
      {
        id: "2-d3",
        speaker: "A",
        hanzi: "谢谢你！",
        pinyin: "Xiè xie nǐ!",
        french: "Merci à toi !"
      },
      {
        id: "2-d4",
        speaker: "B",
        hanzi: "不客气！",
        pinyin: "Bù kè qì!",
        french: "De rien !"
      },
    ],

    quiz: [
      {
        id: "2-q1",
        type: "hanzi-to-french",
        hanzi: "谢谢",
        pinyin: "xiè xie",
        french: "Merci",
        options: ["Merci", "Pardon", "De rien", "S'il vous plaît"],
        answer: "Merci"
      },
      {
        id: "2-q2",
        type: "french-to-hanzi",
        hanzi: "对不起",
        pinyin: "duì bu qǐ",
        french: "Pardon",
        options: ["谢谢", "请", "对不起", "没关系"],
        answer: "对不起"
      },
      {
        id: "2-q3",
        type: "hanzi-to-french",
        hanzi: "不客气",
        pinyin: "bù kè qì",
        french: "De rien",
        options: ["De rien", "Merci", "Pardon", "Ce n'est rien"],
        answer: "De rien"
      },
      {
        id: "2-q4",
        type: "pinyin-to-hanzi",
        hanzi: "没关系",
        pinyin: "méi guān xi",
        french: "Ce n'est rien",
        options: ["对不起", "请", "谢谢", "没关系"],
        answer: "没关系"
      },
    ],
  },

  // ── LEÇON 3 : Les Chiffres ────────────────
  {
    id: 3,
    levelId: "A",
    unitId: 1,
    unitTitle: "Les bases",
    chinese: "数字",
    pinyin: "shù zì",
    title: "Les Chiffres",
    description: "Compter de un à dix.",
    language: "chinese",
    modules: ['vocab', 'dialogue', 'quiz'],
    status: 'completed',
    color: "var(--color-secondary)",

    vocabulaire: [
      { id: "3-v1", hanzi: "一", pinyin: "yī",  french: "Un",   example: { hanzi: "一个苹果。", pinyin: "Yī gè píng guǒ.", french: "Une pomme." } },
      { id: "3-v2", hanzi: "二", pinyin: "èr",  french: "Deux", example: { hanzi: "二个人。",   pinyin: "Èr gè rén.",    french: "Deux personnes." } },
      { id: "3-v3", hanzi: "三", pinyin: "sān", french: "Trois", example: { hanzi: "三只猫。",  pinyin: "Sān zhī māo.",  french: "Trois chats." } },
      { id: "3-v4", hanzi: "四", pinyin: "sì",  french: "Quatre", example: { hanzi: "四本书。", pinyin: "Sì běn shū.",   french: "Quatre livres." } },
      { id: "3-v5", hanzi: "五", pinyin: "wǔ",  french: "Cinq",  example: { hanzi: "五个朋友。", pinyin: "Wǔ gè péng yǒu.", french: "Cinq amis." } },
      { id: "3-v6", hanzi: "六", pinyin: "liù", french: "Six",   example: { hanzi: "六点了。",  pinyin: "Liù diǎn le.",  french: "Il est six heures." } },
      { id: "3-v7", hanzi: "七", pinyin: "qī",  french: "Sept",  example: { hanzi: "七天。",    pinyin: "Qī tiān.",      french: "Sept jours." } },
      { id: "3-v8", hanzi: "八", pinyin: "bā",  french: "Huit",  example: { hanzi: "八月。",    pinyin: "Bā yuè.",       french: "Août (8e mois)." } },
      { id: "3-v9", hanzi: "九", pinyin: "jiǔ", french: "Neuf",  example: { hanzi: "九个月。",  pinyin: "Jiǔ gè yuè.",   french: "Neuf mois." } },
      { id: "3-v10",hanzi: "十", pinyin: "shí", french: "Dix",   example: { hanzi: "十块钱。",  pinyin: "Shí kuài qián.", french: "Dix yuans." } },
    ],

    dialogue: [
      { id: "3-d1", speaker: "A", hanzi: "你有几个苹果？", pinyin: "Nǐ yǒu jǐ gè píng guǒ?", french: "Combien de pommes as-tu ?" },
      { id: "3-d2", speaker: "B", hanzi: "我有五个。", pinyin: "Wǒ yǒu wǔ gè.", french: "J'en ai cinq." },
      { id: "3-d3", speaker: "A", hanzi: "我有三个，我们一共八个！", pinyin: "Wǒ yǒu sān gè, wǒ men yí gòng bā gè!", french: "J'en ai trois, on en a huit en tout !" },
      { id: "3-d4", speaker: "B", hanzi: "对！一、二、三、四、五、六、七、八！", pinyin: "Duì! Yī, èr, sān, sì, wǔ, liù, qī, bā!", french: "Exact ! Un, deux, trois, quatre, cinq, six, sept, huit !" },
    ],

    quiz: [
      { id: "3-q1", type: "hanzi-to-french", hanzi: "五", pinyin: "wǔ", french: "Cinq", options: ["Trois", "Cinq", "Sept", "Neuf"], answer: "Cinq" },
      { id: "3-q2", type: "french-to-hanzi", hanzi: "八", pinyin: "bā", french: "Huit", options: ["六", "七", "八", "九"], answer: "八" },
      { id: "3-q3", type: "pinyin-to-hanzi", hanzi: "十", pinyin: "shí", french: "Dix",  options: ["七", "八", "九", "十"], answer: "十" },
      { id: "3-q4", type: "hanzi-to-french", hanzi: "三", pinyin: "sān", french: "Trois", options: ["Un", "Deux", "Trois", "Quatre"], answer: "Trois" },
      { id: "3-q5", type: "french-to-hanzi", hanzi: "一", pinyin: "yī", french: "Un", options: ["一", "二", "三", "四"], answer: "一" },
    ],
  },

  // ── LEÇON 4 : Prendre des nouvelles ──────
  {
    id: 4,
    levelId: "A",
    unitId: 1,
    unitTitle: "Les bases",
    chinese: "问好",
    pinyin: "wèn hǎo",
    title: "Prendre des nouvelles",
    description: "Demander comment ça va.",
    language: "chinese",
    modules: ['vocab', 'dialogue', 'quiz'],
    status: 'available',
    color: "var(--color-primary)",

    vocabulaire: [
      {
        id: "4-v1",
        hanzi: "你好吗",
        pinyin: "nǐ hǎo ma",
        french: "Comment vas-tu ?",
        example: { hanzi: "你好吗？好久不见！", pinyin: "Nǐ hǎo ma? Hǎo jiǔ bú jiàn!", french: "Comment vas-tu ? Ça fait longtemps !" }
      },
      {
        id: "4-v2",
        hanzi: "很好",
        pinyin: "hěn hǎo",
        french: "Très bien",
        example: { hanzi: "我很好，谢谢。", pinyin: "Wǒ hěn hǎo, xiè xie.", french: "Je vais très bien, merci." }
      },
      {
        id: "4-v3",
        hanzi: "不太好",
        pinyin: "bù tài hǎo",
        french: "Pas très bien",
        example: { hanzi: "今天不太好，有点累。", pinyin: "Jīn tiān bù tài hǎo, yǒu diǎn lèi.", french: "Aujourd'hui pas très bien, un peu fatigué." }
      },
      {
        id: "4-v4",
        hanzi: "还好",
        pinyin: "hái hǎo",
        french: "Ça va / Pas mal",
        example: { hanzi: "还好，谢谢你问。", pinyin: "Hái hǎo, xiè xie nǐ wèn.", french: "Ça va, merci de demander." }
      },
      {
        id: "4-v5",
        hanzi: "你呢",
        pinyin: "nǐ ne",
        french: "Et toi ?",
        example: { hanzi: "我很好，你呢？", pinyin: "Wǒ hěn hǎo, nǐ ne?", french: "Je vais bien, et toi ?" }
      },
    ],

    dialogue: [
      { id: "4-d1", speaker: "A", hanzi: "嗨！你好吗？", pinyin: "Hāi! Nǐ hǎo ma?", french: "Salut ! Comment vas-tu ?" },
      { id: "4-d2", speaker: "B", hanzi: "我很好！你呢？", pinyin: "Wǒ hěn hǎo! Nǐ ne?", french: "Je vais très bien ! Et toi ?" },
      { id: "4-d3", speaker: "A", hanzi: "还好，有点累。", pinyin: "Hái hǎo, yǒu diǎn lèi.", french: "Ça va, un peu fatigué." },
      { id: "4-d4", speaker: "B", hanzi: "哦，好好休息！", pinyin: "Ó, hǎo hǎo xiū xi!", french: "Oh, repose-toi bien !" },
      { id: "4-d5", speaker: "A", hanzi: "谢谢！再见！", pinyin: "Xiè xie! Zài jiàn!", french: "Merci ! Au revoir !" },
    ],

    quiz: [
      { id: "4-q1", type: "hanzi-to-french", hanzi: "很好", pinyin: "hěn hǎo", french: "Très bien", options: ["Pas mal", "Très bien", "Pas très bien", "Et toi ?"], answer: "Très bien" },
      { id: "4-q2", type: "french-to-hanzi", hanzi: "你呢", pinyin: "nǐ ne", french: "Et toi ?", options: ["很好", "还好", "你呢", "不太好"], answer: "你呢" },
      { id: "4-q3", type: "pinyin-to-hanzi", hanzi: "还好", pinyin: "hái hǎo", french: "Pas mal", options: ["很好", "还好", "不太好", "你呢"], answer: "还好" },
      { id: "4-q4", type: "hanzi-to-french", hanzi: "不太好", pinyin: "bù tài hǎo", french: "Pas très bien", options: ["Très bien", "Pas mal", "Pas très bien", "Et toi ?"], answer: "Pas très bien" },
    ],
  },

  /* ==========================================
     NIVEAU A — UNITÉ 2 : SE PRÉSENTER
     ========================================== */
  {
    id: 5,
    levelId: "A", unitId: 2, unitTitle: "Se présenter",
    chinese: "介绍", pinyin: "jiè shào", title: "Identité",
    description: "Dire son nom et sa nationalité.",
    language: "chinese", modules: ['vocab', 'dialogue', 'quiz'],
    status: 'locked', color: "var(--color-secondary)",
    vocabulaire: [
      { id: "5-v1", hanzi: "我叫", pinyin: "wǒ jiào", french: "Je m'appelle", example: { hanzi: "我叫李明。", pinyin: "Wǒ jiào Lǐ Míng.", french: "Je m'appelle Li Ming." } },
      { id: "5-v2", hanzi: "我是", pinyin: "wǒ shì", french: "Je suis", example: { hanzi: "我是法国人。", pinyin: "Wǒ shì fǎ guó rén.", french: "Je suis Français." } },
      { id: "5-v3", hanzi: "法国人", pinyin: "fǎ guó rén", french: "Français(e)", example: { hanzi: "我是法国人。", pinyin: "Wǒ shì fǎ guó rén.", french: "Je suis Français." } },
    ],
    dialogue: [
      { id: "5-d1", speaker: "A", hanzi: "你好，你叫什么名字？", pinyin: "Nǐ hǎo, nǐ jiào shén me míng zi?", french: "Bonjour, comment tu t'appelles ?" },
      { id: "5-d2", speaker: "B", hanzi: "我叫 Thomas，我是法国人。", pinyin: "Wǒ jiào Thomas, wǒ shì fǎ guó rén.", french: "Je m'appelle Thomas, je suis Français." },
    ],
    quiz: [
      { id: "5-q1", type: "hanzi-to-french", hanzi: "我叫", pinyin: "wǒ jiào", french: "Je m'appelle", options: ["Je suis", "Je m'appelle", "Français", "Bonjour"], answer: "Je m'appelle" },
      { id: "5-q2", type: "french-to-hanzi", hanzi: "法国人", pinyin: "fǎ guó rén", french: "Français", options: ["我叫", "我是", "法国人", "你好"], answer: "法国人" },
    ],
  },

  {
    id: 6,
    levelId: "A", unitId: 2, unitTitle: "Se présenter",
    chinese: "年龄", pinyin: "nián líng", title: "Demander l'âge",
    description: "Exprimer son âge en chinois.",
    language: "chinese", modules: ['vocab', 'dialogue', 'quiz'],
    status: 'locked', color: "var(--color-primary)",
    vocabulaire: [
      { id: "6-v1", hanzi: "几岁", pinyin: "jǐ suì", french: "Quel âge ?", example: { hanzi: "你几岁？", pinyin: "Nǐ jǐ suì?", french: "Quel âge as-tu ?" } },
      { id: "6-v2", hanzi: "岁", pinyin: "suì", french: "An(s) (âge)", example: { hanzi: "我二十岁。", pinyin: "Wǒ èr shí suì.", french: "J'ai vingt ans." } },
    ],
    dialogue: [
      { id: "6-d1", speaker: "A", hanzi: "你几岁？", pinyin: "Nǐ jǐ suì?", french: "Quel âge as-tu ?" },
      { id: "6-d2", speaker: "B", hanzi: "我三十岁，你呢？", pinyin: "Wǒ sān shí suì, nǐ ne?", french: "J'ai trente ans, et toi ?" },
      { id: "6-d3", speaker: "A", hanzi: "我二十五岁。", pinyin: "Wǒ èr shí wǔ suì.", french: "J'ai vingt-cinq ans." },
    ],
    quiz: [
      { id: "6-q1", type: "hanzi-to-french", hanzi: "几岁", pinyin: "jǐ suì", french: "Quel âge ?", options: ["Quel âge ?", "Ans", "Nom", "Nationalité"], answer: "Quel âge ?" },
      { id: "6-q2", type: "french-to-hanzi", hanzi: "岁", pinyin: "suì", french: "An(s)", options: ["叫", "是", "岁", "人"], answer: "岁" },
    ],
  },

  {
    id: 7,
    levelId: "A", unitId: 2, unitTitle: "Se présenter",
    chinese: "家庭", pinyin: "jiā tíng", title: "La Famille",
    description: "Présenter ses proches.",
    language: "chinese", modules: ['vocab', 'dialogue', 'quiz'],
    status: 'locked', color: "var(--color-tertiary)",
    vocabulaire: [
      { id: "7-v1", hanzi: "爸爸", pinyin: "bà ba", french: "Papa", example: { hanzi: "我爸爸很高。", pinyin: "Wǒ bà ba hěn gāo.", french: "Mon papa est très grand." } },
      { id: "7-v2", hanzi: "妈妈", pinyin: "mā ma", french: "Maman", example: { hanzi: "妈妈做饭。", pinyin: "Mā ma zuò fàn.", french: "Maman cuisine." } },
      { id: "7-v3", hanzi: "哥哥", pinyin: "gē ge", french: "Grand frère", example: { hanzi: "我哥哥二十岁。", pinyin: "Wǒ gē ge èr shí suì.", french: "Mon grand frère a vingt ans." } },
    ],
    dialogue: [
      { id: "7-d1", speaker: "A", hanzi: "这是你妈妈吗？", pinyin: "Zhè shì nǐ mā ma ma?", french: "C'est ta maman ?" },
      { id: "7-d2", speaker: "B", hanzi: "是的，这是我妈妈。", pinyin: "Shì de, zhè shì wǒ mā ma.", french: "Oui, c'est ma maman." },
      { id: "7-d3", speaker: "A", hanzi: "你好，妈妈！", pinyin: "Nǐ hǎo, mā ma!", french: "Bonjour maman !" },
    ],
    quiz: [
      { id: "7-q1", type: "hanzi-to-french", hanzi: "爸爸", pinyin: "bà ba", french: "Papa", options: ["Maman", "Papa", "Grand frère", "Famille"], answer: "Papa" },
      { id: "7-q2", type: "french-to-hanzi", hanzi: "妈妈", pinyin: "mā ma", french: "Maman", options: ["妈妈", "爸爸", "哥哥", "家庭"], answer: "妈妈" },
    ],
  },

  /* ==========================================
     NIVEAU B — UNITÉ 1 : AU RESTAURANT
     ========================================== */
  {
    id: 8,
    levelId: "B", unitId: 1, unitTitle: "Au restaurant",
    chinese: "点餐", pinyin: "diǎn cān", title: "Commander",
    description: "Demander un plat au serveur.",
    language: "chinese", modules: ['vocab', 'dialogue', 'quiz'],
    status: 'locked', color: "var(--color-primary)",
    vocabulaire: [
      { id: "8-v1", hanzi: "吃饭", pinyin: "chī fàn", french: "Manger", example: { hanzi: "我想吃饭。", pinyin: "Wǒ xiǎng chī fàn.", french: "Je veux manger." } },
      { id: "8-v2", hanzi: "米饭", pinyin: "mǐ fàn", french: "Riz", example: { hanzi: "一碗米饭。", pinyin: "Yī wǎn mǐ fàn.", french: "Un bol de riz." } },
      { id: "8-v3", hanzi: "喝水", pinyin: "hē shuǐ", french: "Boire de l'eau", example: { hanzi: "请喝水。", pinyin: "Qǐng hē shuǐ.", french: "Buvez de l'eau s'il vous plaît." } },
    ],
    dialogue: [
      { id: "8-d1", speaker: "A", hanzi: "服务员！", pinyin: "Fú wù yuán!", french: "Serveur !" },
      { id: "8-d2", speaker: "B", hanzi: "您好，您要点什么？", pinyin: "Nín hǎo, nín yào diǎn shén me?", french: "Bonjour, que désirez-vous ?" },
      { id: "8-d3", speaker: "A", hanzi: "我要米饭和水，谢谢。", pinyin: "Wǒ yào mǐ fàn hé shuǐ, xiè xie.", french: "Je voudrais du riz et de l'eau, merci." },
    ],
    quiz: [
      { id: "8-q1", type: "hanzi-to-french", hanzi: "米饭", pinyin: "mǐ fàn", french: "Riz", options: ["Eau", "Riz", "Thé", "Pain"], answer: "Riz" },
      { id: "8-q2", type: "french-to-hanzi", hanzi: "喝水", pinyin: "hē shuǐ", french: "Boire de l'eau", options: ["吃饭", "米饭", "喝水", "谢谢"], answer: "喝水" },
    ],
  },

  {
    id: 9,
    levelId: "B", unitId: 1, unitTitle: "Au restaurant",
    chinese: "味道", pinyin: "wèi dào", title: "Donner son avis",
    description: "Exprimer ses goûts culinaires.",
    language: "chinese", modules: ['vocab', 'dialogue', 'quiz'],
    status: 'locked', color: "var(--color-secondary)",
    vocabulaire: [
      { id: "9-v1", hanzi: "好吃", pinyin: "hǎo chī", french: "Délicieux", example: { hanzi: "这个很好吃！", pinyin: "Zhè gè hěn hǎo chī!", french: "C'est très délicieux !" } },
      { id: "9-v2", hanzi: "喜欢", pinyin: "xǐ huan", french: "Aimer", example: { hanzi: "我喜欢吃饺子。", pinyin: "Wǒ xǐ huan chī jiǎo zi.", french: "J'aime manger des raviolis." } },
    ],
    dialogue: [
      { id: "9-d1", speaker: "A", hanzi: "米饭好吃吗？", pinyin: "Mǐ fàn hǎo chī ma?", french: "Le riz est-il bon ?" },
      { id: "9-d2", speaker: "B", hanzi: "很好吃！我很喜欢！", pinyin: "Hěn hǎo chī! Wǒ hěn xǐ huan!", french: "Très bon ! J'aime beaucoup !" },
    ],
    quiz: [
      { id: "9-q1", type: "hanzi-to-french", hanzi: "好吃", pinyin: "hǎo chī", french: "Délicieux", options: ["Délicieux", "Aimer", "Manger", "Boire"], answer: "Délicieux" },
      { id: "9-q2", type: "french-to-hanzi", hanzi: "喜欢", pinyin: "xǐ huan", french: "Aimer", options: ["吃饭", "好吃", "喜欢", "喝水"], answer: "喜欢" },
    ],
  },

  {
    id: 10,
    levelId: "B", unitId: 1, unitTitle: "Au restaurant",
    chinese: "结账", pinyin: "jié zhàng", title: "L'addition",
    description: "Payer et parler de ses activités.",
    language: "chinese", modules: ['vocab', 'dialogue', 'quiz'],
    status: 'locked', color: "var(--color-tertiary)",
    vocabulaire: [
      { id: "10-v1", hanzi: "买单", pinyin: "mǎi dān", french: "L'addition", example: { hanzi: "服务员，买单！", pinyin: "Fú wù yuán, mǎi dān!", french: "Serveur, l'addition !" } },
      { id: "10-v2", hanzi: "工作", pinyin: "gōng zuò", french: "Travailler", example: { hanzi: "我在工作。", pinyin: "Wǒ zài gōng zuò.", french: "Je suis en train de travailler." } },
      { id: "10-v3", hanzi: "学习", pinyin: "xué xí", french: "Étudier", example: { hanzi: "他在学习汉语。", pinyin: "Tā zài xué xí hàn yǔ.", french: "Il est en train d'étudier le chinois." } },
    ],
    dialogue: [
      { id: "10-d1", speaker: "A", hanzi: "服务员，买单。", pinyin: "Fú wù yuán, mǎi dān.", french: "Serveur, l'addition s'il vous plaît." },
      { id: "10-d2", speaker: "B", hanzi: "好的，一共五十块。", pinyin: "Hǎo de, yī gòng wǔ shí kuài.", french: "Bien sûr, ça fait cinquante yuans en tout." },
    ],
    quiz: [
      { id: "10-q1", type: "hanzi-to-french", hanzi: "买单", pinyin: "mǎi dān", french: "L'addition", options: ["Travailler", "Étudier", "L'addition", "Manger"], answer: "L'addition" },
      { id: "10-q2", type: "french-to-hanzi", hanzi: "学习", pinyin: "xué xí", french: "Étudier", options: ["工作", "学习", "买单", "吃饭"], answer: "学习" },
    ],
  },
];