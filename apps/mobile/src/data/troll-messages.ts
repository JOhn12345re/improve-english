const trollMessages = {
  correctAnswer: {
    a1: [
      "Ouais bon, tu l'as trouve du premier coup",
      "Ok t'as pas rate celle-la",
      "C'est pas trop difficile quand meme",
      "T'as reussi. Felicitations pour cette prouesse",
      "Wow, un mot de 2 lettres, bravo",
      "Pas mal pour quelqu'un qui criait au secours y'a 5 min",
      "Oui oui, c'est ca",
      "T'as trouve. Lache pas",
      "Bon d'accord, t'as compris celui-la",
      "C'est juste, mais c'etait facile hein",
      "Ok ok, tu maitrises les basics",
      "Ouais c'est bon, tu peux continuer",
      "T'as pas pris trop de temps cette fois",
    ],
    a2: [
      "Ok tu l'as. Pas trop dur",
      "Correct. C'est deja ca",
      "T'as trouve la bonne. Respect minimaliste",
      "Pas mal cette fois",
      "Ok, tu progresses un ptit peu",
      "Oui tu as raison. Suite?",
      "Bon d'accord, t'as compris",
      "T'as pas deconne sur celle-la",
      "Ok ok, on peut continuer",
      "Correct mais c'etait quand meme facile",
    ],
    b1: [
      "Ok tu l'as trouve. Pas trop mal",
      "Correct. Enfin quelque chose",
      "T'as pas juste devine? Surprised",
      "Ok cette fois c'est la bonne",
      "Respect minimaliste. T'as compris la nuance",
      "Bon ok, t'as maitrise",
      "T'as trouve. C'etait dur hein",
      "Ok on peut pas dire que t'as perdu",
      "Correct. Mais c'etait pas facile",
      "Ok ok, tu gravis les echelons",
    ],
    b2: [
      "Ok tu l'as. Et c'etait pas simple",
      "Respect. T'as pas devine du tout",
      "Ok cette fois tu l'as vraiment compris",
      "Correct. Meme les natives hesitent",
      "T'as vu la subtilite? Interessant",
      "Ok ok, t'as maitrise le truc",
      "Pas mal. T'as pas juste eu de la chance",
      "T'as trouve. La bonne, pas par hasard",
      "Ok c'est serieusement impressionnant",
      "Correct. Tu peux etre fier(e)",
    ],
  },
  wrongAnswer: {
    a1: [
      "Oof... t'es sur(e)?",
      "Non non non. Pas du tout",
      "Oups. Mauvaise reponse",
      "Nope. C'est pas ca",
      "Oof... meme Google Translate ferait mieux",
      "T'as vraiment cru que c'etait ca?",
      "Non. Mais bravo l'effort creatif",
      "Rate. C'est pas trop dur hein",
      "Euh... nope",
      "Oof. Tres loin de la bonne reponse",
      "Non c'etait pas ca. Recommence?",
      "T'as des oreilles ou c'est pour decorer?",
      "Rate. Faut vraiment lire le cours",
      "Oof. Meme moi je ferais mieux et je suis une app",
      "Non. Proche zero",
      "C'est faux. Totalement faux",
      "Nope nope nope",
      "Non. Zero sur dix",
      "Oof t'etais genre... partout",
      "Non c'est creatif mais completement faux",
    ],
    a2: [
      "Oof... nope",
      "Rate. C'est pas du tout ca",
      "Non. Mauvaise direction",
      "Nope. T'etais loin",
      "Euh non. Essaye encore",
      "Oof. C'est pas ca du tout",
      "Non. Mais j'aime ton courage",
      "Rate. C'est pas trop dur pourtant",
      "Non c'est la mauvaise reponse",
      "Nope. T'etais proche de rien",
      "Oof. Tres creatif. Tres faux",
      "Non. Zero",
      "Rate. Faut vraiment ecouter",
      "Nope nope. Pas du tout",
      "Non. Continue",
      "Oof t'etais a cote",
      "Non c'etait pas du tout ca",
    ],
    b1: [
      "Nope. Pas du tout",
      "Oof... t'etais loin",
      "Non. Mauvais choix",
      "Rate. C'etait pas ca",
      "Nope. T'as deconne sur celle-la",
      "Non. Loin de la bonne",
      "Oof. Meme les natives hesitent moins",
      "Non c'est pas ca. Reessaye?",
      "Rate. T'aurais du reflechir plus",
      "Nope. Tres loin",
      "Non. T'as juste devine au hasard",
      "Oof. Creatif mais faux",
      "Non c'est la mauvaise direction",
      "Rate. Faut relire la lecon",
      "Nope. T'etais nulle part",
    ],
    b2: [
      "Nope. T'etais tres loin",
      "Non. C'etait plus difficile que ca",
      "Rate. Meme avec ton niveau tu aurais pu",
      "Oof. Pas du tout la bonne",
      "Non. T'as completement rate",
      "Nope. C'est pas ca du tout",
      "Non. T'etais pas en train de reflechir",
      "Rate. Faut vraiment comprendre la nuance",
      "Nope. A cote de la plaque",
      "Non. Zero point",
      "Oof. T'aurais du y penser",
      "Non. Tres mauvais choix",
      "Rate. T'as juste devine",
      "Nope. Pas meme close",
    ],
  },
  sarcasm: [
    "Wow, quel effort",
    "Impressionnant... pas du tout",
    "Ok donc t'as lu la question? Non?",
    "Interessant comme approche. Fausse, mais interessante",
    "T'as vraiment pense que c'etait ca? Lol",
    "Creatif. Completement faux. Mais creatif",
    "Ok on essaye encore?",
    "Y'a eu un bug dans ta tete ou?",
    "T'as juste clique au hasard hein",
    "Ouais non",
    "Sure, why not, mais t'etais loin",
    "Ok faut vraiment ecouter le cours",
    "T'etais tres creatif. Et tres faux",
    "Nice try. Mais non",
    "Oof. Meme pas close",
    "T'as des 50/50? Parce que la tu sais pas",
    "Ok donc t'as pas lu l'option",
    "Nope nope nope",
    "T'es vraiment sur(e)?",
    "Ok refais ta formule mentale",
    "C'est pas comment on appelle ca",
    "Loin. Tres loin",
    "T'as raison. Psyche! C'est faux",
    "Oof t'etais genre... a cote",
    "Non. Le contraire tu sais?",
    "Ok faut vraiment apprendre par coeur",
    "T'es creatif en termes de mauvaises reponses",
    "Ouais non c'est pas ca",
    "T'avais le choix entre 4. T'as pris le pire",
  ],
} as const;

type Level = 'a1' | 'a2' | 'b1' | 'b2';

let lastCorrectIndex = -1;
let lastWrongIndex = -1;

export function getTrollMessage(type: 'correct' | 'wrong', level?: string): string {
  const normalizedLevel = (level?.toLowerCase() ?? 'a1') as Level;
  const key = normalizedLevel.startsWith('c') ? 'b2' : normalizedLevel as Level;
  const validKey = (['a1', 'a2', 'b1', 'b2'] as const).includes(key) ? key : 'a1';

  if (type === 'correct') {
    const messages = trollMessages.correctAnswer[validKey];
    let idx: number;
    do {
      idx = Math.floor(Math.random() * messages.length);
    } while (idx === lastCorrectIndex && messages.length > 1);
    lastCorrectIndex = idx;
    return messages[idx];
  }

  // For wrong answers, 30% chance to use generic sarcasm instead
  if (Math.random() < 0.3) {
    const idx = Math.floor(Math.random() * trollMessages.sarcasm.length);
    return trollMessages.sarcasm[idx];
  }

  const messages = trollMessages.wrongAnswer[validKey];
  let idx: number;
  do {
    idx = Math.floor(Math.random() * messages.length);
  } while (idx === lastWrongIndex && messages.length > 1);
  lastWrongIndex = idx;
  return messages[idx];
}
