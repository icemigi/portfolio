/**
 * MOTEUR DE PARTITIONS HÉRALDIQUES VECTORIELLES
 * =========================================================================
 * Ce fichier calcule la géométrie des divisions du blason (appelées "partitions").
 * Il génère des chemins vectoriels SVG (les coordonnées 'd' d'un <path>).
 */

export class PartitionEngine {
  constructor() {
    // Liste de tous les types de découpages héraldiques pris en charge
    this.partitionTypes = [
      'parti', 'coupe', 'tranche', 'taille', 
      'ecartele','fasce', 'pal', 'bande', 'barre',
      'sautoir', 'chape', 'chausse',
      'embrasse','emanche',
    ];
  }

  /**
   * Sélectionne un type de partition de manière déterministe via la fonction rng.
   * 
   * @param {Function} rng - La fonction de tirage pseudo-aléatoire basée sur la seed.
   * @returns {string} Le nom de la partition choisie.
   */
  getRandomPartition(rng) {
    const randomFunc = typeof rng === 'function' ? rng : Math.random;
    const randomIndex = Math.floor(randomFunc() * this.partitionTypes.length);
    return this.partitionTypes[randomIndex];
  }

  /**
   * Génère les coordonnées SVG (<path d="...">) selon le type de découpe demandé.
   * 
   * @param {string} type - Le nom de la partition (ex: 'parti', 'coupe', 'fasce').
   * @returns {string} Le tracé SVG sous forme de texte d'instructions de dessin.
   */
  getPartitionPathD(type) {
    const boundsWidth = 1400;
    const boundsHeight = 1600;
    const originX = 300;
    const originY = 200;

    const thirdWidth = boundsWidth / 3;
    const thirdHeight = boundsHeight / 3;
    const halfThirdHeight = thirdHeight / 2;
    const slope = boundsHeight / boundsWidth;
    
    const margin = 1000;

    const outerBoundingRect = `M -${margin},-${margin} H ${2000 + margin} V ${2000 + margin} H -${margin} Z`;

    switch (type) {
      case 'parti':
        return `M -${margin},-${margin} H ${originX + boundsWidth / 2} V ${2000 + margin} H -${margin} Z`;

      case 'coupe':
        return `M -${margin},-${margin} H ${2000 + margin} V ${originY + boundsHeight / 2} H -${margin} Z`;

      case 'tranche':
        return `M ${originX},${originY} L ${originX + boundsWidth},${originY + boundsHeight} V -${margin} H -${margin} Z`;

      case 'taille':
        return `M ${originX + boundsWidth},${originY} L ${originX},${originY + boundsHeight} H -${margin} V -${margin} Z`;

      case 'ecartele': {
        const centerX = originX + boundsWidth / 2;
        const centerY = originY + boundsHeight / 2;
        return `M -${margin},-${margin} H ${centerX} V ${centerY} H -${margin} Z M ${centerX},${centerY} H ${2000 + margin} V ${2000 + margin} H ${centerX} Z`;
      }

      case 'ecartele_sautoir': {
        const centerX = originX + boundsWidth / 2;
        const centerY = originY + boundsHeight / 2;
        return `M -${margin},-${margin} L ${centerX},${centerY} L -${margin},${2000 + margin} Z M ${2000 + margin},-${margin} L ${centerX},${centerY} L ${2000 + margin},${2000 + margin} Z`;
      }

      case 'fasce': {
        const stripe = `M -${margin},${originY + thirdHeight} H ${2000 + margin} V ${originY + thirdHeight * 2} H -${margin} Z`;
        return `${outerBoundingRect} ${stripe}`;
      }

      case 'pal': {
        const stripe = `M ${originX + thirdWidth},-${margin} H ${originX + thirdWidth * 2} V ${2000 + margin} H ${originX + thirdWidth} Z`;
        return `${outerBoundingRect} ${stripe}`;
      }

      case 'bande': {
        const yTopStart = (originY - halfThirdHeight) + slope * (-margin - originX);
        const yTopEnd = (originY - halfThirdHeight) + slope * ((2000 + margin) - originX);
        const yBotStart = (originY + halfThirdHeight) + slope * (-margin - originX);
        const yBotEnd = (originY + halfThirdHeight) + slope * ((2000 + margin) - originX);
        const stripe = `M -${margin},${yTopStart} L ${2000 + margin},${yTopEnd} L ${2000 + margin},${yBotEnd} L -${margin},${yBotStart} Z`;
        return `${outerBoundingRect} ${stripe}`;
      }

      case 'barre': {
        const yTopStart = (originY - halfThirdHeight) - slope * (-margin - (originX + boundsWidth));
        const yTopEnd = (originY - halfThirdHeight) - slope * ((2000 + margin) - (originX + boundsWidth));
        const yBotStart = (originY + halfThirdHeight) - slope * (-margin - (originX + boundsWidth));
        const yBotEnd = (originY + halfThirdHeight) - slope * ((2000 + margin) - (originX + boundsWidth));
        const stripe = `M -${margin},${yTopStart} L ${2000 + margin},${yTopEnd} L ${2000 + margin},${yBotEnd} L -${margin},${yBotStart} Z`;
        return `${outerBoundingRect} ${stripe}`;
      }

      case 'chef':
        return `M -${margin},-${margin} H ${2000 + margin} V ${originY + thirdHeight} H -${margin} Z`;

      case 'champagne':
        return `M -${margin},${originY + thirdHeight * 2} H ${2000 + margin} V ${2000 + margin} H -${margin} Z`;

      case 'canton':
        return `M -${margin},-${margin} H ${originX + boundsWidth / 2} V ${originY + boundsHeight / 2} H -${margin} Z`;

      case 'chevron': {
        const thickness = thirdHeight;
        const apexY = originY + thirdHeight;
        return `M -${margin},${2000 + margin} L ${originX + boundsWidth / 2},${apexY} L ${2000 + margin},${2000 + margin} L ${2000 + margin},${2000 + margin + thickness} L ${originX + boundsWidth / 2},${apexY + thickness} L -${margin},${2000 + margin + thickness} Z`;
      }

      case 'croix': {
        const palStripe = `M ${originX + thirdWidth},-${margin} H ${originX + thirdWidth * 2} V ${2000 + margin} H ${originX + thirdWidth} Z`;
        const fasceStripe = `M -${margin},${originY + thirdHeight} H ${2000 + margin} V ${originY + thirdHeight * 2} H -${margin} Z`;
        return `${outerBoundingRect} ${palStripe} ${fasceStripe}`;
      }

      default:
        return `M -${margin},-${margin} H ${originX + boundsWidth / 2} V ${2000 + margin} H -${margin} Z`;
    }
  }
}