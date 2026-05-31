/**
 * Seed: Additional B2/C1/C2 lessons to balance content across levels.
 * Run: npx ts-node prisma/seed-lessons-b2-c2.ts
 */
import { PrismaClient, CefrLevel } from '@prisma/client';

const prisma = new PrismaClient();

const LESSONS = [
  // ═══════════════════════════════════════════════════════════════════
  // B2 — Upper Intermediate (8 more lessons)
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.B2,
    theme: 'travel',
    is_premium: false,
    content_json: {
      title: { en: 'Cultural Differences While Traveling', fr: 'Differences culturelles en voyage' },
      description: { en: 'Navigate cultural norms and avoid misunderstandings abroad.', fr: 'Naviguez les normes culturelles et evitez les malentendus a l\'etranger.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "culture shock" mean?', questionFr: 'Que signifie "culture shock" ?', options: ['Disorientation when experiencing an unfamiliar culture', 'A type of electrical problem', 'A popular TV show', 'A tourist attraction'], correctIndex: 0, explanation: 'Culture shock is the feeling of confusion when encountering different customs.', explanationFr: 'Le choc culturel est le sentiment de confusion face a des coutumes differentes.' },
        { type: 'fill', sentence: 'In Japan, it is considered ___ to tip at restaurants.', sentenceFr: 'Au Japon, il est considere ___ de laisser un pourboire au restaurant.', answer: 'rude', options: ['rude', 'polite', 'normal', 'required'] },
        { type: 'mcq', question: 'What does "to adapt" mean?', questionFr: 'Que signifie "to adapt" ?', options: ['To adjust to new conditions', 'To refuse change', 'To complain', 'To return home'], correctIndex: 0, explanation: '"To adapt" means to modify your behavior to fit new circumstances.', explanationFr: '"To adapt" signifie modifier son comportement pour s\'ajuster a de nouvelles circonstances.' },
        { type: 'fill', sentence: 'Understanding local ___ is essential for meaningful travel experiences.', sentenceFr: 'Comprendre les ___ locales est essentiel pour des experiences de voyage enrichissantes.', answer: 'customs', options: ['customs', 'prices', 'airports', 'hotels'] },
        { type: 'mcq', question: 'According to travel experts, what helps overcome culture shock?', questionFr: 'Selon les experts, qu\'aide a surmonter le choc culturel ?', options: ['Keeping an open mind and learning about local traditions', 'Avoiding all local food', 'Staying in your hotel room', 'Only speaking your native language'], correctIndex: 0, explanation: 'Openness and curiosity are key to overcoming culture shock.', explanationFr: 'L\'ouverture d\'esprit et la curiosite sont essentielles.', passage: 'Travel psychologists recommend approaching cultural differences with curiosity rather than judgment. Learning basic phrases in the local language and researching customs beforehand significantly reduces culture shock.' },
        { type: 'fill', sentence: 'Body language can have very different ___ across cultures.', sentenceFr: 'Le langage corporel peut avoir des ___ tres differentes selon les cultures.', answer: 'meanings', options: ['meanings', 'colors', 'sounds', 'sizes'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Voyager permet d\'elargir ses horizons et de remettre en question ses prejuges.', targetEn: 'Traveling allows you to broaden your horizons and challenge your prejudices.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Il est important de respecter les traditions locales meme si elles sont differentes des notres.', targetEn: 'It is important to respect local traditions even if they are different from ours.' },
        { type: 'mcq', question: 'What does "etiquette" mean?', questionFr: 'Que signifie "etiquette" ?', options: ['Social rules of polite behavior', 'A price tag', 'A type of food', 'A travel document'], correctIndex: 0, explanation: '"Etiquette" refers to the conventional rules of social behavior.', explanationFr: '"Etiquette" designe les regles conventionnelles de comportement social.' },
        { type: 'fill', sentence: 'Immersing yourself in a foreign culture requires stepping out of your comfort ___.', sentenceFr: 'S\'immerger dans une culture etrangere necessite de sortir de sa ___ de confort.', answer: 'zone', options: ['zone', 'room', 'house', 'car'] },
      ],
    },
  },
  {
    level: CefrLevel.B2,
    theme: 'psychology',
    is_premium: false,
    content_json: {
      title: { en: 'Understanding Emotions', fr: 'Comprendre les emotions' },
      description: { en: 'Explore emotional intelligence and mental well-being.', fr: 'Explorez l\'intelligence emotionnelle et le bien-etre mental.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What is "emotional intelligence"?', questionFr: 'Qu\'est-ce que "l\'intelligence emotionnelle" ?', options: ['The ability to recognize and manage emotions', 'Having a high IQ', 'Being unemotional', 'A medical condition'], correctIndex: 0, explanation: 'Emotional intelligence involves understanding and managing both your own and others\' emotions.', explanationFr: 'L\'intelligence emotionnelle implique comprendre et gerer ses emotions et celles des autres.' },
        { type: 'fill', sentence: 'Mindfulness meditation helps reduce ___ and improve focus.', sentenceFr: 'La meditation de pleine conscience aide a reduire l\' ___ et a ameliorer la concentration.', answer: 'anxiety', options: ['anxiety', 'height', 'speed', 'weight'] },
        { type: 'mcq', question: 'What does "resilience" mean?', questionFr: 'Que signifie "resilience" ?', options: ['The ability to recover from difficulties', 'Physical strength', 'Financial wealth', 'Academic achievement'], correctIndex: 0, explanation: 'Resilience is the capacity to bounce back from adversity.', explanationFr: 'La resilience est la capacite a rebondir apres l\'adversite.' },
        { type: 'fill', sentence: 'Expressing your feelings rather than ___ them is healthier in the long run.', sentenceFr: 'Exprimer ses sentiments plutot que les ___ est plus sain a long terme.', answer: 'suppressing', options: ['suppressing', 'celebrating', 'sharing', 'writing'] },
        { type: 'mcq', question: 'What does research suggest about gratitude?', questionFr: 'Que suggere la recherche sur la gratitude ?', options: ['It significantly improves mental well-being', 'It has no measurable effect', 'It only helps children', 'It causes stress'], correctIndex: 0, explanation: 'Studies consistently show that practicing gratitude improves happiness and reduces depression.', explanationFr: 'Les etudes montrent que pratiquer la gratitude ameliore le bonheur.', passage: 'Researchers at UC Berkeley found that people who regularly wrote gratitude letters reported significantly better mental health for up to 12 weeks afterward, even if they never sent the letters.' },
        { type: 'fill', sentence: 'Cognitive behavioral therapy helps people identify and challenge negative thought ___.', sentenceFr: 'La therapie cognitivo-comportementale aide a identifier et remettre en question les ___ de pensee negatives.', answer: 'patterns', options: ['patterns', 'prices', 'colors', 'flavors'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Prendre soin de sa sante mentale est tout aussi important que de prendre soin de sa sante physique.', targetEn: 'Taking care of your mental health is just as important as taking care of your physical health.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Apprendre a gerer ses emotions est une competence qui se developpe avec la pratique.', targetEn: 'Learning to manage your emotions is a skill that develops with practice.' },
        { type: 'mcq', question: 'What does "empathy" mean?', questionFr: 'Que signifie "empathy" ?', options: ['The ability to understand and share others\' feelings', 'Feeling sorry for yourself', 'Being indifferent', 'A type of therapy'], correctIndex: 0, explanation: 'Empathy means putting yourself in someone else\'s shoes.', explanationFr: 'L\'empathie signifie se mettre a la place de l\'autre.' },
        { type: 'fill', sentence: 'Setting healthy ___ is crucial for maintaining balanced relationships.', sentenceFr: 'Etablir des ___ saines est crucial pour des relations equilibrees.', answer: 'boundaries', options: ['boundaries', 'buildings', 'budgets', 'bridges'] },
      ],
    },
  },
  {
    level: CefrLevel.B2,
    theme: 'economics',
    is_premium: false,
    content_json: {
      title: { en: 'Global Economics Explained', fr: 'L\'economie mondiale expliquee' },
      description: { en: 'Understand key economic concepts and global trade.', fr: 'Comprenez les concepts economiques cles et le commerce mondial.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What is "inflation"?', questionFr: 'Qu\'est-ce que "l\'inflation" ?', options: ['A general increase in prices over time', 'A type of investment', 'A government tax', 'A banking service'], correctIndex: 0, explanation: 'Inflation means prices rise and purchasing power decreases.', explanationFr: 'L\'inflation signifie que les prix augmentent et le pouvoir d\'achat diminue.' },
        { type: 'fill', sentence: 'Supply and ___ determine market prices in a free economy.', sentenceFr: 'L\'offre et la ___ determinent les prix du marche dans une economie libre.', answer: 'demand', options: ['demand', 'desire', 'design', 'debate'] },
        { type: 'mcq', question: 'What does "GDP" stand for?', questionFr: 'Que signifie "GDP" ?', options: ['Gross Domestic Product', 'General Data Protection', 'Global Development Program', 'Government Debt Percentage'], correctIndex: 0, explanation: 'GDP measures the total value of goods and services produced in a country.', explanationFr: 'Le PIB mesure la valeur totale des biens et services produits dans un pays.' },
        { type: 'fill', sentence: 'Free trade agreements aim to reduce ___ and promote international commerce.', sentenceFr: 'Les accords de libre-echange visent a reduire les ___ et promouvoir le commerce international.', answer: 'tariffs', options: ['tariffs', 'taxes', 'profits', 'salaries'] },
        { type: 'mcq', question: 'What is a "recession"?', questionFr: 'Qu\'est-ce qu\'une "recession" ?', options: ['A significant decline in economic activity', 'A period of rapid growth', 'A type of investment', 'A government policy'], correctIndex: 0, explanation: 'A recession is typically defined as two consecutive quarters of negative GDP growth.', explanationFr: 'Une recession est generalement definie par deux trimestres consecutifs de croissance negative.', passage: 'Economists define a recession as a significant, widespread, and prolonged downturn in economic activity, commonly identified when GDP declines for two consecutive quarters.' },
        { type: 'fill', sentence: 'Central banks use interest ___ to control inflation.', sentenceFr: 'Les banques centrales utilisent les taux d\' ___ pour controler l\'inflation.', answer: 'rates', options: ['rates', 'books', 'cards', 'rules'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La mondialisation a cree de nouvelles opportunites mais aussi de nouvelles inegalites.', targetEn: 'Globalization has created new opportunities but also new inequalities.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les start-ups jouent un role croissant dans l\'innovation et la creation d\'emplois.', targetEn: 'Start-ups play an increasing role in innovation and job creation.' },
        { type: 'mcq', question: 'What does "sustainable development" mean?', questionFr: 'Que signifie "developpement durable" ?', options: ['Economic growth that doesn\'t deplete resources for future generations', 'Rapid industrialization', 'Profit maximization', 'Government spending cuts'], correctIndex: 0, explanation: 'Sustainable development meets present needs without compromising future generations.', explanationFr: 'Le developpement durable repond aux besoins presents sans compromettre les generations futures.' },
        { type: 'fill', sentence: 'Cryptocurrency has ___ traditional banking systems.', sentenceFr: 'La cryptomonnaie a ___ les systemes bancaires traditionnels.', answer: 'disrupted', options: ['disrupted', 'supported', 'ignored', 'copied'] },
      ],
    },
  },
  {
    level: CefrLevel.B2,
    theme: 'arts',
    is_premium: false,
    content_json: {
      title: { en: 'Art and Creative Expression', fr: 'Art et expression creative' },
      description: { en: 'Discuss various art forms and their cultural significance.', fr: 'Discutez des differentes formes d\'art et leur importance culturelle.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "abstract art" mean?', questionFr: 'Que signifie "art abstrait" ?', options: ['Art that doesn\'t attempt to represent reality accurately', 'Art made with photography', 'Art from ancient civilizations', 'Art sold at auctions'], correctIndex: 0, explanation: 'Abstract art uses shapes, colors, and forms to create compositions independent of visual references.', explanationFr: 'L\'art abstrait utilise des formes et des couleurs independamment des references visuelles.' },
        { type: 'fill', sentence: 'Street art has evolved from vandalism to a recognized form of cultural ___.', sentenceFr: 'Le street art a evolue du vandalisme a une forme reconnue d\' ___ culturelle.', answer: 'expression', options: ['expression', 'exercise', 'explosion', 'expansion'] },
        { type: 'mcq', question: 'What is a "masterpiece"?', questionFr: 'Qu\'est-ce qu\'un "chef-d\'oeuvre" ?', options: ['An exceptionally good piece of creative work', 'An expensive painting', 'A famous museum', 'A type of art material'], correctIndex: 0, explanation: 'A masterpiece is a work of outstanding artistry or skill.', explanationFr: 'Un chef-d\'oeuvre est une oeuvre d\'un art ou d\'une habilete exceptionnels.' },
        { type: 'fill', sentence: 'Art serves as a powerful medium for social ___ and political commentary.', sentenceFr: 'L\'art sert de puissant medium pour la ___ sociale et le commentaire politique.', answer: 'critique', options: ['critique', 'cooking', 'cleaning', 'climbing'] },
        { type: 'mcq', question: 'According to art historians, what role does art play in society?', questionFr: 'Selon les historiens de l\'art, quel role joue l\'art ?', options: ['It reflects and shapes cultural values and identity', 'It is purely decorative', 'It is only for wealthy people', 'It has no social function'], correctIndex: 0, explanation: 'Art both mirrors society and influences how people think about their world.', explanationFr: 'L\'art reflete la societe et influence la facon dont les gens pensent.', passage: 'Throughout history, art has served as both a mirror of society and a catalyst for change, reflecting cultural values while simultaneously challenging them and proposing new ways of seeing the world.' },
        { type: 'fill', sentence: 'The Renaissance period witnessed an unprecedented ___ of artistic innovation in Europe.', sentenceFr: 'La Renaissance a ete temoin d\'un ___ sans precedent d\'innovation artistique en Europe.', answer: 'flourishing', options: ['flourishing', 'failure', 'freezing', 'fighting'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La musique transcende les barrieres linguistiques et unit les gens du monde entier.', targetEn: 'Music transcends language barriers and unites people from around the world.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'L\'art contemporain remet souvent en question les definitions traditionnelles de la beaute.', targetEn: 'Contemporary art often challenges traditional definitions of beauty.' },
        { type: 'mcq', question: 'What does "to curate" mean?', questionFr: 'Que signifie "curate" ?', options: ['To select and organize items for an exhibition', 'To paint a picture', 'To sell artwork', 'To destroy old paintings'], correctIndex: 0, explanation: '"To curate" means to carefully choose and present works in a meaningful arrangement.', explanationFr: '"Curate" signifie choisir et presenter soigneusement des oeuvres.' },
        { type: 'fill', sentence: 'Digital technology has ___ the boundaries between traditional and new media art.', sentenceFr: 'La technologie numerique a ___ les frontieres entre l\'art traditionnel et les nouveaux medias.', answer: 'blurred', options: ['blurred', 'built', 'broken', 'bought'] },
      ],
    },
  },
  {
    level: CefrLevel.B2,
    theme: 'education',
    is_premium: false,
    content_json: {
      title: { en: 'The Future of Education', fr: 'L\'avenir de l\'education' },
      description: { en: 'Discuss how technology and new methods are reshaping learning.', fr: 'Discutez de comment la technologie transforme l\'apprentissage.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "lifelong learning" mean?', questionFr: 'Que signifie "lifelong learning" ?', options: ['Continuous education throughout one\'s life', 'Only formal schooling', 'Learning only until age 18', 'A university degree'], correctIndex: 0, explanation: 'Lifelong learning emphasizes ongoing personal and professional development.', explanationFr: 'L\'apprentissage tout au long de la vie met l\'accent sur le developpement continu.' },
        { type: 'fill', sentence: 'Online courses have made education more ___ to people worldwide.', sentenceFr: 'Les cours en ligne ont rendu l\'education plus ___ aux personnes du monde entier.', answer: 'accessible', options: ['accessible', 'expensive', 'difficult', 'dangerous'] },
        { type: 'mcq', question: 'What is "critical thinking"?', questionFr: 'Qu\'est-ce que la "pensee critique" ?', options: ['The ability to analyze information objectively and make reasoned judgments', 'Being negative about everything', 'Memorizing facts', 'Following instructions without questioning'], correctIndex: 0, explanation: 'Critical thinking involves evaluating information from multiple perspectives.', explanationFr: 'La pensee critique implique d\'evaluer l\'information sous differents angles.' },
        { type: 'fill', sentence: 'Personalized learning adapts to each student\'s individual ___ and pace.', sentenceFr: 'L\'apprentissage personnalise s\'adapte aux ___ et au rythme de chaque eleve.', answer: 'needs', options: ['needs', 'names', 'notes', 'numbers'] },
        { type: 'mcq', question: 'According to educators, what skill is most important for the 21st century?', questionFr: 'Selon les educateurs, quelle competence est la plus importante au 21e siecle ?', options: ['Adaptability and ability to learn new skills quickly', 'Memorization of dates and facts', 'Handwriting quality', 'Speed of reading'], correctIndex: 0, explanation: 'In a rapidly changing world, the ability to adapt and learn new things is crucial.', explanationFr: 'Dans un monde en evolution rapide, la capacite d\'adaptation est cruciale.', passage: 'The World Economic Forum identifies adaptability, critical thinking, and collaboration as the top skills needed for success in the 21st-century workplace, surpassing traditional academic knowledge.' },
        { type: 'fill', sentence: 'Collaborative learning encourages students to work together and share different ___.', sentenceFr: 'L\'apprentissage collaboratif encourage les eleves a travailler ensemble et partager differentes ___.', answer: 'perspectives', options: ['perspectives', 'passwords', 'payments', 'packages'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'L\'education ne devrait pas se limiter a la transmission de connaissances mais aussi developper l\'esprit critique.', targetEn: 'Education should not be limited to transmitting knowledge but should also develop critical thinking.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les enseignants doivent constamment adapter leurs methodes aux nouvelles technologies.', targetEn: 'Teachers must constantly adapt their methods to new technologies.' },
        { type: 'mcq', question: 'What does "curriculum" mean?', questionFr: 'Que signifie "curriculum" ?', options: ['The subjects and content taught in a school or course', 'A type of exam', 'A teaching certificate', 'A school building'], correctIndex: 0, explanation: 'A curriculum is the set of courses and content offered by an educational institution.', explanationFr: 'Un curriculum est l\'ensemble des cours et contenus proposes par un etablissement.' },
        { type: 'fill', sentence: 'Gamification ___ student engagement by incorporating game elements into learning.', sentenceFr: 'La gamification ___ l\'engagement des eleves en incorporant des elements de jeu.', answer: 'increases', options: ['increases', 'decreases', 'ignores', 'prevents'] },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // C1 — Advanced (5 more lessons)
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.C1,
    theme: 'geopolitics',
    is_premium: false,
    content_json: {
      title: { en: 'Geopolitics and International Relations', fr: 'Geopolitique et relations internationales' },
      description: { en: 'Analyze complex geopolitical dynamics and diplomatic strategies.', fr: 'Analysez les dynamiques geopolitiques et les strategies diplomatiques.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "multilateralism" mean?', questionFr: 'Que signifie "multilateralisme" ?', options: ['Cooperation between multiple countries on shared challenges', 'A single country acting alone', 'Bilateral trade agreements', 'Military alliances'], correctIndex: 0, explanation: 'Multilateralism involves collaborative approaches to international issues through institutions like the UN.', explanationFr: 'Le multilateralisme implique des approches collaboratives via des institutions comme l\'ONU.' },
        { type: 'fill', sentence: 'Diplomatic ___ are essential for maintaining peaceful relations between nations.', sentenceFr: 'Les ___ diplomatiques sont essentielles pour maintenir des relations pacifiques entre nations.', answer: 'negotiations', options: ['negotiations', 'celebrations', 'competitions', 'decorations'] },
        { type: 'mcq', question: 'What is "soft power"?', questionFr: 'Qu\'est-ce que le "soft power" ?', options: ['Influence through culture, values, and diplomacy rather than military force', 'Nuclear weapons capability', 'Economic sanctions', 'Intelligence agencies'], correctIndex: 0, explanation: 'Soft power achieves objectives through attraction and persuasion rather than coercion.', explanationFr: 'Le soft power atteint ses objectifs par l\'attraction et la persuasion plutot que par la coercition.' },
        { type: 'fill', sentence: 'Economic sanctions are often imposed as an alternative to military ___.', sentenceFr: 'Les sanctions economiques sont souvent imposees comme alternative a l\' ___ militaire.', answer: 'intervention', options: ['intervention', 'celebration', 'education', 'decoration'] },
        { type: 'mcq', question: 'What challenge does the concept of "sovereignty" face in an interconnected world?', questionFr: 'Quel defi le concept de "souverainete" affronte-t-il dans un monde interconnecte ?', options: ['Balancing national autonomy with international cooperation obligations', 'Choosing a national anthem', 'Designing a flag', 'Building a parliament'], correctIndex: 0, explanation: 'Globalization creates tensions between national sovereignty and the need for international coordination.', explanationFr: 'La mondialisation cree des tensions entre souverainete nationale et coordination internationale.', passage: 'In an era of global challenges such as climate change, pandemics, and cyber threats, the traditional Westphalian concept of absolute state sovereignty is increasingly challenged by the necessity for coordinated international responses.' },
        { type: 'fill', sentence: 'The rise of nationalism has complicated ___ integration processes worldwide.', sentenceFr: 'La montee du nationalisme a complique les processus d\' ___ regionale dans le monde.', answer: 'regional', options: ['regional', 'personal', 'musical', 'digital'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'L\'equilibre des puissances mondiales est en pleine mutation, remettant en cause l\'ordre international etabli apres 1945.', targetEn: 'The balance of global powers is undergoing a profound shift, challenging the international order established after 1945.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La cybersecurite est devenue un enjeu strategique majeur dans les relations internationales contemporaines.', targetEn: 'Cybersecurity has become a major strategic issue in contemporary international relations.' },
        { type: 'mcq', question: 'What does "to ratify" a treaty mean?', questionFr: 'Que signifie "ratifier" un traite ?', options: ['To formally approve and give legal consent', 'To reject completely', 'To propose amendments', 'To postpone indefinitely'], correctIndex: 0, explanation: '"To ratify" means to give formal consent to a treaty, making it legally binding.', explanationFr: '"Ratifier" signifie donner son consentement formel a un traite.' },
        { type: 'fill', sentence: 'Humanitarian ___ must navigate complex political landscapes to deliver aid effectively.', sentenceFr: 'Les ___ humanitaires doivent naviguer des paysages politiques complexes pour fournir une aide efficace.', answer: 'organizations', options: ['organizations', 'orchestras', 'opinions', 'occasions'] },
      ],
    },
  },
  {
    level: CefrLevel.C1,
    theme: 'neuroscience',
    is_premium: false,
    content_json: {
      title: { en: 'The Brain and Decision Making', fr: 'Le cerveau et la prise de decision' },
      description: { en: 'Explore how neuroscience reveals cognitive biases in decision-making.', fr: 'Explorez comment les neurosciences revelent les biais cognitifs.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What is a "cognitive bias"?', questionFr: 'Qu\'est-ce qu\'un "biais cognitif" ?', options: ['A systematic error in thinking that affects judgment', 'A brain disease', 'A type of intelligence test', 'A learning disability'], correctIndex: 0, explanation: 'Cognitive biases are mental shortcuts that can lead to irrational decisions.', explanationFr: 'Les biais cognitifs sont des raccourcis mentaux qui peuvent mener a des decisions irrationnelles.' },
        { type: 'fill', sentence: 'Confirmation bias leads people to seek information that ___ their existing beliefs.', sentenceFr: 'Le biais de confirmation pousse les gens a chercher des informations qui ___ leurs croyances existantes.', answer: 'confirms', options: ['confirms', 'contradicts', 'confuses', 'creates'] },
        { type: 'mcq', question: 'What is "neuroplasticity"?', questionFr: 'Qu\'est-ce que la "neuroplasticite" ?', options: ['The brain\'s ability to reorganize and form new neural connections', 'Brain surgery', 'A mental disorder', 'The size of the brain'], correctIndex: 0, explanation: 'Neuroplasticity demonstrates that the brain continues changing throughout life.', explanationFr: 'La neuroplasticite demontre que le cerveau continue de changer tout au long de la vie.' },
        { type: 'fill', sentence: 'The prefrontal cortex, responsible for rational thinking, is not fully ___ until the mid-twenties.', sentenceFr: 'Le cortex prefrontal, responsable de la pensee rationnelle, n\'est pas completement ___ avant la mi-vingtaine.', answer: 'developed', options: ['developed', 'destroyed', 'designed', 'discovered'] },
        { type: 'mcq', question: 'According to research, how does sleep deprivation affect decision-making?', questionFr: 'Selon la recherche, comment le manque de sommeil affecte-t-il la prise de decision ?', options: ['It significantly impairs judgment and increases risk-taking behavior', 'It has no measurable effect', 'It improves creativity', 'It makes people more cautious'], correctIndex: 0, explanation: 'Sleep deprivation reduces prefrontal cortex activity, impairing rational decision-making.', explanationFr: 'Le manque de sommeil reduit l\'activite du cortex prefrontal.', passage: 'Neuroscience research has conclusively demonstrated that even moderate sleep deprivation significantly impairs the prefrontal cortex, leading to reduced impulse control, poor risk assessment, and compromised emotional regulation.' },
        { type: 'fill', sentence: 'The "anchoring effect" describes how initial information disproportionately ___ subsequent judgments.', sentenceFr: 'L\'"effet d\'ancrage" decrit comment l\'information initiale ___ de maniere disproportionnee les jugements subsequents.', answer: 'influences', options: ['influences', 'ignores', 'improves', 'illustrates'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les neurosciences ont revele que nos decisions sont bien moins rationnelles que nous ne le pensons.', targetEn: 'Neuroscience has revealed that our decisions are far less rational than we think.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La prise de conscience de nos biais cognitifs est la premiere etape pour les surmonter.', targetEn: 'Awareness of our cognitive biases is the first step toward overcoming them.' },
        { type: 'mcq', question: 'What does "heuristic" mean in psychology?', questionFr: 'Que signifie "heuristique" en psychologie ?', options: ['A mental shortcut for quick problem-solving', 'A type of medication', 'An advanced brain scan', 'A learning technique'], correctIndex: 0, explanation: 'Heuristics are efficient cognitive strategies that can sometimes lead to errors.', explanationFr: 'Les heuristiques sont des strategies cognitives efficaces mais parfois source d\'erreurs.' },
        { type: 'fill', sentence: 'Emotional responses often ___ rational analysis in high-pressure situations.', sentenceFr: 'Les reponses emotionnelles ___ souvent l\'analyse rationnelle dans les situations de forte pression.', answer: 'override', options: ['override', 'improve', 'support', 'reflect'] },
      ],
    },
  },
  {
    level: CefrLevel.C1,
    theme: 'literature',
    is_premium: false,
    content_json: {
      title: { en: 'Literary Analysis and Interpretation', fr: 'Analyse et interpretation litteraire' },
      description: { en: 'Develop skills for analyzing literary texts and identifying themes.', fr: 'Developpez des competences d\'analyse de textes litteraires.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What is an "unreliable narrator"?', questionFr: 'Qu\'est-ce qu\'un "narrateur non fiable" ?', options: ['A narrator whose credibility is compromised', 'A narrator who speaks too quickly', 'A first-person narrator', 'An omniscient narrator'], correctIndex: 0, explanation: 'An unreliable narrator\'s account cannot be fully trusted due to bias, ignorance, or deception.', explanationFr: 'Un narrateur non fiable dont le recit ne peut etre entierement cru a cause de biais ou tromperie.' },
        { type: 'fill', sentence: 'A recurring symbol or image throughout a work is called a ___.', sentenceFr: 'Un symbole ou une image recurrente tout au long d\'une oeuvre s\'appelle un ___.', answer: 'motif', options: ['motif', 'chapter', 'genre', 'review'] },
        { type: 'mcq', question: 'What is "dramatic irony"?', questionFr: 'Qu\'est-ce que "l\'ironie dramatique" ?', options: ['When the audience knows something the characters do not', 'When a character tells a joke', 'When the ending is surprising', 'When the story is set in a theater'], correctIndex: 0, explanation: 'Dramatic irony creates tension because the reader knows more than the characters.', explanationFr: 'L\'ironie dramatique cree de la tension car le lecteur en sait plus que les personnages.' },
        { type: 'fill', sentence: 'The author\'s deliberate choice of words to create specific effects is known as ___.', sentenceFr: 'Le choix delibere des mots par l\'auteur pour creer des effets specifiques est appele ___.', answer: 'diction', options: ['diction', 'fiction', 'action', 'section'] },
        { type: 'mcq', question: 'What distinguishes a "novella" from a "novel"?', questionFr: 'Qu\'est-ce qui distingue une "novella" d\'un "novel" ?', options: ['A novella is shorter and typically focuses on a single conflict', 'A novella is always non-fiction', 'There is no difference', 'A novella is always about love'], correctIndex: 0, explanation: 'A novella is a narrative work between a short story and a novel in length and complexity.', explanationFr: 'Une novella est une oeuvre narrative entre la nouvelle et le roman en longueur.', passage: 'The novella, exemplified by works such as Kafka\'s The Metamorphosis and Conrad\'s Heart of Darkness, occupies a unique literary space: long enough to develop complex themes yet concise enough to maintain narrative intensity throughout.' },
        { type: 'fill', sentence: 'Post-colonial literature often explores themes of identity, ___, and cultural displacement.', sentenceFr: 'La litterature postcoloniale explore souvent les themes de l\'identite, de l\' ___ et du deplacement culturel.', answer: 'belonging', options: ['belonging', 'banking', 'building', 'breathing'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La litterature nous permet d\'apprehender des perspectives radicalement differentes de la notre.', targetEn: 'Literature allows us to grasp perspectives radically different from our own.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'L\'ambiguite est souvent une force plutot qu\'une faiblesse dans les grands textes litteraires.', targetEn: 'Ambiguity is often a strength rather than a weakness in great literary texts.' },
        { type: 'mcq', question: 'What does "allegory" mean?', questionFr: 'Que signifie "allegorie" ?', options: ['A story with a hidden meaning, often moral or political', 'A type of rhyme scheme', 'A historical document', 'A literary award'], correctIndex: 0, explanation: 'An allegory conveys a deeper meaning through symbolic characters and events.', explanationFr: 'Une allegorie transmet un sens plus profond a travers des personnages et evenements symboliques.' },
        { type: 'fill', sentence: 'The stream of consciousness technique attempts to represent the continuous ___ of a character\'s thoughts.', sentenceFr: 'La technique du flux de conscience tente de representer le ___ continu des pensees d\'un personnage.', answer: 'flow', options: ['flow', 'end', 'start', 'limit'] },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // C2 — Mastery (4 more lessons)
  // ═══════════════════════════════════════════════════════════════════
  {
    level: CefrLevel.C2,
    theme: 'epistemology',
    is_premium: true,
    content_json: {
      title: { en: 'Knowledge and Certainty', fr: 'Connaissance et certitude' },
      description: { en: 'Examine epistemological debates about the nature and limits of knowledge.', fr: 'Examinez les debats epistemologiques sur la nature et les limites de la connaissance.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does "epistemology" study?', questionFr: 'Qu\'etudie l\'"epistemologie" ?', options: ['The nature, scope, and limits of human knowledge', 'The origin of the universe', 'The evolution of species', 'The structure of atoms'], correctIndex: 0, explanation: 'Epistemology investigates what constitutes justified belief and knowledge itself.', explanationFr: 'L\'epistemologie examine ce qui constitue une croyance justifiee et la connaissance elle-meme.' },
        { type: 'fill', sentence: 'Descartes\' method of systematic doubt sought to establish an indubitable ___ for all knowledge.', sentenceFr: 'La methode de doute systematique de Descartes cherchait a etablir un ___ indubitable pour toute connaissance.', answer: 'foundation', options: ['foundation', 'destruction', 'fiction', 'decoration'] },
        { type: 'mcq', question: 'What is the "Gettier problem"?', questionFr: 'Qu\'est-ce que le "probleme de Gettier" ?', options: ['A challenge showing that justified true belief is insufficient for knowledge', 'A mathematical equation', 'A psychological experiment', 'A logical paradox about time'], correctIndex: 0, explanation: 'Gettier demonstrated scenarios where justified true belief doesn\'t constitute knowledge.', explanationFr: 'Gettier a demontre des scenarios ou la croyance vraie justifiee ne constitue pas la connaissance.' },
        { type: 'fill', sentence: 'Empiricists maintain that all substantive knowledge ultimately derives from sensory ___.', sentenceFr: 'Les empiristes soutiennent que toute connaissance substantielle derive ultimement de l\' ___ sensorielle.', answer: 'experience', options: ['experience', 'experiment', 'existence', 'expression'] },
        { type: 'mcq', question: 'What does Popper\'s falsificationism propose about scientific theories?', questionFr: 'Que propose le falsificationnisme de Popper ?', options: ['That theories can never be proven true, only falsified', 'That all theories are equally valid', 'That observation precedes theory', 'That science is purely subjective'], correctIndex: 0, explanation: 'Popper argued that the hallmark of science is falsifiability, not verification.', explanationFr: 'Popper a soutenu que la marque de la science est la falsifiabilite, non la verification.', passage: 'Karl Popper\'s critical rationalism fundamentally reoriented the philosophy of science by arguing that the demarcation criterion between science and pseudoscience is not verifiability but falsifiability: genuine scientific theories must make predictions that could, in principle, be shown to be false.' },
        { type: 'fill', sentence: 'The problem of induction, famously articulated by Hume, questions our epistemic ___ for believing that the future will resemble the past.', sentenceFr: 'Le probleme de l\'induction questionne notre ___ epistemique pour croire que le futur ressemblera au passe.', answer: 'justification', options: ['justification', 'celebration', 'destination', 'imagination'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La distinction entre croyance et connaissance demeure l\'un des problemes les plus debattus en philosophie analytique.', targetEn: 'The distinction between belief and knowledge remains one of the most debated problems in analytic philosophy.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Le scepticisme radical, bien qu\'irrefutable en theorie, s\'avere pragmatiquement inapplicable dans la vie quotidienne.', targetEn: 'Radical skepticism, although irrefutable in theory, proves pragmatically inapplicable in everyday life.' },
        { type: 'mcq', question: 'What does "paradigm shift" mean in Kuhn\'s philosophy?', questionFr: 'Que signifie "changement de paradigme" chez Kuhn ?', options: ['A fundamental change in the basic concepts and practices of a discipline', 'A minor scientific discovery', 'A change in government policy', 'A new teaching method'], correctIndex: 0, explanation: 'Kuhn argued that scientific revolutions involve wholesale changes in worldview, not gradual progress.', explanationFr: 'Kuhn a soutenu que les revolutions scientifiques impliquent des changements complets de vision du monde.' },
        { type: 'fill', sentence: 'Wittgenstein\'s later philosophy challenged the notion that language ___ reality through a simple picture-like correspondence.', sentenceFr: 'La philosophie tardive de Wittgenstein a remis en cause la notion que le langage ___ la realite par une simple correspondance.', answer: 'mirrors', options: ['mirrors', 'creates', 'destroys', 'ignores'] },
      ],
    },
  },
  {
    level: CefrLevel.C2,
    theme: 'bioethics',
    is_premium: true,
    content_json: {
      title: { en: 'Bioethics and Human Enhancement', fr: 'Bioethique et amelioration humaine' },
      description: { en: 'Debate the ethical boundaries of genetic engineering and transhumanism.', fr: 'Debattez des limites ethiques du genie genetique et du transhumanisme.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What distinguishes "therapeutic" from "enhancement" genetic interventions?', questionFr: 'Qu\'est-ce qui distingue les interventions genetiques "therapeutiques" des interventions d\'"amelioration" ?', options: ['Therapeutic corrects disease; enhancement goes beyond normal function', 'They are identical in scope', 'Enhancement is always illegal', 'Therapeutic is more expensive'], correctIndex: 0, explanation: 'This distinction is central to bioethical debate: treating vs. upgrading human capabilities.', explanationFr: 'Cette distinction est centrale dans le debat bioethique : traiter vs. ameliorer les capacites humaines.' },
        { type: 'fill', sentence: 'CRISPR technology has rendered the prospect of heritable genetic modifications both technically ___ and ethically contentious.', sentenceFr: 'La technologie CRISPR a rendu la perspective de modifications genetiques hereditaires a la fois techniquement ___ et ethiquement controversee.', answer: 'feasible', options: ['feasible', 'impossible', 'invisible', 'irrelevant'] },
        { type: 'mcq', question: 'What is the "slippery slope" argument in bioethics?', questionFr: 'Qu\'est-ce que l\'argument de la "pente glissante" en bioethique ?', options: ['That permitting one intervention will inevitably lead to more extreme ones', 'A type of genetic mutation', 'A surgical technique', 'A pharmacological principle'], correctIndex: 0, explanation: 'The slippery slope concern warns that initial permissiveness may lead to unacceptable outcomes.', explanationFr: 'L\'argument de la pente glissante avertit que la permissivite initiale peut mener a des resultats inacceptables.' },
        { type: 'fill', sentence: 'The concept of "designer babies" raises profound questions about genetic ___ and social equality.', sentenceFr: 'Le concept de "bebes sur mesure" souleve de profondes questions sur la ___ genetique et l\'egalite sociale.', answer: 'determinism', options: ['determinism', 'democracy', 'dependency', 'development'] },
        { type: 'mcq', question: 'What ethical principle does human germline editing most directly challenge?', questionFr: 'Quel principe ethique l\'edition de la lignee germinale humaine remet-elle le plus directement en cause ?', options: ['Informed consent, since future generations cannot consent to modifications', 'The right to education', 'Freedom of speech', 'Property rights'], correctIndex: 0, explanation: 'Germline changes affect all descendants, who cannot consent to alterations of their genome.', explanationFr: 'Les modifications germinales affectent tous les descendants, qui ne peuvent consentir aux alterations.', passage: 'The fundamental ethical challenge of germline editing lies in its intergenerational implications: modifications to the human genome will be inherited by all future descendants, none of whom can provide informed consent to changes that will fundamentally shape their biological constitution.' },
        { type: 'fill', sentence: 'Transhumanists advocate for the use of technology to transcend the ___ limitations of human biology.', sentenceFr: 'Les transhumanistes plaident pour l\'utilisation de la technologie pour transcender les limitations ___ de la biologie humaine.', answer: 'inherent', options: ['inherent', 'inherited', 'internal', 'initial'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La commodification du genome humain souleve des questions fondamentales sur la dignite et l\'essence meme de ce qui nous constitue en tant qu\'espece.', targetEn: 'The commodification of the human genome raises fundamental questions about dignity and the very essence of what constitutes us as a species.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'L\'absence de cadre reglementaire international coherent en matiere de genie genetique constitue un vide juridique potentiellement dangereux.', targetEn: 'The absence of a coherent international regulatory framework for genetic engineering constitutes a potentially dangerous legal void.' },
        { type: 'mcq', question: 'What does "posthumanism" envision?', questionFr: 'Qu\'envisage le "posthumanisme" ?', options: ['A future where technology fundamentally transforms the human condition', 'A return to pre-industrial society', 'The end of all technology', 'A political ideology'], correctIndex: 0, explanation: 'Posthumanism contemplates beings that have been enhanced beyond current human limitations.', explanationFr: 'Le posthumanisme contemple des etres ameliores au-dela des limitations humaines actuelles.' },
        { type: 'fill', sentence: 'The precautionary ___ suggests that potentially irreversible technologies should be approached with extreme caution.', sentenceFr: 'Le ___ de precaution suggere que les technologies potentiellement irreversibles devraient etre abordees avec une extreme prudence.', answer: 'principle', options: ['principle', 'problem', 'process', 'product'] },
      ],
    },
  },
  {
    level: CefrLevel.C2,
    theme: 'economics-advanced',
    is_premium: true,
    content_json: {
      title: { en: 'Behavioral Economics and Rationality', fr: 'Economie comportementale et rationalite' },
      description: { en: 'Examine how psychological insights challenge classical economic assumptions.', fr: 'Examinez comment les decouvertes psychologiques remettent en cause les hypotheses economiques classiques.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What fundamental assumption does behavioral economics challenge?', questionFr: 'Quelle hypothese fondamentale l\'economie comportementale remet-elle en cause ?', options: ['That humans are perfectly rational utility-maximizing agents', 'That markets exist', 'That money has value', 'That trade is beneficial'], correctIndex: 0, explanation: 'Behavioral economics demonstrates systematic deviations from the rational actor model.', explanationFr: 'L\'economie comportementale demontre des deviations systematiques du modele de l\'acteur rationnel.' },
        { type: 'fill', sentence: 'Kahneman and Tversky\'s prospect theory demonstrates that losses are psychologically weighted approximately twice as heavily as equivalent ___.', sentenceFr: 'La theorie des perspectives demontre que les pertes sont psychologiquement ponderees environ deux fois plus que les ___ equivalents.', answer: 'gains', options: ['gains', 'games', 'goals', 'grades'] },
        { type: 'mcq', question: 'What is a "nudge" in behavioral economics?', questionFr: 'Qu\'est-ce qu\'un "nudge" en economie comportementale ?', options: ['A subtle environmental change that influences behavior without restricting choice', 'A financial penalty', 'A mandatory regulation', 'A tax incentive'], correctIndex: 0, explanation: 'Nudges preserve freedom of choice while steering behavior through choice architecture.', explanationFr: 'Les nudges preservent la liberte de choix tout en orientant le comportement.' },
        { type: 'fill', sentence: 'The endowment effect describes our tendency to overvalue items merely because we ___ them.', sentenceFr: 'L\'effet de dotation decrit notre tendance a surestimer les objets simplement parce que nous les ___.', answer: 'own', options: ['own', 'see', 'need', 'want'] },
        { type: 'mcq', question: 'What does "bounded rationality" (Herbert Simon) suggest?', questionFr: 'Que suggere la "rationalite limitee" (Herbert Simon) ?', options: ['That human decision-making is constrained by cognitive limitations and available information', 'That all decisions are irrational', 'That computers make better decisions', 'That markets are always efficient'], correctIndex: 0, explanation: 'Simon argued that humans "satisfice" rather than optimize due to cognitive constraints.', explanationFr: 'Simon a soutenu que les humains "satisficent" plutot qu\'optimisent en raison de contraintes cognitives.', passage: 'Herbert Simon\'s concept of bounded rationality revolutionized economics by acknowledging that human decision-makers operate under inherent cognitive constraints: limited information-processing capacity, incomplete knowledge, and finite time for deliberation compel individuals to employ heuristic strategies rather than undertaking exhaustive optimization.' },
        { type: 'fill', sentence: 'Thaler\'s concept of "mental accounting" reveals how people compartmentalize money in ways that violate fungibility—a cornerstone of classical economic ___.', sentenceFr: 'Le concept de "comptabilite mentale" de Thaler revele comment les gens compartimentent l\'argent de manieres qui violent la fongibilite—une pierre angulaire de la ___ economique classique.', answer: 'theory', options: ['theory', 'therapy', 'theology', 'technology'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'L\'hypothese de l\'homo economicus, bien que methodologiquement utile, constitue une idealisation qui ne rend pas compte de la complexite reelle du comportement humain.', targetEn: 'The homo economicus hypothesis, although methodologically useful, constitutes an idealization that does not account for the actual complexity of human behavior.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les politiques publiques fondees sur l\'economie comportementale suscitent un debat quant a la legitimite de l\'Etat a influencer les choix individuels, fut-ce de maniere non coercitive.', targetEn: 'Public policies based on behavioral economics spark debate regarding the legitimacy of the state to influence individual choices, even in a non-coercive manner.' },
        { type: 'mcq', question: 'What does "hyperbolic discounting" describe?', questionFr: 'Que decrit l\'"actualisation hyperbolique" ?', options: ['The tendency to strongly prefer immediate rewards over larger future rewards', 'A mathematical formula for interest rates', 'A type of investment strategy', 'A pricing technique in retail'], correctIndex: 0, explanation: 'Hyperbolic discounting explains why people make choices their future selves will regret.', explanationFr: 'L\'actualisation hyperbolique explique pourquoi les gens font des choix que leur futur moi regrettera.' },
        { type: 'fill', sentence: 'The "sunk cost fallacy" describes the irrational tendency to continue investing in a losing ___ because of previously committed resources.', sentenceFr: 'Le "sophisme des couts irrecuperables" decrit la tendance irrationnelle a continuer d\'investir dans un ___ perdant a cause des ressources deja engagees.', answer: 'endeavor', options: ['endeavor', 'envelope', 'entrance', 'enjoyment'] },
      ],
    },
  },
  {
    level: CefrLevel.C2,
    theme: 'sociology',
    is_premium: false,
    content_json: {
      title: { en: 'Social Stratification and Mobility', fr: 'Stratification sociale et mobilite' },
      description: { en: 'Analyze theories of social inequality and mechanisms of class reproduction.', fr: 'Analysez les theories de l\'inegalite sociale et les mecanismes de reproduction de classe.' },
      source: { name: 'EnglishFlow', url: '' },
      exercises: [
        { type: 'mcq', question: 'What does Bourdieu\'s concept of "cultural capital" encompass?', questionFr: 'Qu\'englobe le concept de "capital culturel" de Bourdieu ?', options: ['Knowledge, skills, education, and cultural awareness that confer social advantage', 'Only financial wealth', 'Physical property', 'Political connections'], correctIndex: 0, explanation: 'Cultural capital includes embodied dispositions, objectified cultural goods, and institutional credentials.', explanationFr: 'Le capital culturel inclut les dispositions incorporees, les biens culturels et les diplomes.' },
        { type: 'fill', sentence: 'Intersectionality theory examines how multiple dimensions of identity—race, gender, class—interact to produce compound forms of ___.', sentenceFr: 'La theorie de l\'intersectionnalite examine comment les dimensions multiples de l\'identite interagissent pour produire des formes composees de ___.', answer: 'disadvantage', options: ['disadvantage', 'decoration', 'development', 'discovery'] },
        { type: 'mcq', question: 'What is "meritocracy" in sociological discourse?', questionFr: 'Qu\'est-ce que la "meritocratie" en sociologie ?', options: ['A system where advancement is based on individual ability and effort', 'Government by the wealthy', 'Rule by the military', 'Direct democracy'], correctIndex: 0, explanation: 'Sociologists debate whether true meritocracy exists or merely legitimizes existing hierarchies.', explanationFr: 'Les sociologues debattent de l\'existence reelle de la meritocratie ou si elle ne fait que legitimer les hierarchies existantes.' },
        { type: 'fill', sentence: 'The concept of "social reproduction" describes mechanisms through which inequality is perpetuated across ___.', sentenceFr: 'Le concept de "reproduction sociale" decrit les mecanismes par lesquels l\'inegalite est perpetuee a travers les ___.', answer: 'generations', options: ['generations', 'geographies', 'governments', 'galaxies'] },
        { type: 'mcq', question: 'What does Weber\'s theory of stratification add to Marx\'s class analysis?', questionFr: 'Qu\'ajoute la theorie de la stratification de Weber a l\'analyse de classe de Marx ?', options: ['Additional dimensions of status and power alongside economic class', 'Nothing significant', 'Only economic factors matter', 'A focus solely on religion'], correctIndex: 0, explanation: 'Weber introduced "status" (prestige) and "party" (political power) as distinct from class.', explanationFr: 'Weber a introduit le "statut" (prestige) et le "parti" (pouvoir politique) distincts de la classe.', passage: 'Weber\'s multidimensional model of stratification distinguishes between class (economic position), status (social prestige and honor), and party (political influence), arguing that these dimensions, while often correlated, can operate independently and produce complex, crosscutting patterns of inequality irreducible to economic relations alone.' },
        { type: 'fill', sentence: 'Rawls\' "veil of ignorance" thought experiment asks what principles of justice individuals would choose if they were ___ of their social position.', sentenceFr: 'L\'experience de pensee du "voile d\'ignorance" de Rawls demande quels principes de justice les individus choisiraient s\'ils ___ de leur position sociale.', answer: 'ignorant', options: ['ignorant', 'proud', 'certain', 'aware'] },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'La mobilite sociale ascendante, bien qu\'ideologiquement celebree dans les societes occidentales, demeure statistiquement l\'exception plutot que la norme.', targetEn: 'Upward social mobility, although ideologically celebrated in Western societies, remains statistically the exception rather than the norm.' },
        { type: 'translation', instructionEn: 'Translate into English.', instructionFr: 'Traduisez en anglais.', sourceFr: 'Les mecanismes de reproduction sociale operent souvent de maniere invisible, se dissimulant derriere le discours meritocratique qui impute les inegalites a des differences de talent ou d\'effort individuels.', targetEn: 'Mechanisms of social reproduction often operate invisibly, concealing themselves behind meritocratic discourse that attributes inequalities to differences in individual talent or effort.' },
        { type: 'mcq', question: 'What does "structural violence" (Galtung) refer to?', questionFr: 'A quoi fait reference la "violence structurelle" (Galtung) ?', options: ['Harm embedded in social structures that prevents people from meeting basic needs', 'Physical assault', 'War between nations', 'Verbal aggression'], correctIndex: 0, explanation: 'Structural violence is harm caused by unequal social arrangements rather than direct physical force.', explanationFr: 'La violence structurelle est le tort cause par des arrangements sociaux inegaux.' },
        { type: 'fill', sentence: 'The "glass ceiling" metaphor describes invisible barriers that prevent certain groups from advancing beyond a certain ___ in organizations.', sentenceFr: 'La metaphore du "plafond de verre" decrit les barrieres invisibles qui empechent certains groupes de progresser au-dela d\'un certain ___ dans les organisations.', answer: 'level', options: ['level', 'lesson', 'letter', 'limit'] },
      ],
    },
  },
];

async function main() {
  console.log('=== Seeding B2/C1/C2 lessons ===\n');
  let created = 0;

  for (const lessonData of LESSONS) {
    const maxOrder = await prisma.lesson.aggregate({
      where: { level: lessonData.level },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? 0) + 1;

    const existing = await prisma.lesson.findFirst({
      where: {
        level: lessonData.level,
        content_json: { path: ['title', 'en'], equals: lessonData.content_json.title.en },
      },
    });

    if (existing) {
      console.log(`[skip] ${lessonData.level} - ${lessonData.content_json.title.en}`);
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

  const stats = await prisma.lesson.groupBy({ by: ['level'], _count: true });
  console.log('\nTotal lessons by level:');
  for (const s of stats.sort((a, b) => a.level.localeCompare(b.level))) {
    console.log(`  ${s.level}: ${s._count}`);
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
