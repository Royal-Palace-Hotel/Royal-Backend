import { DEEPL_API_KEY, DEEPL_API_URL, DEEPL_TARGET_LANG } from '../config/env'
import { AppError } from '../middleware/errorHandler'

/**
 * Traduction FR → EN des champs du back-office, via DeepL.
 *
 * Le service est facultatif : sans `DEEPL_API_KEY`, la route répond 503 et le
 * back-office retombe sur la saisie manuelle. Aucune traduction n'est écrite en
 * base ici — elle est seulement *proposée* au formulaire, qui reste libre de la
 * corriger avant d'enregistrer.
 */

export const translationEnabled = Boolean(DEEPL_API_KEY)

/** Aligné sur `translateSchema` : au-delà, le texte est tronqué, pas refusé. */
const MAX_LENGTH = 5000

/**
 * Mémoire des traductions déjà payées.
 *
 * Le back-office traduit à la volée, dès qu'on quitte un champ français : sans
 * ce cache, revenir sur une description pour corriger une virgule referait un
 * appel facturé au quota mensuel pour un texte déjà traduit. La table est bornée
 * pour ne pas grossir indéfiniment sur un serveur de longue durée ; au-delà, les
 * entrées les plus anciennes partent — une `Map` conserve l'ordre d'insertion.
 */
const cache = new Map<string, string>()
const CACHE_MAX = 500

function remember(source: string, translation: string) {
  cache.delete(source)
  cache.set(source, translation)
  while (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value
    if (oldest === undefined) break
    cache.delete(oldest)
  }
}

/**
 * Réponses d'erreur de DeepL qui méritent un message propre : elles s'affichent
 * telles quelles dans le back-office, donc en français.
 */
const DEEPL_ERRORS: Record<number, { status: number; message: string }> = {
  403: { status: 502, message: 'Clé DeepL refusée. Vérifiez DEEPL_API_KEY côté serveur.' },
  429: { status: 429, message: 'Trop de traductions d’affilée. Réessayez dans quelques secondes.' },
  456: { status: 502, message: 'Quota de traduction DeepL épuisé pour ce mois.' },
}

interface DeepLResult {
  translations?: Array<{ text?: string }>
}

/**
 * Traduit du français vers l'anglais. Les textes ressortent dans l'ordre reçu ;
 * un texte vide ressort vide.
 */
export async function translateToEnglish(texts: string[]): Promise<string[]> {
  if (!translationEnabled) {
    throw new AppError('Traduction automatique non configurée (DEEPL_API_KEY absente).', 503)
  }

  const sources = texts.map(text => text.trim().slice(0, MAX_LENGTH))
  // Seuls les textes encore inconnus partent chez DeepL, dédoublonnés : un
  // formulaire peut porter deux fois la même valeur.
  const unknown = [...new Set(sources.filter(text => text && !cache.has(text)))]

  if (unknown.length > 0) {
    const fresh = await callDeepL(unknown)
    unknown.forEach((source, index) => remember(source, fresh[index]))
  }

  return sources.map(source => (source ? cache.get(source) ?? '' : ''))
}

/** Un seul appel pour tout le lot : DeepL accepte plusieurs textes par requête. */
async function callDeepL(texts: string[]): Promise<string[]> {
  let response: Response
  try {
    response = await fetch(DEEPL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      // `preserve_formatting` empêche DeepL de retoucher ponctuation et
      // majuscules d'un texte déjà mis en forme (titres, durées, listes).
      body: JSON.stringify({
        text: texts,
        source_lang: 'FR',
        target_lang: DEEPL_TARGET_LANG,
        preserve_formatting: true,
      }),
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    // Réseau coupé ou délai dépassé : l'erreur doit rester lisible et inviter à
    // saisir la version anglaise à la main, jamais bloquer l'enregistrement.
    throw new AppError('Service de traduction injoignable. Saisissez la version anglaise à la main.', 503)
  }

  if (!response.ok) {
    const known = DEEPL_ERRORS[response.status]
    if (known) throw new AppError(known.message, known.status)
    throw new AppError(`Traduction impossible (DeepL a répondu ${response.status}).`, 502)
  }

  const body = (await response.json().catch(() => null)) as DeepLResult | null
  const translations = body?.translations
  if (!translations || translations.length !== texts.length) {
    throw new AppError('Réponse inattendue du service de traduction.', 502)
  }
  return translations.map(item => item.text ?? '')
}
