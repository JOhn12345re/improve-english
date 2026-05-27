import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const lessons = [
  // ── A1 ──────────────────────────────────────────────────────────
  {
    level: 'A1' as const,
    theme: 'greetings',
    order: 1,
    is_premium: false,
    content_json: {
      title: { fr: 'Salutations & Présentations', en: 'Greetings & Introductions' },
      description: {
        fr: 'Apprenez à vous saluer et à vous présenter en anglais.',
        en: 'Learn how to greet people and introduce yourself in English.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'How do you say "Bonjour" in English?',
          questionFr: 'Comment dit-on "Bonjour" en anglais ?',
          options: ['Goodbye', 'Hello', 'Sorry', 'Please'],
          correctIndex: 1,
          explanation: '"Hello" is the most common English greeting.',
          explanationFr: '"Hello" est la salutation la plus courante en anglais.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate this sentence into English.',
          instructionFr: 'Traduisez cette phrase en anglais.',
          sourceFr: "Je m'appelle Marie.",
          targetEn: 'My name is Marie.',
          hint: 'My name is...',
        },
        {
          type: 'mcq',
          question: 'What does "How are you?" mean?',
          questionFr: 'Que signifie "How are you?" ?',
          options: ['Where are you?', 'What is your name?', 'How are you?', 'How old are you?'],
          correctIndex: 2,
          explanation: '"How are you?" means "Comment vas-tu ?".',
          explanationFr: '"How are you?" se traduit par "Comment allez-vous ?".',
        },
        {
          type: 'fill',
          sentence: 'Nice to ___ you!',
          sentenceFr: 'Ravi de vous ___ !',
          answer: 'meet',
          options: ['meet', 'see', 'know', 'find'],
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Enchanté de vous rencontrer.',
          targetEn: 'Nice to meet you.',
        },
      ],
    },
  },
  {
    level: 'A1' as const,
    theme: 'numbers',
    order: 2,
    is_premium: false,
    content_json: {
      title: { fr: 'Les chiffres de 1 à 20', en: 'Numbers 1–20' },
      description: {
        fr: 'Apprenez les chiffres de 1 à 20 en anglais.',
        en: 'Learn numbers from 1 to 20 in English.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'Which word represents the number 5?',
          questionFr: 'Quel mot représente le chiffre 5 ?',
          options: ['Four', 'Three', 'Five', 'Six'],
          correctIndex: 2,
          explanation: '5 = "five" in English.',
          explanationFr: '5 se dit "five" en anglais.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "J'ai quinze ans.",
          targetEn: 'I am fifteen years old.',
          hint: 'I am ... years old.',
        },
        {
          type: 'fill',
          sentence: 'There are ___ days in a week.',
          sentenceFr: 'Il y a ___ jours dans une semaine.',
          answer: 'seven',
          options: ['five', 'six', 'seven', 'eight'],
        },
        {
          type: 'mcq',
          question: 'Which number comes after "twelve"?',
          questionFr: 'Quel nombre vient après "twelve" (douze) ?',
          options: ['Eleven', 'Fourteen', 'Thirteen', 'Twenty'],
          correctIndex: 2,
          explanation: 'After twelve (12) comes thirteen (13).',
          explanationFr: 'Après douze (12) vient treize (13) = "thirteen".',
        },
      ],
    },
  },
  {
    level: 'A1' as const,
    theme: 'colors',
    order: 3,
    is_premium: false,
    content_json: {
      title: { fr: 'Couleurs & Adjectifs', en: 'Colors & Adjectives' },
      description: {
        fr: 'Les couleurs et adjectifs de base en anglais.',
        en: 'Basic colors and adjectives in English.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'What color is the sky?',
          questionFr: 'De quelle couleur est le ciel ?',
          options: ['Red', 'Green', 'Blue', 'Yellow'],
          correctIndex: 2,
          explanation: 'The sky is blue.',
          explanationFr: 'Le ciel est bleu = "blue".',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'La voiture est rouge.',
          targetEn: 'The car is red.',
        },
        {
          type: 'fill',
          sentence: 'Snow is ___.',
          sentenceFr: 'La neige est ___ (blanche).',
          answer: 'white',
          options: ['black', 'white', 'grey', 'brown'],
        },
        {
          type: 'mcq',
          question: 'How do you say "grand / gros" in English?',
          questionFr: 'Comment dit-on "grand / gros" en anglais ?',
          options: ['Small', 'Big', 'Long', 'Heavy'],
          correctIndex: 1,
          explanation: '"Big" means grand or gros.',
          explanationFr: '"Big" signifie grand ou gros.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Le chat est petit et noir.',
          targetEn: 'The cat is small and black.',
          hint: 'The cat is ... and ...',
        },
      ],
    },
  },
  {
    level: 'A1' as const,
    theme: 'family',
    order: 4,
    is_premium: false,
    content_json: {
      title: { fr: 'Les membres de la famille', en: 'Family Members' },
      description: {
        fr: 'Vocabulaire pour parler de sa famille.',
        en: 'Vocabulary for family members.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'What is the English word for "mère"?',
          questionFr: 'Quel est le mot anglais pour "mère" ?',
          options: ['Sister', 'Mother', 'Daughter', 'Aunt'],
          correctIndex: 1,
          explanation: '"Mère" = "mother" in English.',
          explanationFr: '"Mère" se traduit par "mother".',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "Mon père s'appelle Paul.",
          targetEn: "My father's name is Paul.",
          hint: "My father's name is...",
        },
        {
          type: 'fill',
          sentence: 'My parents are my ___ and my father.',
          sentenceFr: 'Mes parents sont ma ___ (mère) et mon père.',
          answer: 'mother',
          options: ['sister', 'mother', 'aunt', 'grandmother'],
        },
        {
          type: 'mcq',
          question: 'What is the English word for "frère"?',
          questionFr: 'Quel est le mot anglais pour "frère" ?',
          options: ['Friend', 'Father', 'Brother', 'Boy'],
          correctIndex: 2,
          explanation: '"Frère" = "brother" in English.',
          explanationFr: '"Frère" se traduit par "brother".',
        },
      ],
    },
  },
  {
    level: 'A1' as const,
    theme: 'food',
    order: 5,
    is_premium: false,
    content_json: {
      title: { fr: 'Nourriture & Boissons', en: 'Food & Drinks' },
      description: {
        fr: 'Vocabulaire pour la nourriture et les boissons.',
        en: 'Vocabulary for food and drinks.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'What is the English word for "eau"?',
          questionFr: 'Quel est le mot anglais pour "eau" ?',
          options: ['Milk', 'Juice', 'Water', 'Coffee'],
          correctIndex: 2,
          explanation: '"Eau" = "water" in English.',
          explanationFr: '"Eau" se traduit par "water".',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "Je voudrais une pomme, s'il vous plaît.",
          targetEn: 'I would like an apple, please.',
          hint: 'I would like...',
        },
        {
          type: 'fill',
          sentence: 'I drink ___ every morning.',
          sentenceFr: 'Je bois du ___ (café) chaque matin.',
          answer: 'coffee',
          options: ['food', 'bread', 'coffee', 'rice'],
        },
        {
          type: 'mcq',
          question: 'Which of these is a drink?',
          questionFr: 'Lequel de ces mots est une boisson ?',
          options: ['Bread', 'Orange juice', 'Rice', 'Cheese'],
          correctIndex: 1,
          explanation: '"Orange juice" is a drink — un jus d\'orange.',
          explanationFr: '"Orange juice" signifie "jus d\'orange", c\'est une boisson.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Le pain est délicieux.',
          targetEn: 'The bread is delicious.',
        },
      ],
    },
  },
  {
    level: 'A1' as const,
    theme: 'days_months',
    order: 6,
    is_premium: false,
    content_json: {
      title: { fr: 'Jours & Mois', en: 'Days & Months' },
      description: {
        fr: "Les jours de la semaine et les mois de l'année.",
        en: 'Days of the week and months of the year.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'What day comes after "Monday"?',
          questionFr: 'Quel jour vient après "Monday" (lundi) ?',
          options: ['Sunday', 'Tuesday', 'Saturday', 'Wednesday'],
          correctIndex: 1,
          explanation: 'Monday → Tuesday (lundi → mardi).',
          explanationFr: 'Après lundi (Monday) vient mardi = "Tuesday".',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "Aujourd'hui c'est lundi.",
          targetEn: 'Today is Monday.',
        },
        {
          type: 'fill',
          sentence: 'There are ___ months in a year.',
          sentenceFr: 'Il y a ___ mois dans une année.',
          answer: 'twelve',
          options: ['ten', 'eleven', 'twelve', 'thirteen'],
        },
        {
          type: 'mcq',
          question: 'What is the English word for "décembre"?',
          questionFr: 'Quel est le mot anglais pour "décembre" ?',
          options: ['November', 'January', 'October', 'December'],
          correctIndex: 3,
          explanation: '"Décembre" = "December" in English.',
          explanationFr: '"Décembre" se traduit par "December".',
        },
      ],
    },
  },

  // ── A2 ──────────────────────────────────────────────────────────
  {
    level: 'A2' as const,
    theme: 'daily_routines',
    order: 1,
    is_premium: false,
    content_json: {
      title: { fr: 'La routine quotidienne', en: 'Daily Routines' },
      description: {
        fr: 'Parlez de votre journée typique en anglais.',
        en: 'Talk about your typical day in English.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'Which sentence means "Je me réveille à 7h" ?',
          questionFr: 'Quelle phrase signifie "Je me réveille à 7h" ?',
          options: [
            "I sleep at 7 o'clock.",
            "I wake up at 7 o'clock.",
            "I eat at 7 o'clock.",
            "I work at 7 o'clock.",
          ],
          correctIndex: 1,
          explanation: '"Wake up" means se réveiller.',
          explanationFr: '"Wake up" = se réveiller.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Je prends mon petit-déjeuner à huit heures.',
          targetEn: "I have breakfast at eight o'clock.",
          hint: 'I have breakfast at...',
        },
        {
          type: 'fill',
          sentence: 'She ___ to work by bus every day.',
          sentenceFr: 'Elle ___ (va) au travail en bus chaque jour.',
          answer: 'goes',
          options: ['go', 'goes', 'going', 'gone'],
        },
        {
          type: 'mcq',
          question: 'What does "go to bed" mean?',
          questionFr: 'Que signifie "go to bed" ?',
          options: ['Se lever', 'Aller au travail', 'Aller se coucher', 'Déjeuner'],
          correctIndex: 2,
          explanation: '"Go to bed" means aller se coucher.',
          explanationFr: '"Go to bed" signifie aller se coucher.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Il se couche à vingt-deux heures.',
          targetEn: "He goes to bed at ten o'clock.",
          hint: 'He goes to bed at...',
        },
      ],
    },
  },
  {
    level: 'A2' as const,
    theme: 'shopping',
    order: 2,
    is_premium: false,
    content_json: {
      title: { fr: 'Les courses / Shopping', en: 'Shopping' },
      description: {
        fr: 'Faire des courses et demander les prix.',
        en: 'Go shopping and ask about prices.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'How do you ask for the price of something?',
          questionFr: 'Comment demander le prix de quelque chose ?',
          options: ['Where is it?', 'How much is it?', 'What is it?', 'Can I have it?'],
          correctIndex: 1,
          explanation: '"How much is it?" = Combien ça coûte ?',
          explanationFr: '"How much is it?" signifie "Combien ça coûte ?".',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "C'est trop cher.",
          targetEn: "It's too expensive.",
          hint: "It's too...",
        },
        {
          type: 'fill',
          sentence: 'Do you have this in a ___ size?',
          sentenceFr: 'Avez-vous ceci dans une taille ___ (plus grande) ?',
          answer: 'bigger',
          options: ['small', 'bigger', 'expensive', 'nice'],
        },
        {
          type: 'mcq',
          question: "What does \"I'd like to pay by card\" mean?",
          questionFr: 'Que signifie "I\'d like to pay by card" ?',
          options: [
            'Je voudrais payer en espèces.',
            'Je voudrais payer par carte.',
            'Je cherche la caisse.',
            'Avez-vous un reçu ?',
          ],
          correctIndex: 1,
          explanation: '"Pay by card" = payer par carte.',
          explanationFr: '"Pay by card" signifie "payer par carte bancaire".',
        },
      ],
    },
  },
  {
    level: 'A2' as const,
    theme: 'telling_time',
    order: 3,
    is_premium: false,
    content_json: {
      title: { fr: "Dire l'heure", en: 'Telling the Time' },
      description: {
        fr: "Dire et demander l'heure en anglais.",
        en: 'Say and ask the time in English.',
      },
      exercises: [
        {
          type: 'mcq',
          question: "What does \"It's half past two\" mean?",
          questionFr: 'Que signifie "It\'s half past two" ?',
          options: [
            'Il est deux heures.',
            'Il est deux heures et demie.',
            'Il est deux heures et quart.',
            'Il est deux heures moins le quart.',
          ],
          correctIndex: 1,
          explanation: '"Half past two" = two thirty = deux heures et demie.',
          explanationFr: '"Half past two" signifie "deux heures et demie" (2h30).',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Il est trois heures et quart.',
          targetEn: "It's quarter past three.",
          hint: "It's quarter past...",
        },
        {
          type: 'fill',
          sentence: "The train leaves ___ ten o'clock.",
          sentenceFr: 'Le train part ___ dix heures (à).',
          answer: 'at',
          options: ['in', 'on', 'at', 'by'],
        },
        {
          type: 'mcq',
          question: 'What does "What time is it?" mean?',
          questionFr: 'Que signifie "What time is it?" ?',
          options: [
            "C'est l'heure ?",
            'Quelle heure est-il ?',
            'À quelle heure ?',
            'Depuis quand ?',
          ],
          correctIndex: 1,
          explanation: '"What time is it?" = Quelle heure est-il ?',
          explanationFr: '"What time is it?" se traduit par "Quelle heure est-il ?".',
        },
      ],
    },
  },
  {
    level: 'A2' as const,
    theme: 'past_simple',
    order: 4,
    is_premium: false,
    content_json: {
      title: { fr: 'Le prétérit (passé simple)', en: 'Past Simple' },
      description: {
        fr: 'Parlez des événements passés en anglais.',
        en: 'Talk about past events in English.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'What is the past tense of "go"?',
          questionFr: 'Quel est le passé du verbe "go" (aller) ?',
          options: ['Goed', 'Goes', 'Went', 'Going'],
          correctIndex: 2,
          explanation: '"Go" is irregular — past tense is "went".',
          explanationFr: '"Go" est irrégulier — son passé est "went".',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "Hier, j'ai mangé une pizza.",
          targetEn: 'Yesterday, I ate a pizza.',
          hint: 'Yesterday, I ate...',
        },
        {
          type: 'fill',
          sentence: 'She ___ a book last night.',
          sentenceFr: 'Elle ___ (a lu) un livre hier soir.',
          answer: 'read',
          options: ['reads', 'readed', 'read', 'reading'],
        },
        {
          type: 'mcq',
          question: 'What does "Did you sleep well?" mean?',
          questionFr: 'Que signifie "Did you sleep well?" ?',
          options: [
            'Dors-tu bien ?',
            'Tu as bien dormi ?',
            'Est-ce que tu dors ?',
            'Tu vas dormir ?',
          ],
          correctIndex: 1,
          explanation: '"Did you sleep well?" = As-tu bien dormi ?',
          explanationFr: '"Did you sleep well?" se traduit par "As-tu bien dormi ?".',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "Il n'est pas venu hier.",
          targetEn: "He didn't come yesterday.",
          hint: "He didn't...",
        },
      ],
    },
  },

  // ── B1 ──────────────────────────────────────────────────────────
  {
    level: 'B1' as const,
    theme: 'restaurant',
    order: 1,
    is_premium: false,
    content_json: {
      title: { fr: 'Au restaurant', en: 'At the Restaurant' },
      description: {
        fr: 'Commander, demander la carte et payer.',
        en: 'Order food, ask for the menu, and pay the bill.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'How do you ask to see the menu?',
          questionFr: 'Comment demander à voir la carte ?',
          options: [
            'Can I have the bill, please?',
            'Could I see the menu, please?',
            "What is today's special?",
            "I'm ready to order.",
          ],
          correctIndex: 1,
          explanation: '"Could I see the menu?" is the polite way to ask.',
          explanationFr: '"Could I see the menu?" = Puis-je voir la carte, s\'il vous plaît ?',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Je suis allergique aux noix.',
          targetEn: 'I am allergic to nuts.',
          hint: 'I am allergic to...',
        },
        {
          type: 'fill',
          sentence: "Could we have the ___, please? We're ready to pay.",
          sentenceFr: "Pourrions-nous avoir ___ (l'addition), s'il vous plaît ?",
          answer: 'bill',
          options: ['menu', 'bill', 'food', 'table'],
        },
        {
          type: 'mcq',
          question: 'What does "the dish of the day" mean?',
          questionFr: 'Que signifie "the dish of the day" ?',
          options: ['La carte', 'Le dessert', 'Le plat du jour', "L'entrée"],
          correctIndex: 2,
          explanation: '"Dish of the day" = le plat du jour.',
          explanationFr: '"Dish of the day" signifie "le plat du jour".',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "Je prendrais le poulet rôti, s'il vous plaît.",
          targetEn: "I'll have the roast chicken, please.",
          hint: "I'll have the...",
        },
      ],
    },
  },
  {
    level: 'B1' as const,
    theme: 'travel',
    order: 2,
    is_premium: false,
    content_json: {
      title: { fr: 'Voyages & Aéroports', en: 'Travel & Airports' },
      description: {
        fr: 'Vocabulaire essentiel pour voyager.',
        en: 'Essential vocabulary for travelling.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'Where do you check in your luggage?',
          questionFr: 'Où enregistre-t-on ses bagages ?',
          options: ['At the gate', 'At the check-in desk', 'At security', 'On the plane'],
          correctIndex: 1,
          explanation: 'You check in at the check-in desk.',
          explanationFr:
            "On enregistre ses bagages au comptoir d'enregistrement = \"check-in desk\".",
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Mon vol est retardé de deux heures.',
          targetEn: 'My flight is delayed by two hours.',
          hint: 'My flight is delayed by...',
        },
        {
          type: 'fill',
          sentence: 'Please have your ___ ready at the gate.',
          sentenceFr: "Veuillez avoir votre ___ (carte d'embarquement) prête à la porte.",
          answer: 'boarding pass',
          options: ['luggage', 'passport', 'boarding pass', 'ticket'],
        },
        {
          type: 'mcq',
          question: 'What does "overhead bin" mean?',
          questionFr: 'Que signifie "overhead bin" ?',
          options: [
            'Le couloir',
            'Le compartiment à bagages au-dessus',
            'Le siège fenêtre',
            'La sortie de secours',
          ],
          correctIndex: 1,
          explanation: '"Overhead bin" is the storage compartment above your seat.',
          explanationFr:
            '"Overhead bin" = le compartiment à bagages au-dessus de votre siège.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Y a-t-il une correspondance à Londres ?',
          targetEn: 'Is there a connection in London?',
          hint: 'Is there a connection in...',
        },
      ],
    },
  },
  {
    level: 'B1' as const,
    theme: 'job_interviews',
    order: 3,
    is_premium: true,
    content_json: {
      title: { fr: "Entretiens d'embauche", en: 'Job Interviews' },
      description: {
        fr: "Réussir un entretien d'embauche en anglais.",
        en: 'Succeed in a job interview in English.',
      },
      exercises: [
        {
          type: 'mcq',
          question: 'What does "What are your strengths?" mean?',
          questionFr: 'Que signifie "What are your strengths?" ?',
          options: [
            'Quelles sont vos faiblesses ?',
            'Quelles sont vos qualités / points forts ?',
            'Quelle est votre expérience ?',
            'Pourquoi postulez-vous ?',
          ],
          correctIndex: 1,
          explanation: '"Strengths" are qualities or strong points.',
          explanationFr: '"Strengths" = points forts, qualités.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: "J'ai cinq ans d'expérience dans ce domaine.",
          targetEn: 'I have five years of experience in this field.',
          hint: 'I have ... years of experience in...',
        },
        {
          type: 'fill',
          sentence: 'I am very ___ in this position.',
          sentenceFr: 'Je suis très ___ (intéressé) par ce poste.',
          answer: 'interested',
          options: ['excited', 'interested', 'happy', 'working'],
        },
        {
          type: 'mcq',
          question: 'What does "Could you tell me about your background?" mean?',
          questionFr: 'Que signifie "Could you tell me about your background?" ?',
          options: [
            "Parlez-moi de votre pays d'origine.",
            'Pouvez-vous me parler de votre parcours professionnel ?',
            'Quel est votre diplôme ?',
            'Pourquoi avez-vous quitté votre dernier emploi ?',
          ],
          correctIndex: 1,
          explanation: '"Background" here refers to your professional experience.',
          explanationFr:
            '"Background" désigne ici votre parcours / expérience professionnelle.',
        },
        {
          type: 'translation',
          instructionEn: 'Translate into English.',
          instructionFr: 'Traduisez en anglais.',
          sourceFr: 'Je travaille bien en équipe.',
          targetEn: 'I work well in a team.',
          hint: 'I work well in...',
        },
      ],
    },
  },
];

async function main() {
  const count = await prisma.lesson.count();
  if (count > 0) {
    console.log(`Seed skipped — database already has ${count} lessons.`);
    return;
  }

  console.log('Seeding lessons...');
  for (const lesson of lessons) {
    await prisma.lesson.create({ data: lesson });
  }
  console.log(`Seeded ${lessons.length} lessons successfully.`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
