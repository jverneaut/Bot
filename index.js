const title = document.querySelector('h1');
const input = document.querySelector('input');
const submit = document.querySelector('button');

// Les variables auront ces noms dans l'objet final
const STEP_NAME = 'name';
const STEP_EMAIL = 'email';
const STEP_ACTION = 'action';
const STEP_ACTION_1 = 'action-1';
const STEP_ACTION_2 = 'action-2';
const STEP_END = 'end';
const STEP_FAIL = 'fail';

// Contient les variables remplies au fur et à mesure de l'avancée du questionnaire
const variables = {};

const steps = [
  // Chaque étape gère sa validation et sa propre logique.
  {
    name: STEP_NAME,
    type: 'input',
    text: 'Bonjour ! Quel est ton nom ?',
    next: (value, history) => STEP_ACTION,
    validate: value => value.trim() !== '',
  },
  {
    name: STEP_ACTION,
    type: 'input',

    // Cet example référence la STEP_NAME. La variable lui sera passée automatiquement.
    text: `Enchanté [${STEP_NAME}] ! Choisi de taper 1 ou 2`,

    // La valeur de l'input ainsi que tout le stack précédent sont passés dans cette fonction
    // qui retourne le nom de la prochaine étape.
    // C'est ici que se passe toute la logique.
    next: (value, history) => value === '1' ? STEP_ACTION_1 : STEP_ACTION_2,

    // La validation vérifie que les valeurs sont bien soit 1 soit 2. Bien sûr il faut aussi
    // vérifier les valeurs en back office.
    validate: value => value.trim() === '1' || value.trim() === '2',
  },
  {
    name: STEP_ACTION_1,
    type: 'input',
    text: `Vous avez choisi [${STEP_ACTION}]... Bravo ! Taper "cool" pour continuer.`,
    next: (value, history) => value === 'cool' ? STEP_EMAIL : STEP_FAIL,
    validate: value => value.trim() !== '',
  },
  {
    name: STEP_ACTION_2,
    type: 'input',
    text: `Vous avez choisi [${STEP_ACTION}]... Retour à la case départ !`,
    next: (value, history) => STEP_NAME,
    validate: () => true,
  },
  {
    name: STEP_FAIL,
    type: 'input',
    text: `Je t'avais pourtant dis de taper "cool" mais tu n'en a fait qu'à ta tête en tapant [${STEP_ACTION_1}]... Retour à la case départ pour toi.`,
    next: (value, history) => STEP_NAME,
    validate: () => true,
  },
  {
    name: STEP_EMAIL,
    type: 'input',
    text: `Attends ! Pour profiter de notre toute dernière promotion, merci de laisser ton adresse email.`,
    next: (value, history) => STEP_END,
    validate: value => validateEmail(value),
  },
  {
    name: STEP_END,
    type: 'input',
    text: `Voili voilou. Tu peux regarder dans la console l'objet final envoyé au serveur.`,
    next: (value, history) => STEP_NAME,
    validate: () => true,
  },
];

const validateEmail = (email) => {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}


// Historique des étapes
const stepsHistory = [];

const isInArray = (a, arr) => arr.filter(el => el === a).length;

// Se charge de trouver l'étape correspondante au nom fourni et charge les variables
// à la place des shortcodes.
const loadStepByName = name => {
  const step = steps.filter(step => step.name === name)[0];
  let { text } = step;

  const shortcode = text.split('[')[1] ? (
    text.split('[')[1].split(']')[0] ? text.split('[')[1].split(']')[0] : false
  ) : false;

  if (shortcode) {
    if (isInArray(shortcode, Object.keys(variables))) {
      text = text.replace('[' + shortcode + ']', variables[shortcode])
    }
  }
  const finalStep = {
    ...step,
    text,
    value: ''
  }
  stepsHistory.push(finalStep);
  return finalStep;
}

let currentStep = loadStepByName(STEP_NAME);
const getNextStepName = () => {
  return currentStep.next(currentStep.value, history);
}

// Reset l'input et change le titre
const render = () => {
  input.value = '';
  input.className = '';
  title.innerText = currentStep.text;

  if (currentStep.name === STEP_END) {
    console.log(variables);
  }
}

// La valeur de l'input est affectée à l'étape en cours
input.addEventListener('input', () => {
  currentStep.value = input.value;
});

// On vérifie que la validation passe, sinon on affiche une erreur.
// Si tout est bon, on passe à l'étape suivante.
submit.addEventListener('click', () => {
  if (currentStep.validate(currentStep.value)) {
    variables[currentStep.name] = currentStep.value;
    currentStep = loadStepByName(getNextStepName());
    render();
  } else {
    input.className = 'error';
  }
});

render();
