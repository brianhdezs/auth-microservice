import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/* =========================================================
   🧩 Diccionario de malas palabras (MX / LatAm / ES)
========================================================= */
const BAD_WORDS = new Set([
  'mierda','mrd','asqueroso','asquerosa','imbecil','idiota','estupido','estupida',
  'pendejo','pendeja','cabron','cabrona','chingar','chingada','chingado','chingatumadre',
  'culero','culera','pinche','verga','vergazo','puto','puta','putitos','putita',
  'maricon','marica','joto','zorra','perra','boludo','pelotudo','huevon','huevona',
  'gonorrea','malparido','malparida','cojones','hijueputa','hijodeputa','ctm','lptm',
  'carajo','naco','culiao','culia','ql','hdp','hpta'
]);

/* =========================================================
   🚫 Función auxiliar: detecta palabras ofensivas
========================================================= */
function containsProfanity(value: string): boolean {
  const cleaned = value
    .toLowerCase()
    .normalize('NFD') // quita acentos
    .replace(/[\u0300-\u036f]/g, '') // remueve diacríticos
    .replace(/[@4]/g, 'a')
    .replace(/[0]/g, 'o')
    .replace(/[1]/g, 'i')
    .replace(/[3]/g, 'e')
    .replace(/[5$]/g, 's')
    .replace(/[7]/g, 't');

  // separa por espacios, guiones o signos
  const words = cleaned.split(/[^a-zA-Záéíóúñü]+/g);
  return words.some(w => BAD_WORDS.has(w));
}

/* =========================================================
   🛡️ Validador @NoProfanity()
========================================================= */
@ValidatorConstraint({ name: 'NoProfanity', async: false })
export class NoProfanityConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return true;
    return !containsProfanity(value);
  }

  defaultMessage(): string {
    return 'El campo contiene lenguaje inapropiado.';
  }
}

export function NoProfanity(options?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'NoProfanity',
      target: object.constructor,
      propertyName,
      options,
      validator: NoProfanityConstraint,
    });
  };
}
