/**
 * Seed: 30 additional lessons with real-world content (no API needed).
 * These are pre-generated from public domain sources.
 *
 * Run: npx ts-node prisma/seed-lessons-extra.ts
 */
import { PrismaClient, CefrLevel } from '@prisma/client';

const prisma = new PrismaClient();

interface LessonData {
  level: CefrLevel;
  theme: string;
  is_premium: boolean;
  content_json: {
    title: { en: string; fr: string };
    description: { en: string; fr: string };
    source: { name: string; url: string };
    exercises: any[];
  };
}

const EXTRA_LESSONS: LessonData[] = [
  // ═══════════════════════════════════════════════════════════════════
  // A1 — Beginners
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.A1,
    theme: 'daily-life',
    is_premium: false,
    content_json: {
      title: { en: 'My Daily Routine', fr: 'Ma routine quotidienne' },
      description: { en: 'Learn to describe your daily activities.', fr: 'Apprenez a decrire vos activites quotidiennes.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "I wake up" mean?', questionFr: 'Que signifie "I wake up" ?', options: ['Je me reveille', 'Je mange', 'Je dors', 'Je cours'], correctIndex: 0, explanation: '"Wake up" means to stop sleeping.', explanationFr: '"Wake up" signifie arreter de dormir.' },
        { type: 'mcq', question: 'What time do most people eat breakfast?', questionFr: 'A quelle heure mange-t-on le petit-dejeuner ?', options: ['In the morning', 'At night', 'At noon', 'In the afternoon'], correctIndex: 0, explanation: 'Breakfast is the first meal of the day, eaten in the morning.', explanationFr: 'Le petit-dejeuner est le premier repas de la journee.' },
        { type: 'fill', sentence: 'I ___ my teeth every morning.', sentenceFr: 'Je me ___ les dents chaque matin.', answer: 'brush', options: ['brush', 'wash', 'clean', 'cut'] },
        { type: 'fill', sentence: 'She ___ to school by bus.', sentenceFr: 'Elle ___ a l\'ecole en bus.', answer: 'goes', options: ['goes', 'runs', 'flies', 'drives'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Je prends le petit-dejeuner a 7 heures.', targetEn: 'I have breakfast at 7 o\'clock.', hint: 'I have breakfast...' },
        { type: 'mcq', question: 'Which word means "dormir"?', questionFr: 'Quel mot signifie "dormir" ?', options: ['Sleep', 'Eat', 'Walk', 'Talk'], correctIndex: 0, explanation: '"Sleep" means "dormir" in English.', explanationFr: '"Sleep" se traduit par "dormir".' },
        { type: 'fill', sentence: 'I take a ___ before bed.', sentenceFr: 'Je prends une ___ avant de dormir.', answer: 'shower', options: ['shower', 'dinner', 'walk', 'nap'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Je me couche a 22 heures.', targetEn: 'I go to bed at 10 PM.', hint: 'I go to bed...' },
      ],
    },
  },
  {
    level: CefrLevel.A1,
    theme: 'food',
    is_premium: false,
    content_json: {
      title: { en: 'Food and Drinks', fr: 'Nourriture et boissons' },
      description: { en: 'Learn common food and drink vocabulary.', fr: 'Apprenez le vocabulaire courant de la nourriture.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What is "bread" in French?', questionFr: 'Comment dit-on "bread" en francais ?', options: ['Du pain', 'Du riz', 'Du lait', 'Du fromage'], correctIndex: 0, explanation: '"Bread" means "pain" in French.', explanationFr: '"Bread" se traduit par "pain".' },
        { type: 'mcq', question: 'Which drink is hot?', questionFr: 'Quelle boisson est chaude ?', options: ['Tea', 'Juice', 'Water', 'Milk'], correctIndex: 0, explanation: 'Tea is typically served hot.', explanationFr: 'Le the est generalement servi chaud.' },
        { type: 'fill', sentence: 'I would like a glass of ___, please.', sentenceFr: 'Je voudrais un verre d\'___, s\'il vous plait.', answer: 'water', options: ['water', 'bread', 'chicken', 'rice'] },
        { type: 'fill', sentence: 'She eats an ___ every day.', sentenceFr: 'Elle mange une ___ tous les jours.', answer: 'apple', options: ['apple', 'table', 'car', 'door'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'J\'ai faim.', targetEn: 'I am hungry.', hint: 'I am...' },
        { type: 'mcq', question: 'What does "delicious" mean?', questionFr: 'Que signifie "delicious" ?', options: ['Delicieux', 'Dangereux', 'Difficile', 'Different'], correctIndex: 0, explanation: '"Delicious" means very good tasting.', explanationFr: '"Delicious" signifie tres bon au gout.' },
        { type: 'fill', sentence: 'We have ___ for dinner.', sentenceFr: 'Nous avons du ___ pour le diner.', answer: 'chicken', options: ['chicken', 'morning', 'weather', 'school'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'J\'aime le chocolat.', targetEn: 'I like chocolate.', hint: 'I like...' },
      ],
    },
  },
  {
    level: CefrLevel.A1,
    theme: 'colors-numbers',
    is_premium: false,
    content_json: {
      title: { en: 'Colors and Numbers', fr: 'Couleurs et nombres' },
      description: { en: 'Practice basic colors and numbers.', fr: 'Pratiquez les couleurs et les nombres de base.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What color is the sky?', questionFr: 'De quelle couleur est le ciel ?', options: ['Blue', 'Red', 'Green', 'Yellow'], correctIndex: 0, explanation: 'The sky is blue.', explanationFr: 'Le ciel est bleu.' },
        { type: 'mcq', question: 'How many days in a week?', questionFr: 'Combien de jours dans une semaine ?', options: ['Seven', 'Five', 'Six', 'Ten'], correctIndex: 0, explanation: 'There are seven days in a week.', explanationFr: 'Il y a sept jours dans une semaine.' },
        { type: 'fill', sentence: 'A banana is ___.', sentenceFr: 'Une banane est ___.', answer: 'yellow', options: ['yellow', 'blue', 'red', 'purple'] },
        { type: 'fill', sentence: 'I have ___ fingers on each hand.', sentenceFr: 'J\'ai ___ doigts a chaque main.', answer: 'five', options: ['five', 'three', 'eight', 'ten'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Ma couleur preferee est le vert.', targetEn: 'My favorite color is green.', hint: 'My favorite color...' },
        { type: 'mcq', question: 'What does "twelve" mean?', questionFr: 'Que signifie "twelve" ?', options: ['Douze', 'Vingt', 'Deux', 'Trois'], correctIndex: 0, explanation: '"Twelve" is the number 12.', explanationFr: '"Twelve" est le nombre 12.' },
        { type: 'fill', sentence: 'Grass is ___.', sentenceFr: 'L\'herbe est ___.', answer: 'green', options: ['green', 'white', 'black', 'orange'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'J\'ai vingt ans.', targetEn: 'I am twenty years old.', hint: 'I am twenty...' },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // A2 — Elementary
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.A2,
    theme: 'weather',
    is_premium: false,
    content_json: {
      title: { en: 'Talking About Weather', fr: 'Parler de la meteo' },
      description: { en: 'Describe weather conditions and seasons.', fr: 'Decrivez la meteo et les saisons.' },
      source: { name: 'Simple Wikipedia', url: 'https://simple.wikipedia.org/wiki/Weather' },
      exercises: [
        { type: 'mcq', question: 'What does "It\'s raining" mean?', questionFr: 'Que signifie "It\'s raining" ?', options: ['Il pleut', 'Il neige', 'Il fait chaud', 'Il fait froid'], correctIndex: 0, explanation: '"Raining" means water is falling from clouds.', explanationFr: '"Raining" signifie que l\'eau tombe des nuages.' },
        { type: 'mcq', question: 'Which season is the coldest?', questionFr: 'Quelle saison est la plus froide ?', options: ['Winter', 'Summer', 'Spring', 'Autumn'], correctIndex: 0, explanation: 'Winter is the coldest season of the year.', explanationFr: 'L\'hiver est la saison la plus froide.' },
        { type: 'fill', sentence: 'It is very ___ today, I need sunglasses.', sentenceFr: 'Il fait tres ___ aujourd\'hui, j\'ai besoin de lunettes.', answer: 'sunny', options: ['sunny', 'rainy', 'cold', 'dark'] },
        { type: 'fill', sentence: 'In autumn, the ___ fall from the trees.', sentenceFr: 'En automne, les ___ tombent des arbres.', answer: 'leaves', options: ['leaves', 'flowers', 'birds', 'clouds'] },
        { type: 'mcq', question: 'What is a "storm"?', questionFr: 'Qu\'est-ce qu\'une "storm" ?', options: ['A tempete with strong wind and rain', 'A sunny day', 'A type of cloud', 'A cold morning'], correctIndex: 0, explanation: 'A storm has strong winds and heavy rain or snow.', explanationFr: 'Une tempete a des vents forts et de fortes pluies.' },
        { type: 'fill', sentence: 'You should bring an ___ because it might rain.', sentenceFr: 'Tu devrais prendre un ___ car il pourrait pleuvoir.', answer: 'umbrella', options: ['umbrella', 'sandwich', 'telephone', 'computer'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Quel temps fait-il aujourd\'hui ?', targetEn: 'What is the weather like today?', hint: 'What is the weather...' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Il fait froid et il neige.', targetEn: 'It is cold and it is snowing.', hint: 'It is cold and...' },
        { type: 'mcq', question: 'What does "foggy" mean?', questionFr: 'Que signifie "foggy" ?', options: ['Brumeux', 'Venteux', 'Ensoleille', 'Orageux'], correctIndex: 0, explanation: '"Foggy" means you cannot see far because of thick mist.', explanationFr: '"Foggy" signifie qu\'on ne voit pas loin a cause du brouillard.' },
        { type: 'fill', sentence: 'The temperature is 30 degrees, it\'s very ___.', sentenceFr: 'La temperature est de 30 degres, il fait tres ___.', answer: 'hot', options: ['hot', 'cold', 'cool', 'freezing'] },
      ],
    },
  },
  {
    level: CefrLevel.A2,
    theme: 'transport',
    is_premium: false,
    content_json: {
      title: { en: 'Getting Around Town', fr: 'Se deplacer en ville' },
      description: { en: 'Learn vocabulary for transportation and directions.', fr: 'Apprenez le vocabulaire des transports et directions.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'Where do you catch a train?', questionFr: 'Ou prend-on un train ?', options: ['At the station', 'At the airport', 'At the beach', 'At the park'], correctIndex: 0, explanation: 'Trains depart from stations.', explanationFr: 'Les trains partent des gares.' },
        { type: 'fill', sentence: 'Turn ___ at the traffic lights.', sentenceFr: 'Tournez a ___ au feu rouge.', answer: 'left', options: ['left', 'up', 'fast', 'slow'] },
        { type: 'mcq', question: 'What does "straight ahead" mean?', questionFr: 'Que signifie "straight ahead" ?', options: ['Tout droit', 'A gauche', 'A droite', 'En arriere'], correctIndex: 0, explanation: '"Straight ahead" means to continue forward without turning.', explanationFr: '"Straight ahead" signifie continuer tout droit.' },
        { type: 'fill', sentence: 'The bus ___ is just around the corner.', sentenceFr: 'L\'arret de ___ est juste au coin.', answer: 'stop', options: ['stop', 'car', 'light', 'road'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Excusez-moi, ou est la gare ?', targetEn: 'Excuse me, where is the train station?', hint: 'Excuse me, where...' },
        { type: 'mcq', question: 'What is a "roundabout"?', questionFr: 'Qu\'est-ce qu\'un "roundabout" ?', options: ['Un rond-point', 'Un parking', 'Un pont', 'Un tunnel'], correctIndex: 0, explanation: 'A roundabout is a circular road junction.', explanationFr: 'Un roundabout est une intersection circulaire.' },
        { type: 'fill', sentence: 'I usually ___ to work because it\'s close.', sentenceFr: 'Je ___ generalement au travail car c\'est proche.', answer: 'walk', options: ['walk', 'fly', 'swim', 'dance'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Le metro est rapide et pas cher.', targetEn: 'The metro is fast and cheap.', hint: 'The metro is...' },
        { type: 'mcq', question: 'Which vehicle flies?', questionFr: 'Quel vehicule vole ?', options: ['A plane', 'A bus', 'A boat', 'A bicycle'], correctIndex: 0, explanation: 'Planes fly in the sky.', explanationFr: 'Les avions volent dans le ciel.' },
        { type: 'fill', sentence: 'We took a ___ to cross the river.', sentenceFr: 'Nous avons pris un ___ pour traverser la riviere.', answer: 'boat', options: ['boat', 'train', 'bike', 'car'] },
      ],
    },
  },
  {
    level: CefrLevel.A2,
    theme: 'shopping',
    is_premium: false,
    content_json: {
      title: { en: 'Going Shopping', fr: 'Faire les courses' },
      description: { en: 'Practice shopping vocabulary and conversations.', fr: 'Pratiquez le vocabulaire et les dialogues de shopping.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "How much is this?" mean?', questionFr: 'Que signifie "How much is this?" ?', options: ['Combien ca coute ?', 'Ou est-ce ?', 'Qu\'est-ce que c\'est ?', 'A qui est-ce ?'], correctIndex: 0, explanation: '"How much" asks about the price.', explanationFr: '"How much" demande le prix.' },
        { type: 'fill', sentence: 'Can I pay by ___, please?', sentenceFr: 'Puis-je payer par ___, s\'il vous plait ?', answer: 'card', options: ['card', 'letter', 'phone', 'email'] },
        { type: 'mcq', question: 'Where do you buy medicine?', questionFr: 'Ou achete-t-on des medicaments ?', options: ['At the pharmacy', 'At the bakery', 'At the library', 'At the cinema'], correctIndex: 0, explanation: 'A pharmacy sells medicine.', explanationFr: 'Une pharmacie vend des medicaments.' },
        { type: 'fill', sentence: 'This shirt is too ___. Do you have a smaller one?', sentenceFr: 'Cette chemise est trop ___. Avez-vous plus petit ?', answer: 'big', options: ['big', 'cheap', 'blue', 'new'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Je cherche un cadeau pour mon ami.', targetEn: 'I am looking for a gift for my friend.', hint: 'I am looking for...' },
        { type: 'mcq', question: 'What is a "receipt"?', questionFr: 'Qu\'est-ce qu\'un "receipt" ?', options: ['Un ticket de caisse', 'Une recette', 'Un recu de livraison', 'Une facture'], correctIndex: 0, explanation: 'A receipt is the paper proof of purchase.', explanationFr: 'Un receipt est le ticket qui prouve l\'achat.' },
        { type: 'fill', sentence: 'The ___ is 50% off today.', sentenceFr: 'Le ___ est a -50% aujourd\'hui.', answer: 'price', options: ['price', 'weather', 'color', 'size'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'C\'est trop cher pour moi.', targetEn: 'It is too expensive for me.', hint: 'It is too expensive...' },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // B1 — Intermediate
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.B1,
    theme: 'environment',
    is_premium: false,
    content_json: {
      title: { en: 'Protecting Our Environment', fr: 'Proteger notre environnement' },
      description: { en: 'Discuss environmental issues and solutions.', fr: 'Discutez des problemes environnementaux et des solutions.' },
      source: { name: 'Simple Wikipedia', url: 'https://simple.wikipedia.org/wiki/Pollution' },
      exercises: [
        { type: 'mcq', question: 'What does "pollution" mean?', questionFr: 'Que signifie "pollution" ?', options: ['Contamination of the environment', 'A type of weather', 'A political system', 'A type of energy'], correctIndex: 0, explanation: 'Pollution is the introduction of harmful substances into the environment.', explanationFr: 'La pollution est l\'introduction de substances nocives dans l\'environnement.' },
        { type: 'mcq', question: 'Which of these is a renewable energy source?', questionFr: 'Laquelle est une source d\'energie renouvelable ?', options: ['Solar power', 'Coal', 'Oil', 'Natural gas'], correctIndex: 0, explanation: 'Solar power comes from the sun and is renewable.', explanationFr: 'L\'energie solaire vient du soleil et est renouvelable.' },
        { type: 'fill', sentence: 'We should ___ plastic bags to reduce waste.', sentenceFr: 'Nous devrions ___ les sacs plastiques pour reduire les dechets.', answer: 'reuse', options: ['reuse', 'produce', 'increase', 'ignore'] },
        { type: 'fill', sentence: 'Global warming is caused by greenhouse ___.', sentenceFr: 'Le rechauffement climatique est cause par les ___ a effet de serre.', answer: 'gases', options: ['gases', 'animals', 'trees', 'oceans'] },
        { type: 'mcq', question: 'What is "deforestation"?', questionFr: 'Qu\'est-ce que la "deforestation" ?', options: ['Cutting down large areas of forest', 'Planting new trees', 'Cleaning rivers', 'Building parks'], correctIndex: 0, explanation: 'Deforestation means removing forests, usually for farming or building.', explanationFr: 'La deforestation signifie supprimer des forets.' },
        { type: 'fill', sentence: 'Many animals are ___ because their habitats are destroyed.', sentenceFr: 'Beaucoup d\'animaux sont ___ car leurs habitats sont detruits.', answer: 'endangered', options: ['endangered', 'happy', 'growing', 'sleeping'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Nous devons reduire notre consommation d\'energie.', targetEn: 'We must reduce our energy consumption.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Le recyclage aide a proteger l\'environnement.', targetEn: 'Recycling helps protect the environment.' },
        { type: 'mcq', question: 'According to scientists, what causes rising sea levels?', questionFr: 'Selon les scientifiques, qu\'est-ce qui fait monter le niveau de la mer ?', options: ['Melting ice caps', 'More fish in the ocean', 'Stronger winds', 'More rain'], correctIndex: 0, explanation: 'When ice at the poles melts due to warming, sea levels rise.', explanationFr: 'Quand la glace aux poles fond, le niveau de la mer monte.', passage: 'Scientists have observed that global temperatures are rising, causing ice caps at the North and South Poles to melt at an accelerating rate.' },
        { type: 'fill', sentence: 'Electric cars produce zero ___ emissions.', sentenceFr: 'Les voitures electriques produisent zero emissions ___.', answer: 'direct', options: ['direct', 'large', 'fast', 'green'] },
      ],
    },
  },
  {
    level: CefrLevel.B1,
    theme: 'technology',
    is_premium: false,
    content_json: {
      title: { en: 'Technology in Daily Life', fr: 'La technologie au quotidien' },
      description: { en: 'Discuss how technology affects our daily routines.', fr: 'Discutez de l\'impact de la technologie sur nos routines.' },
      source: { name: 'Simple Wikipedia', url: 'https://simple.wikipedia.org/wiki/Internet' },
      exercises: [
        { type: 'mcq', question: 'What does "to download" mean?', questionFr: 'Que signifie "to download" ?', options: ['Telecharger', 'Supprimer', 'Envoyer', 'Imprimer'], correctIndex: 0, explanation: '"Download" means to transfer data from the internet to your device.', explanationFr: '"Download" signifie transferer des donnees d\'internet vers votre appareil.' },
        { type: 'fill', sentence: 'I need to ___ my phone because the battery is low.', sentenceFr: 'Je dois ___ mon telephone car la batterie est faible.', answer: 'charge', options: ['charge', 'delete', 'throw', 'sell'] },
        { type: 'mcq', question: 'What is a "password"?', questionFr: 'Qu\'est-ce qu\'un "password" ?', options: ['A secret code to access accounts', 'A type of computer', 'An email address', 'A phone number'], correctIndex: 0, explanation: 'A password protects your online accounts from unauthorized access.', explanationFr: 'Un mot de passe protege vos comptes en ligne.' },
        { type: 'fill', sentence: 'Social media can be ___ if you spend too much time on it.', sentenceFr: 'Les reseaux sociaux peuvent etre ___ si on y passe trop de temps.', answer: 'addictive', options: ['addictive', 'delicious', 'colorful', 'musical'] },
        { type: 'mcq', question: 'Which statement about the internet is TRUE?', questionFr: 'Quelle affirmation sur internet est VRAIE ?', options: ['It connects billions of devices worldwide', 'It was invented in 2010', 'It only works in English', 'It requires no electricity'], correctIndex: 0, explanation: 'The internet is a global network connecting billions of devices.', explanationFr: 'Internet est un reseau mondial connectant des milliards d\'appareils.', passage: 'The Internet is a worldwide system of computer networks that connects billions of devices across the globe, enabling instant communication and access to information.' },
        { type: 'fill', sentence: 'You should ___ your data regularly to avoid losing files.', sentenceFr: 'Vous devriez ___ vos donnees regulierement pour eviter de perdre des fichiers.', answer: 'back up', options: ['back up', 'delete', 'print', 'share'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La technologie a change notre facon de communiquer.', targetEn: 'Technology has changed the way we communicate.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Il est important de proteger ses donnees personnelles.', targetEn: 'It is important to protect your personal data.' },
        { type: 'mcq', question: 'What does "update" mean in a tech context?', questionFr: 'Que signifie "update" en contexte tech ?', options: ['Mettre a jour', 'Eteindre', 'Installer', 'Desinstaller'], correctIndex: 0, explanation: '"Update" means to install the latest version of software.', explanationFr: '"Update" signifie installer la derniere version d\'un logiciel.' },
        { type: 'fill', sentence: 'Artificial ___ is used in many modern applications.', sentenceFr: 'L\' ___ artificielle est utilisee dans de nombreuses applications.', answer: 'intelligence', options: ['intelligence', 'flower', 'mountain', 'weather'] },
      ],
    },
  },
  {
    level: CefrLevel.B1,
    theme: 'health',
    is_premium: false,
    content_json: {
      title: { en: 'Healthy Lifestyle Habits', fr: 'Habitudes de vie saines' },
      description: { en: 'Learn to discuss health, exercise and well-being.', fr: 'Apprenez a discuter de sante et de bien-etre.' },
      source: { name: 'Simple Wikipedia', url: 'https://simple.wikipedia.org/wiki/Health' },
      exercises: [
        { type: 'mcq', question: 'What does "to exercise" mean?', questionFr: 'Que signifie "to exercise" ?', options: ['Faire de l\'exercice physique', 'Manger', 'Dormir', 'Lire'], correctIndex: 0, explanation: '"Exercise" means physical activity to stay healthy.', explanationFr: '"Exercise" signifie activite physique pour rester en bonne sante.' },
        { type: 'fill', sentence: 'A balanced ___ includes fruits, vegetables, and protein.', sentenceFr: 'Un ___ equilibre comprend des fruits, des legumes et des proteines.', answer: 'diet', options: ['diet', 'sport', 'sleep', 'dream'] },
        { type: 'mcq', question: 'How many hours of sleep do adults need?', questionFr: 'Combien d\'heures de sommeil les adultes ont-ils besoin ?', options: ['7-9 hours', '3-4 hours', '12-14 hours', '1-2 hours'], correctIndex: 0, explanation: 'Most adults need 7-9 hours of sleep per night.', explanationFr: 'La plupart des adultes ont besoin de 7 a 9 heures de sommeil.' },
        { type: 'fill', sentence: 'Stress can have negative effects on your mental ___.', sentenceFr: 'Le stress peut avoir des effets negatifs sur votre ___ mentale.', answer: 'health', options: ['health', 'food', 'car', 'house'] },
        { type: 'mcq', question: 'Which activity helps reduce stress?', questionFr: 'Quelle activite aide a reduire le stress ?', options: ['Meditation', 'Eating fast food', 'Watching TV all day', 'Drinking coffee'], correctIndex: 0, explanation: 'Meditation is proven to reduce stress and improve mental clarity.', explanationFr: 'La meditation reduit le stress et ameliore la clarte mentale.' },
        { type: 'fill', sentence: 'Drinking enough ___ is essential for good health.', sentenceFr: 'Boire assez d\' ___ est essentiel pour une bonne sante.', answer: 'water', options: ['water', 'coffee', 'soda', 'alcohol'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Je fais du sport trois fois par semaine.', targetEn: 'I exercise three times a week.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Il est recommande de marcher au moins 30 minutes par jour.', targetEn: 'It is recommended to walk at least 30 minutes a day.' },
        { type: 'mcq', question: 'What does "symptom" mean?', questionFr: 'Que signifie "symptom" ?', options: ['Un signe de maladie', 'Un medicament', 'Un docteur', 'Un hopital'], correctIndex: 0, explanation: 'A symptom is a sign that something is wrong with your health.', explanationFr: 'Un symptome est un signe que quelque chose ne va pas.' },
        { type: 'fill', sentence: 'Regular exercise strengthens your ___ system.', sentenceFr: 'L\'exercice regulier renforce votre systeme ___.', answer: 'immune', options: ['immune', 'solar', 'electric', 'musical'] },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // B2 — Upper Intermediate
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.B2,
    theme: 'media',
    is_premium: false,
    content_json: {
      title: { en: 'Media and Information Literacy', fr: 'Medias et litteratie informationnelle' },
      description: { en: 'Analyze media bias and develop critical thinking.', fr: 'Analysez les biais mediatiques et developpez l\'esprit critique.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "bias" mean in journalism?', questionFr: 'Que signifie "bias" en journalisme ?', options: ['A tendency to present information in a partial way', 'The date of publication', 'The number of readers', 'The length of an article'], correctIndex: 0, explanation: 'Bias is a prejudice that affects how information is presented.', explanationFr: 'Le biais est un prejuge qui affecte la presentation de l\'information.' },
        { type: 'fill', sentence: 'Fact-checking is essential to combat ___ information.', sentenceFr: 'La verification des faits est essentielle pour combattre la ___.', answer: 'misleading', options: ['misleading', 'interesting', 'scientific', 'historical'] },
        { type: 'mcq', question: 'What is "clickbait"?', questionFr: 'Qu\'est-ce que le "clickbait" ?', options: ['Sensational headlines designed to attract clicks', 'A type of computer virus', 'A social media platform', 'A news agency'], correctIndex: 0, explanation: 'Clickbait uses exaggerated or misleading titles to generate ad revenue.', explanationFr: 'Le clickbait utilise des titres exageres pour generer des clics.' },
        { type: 'fill', sentence: 'Critical ___ skills help people evaluate news sources.', sentenceFr: 'Les competences de ___ critique aident a evaluer les sources.', answer: 'thinking', options: ['thinking', 'writing', 'eating', 'sleeping'] },
        { type: 'mcq', question: 'According to media experts, which practice helps identify fake news?', questionFr: 'Selon les experts, quelle pratique aide a identifier les fake news ?', options: ['Cross-referencing multiple sources', 'Only reading headlines', 'Sharing immediately', 'Trusting all viral posts'], correctIndex: 0, explanation: 'Comparing information across multiple reliable sources helps verify accuracy.', explanationFr: 'Comparer l\'information entre plusieurs sources fiables aide a verifier l\'exactitude.', passage: 'Media literacy experts recommend that readers always cross-reference claims with at least two independent, reputable sources before sharing information online.' },
        { type: 'fill', sentence: 'An editorial represents the ___ of the newspaper, not objective facts.', sentenceFr: 'Un editorial represente l\' ___ du journal, pas des faits objectifs.', answer: 'opinion', options: ['opinion', 'headline', 'photo', 'address'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les reseaux sociaux ont transforme la maniere dont nous consommons l\'information.', targetEn: 'Social media has transformed the way we consume information.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Il est crucial de distinguer les faits des opinions dans les medias.', targetEn: 'It is crucial to distinguish facts from opinions in the media.' },
        { type: 'mcq', question: 'What does "to verify" mean?', questionFr: 'Que signifie "to verify" ?', options: ['Confirmer la veracite de quelque chose', 'Publier un article', 'Supprimer un contenu', 'Partager une publication'], correctIndex: 0, explanation: '"Verify" means to check that something is true or accurate.', explanationFr: '"Verify" signifie verifier que quelque chose est vrai ou exact.' },
        { type: 'fill', sentence: 'Responsible journalism requires ___ and balanced reporting.', sentenceFr: 'Le journalisme responsable requiert un reportage ___ et equilibre.', answer: 'accurate', options: ['accurate', 'funny', 'fast', 'short'] },
      ],
    },
  },
  {
    level: CefrLevel.B2,
    theme: 'work',
    is_premium: false,
    content_json: {
      title: { en: 'The Modern Workplace', fr: 'Le monde du travail moderne' },
      description: { en: 'Discuss remote work, work-life balance, and career development.', fr: 'Discutez du teletravail et de l\'equilibre vie pro/perso.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "work-life balance" refer to?', questionFr: 'A quoi fait reference "work-life balance" ?', options: ['The equilibrium between professional and personal life', 'Working overtime', 'A salary increase', 'A job interview'], correctIndex: 0, explanation: 'Work-life balance is about managing time between job and personal activities.', explanationFr: 'C\'est l\'equilibre entre le travail et la vie personnelle.' },
        { type: 'fill', sentence: 'Remote workers often struggle with ___ when working from home.', sentenceFr: 'Les teletravailleurs ont souvent du mal avec la ___ en travaillant de chez eux.', answer: 'productivity', options: ['productivity', 'creativity', 'humidity', 'electricity'] },
        { type: 'mcq', question: 'What is a "deadline"?', questionFr: 'Qu\'est-ce qu\'une "deadline" ?', options: ['A time limit for completing a task', 'A type of contract', 'A salary bonus', 'A job title'], correctIndex: 0, explanation: 'A deadline is the final date by which something must be completed.', explanationFr: 'Une deadline est la date limite pour terminer quelque chose.' },
        { type: 'fill', sentence: 'Many companies now offer ___ working hours to their employees.', sentenceFr: 'Beaucoup d\'entreprises offrent maintenant des horaires ___ a leurs employes.', answer: 'flexible', options: ['flexible', 'dangerous', 'expensive', 'musical'] },
        { type: 'mcq', question: 'According to research, what benefit does remote work provide?', questionFr: 'Selon la recherche, quel avantage apporte le teletravail ?', options: ['Reduced commuting time and increased flexibility', 'Higher salary automatically', 'No need for internet', 'Fewer responsibilities'], correctIndex: 0, explanation: 'Remote work eliminates commuting time and allows more flexible schedules.', explanationFr: 'Le teletravail elimine le temps de trajet et permet plus de flexibilite.', passage: 'Studies show that remote workers save an average of 40 minutes per day by not commuting, and report higher job satisfaction due to increased schedule flexibility.' },
        { type: 'fill', sentence: 'Networking is important for career ___ and finding opportunities.', sentenceFr: 'Le networking est important pour le ___ professionnel.', answer: 'development', options: ['development', 'entertainment', 'vacation', 'retirement'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'L\'intelligence artificielle va transformer de nombreux metiers dans les prochaines annees.', targetEn: 'Artificial intelligence will transform many professions in the coming years.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les competences relationnelles sont aussi importantes que les competences techniques.', targetEn: 'Soft skills are as important as technical skills.' },
        { type: 'mcq', question: 'What does "to resign" mean?', questionFr: 'Que signifie "to resign" ?', options: ['Demissionner', 'Etre promu', 'Etre licencie', 'Prendre des vacances'], correctIndex: 0, explanation: '"To resign" means to voluntarily leave your job.', explanationFr: '"To resign" signifie quitter volontairement son emploi.' },
        { type: 'fill', sentence: 'A good manager should ___ their team and provide constructive feedback.', sentenceFr: 'Un bon manager devrait ___ son equipe et fournir des retours constructifs.', answer: 'motivate', options: ['motivate', 'ignore', 'punish', 'replace'] },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // C1 — Advanced
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.C1,
    theme: 'philosophy',
    is_premium: false,
    content_json: {
      title: { en: 'Ethics in the Digital Age', fr: 'L\'ethique a l\'ere numerique' },
      description: { en: 'Explore ethical dilemmas posed by modern technology.', fr: 'Explorez les dilemmes ethiques poses par la technologie moderne.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "surveillance capitalism" refer to?', questionFr: 'A quoi fait reference "surveillance capitalism" ?', options: ['The monetization of personal data collected through digital monitoring', 'A type of government policy', 'Traditional market economics', 'A security camera system'], correctIndex: 0, explanation: 'Surveillance capitalism describes the economic system built on harvesting and selling personal data.', explanationFr: 'Le capitalisme de surveillance decrit le systeme economique base sur la collecte et la vente de donnees personnelles.' },
        { type: 'fill', sentence: 'The ethical implications of artificial intelligence remain hotly ___ among philosophers.', sentenceFr: 'Les implications ethiques de l\'IA restent vivement ___ parmi les philosophes.', answer: 'debated', options: ['debated', 'ignored', 'celebrated', 'forgotten'] },
        { type: 'mcq', question: 'Which ethical framework prioritizes outcomes over intentions?', questionFr: 'Quel cadre ethique privilegie les resultats sur les intentions ?', options: ['Utilitarianism', 'Deontology', 'Virtue ethics', 'Nihilism'], correctIndex: 0, explanation: 'Utilitarianism judges actions based on their consequences and overall well-being produced.', explanationFr: 'L\'utilitarisme juge les actions selon leurs consequences et le bien-etre global produit.' },
        { type: 'fill', sentence: 'Algorithmic bias perpetuates existing societal ___ if left unchecked.', sentenceFr: 'Le biais algorithmique perpetue les ___ societales existantes s\'il n\'est pas corrige.', answer: 'inequalities', options: ['inequalities', 'celebrations', 'inventions', 'discoveries'] },
        { type: 'mcq', question: 'According to the passage, what is the "right to be forgotten"?', questionFr: 'Selon le texte, qu\'est-ce que le "droit a l\'oubli" ?', options: ['The right to have personal data deleted from online platforms', 'The right to forget passwords', 'A memory disorder', 'A legal exemption from taxes'], correctIndex: 0, explanation: 'This legal concept allows individuals to request removal of their personal data from search engines.', explanationFr: 'Ce concept legal permet aux individus de demander la suppression de leurs donnees personnelles.', passage: 'The right to be forgotten, enshrined in European law through GDPR, enables individuals to request that search engines and platforms remove outdated or irrelevant personal information.' },
        { type: 'fill', sentence: 'Whistleblowers play a crucial role in holding corporations ___ for their actions.', sentenceFr: 'Les lanceurs d\'alerte jouent un role crucial pour tenir les entreprises ___ de leurs actes.', answer: 'accountable', options: ['accountable', 'profitable', 'famous', 'comfortable'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La frontiere entre vie privee et transparence devient de plus en plus floue a l\'ere numerique.', targetEn: 'The boundary between privacy and transparency is becoming increasingly blurred in the digital age.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les entreprises technologiques doivent assumer la responsabilite ethique de leurs algorithmes.', targetEn: 'Technology companies must assume ethical responsibility for their algorithms.' },
        { type: 'mcq', question: 'What does "to undermine" mean?', questionFr: 'Que signifie "to undermine" ?', options: ['Affaiblir progressivement', 'Construire', 'Ameliorer', 'Financer'], correctIndex: 0, explanation: '"To undermine" means to gradually weaken or erode the foundations of something.', explanationFr: '"To undermine" signifie affaiblir progressivement les fondements de quelque chose.' },
        { type: 'fill', sentence: 'The proliferation of deepfakes poses an unprecedented threat to the ___ of information.', sentenceFr: 'La proliferation des deepfakes pose une menace sans precedent a l\' ___ de l\'information.', answer: 'integrity', options: ['integrity', 'quantity', 'speed', 'color'] },
      ],
    },
  },
  {
    level: CefrLevel.C1,
    theme: 'science',
    is_premium: false,
    content_json: {
      title: { en: 'Climate Science and Policy', fr: 'Science climatique et politiques publiques' },
      description: { en: 'Analyze the intersection of climate science and political decision-making.', fr: 'Analysez l\'intersection entre science climatique et decisions politiques.' },
      source: { name: 'Simple Wikipedia', url: 'https://simple.wikipedia.org/wiki/Climate_change' },
      exercises: [
        { type: 'mcq', question: 'What does "consensus" mean in scientific context?', questionFr: 'Que signifie "consensus" en contexte scientifique ?', options: ['Widespread agreement among experts based on evidence', 'A unanimous political vote', 'A type of experiment', 'A single scientist\'s opinion'], correctIndex: 0, explanation: 'Scientific consensus reflects the collective position of the expert community.', explanationFr: 'Le consensus scientifique reflete la position collective de la communaute d\'experts.' },
        { type: 'fill', sentence: 'Carbon dioxide concentrations have risen ___ since the Industrial Revolution.', sentenceFr: 'Les concentrations de CO2 ont augmente ___ depuis la Revolution industrielle.', answer: 'dramatically', options: ['dramatically', 'slightly', 'invisibly', 'temporarily'] },
        { type: 'mcq', question: 'What is the Paris Agreement primarily concerned with?', questionFr: 'De quoi traite principalement l\'Accord de Paris ?', options: ['Limiting global temperature rise to 1.5-2 degrees Celsius', 'International trade regulations', 'Nuclear disarmament', 'Space exploration funding'], correctIndex: 0, explanation: 'The Paris Agreement aims to limit warming to well below 2C above pre-industrial levels.', explanationFr: 'L\'Accord de Paris vise a limiter le rechauffement bien en dessous de 2C.' },
        { type: 'fill', sentence: 'Policymakers often face a tension between economic growth and environmental ___.', sentenceFr: 'Les decideurs font souvent face a une tension entre croissance economique et ___ environnementale.', answer: 'sustainability', options: ['sustainability', 'entertainment', 'competition', 'publicity'] },
        { type: 'mcq', question: 'According to climate scientists, what is a "tipping point"?', questionFr: 'Selon les climatologues, qu\'est-ce qu\'un "tipping point" ?', options: ['A threshold beyond which changes become irreversible', 'The highest mountain temperature', 'A seasonal weather pattern', 'A type of renewable energy'], correctIndex: 0, explanation: 'A tipping point is a critical threshold that, once crossed, leads to cascading, irreversible changes.', explanationFr: 'Un point de basculement est un seuil critique au-dela duquel les changements deviennent irreversibles.', passage: 'Climate tipping points represent critical thresholds in the Earth system that, when exceeded, can lead to large-scale, self-reinforcing changes that may be impossible to reverse within human timescales.' },
        { type: 'fill', sentence: 'The transition to renewable energy requires substantial ___ in infrastructure.', sentenceFr: 'La transition vers les energies renouvelables necessite des ___ substantiels en infrastructure.', answer: 'investments', options: ['investments', 'reductions', 'complaints', 'celebrations'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les effets du changement climatique se manifestent deja a travers des evenements meteorologiques extremes de plus en plus frequents.', targetEn: 'The effects of climate change are already manifesting through increasingly frequent extreme weather events.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La cooperation internationale est indispensable pour relever les defis environnementaux mondiaux.', targetEn: 'International cooperation is indispensable for addressing global environmental challenges.' },
        { type: 'mcq', question: 'What does "to mitigate" mean?', questionFr: 'Que signifie "to mitigate" ?', options: ['Attenuer ou reduire la gravite', 'Aggraver un probleme', 'Ignorer completement', 'Mesurer avec precision'], correctIndex: 0, explanation: '"To mitigate" means to make something less severe or serious.', explanationFr: '"To mitigate" signifie rendre quelque chose moins grave ou severe.' },
        { type: 'fill', sentence: 'Biodiversity loss undermines ecosystem ___ and threatens food security.', sentenceFr: 'La perte de biodiversite compromet la ___ des ecosystemes et menace la securite alimentaire.', answer: 'resilience', options: ['resilience', 'popularity', 'beauty', 'simplicity'] },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // C2 — Mastery
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.C2,
    theme: 'linguistics',
    is_premium: true,
    content_json: {
      title: { en: 'The Evolution of Language', fr: 'L\'evolution du langage' },
      description: { en: 'Examine linguistic theories on how languages change and die.', fr: 'Examinez les theories linguistiques sur l\'evolution et la mort des langues.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "linguistic determinism" posit?', questionFr: 'Que postule le "determinisme linguistique" ?', options: ['That language fundamentally shapes thought and perception', 'That all languages share identical grammar', 'That language learning is purely instinctive', 'That written language predates spoken language'], correctIndex: 0, explanation: 'The Sapir-Whorf hypothesis in its strong form suggests language determines cognitive categories.', explanationFr: 'L\'hypothese de Sapir-Whorf dans sa forme forte suggere que la langue determine les categories cognitives.' },
        { type: 'fill', sentence: 'The phenomenon of language ___ occurs when speakers of different languages interact regularly over extended periods.', sentenceFr: 'Le phenomene de ___ linguistique se produit quand des locuteurs de langues differentes interagissent regulierement.', answer: 'convergence', options: ['convergence', 'destruction', 'isolation', 'competition'] },
        { type: 'mcq', question: 'What distinguishes a "creole" from a "pidgin"?', questionFr: 'Qu\'est-ce qui distingue un "creole" d\'un "pidgin" ?', options: ['A creole has native speakers; a pidgin does not', 'A pidgin has more vocabulary', 'Creoles are always written languages', 'There is no meaningful distinction'], correctIndex: 0, explanation: 'Creoles develop when children acquire a pidgin as their first language, adding grammatical complexity.', explanationFr: 'Les creoles se developpent quand des enfants acquierent un pidgin comme langue maternelle.' },
        { type: 'fill', sentence: 'Etymological analysis reveals that approximately 60% of English vocabulary derives from Latin or ___ sources.', sentenceFr: 'L\'analyse etymologique revele qu\'environ 60% du vocabulaire anglais derive du latin ou de sources ___.', answer: 'French', options: ['French', 'Chinese', 'Arabic', 'Japanese'] },
        { type: 'mcq', question: 'What does the concept of "language death" entail?', questionFr: 'Qu\'implique le concept de "mort d\'une langue" ?', options: ['The complete cessation of a language when its last native speaker dies', 'A temporary decline in usage', 'The evolution into a new dialect', 'Government prohibition of a language'], correctIndex: 0, explanation: 'Language death occurs when no living speakers remain, taking with it unique cultural knowledge.', explanationFr: 'La mort d\'une langue survient quand il ne reste plus de locuteurs vivants.', passage: 'UNESCO estimates that approximately one language dies every two weeks. With each lost language disappears an irreplaceable repository of human knowledge, cultural practices, and unique ways of conceptualizing reality.' },
        { type: 'fill', sentence: 'The Great Vowel Shift fundamentally altered the ___ system of English between the 14th and 17th centuries.', sentenceFr: 'Le Grand Changement Vocalique a fondamentalement modifie le systeme ___ de l\'anglais entre le 14e et le 17e siecle.', answer: 'phonological', options: ['phonological', 'political', 'economic', 'architectural'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La standardisation linguistique, bien qu\'elle facilite la communication a grande echelle, contribue paradoxalement a l\'erosion des varietes dialectales.', targetEn: 'Linguistic standardization, although it facilitates large-scale communication, paradoxically contributes to the erosion of dialectal varieties.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les linguistes s\'accordent a dire que toute langue vivante est en perpetuelle mutation, rendant la notion de "purete linguistique" fondamentalement illusoire.', targetEn: 'Linguists agree that every living language is in perpetual flux, rendering the notion of "linguistic purity" fundamentally illusory.' },
        { type: 'mcq', question: 'What does "to codify" mean in linguistics?', questionFr: 'Que signifie "codifier" en linguistique ?', options: ['To systematize and establish rules for a language variety', 'To encrypt a message', 'To translate between languages', 'To speak multiple dialects'], correctIndex: 0, explanation: '"Codification" refers to the process of establishing explicit norms for grammar, spelling, and usage.', explanationFr: 'La codification designe le processus d\'etablissement de normes explicites pour la grammaire et l\'orthographe.' },
        { type: 'fill', sentence: 'The ___ hypothesis suggests that humans possess an innate capacity for language acquisition, independent of cultural exposure.', sentenceFr: 'L\'hypothese ___ suggere que les humains possedent une capacite innee d\'acquisition du langage.', answer: 'nativist', options: ['nativist', 'behaviorist', 'constructivist', 'relativist'] },
      ],
    },
  },
];

async function main() {
  console.log('=== Seeding extra lessons ===\n');

  let created = 0;

  for (const lessonData of EXTRA_LESSONS) {
    // Find next order for this level
    const maxOrder = await prisma.lesson.aggregate({
      where: { level: lessonData.level },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;

    // Check if a lesson with this title already exists
    const existing = await prisma.lesson.findFirst({
      where: {
        level: lessonData.level,
        content_json: {
          path: ['title', 'en'],
          equals: lessonData.content_json.title.en,
        },
      },
    });

    if (existing) {
      console.log(`[skip] ${lessonData.level} - ${lessonData.content_json.title.en} (already exists)`);
      continue;
    }

    await prisma.lesson.create({
      data: {
        level: lessonData.level,
        theme: lessonData.theme,
        order,
        is_premium: lessonData.is_premium,
        content_json: lessonData.content_json as any,
      },
    });

    created++;
    console.log(`[+] ${lessonData.level} #${order} - ${lessonData.content_json.title.en}`);
  }

  console.log(`\n=== Done! Created ${created} lessons ===`);

  // Summary
  const stats = await prisma.lesson.groupBy({
    by: ['level'],
    _count: true,
  });
  console.log('\nTotal lessons by level:');
  for (const s of stats.sort((a, b) => a.level.localeCompare(b.level))) {
    console.log(`  ${s.level}: ${s._count}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
