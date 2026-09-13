import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useQuantum } from '../../context/QuantumContext';
import { aiVoiceEngine } from '../../utils/aiVoiceEngine';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Mic, 
  Activity, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Sliders, 
  Zap, 
  CheckCircle, 
  Radio, 
  Languages 
} from 'lucide-react';

export type SupportedLanguage = 
  | 'en' 
  | 'es' 
  | 'fr' 
  | 'de' 
  | 'hi' 
  | 'ja' 
  | 'zh' 
  | 'it' 
  | 'pt' 
  | 'ru' 
  | 'ko' 
  | 'ar';

interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English (US / UK)', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (Mandarin)', flag: '🇨🇳' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
];

const getVoiceLabel = (voice: SpeechSynthesisVoice): string => {
  const lang = (voice.lang || '').toLowerCase();
  let flag = '🌐';
  if (lang.includes('en-us') || lang.includes('en_us')) flag = '🇺🇸';
  else if (lang.includes('en-gb') || lang.includes('en_gb')) flag = '🇬🇧';
  else if (lang.includes('en-in') || lang.includes('hi-in') || lang.includes('hi_in')) flag = '🇮🇳';
  else if (lang.includes('en-ca')) flag = '🇨🇦';
  else if (lang.includes('en-au')) flag = '🇦🇺';
  else if (lang.startsWith('es')) flag = '🇪🇸';
  else if (lang.startsWith('fr')) flag = '🇫🇷';
  else if (lang.startsWith('de')) flag = '🇩🇪';
  else if (lang.startsWith('it')) flag = '🇮🇹';
  else if (lang.startsWith('ja')) flag = '🇯🇵';
  else if (lang.startsWith('zh') || lang.includes('cn')) flag = '🇨🇳';
  else if (lang.startsWith('ru')) flag = '🇷🇺';
  else if (lang.startsWith('pt')) flag = '🇧🇷';
  else if (lang.startsWith('ko')) flag = '🇰🇷';
  else if (lang.startsWith('ar')) flag = '🇸🇦';

  return `${flag} ${voice.name} [${voice.lang}]`;
};

const mapVoiceToLang = (voice?: SpeechSynthesisVoice): SupportedLanguage => {
  if (!voice || !voice.lang) return 'en';
  const prefix = voice.lang.toLowerCase();
  if (prefix.startsWith('es')) return 'es';
  if (prefix.startsWith('fr')) return 'fr';
  if (prefix.startsWith('de')) return 'de';
  if (prefix.startsWith('hi')) return 'hi';
  if (prefix.startsWith('ja')) return 'ja';
  if (prefix.startsWith('zh')) return 'zh';
  if (prefix.startsWith('it')) return 'it';
  if (prefix.startsWith('pt')) return 'pt';
  if (prefix.startsWith('ru')) return 'ru';
  if (prefix.startsWith('ko')) return 'ko';
  if (prefix.startsWith('ar')) return 'ar';
  return 'en';
};

interface BaseStep {
  gate: string;
  theta: number; // degrees 0-180
  phi: number;   // degrees 0-360
  prob0: number; // 0-100
  prob1: number; // 0-100
  math: string;
}

interface LocalizedStep {
  title: string;
  explanation: string;
}

interface LocalizedTopic {
  name: string;
  badge: string;
  description: string;
  steps: LocalizedStep[];
}

interface TopicData {
  id: string;
  steps: BaseStep[];
}

const BASE_TOPICS: TopicData[] = [
  {
    id: 'superposition',
    steps: [
      { gate: 'INIT', theta: 0, phi: 0, prob0: 100, prob1: 0, math: '|Ψ⟩ = 1|0⟩ + 0|1⟩' },
      { gate: 'H', theta: 90, phi: 0, prob0: 50, prob1: 50, math: '|Ψ⟩ = 1/√2 |0⟩ + 1/√2 |1⟩ = |+⟩' },
      { gate: 'MEASURE', theta: 0, phi: 0, prob0: 100, prob1: 0, math: 'P(|0⟩) = |α|² = 50%,  P(|1⟩) = |β|² = 50%' }
    ]
  },
  {
    id: 'entanglement',
    steps: [
      { gate: 'INIT', theta: 0, phi: 0, prob0: 100, prob1: 0, math: '|Ψ⟩ = |0⟩ ⊗ |0⟩ = |00⟩' },
      { gate: 'H', theta: 90, phi: 0, prob0: 50, prob1: 50, math: '|Ψ⟩ = 1/√2 (|00⟩ + |10⟩)' },
      { gate: 'CNOT', theta: 90, phi: 45, prob0: 50, prob1: 50, math: '|Φ+⟩ = 1/√2 (|00⟩ + |11⟩)' }
    ]
  },
  {
    id: 'bitflip',
    steps: [
      { gate: 'INIT', theta: 0, phi: 0, prob0: 100, prob1: 0, math: '|Ψ⟩ = |0⟩' },
      { gate: 'X', theta: 180, phi: 0, prob0: 0, prob1: 100, math: 'X|0⟩ = |1⟩' }
    ]
  },
  {
    id: 'phase',
    steps: [
      { gate: 'H', theta: 90, phi: 0, prob0: 50, prob1: 50, math: 'θ = 90°, φ = 0° (|X+⟩)' },
      { gate: 'S', theta: 90, phi: 90, prob0: 50, prob1: 50, math: 'S|+⟩ = 1/√2 (|0⟩ + i|1⟩)' },
      { gate: 'T', theta: 90, phi: 135, prob0: 50, prob1: 50, math: 'T|Ψ⟩ = 1/√2 (|0⟩ + e^(iπ/4)|1⟩)' }
    ]
  }
];

const MULTILINGUAL_DATA: Record<SupportedLanguage, Record<string, LocalizedTopic>> = {
  en: {
    superposition: {
      name: '1. Quantum Superposition (Hadamard H Gate)',
      badge: 'Fundamental',
      description: 'Learn how a qubit exists in multiple states simultaneously before measurement.',
      steps: [
        {
          title: 'Initial State |0⟩ (North Pole)',
          explanation: 'We begin with a qubit initialized to the ground state |0⟩. On the 3D Bloch sphere, this state points straight up at the North Pole with 100% probability of measuring zero.'
        },
        {
          title: 'Hadamard Gate (H) Applied',
          explanation: 'Applying the Hadamard gate rotates the state vector 90 degrees to the equator! The qubit is now in equal superposition of |0⟩ and |1⟩, meaning it is simultaneously 0 and 1.'
        },
        {
          title: 'Quantum Measurement & Wavefunction Collapse',
          explanation: 'When we measure the qubit, the superposition instantly collapses to a single definite state (|0⟩ or |1⟩) based on probability amplitudes.'
        }
      ]
    },
    entanglement: {
      name: '2. Quantum Entanglement (Bell State |Φ+⟩)',
      badge: 'Multi-Qubit',
      description: 'See how two qubits become intrinsically bound so measuring one instantly dictates the other.',
      steps: [
        {
          title: 'Initial Independent State |00⟩',
          explanation: 'Both Qubit 0 and Qubit 1 start in independent zero states |00⟩. There is no entanglement yet.'
        },
        {
          title: 'Superposition on Qubit 0 (H Gate)',
          explanation: 'We apply a Hadamard gate to Qubit 0, putting it into superposition while Qubit 1 remains in zero.'
        },
        {
          title: 'CNOT Gate (Entanglement Activated!)',
          explanation: 'Applying a Controlled-NOT gate flips Qubit 1 whenever Qubit 0 is one! The qubits are now entangled in the Bell state |Φ+⟩. Measuring Qubit 0 as zero immediately guarantees Qubit 1 is zero.'
        }
      ]
    },
    bitflip: {
      name: '3. Quantum Bit Flip (Pauli-X Gate)',
      badge: 'Single Qubit',
      description: 'Understand the quantum NOT gate that flips state |0⟩ to |1⟩.',
      steps: [
        {
          title: 'State |0⟩ (Ground State)',
          explanation: 'The qubit starts at state zero (pointing straight up at the North Pole).'
        },
        {
          title: 'Pauli-X Gate Execution (180° Rotation)',
          explanation: 'Executing the Pauli-X gate rotates the state vector 180 degrees around the X-axis from the North Pole to the South Pole! The state is flipped to |1⟩ with 100% probability.'
        }
      ]
    },
    phase: {
      name: '4. Phase Rotation (Z, S, T Gates)',
      badge: 'Advanced',
      description: 'Explore relative phase changes along the equatorial plane of the Bloch sphere.',
      steps: [
        {
          title: 'Equatorial Superposition |+⟩',
          explanation: 'The qubit is placed on the equator of the Bloch sphere with equal 50/50 probability amplitudes.'
        },
        {
          title: 'Phase S Gate (90° Rotation around Z-axis)',
          explanation: 'Applying an S gate rotates the phase angle phi by 90 degrees around the Z-axis. Notice that measurement probabilities stay 50/50, but the complex phase has changed!'
        },
        {
          title: 'Phase T Gate (45° Rotation)',
          explanation: 'The T gate rotates the phase by another 45 degrees, pointing the vector into the second quadrant of the equatorial plane.'
        }
      ]
    }
  },

  es: {
    superposition: {
      name: '1. Superposición Cuántica (Compuerta Hadamard H)',
      badge: 'Fundamental',
      description: 'Aprende cómo un cúbit existe en múltiples estados simultáneamente antes de ser medido.',
      steps: [
        {
          title: 'Estado Inicial |0⟩ (Polo Norte)',
          explanation: 'Comenzamos con un cúbit inicializado en el estado fundamental |0⟩. En la esfera de Bloch 3D, este estado apunta verticalmente hacia el Polo Norte con un 100% de probabilidad de medir cero.'
        },
        {
          title: 'Compuerta Hadamard (H) Aplicada',
          explanation: '¡Al aplicar la compuerta Hadamard, el vector de estado rota 90 grados hacia el ecuador! El cúbit se encuentra ahora en superposición simétrica de |0⟩ y |1⟩, existiendo simultáneamente en ambos estados.'
        },
        {
          title: 'Medición Cuántica y Colapso de la Función de Onda',
          explanation: 'Cuando medimos el cúbit, la superposición colapsa instantáneamente a un único estado definido (|0⟩ o |1⟩) según sus amplitudes de probabilidad.'
        }
      ]
    },
    entanglement: {
      name: '2. Entrelazamiento Cuántico (Estado de Bell |Φ+⟩)',
      badge: 'Multi-Cúbit',
      description: 'Descubre cómo dos cúbits se vinculan íntimamente de modo que medir uno determina de inmediato al otro.',
      steps: [
        {
          title: 'Estado Inicial Independiente |00⟩',
          explanation: 'Tanto el Cúbit 0 como el Cúbit 1 comienzan en estados independientes |00⟩. Aún no existe entrelazamiento cuántico.'
        },
        {
          title: 'Superposición en Cúbit 0 (Compuerta H)',
          explanation: 'Aplicamos una compuerta Hadamard al Cúbit 0, colocándolo en superposición mientras el Cúbit 1 permanece en cero.'
        },
        {
          title: 'Compuerta CNOT (¡Entrelazamiento Activado!)',
          explanation: '¡Al aplicar la compuerta CNOT se invierte el Cúbit 1 siempre que el Cúbit 0 sea uno! Los cúbits quedan entrelazados en el estado de Bell |Φ+⟩. Medir el Cúbit 0 como cero garantiza al instante que el Cúbit 1 es cero.'
        }
      ]
    },
    bitflip: {
      name: '3. Inversión de Bit Cuántico (Compuerta Pauli-X)',
      badge: 'Cúbit Individual',
      description: 'Comprende la compuerta cuántica NOT que invierte el estado |0⟩ al estado |1⟩.',
      steps: [
        {
          title: 'Estado |0⟩ (Estado Fundamental)',
          explanation: 'El cúbit inicia en el estado fundamental cero, apuntando directamente hacia el Polo Norte.'
        },
        {
          title: 'Ejecución de Compuerta Pauli-X (Rotación de 180°)',
          explanation: '¡Al ejecutar la compuerta Pauli-X, el vector rota 180 grados alrededor del eje X desde el Polo Norte hacia el Polo Sur! El estado se invierte a |1⟩ con un 100% de probabilidad.'
        }
      ]
    },
    phase: {
      name: '4. Rotación de Fase (Compuertas Z, S, T)',
      badge: 'Avanzado',
      description: 'Explora cambios de fase relativa a lo largo del plano ecuatorial de la esfera de Bloch.',
      steps: [
        {
          title: 'Superposición Ecuatorial |+⟩',
          explanation: 'El cúbit se posiciona en el ecuador de la esfera de Bloch con probabilidades idénticas del 50%.'
        },
        {
          title: 'Compuerta de Fase S (Rotación de 90° sobre Eje Z)',
          explanation: 'Al aplicar la compuerta S se rota el ángulo de fase phi 90 grados alrededor del eje Z. Las probabilidades se mantienen al 50/50, ¡pero la fase compleja ha cambiado!'
        },
        {
          title: 'Compuerta de Fase T (Rotación de 45°)',
          explanation: 'La compuerta T rota la fase otros 45 grados adicionales, dirigiendo el vector hacia el segundo cuadrante del plano ecuatorial.'
        }
      ]
    }
  },

  fr: {
    superposition: {
      name: '1. Superposition Quantique (Porte Hadamard H)',
      badge: 'Fondamental',
      description: 'Découvrez comment un qubit existe dans plusieurs états simultanément avant la mesure.',
      steps: [
        {
          title: 'État Initial |0⟩ (Pôle Nord)',
          explanation: 'Nous commençons avec un qubit initialisé à l\'état fondamental |0⟩. Sur la sphère de Bloch 3D, cet état pointe verticalement vers le pôle Nord avec 100 % de probabilité de mesurer zéro.'
        },
        {
          title: 'Application de la Porte Hadamard (H)',
          explanation: 'L\'application de la porte de Hadamard fait pivoter le vecteur d\'état de 90 degrés vers l\'équateur ! Le qubit est maintenant en superposition égale de |0⟩ et |1⟩, existant simultanément comme 0 et 1.'
        },
        {
          title: 'Mesure Quantique et Effondrement de la Fonction d\'Onde',
          explanation: 'Lorsque nous mesurons le qubit, la superposition s\'effondre instantanément en un état défini unique (|0⟩ ou |1⟩) selon les amplitudes de probabilité.'
        }
      ]
    },
    entanglement: {
      name: '2. Intrication Quantique (État de Bell |Φ+⟩)',
      badge: 'Multi-Qubits',
      description: 'Voyez comment deux qubits se lient si intimement que mesurer l\'un dicte instantanément l\'autre.',
      steps: [
        {
          title: 'État Initial Indépendant |00⟩',
          explanation: 'Le qubit 0 et le qubit 1 démarrent tous deux dans des états indépendants |00⟩. Il n\'y a pas encore d\'intrication quantique.'
        },
        {
          title: 'Superposition sur le Qubit 0 (Porte H)',
          explanation: 'Nous appliquons une porte Hadamard au qubit 0, le plaçant en superposition tandis que le qubit 1 reste à zéro.'
        },
        {
          title: 'Porte CNOT (Intrication Activée !)',
          explanation: 'L\'application d\'une porte CNOT inverse le qubit 1 chaque fois que le qubit 0 vaut un ! Les qubits sont désormais intriqués dans l\'état de Bell |Φ+⟩. Mesurer le qubit 0 à zéro garantit instantanément que le qubit 1 est zéro.'
        }
      ]
    },
    bitflip: {
      name: '3. Inversion de Bit Quantique (Porte Pauli-X)',
      badge: 'Qubit Unique',
      description: 'Comprenez la porte quantique NON qui fait basculer l\'état |0⟩ en |1⟩.',
      steps: [
        {
          title: 'État |0⟩ (État Fondamental)',
          explanation: 'Le qubit commence à l\'état fondamental zéro, pointant droit vers le pôle Nord.'
        },
        {
          title: 'Exécution de la Porte Pauli-X (Rotation 180°)',
          explanation: 'L\'exécution de la porte Pauli-X fait pivoter le vecteur d\'état de 180 degrés autour de l\'axe X du pôle Nord au pôle Sud ! L\'état est inversé à |1⟩ avec 100 % de certitude.'
        }
      ]
    },
    phase: {
      name: '4. Rotation de Phase (Portes Z, S, T)',
      badge: 'Avancé',
      description: 'Explorez les déphasages relatifs le long du plan équatorial de la sphère de Bloch.',
      steps: [
        {
          title: 'Superposition Équatoriale |+⟩',
          explanation: 'Le qubit est placé sur l\'équateur de la sphère de Bloch avec des amplitudes de probabilité égales à 50/50.'
        },
        {
          title: 'Porte de Phase S (Rotation de 90° autour de l\'axe Z)',
          explanation: 'L\'application d\'une porte S fait pivoter l\'angle de phase phi de 90 degrés autour de l\'axe Z. Les probabilités de mesure restent à 50/50, mais la phase complexe a changé !'
        },
        {
          title: 'Porte de Phase T (Rotation de 45°)',
          explanation: 'La porte T fait pivoter la phase de 45 degrés supplémentaires, orientant le vecteur dans le deuxième quadrant du plan équatorial.'
        }
      ]
    }
  },

  de: {
    superposition: {
      name: '1. Quantenüberlagerung (Hadamard H-Gatter)',
      badge: 'Grundlegend',
      description: 'Erfahren Sie, wie ein Qubit vor der Messung in mehreren Zuständen gleichzeitig existiert.',
      steps: [
        {
          title: 'Grundzustand |0⟩ (Nordpol)',
          explanation: 'Wir beginnen mit einem Qubit im Grundzustand |0⟩. Auf der dreidimensionalen Bloch-Kugel zeigt dieser Zustand genau zum Nordpol mit 100 % Wahrscheinlichkeit, eine Null zu messen.'
        },
        {
          title: 'Hadamard-Gatter (H) angewendet',
          explanation: 'Das Anwenden des Hadamard-Gatters dreht den Zustandsvektor um 90 Grad zum Äquator! Das Qubit befindet sich nun in einer gleichmäßigen Überlagerung von |0⟩ und |1⟩.'
        },
        {
          title: 'Quantenmessung und Kollaps der Wellenfunktion',
          explanation: 'Wenn wir das Qubit messen, kollabiert die Überlagerung sofort in einen eindeutigen Basiszustand (|0⟩ oder |1⟩), bestimmt durch die Wahrscheinlichkeitsamplituden.'
        }
      ]
    },
    entanglement: {
      name: '2. Quantenverschränkung (Bell-Zustand |Φ+⟩)',
      badge: 'Multi-Qubit',
      description: 'Sehen Sie, wie zwei Qubits verschränkt werden, sodass die Messung des einen sofort das andere bestimmt.',
      steps: [
        {
          title: 'Unabhängiger Ausgangszustand |00⟩',
          explanation: 'Sowohl Qubit 0 als auch Qubit 1 starten in unabhängigen Null-Zuständen |00⟩. Es gibt noch keine Quantenverschränkung.'
        },
        {
          title: 'Überlagerung auf Qubit 0 (H-Gatter)',
          explanation: 'Wir wenden ein Hadamard-Gatter auf Qubit 0 an, wodurch es in Überlagerung gebracht wird, während Qubit 1 im Zustand Null verbleibt.'
        },
        {
          title: 'CNOT-Gatter (Verschränkung aktiviert!)',
          explanation: 'Das CNOT-Gatter invertiert Qubit 1 immer dann, wenn Qubit 0 den Wert Eins hat! Die Qubits sind nun im Bell-Zustand |Φ+⟩ verschränkt.'
        }
      ]
    },
    bitflip: {
      name: '3. Quanten-Bitflip (Pauli-X-Gatter)',
      badge: 'Einzel-Qubit',
      description: 'Verstehen Sie das Quanten-NOT-Gatter, das den Zustand |0⟩ in |1⟩ umkehrt.',
      steps: [
        {
          title: 'Zustand |0⟩ (Grundzustand)',
          explanation: 'Das Qubit startet im Zustand Null und zeigt direkt auf den Nordpol.'
        },
        {
          title: 'Pauli-X-Gatter Ausführung (180° Drehung)',
          explanation: 'Das Pauli-X-Gatter dreht den Zustandsvektor um 180 Grad um die X-Achse vom Nordpol zum Südpol! Der Zustand kippt zu |1⟩ mit 100 % Wahrscheinlichkeit.'
        }
      ]
    },
    phase: {
      name: '4. Phasendrehung (Z, S, T-Gatter)',
      badge: 'Fortgeschritten',
      description: 'Erforschen Sie Phasenverschiebungen in der Äquatorebene der Bloch-Kugel.',
      steps: [
        {
          title: 'Äquatoriale Überlagerung |+⟩',
          explanation: 'Das Qubit befindet sich auf dem Äquator der Bloch-Kugel mit gleichen Wahrscheinlichkeitsamplituden von 50 zu 50.'
        },
        {
          title: 'Phasen-S-Gatter (90°-Drehung um Z-Achse)',
          explanation: 'Das S-Gatter dreht den Phasenwinkel phi um 90 Grad um die Z-Achse. Die Messwahrscheinlichkeiten bleiben bei 50/50, aber die komplexe Phase hat sich geändert!'
        },
        {
          title: 'Phasen-T-Gatter (45°-Drehung)',
          explanation: 'Das T-Gatter dreht die Phase um weitere 45 Grad und richtet den Vektor in den zweiten Quadranten der Äquatorebene aus.'
        }
      ]
    }
  },

  hi: {
    superposition: {
      name: '1. क्वांटम सुपरपोजिशन (हाडामार्ड H गेट)',
      badge: 'मूल सिद्धांत',
      description: 'जानें कि मापन से पहले एक क्यूबिट एक साथ कई अवस्थाओं में कैसे मौजूद रहता है।',
      steps: [
        {
          title: 'प्रारंभिक अवस्था |0⟩ (उत्तरी ध्रुव)',
          explanation: 'हम ग्राउंड स्टेट |0⟩ में इनिशियलाइज़ किए गए क्यूबिट से शुरुआत करते हैं। 3D ब्लोच क्षेत्र पर, यह अवस्था सीधे उत्तरी ध्रुव की ओर संकेत करती है, जिसमें शून्य मापने की 100% संभावना होती है।'
        },
        {
          title: 'हाडामार्ड गेट (H) लागू किया गया',
          explanation: 'हाडामार्ड गेट लागू करने पर स्टेट वेक्टर 90 डिग्री घूमकर भूमध्य रेखा पर आ जाता है! क्यूबिट अब |0⟩ और |1⟩ के समान सुपरपोजिशन में है, यानी यह एक ही समय में 0 और 1 दोनों है।'
        },
        {
          title: 'क्वांटम मापन और वेवफंक्शन पतन',
          explanation: 'जब हम क्यूबिट का मापन करते हैं, तो सुपरपोजिशन तुरंत प्रायिकता आयामों के आधार पर किसी एक निश्चित अवस्था (|0⟩ या |1⟩) में सिमट जाता है।'
        }
      ]
    },
    entanglement: {
      name: '2. क्वांटम उलझाव (बेल स्टेट |Φ+⟩)',
      badge: 'मल्टी-क्यूबिट',
      description: 'देखें कि कैसे दो क्यूबिट आपस में इस प्रकार बंधते हैं कि एक को मापने पर दूसरे का परिणाम तुरंत तय हो जाता है।',
      steps: [
        {
          title: 'प्रारंभिक स्वतंत्र अवस्था |00⟩',
          explanation: 'क्यूबिट 0 और क्यूबिट 1 दोनों स्वतंत्र शून्य अवस्थाओं |00⟩ में शुरू होते हैं। अभी कोई क्वांटम उलझाव नहीं है।'
        },
        {
          title: 'क्यूबिट 0 पर सुपरपोजिशन (H गेट)',
          explanation: 'हम क्यूबिट 0 पर हाडामार्ड गेट लगाते हैं, जिससे यह सुपरपोजिशन में आ जाता है जबकि क्यूबिट 1 शून्य में रहता है।'
        },
        {
          title: 'CNOT गेट (क्वांटम उलझाव सक्रिय!)',
          explanation: 'कंट्रोल्ड-नॉट गेट लगाने से जब भी क्यूबिट 0 एक होता है, क्यूबिट 1 पलट जाता है! क्यूबिट अब बेल स्टेट |Φ+⟩ में उलझ गए हैं।'
        }
      ]
    },
    bitflip: {
      name: '3. क्वांटम बिट फ्लिप (पाउली-X गेट)',
      badge: 'एकल क्यूबिट',
      description: 'क्वांटम NOT गेट को समझें जो अवस्था |0⟩ को |1⟩ में बदल देता है।',
      steps: [
        {
          title: 'अवस्था |0⟩ (ग्राउंड स्टेट)',
          explanation: 'क्यूबिट स्टेट ज़ीरो से शुरू होता है, जो सीधे उत्तरी ध्रुव की ओर इंगित करता है।'
        },
        {
          title: 'पाउली-X गेट निष्पादन (180° घूर्णन)',
          explanation: 'पाउली-X गेट लगाने से स्टेट वेक्टर X-अक्ष के चारों ओर 180 डिग्री घूमकर उत्तरी ध्रुव से दक्षिणी ध्रुव पर चला जाता है! अवस्था 100% संभावना के साथ |1⟩ में बदल जाती है।'
        }
      ]
    },
    phase: {
      name: '4. फेज घूर्णन (Z, S, T गेट्स)',
      badge: 'उन्नत',
      description: 'ब्लोच क्षेत्र के भूमध्यरेखीय तल के साथ सापेक्ष फेज परिवर्तनों का अन्वेषण करें।',
      steps: [
        {
          title: 'भूमध्यरेखीय सुपरपोजिशन |+⟩',
          explanation: 'क्यूबिट को ब्लोच क्षेत्र के भूमध्य रेखा पर 50/50 की समान संभावना आयामों के साथ रखा गया है।'
        },
        {
          title: 'फेज S गेट (Z-अक्ष पर 90° घूर्णन)',
          explanation: 'S गेट लगाने से Z-अक्ष के चारों ओर फेज कोण phi 90 डिग्री घूम जाता है। मापने की संभावनाएं 50/50 रहती हैं, लेकिन सम्मिश्र फेज बदल गया है!'
        },
        {
          title: 'फेज T गेट (45° घूर्णन)',
          explanation: 'T गेट फेज को 45 डिग्री और घुमाता है, जिससे वेक्टर भूमध्यरेखीय तल के दूसरे चतुर्थांश में पहुंच जाता है।'
        }
      ]
    }
  },

  ja: {
    superposition: {
      name: '1. 量子重ね合わせ (アダマール H ゲート)',
      badge: '基本原理',
      description: '測定前に量子ビットが複数の状態に同時に存在する仕組みを学びます。',
      steps: [
        {
          title: '初期状態 |0⟩ (北極)',
          explanation: '基底状態 |0⟩ に初期化された量子ビットから始めます。3Dブロッホ球上では、この状態は北極を真っ直ぐ指しており、0が測定される確率は100%です。'
        },
        {
          title: 'アダマールゲート (H) の適用',
          explanation: 'アダマールゲートを適用すると、状態ベクトルが赤道に向かって90度回転します！量子ビットは |0⟩ と |1⟩ の均等な重ね合わせ状態になり、同時に0と1の両方として存在します。'
        },
        {
          title: '量子測定と波動関数の収縮',
          explanation: '量子ビットを測定すると、確率振幅に基づいて重ね合わせが瞬時に単一の確定状態（|0⟩または|1⟩）に収縮します。'
        }
      ]
    },
    entanglement: {
      name: '2. 量子もつれ (ベル状態 |Φ+⟩)',
      badge: 'マルチ量子ビット',
      description: '2つの量子ビットが密接に結合し、一方を測定すると他方が即座に確定する様子を確認します。',
      steps: [
        {
          title: '初期独立状態 |00⟩',
          explanation: '量子ビット0と量子ビット1の両方が独立したゼロ状態 |00⟩ から開始します。まだ量子もつれは存在しません。'
        },
        {
          title: '量子ビット0での重ね合わせ (Hゲート)',
          explanation: '量子ビット0にアダマールゲートを適用して重ね合わせ状態にし、量子ビット1はゼロのままにします。'
        },
        {
          title: 'CNOTゲート (量子もつれ活性化！)',
          explanation: 'CNOTゲートを適用すると、量子ビット0が1のときに量子ビット1が反転します！量子ビットはベル状態 |Φ+⟩ で完全にもつれ合います。'
        }
      ]
    },
    bitflip: {
      name: '3. 量子ビット反転 (パウリXゲート)',
      badge: '単一量子ビット',
      description: '状態 |0⟩ を |1⟩ に反転する量子NOTゲートの動作を理解します。',
      steps: [
        {
          title: '状態 |0⟩ (基底状態)',
          explanation: '量子ビットはゼロ状態（北極を真っ直ぐ指す状態）から始まります。'
        },
        {
          title: 'パウリXゲートの実行 (180°回転)',
          explanation: 'パウリXゲートを実行すると、状態ベクトルがX軸を中心に北極から南極へ180度回転します！状態は100%の確率で |1⟩ に反転します。'
        }
      ]
    },
    phase: {
      name: '4. 位相回転 (Z, S, Tゲート)',
      badge: '高度',
      description: 'ブロッホ球の赤道面における相対位相の変化を探求します。',
      steps: [
        {
          title: '赤道上の重ね合わせ |+⟩',
          explanation: '量子ビットはブロッホ球の赤道上に配置され、測定確率は等しい50/50になります。'
        },
        {
          title: '位相Sゲート (Z軸中心90°回転)',
          explanation: 'Sゲートを適用すると、位相角phiがZ軸を中心に90度回転します。測定確率は50/50のままですが、複素位相が変化しました！'
        },
        {
          title: '位相Tゲート (45°回転)',
          explanation: 'Tゲートは位相をさらに45度回転させ、ベクトルを赤道面の第2象限に向けます。'
        }
      ]
    }
  },

  zh: {
    superposition: {
      name: '1. 量子叠加态 (阿达马 H 门)',
      badge: '基础理论',
      description: '了解量子比特在测量前如何同时存在于多种可能状态之中。',
      steps: [
        {
          title: '初始状态 |0⟩ (北极)',
          explanation: '我们从处于基态 |0⟩ 的量子比特开始。在三维布洛赫球上，此状态垂直指向北极，测量为0的概率为100%。'
        },
        {
          title: '应用阿达马门 (H)',
          explanation: '应用阿达马门将状态向量向赤道旋转90度！量子比特现在处于 |0⟩ 和 |1⟩ 的均等叠加态，意味着它同时具有0和1的特征。'
        },
        {
          title: '量子测量与波函数塌缩',
          explanation: '当我们测量量子比特时，叠加态会根据概率振幅瞬间塌缩为单一确定状态（|0⟩ 或 |1⟩）。'
        }
      ]
    },
    entanglement: {
      name: '2. 量子纠缠 (贝尔态 |Φ+⟩)',
      badge: '多量子比特',
      description: '观察两个量子比特如何建立内在关联，从而对一个的测量瞬间决定另一个。',
      steps: [
        {
          title: '初始独立状态 |00⟩',
          explanation: '量子比特0和量子比特1均从独立的零状态 |00⟩ 开始，尚未形成量子纠缠。'
        },
        {
          title: '量子比特0上的叠加态 (H门)',
          explanation: '我们对量子比特0应用阿达马门使其处于叠加态，而量子比特1保持为零。'
        },
        {
          title: 'CNOT门 (量子纠缠已激活！)',
          explanation: '应用控制非门（CNOT）后，每当量子比特0为1时，量子比特1就会翻转！两个量子比特现在纠缠在贝尔态 |Φ+⟩ 中。'
        }
      ]
    },
    bitflip: {
      name: '3. 量子比特翻转 (泡利-X门)',
      badge: '单量子比特',
      description: '理解将状态 |0⟩ 翻转为 |1⟩ 的量子非门。',
      steps: [
        {
          title: '状态 |0⟩ (基态)',
          explanation: '量子比特从零状态开始，垂直指向北极。'
        },
        {
          title: '执行泡利-X门 (180° 旋转)',
          explanation: '执行泡利-X门使状态向量绕X轴从北极旋转180度至南极！状态以100%的确定性翻转为 |1⟩。'
        }
      ]
    },
    phase: {
      name: '4. 相位旋转 (Z, S, T门)',
      badge: '进阶',
      description: '探索布洛赫球赤道平面上的相对相位演化。',
      steps: [
        {
          title: '赤道叠加态 |+⟩',
          explanation: '量子比特位于布洛赫球的赤道上，具有相等的50/50概率振幅。'
        },
        {
          title: '相位S门 (绕Z轴旋转90°)',
          explanation: '应用S门使相位角phi绕Z轴旋转90度。测量概率仍保持50/50，但复数相位已经改变！'
        },
        {
          title: '相位T门 (45° 旋转)',
          explanation: 'T门使相位再旋转45度，将向量指向赤道平面的第二象限。'
        }
      ]
    }
  },

  it: {
    superposition: {
      name: '1. Sovrapposizione Quantistica (Porta Hadamard H)',
      badge: 'Fondamentale',
      description: 'Scopri come un qubit esiste contemporaneamente in più stati prima della misurazione.',
      steps: [
        {
          title: 'Stato Iniziale |0⟩ (Polo Nord)',
          explanation: 'Iniziamo con un qubit nello stato fondamentale |0⟩. Sulla sfera di Bloch 3D, questo stato punta dritto verso il Polo Nord con il 100% di probabilità di misurare zero.'
        },
        {
          title: 'Applicazione Porta Hadamard (H)',
          explanation: 'L\'applicazione della porta di Hadamard ruota il vettore di stato di 90 gradi verso l\'equatore! Il qubit è ora in sovrapposizione simmetrica di |0⟩ e |1⟩.'
        },
        {
          title: 'Misura Quantistica e Collasso della Funzione d\'Onda',
          explanation: 'Quando misuriamo il qubit, la sovrapposizione collassa istantaneamente in un singolo stato definito (|0⟩ o |1⟩) secondo le ampiezze di probabilità.'
        }
      ]
    },
    entanglement: {
      name: '2. Entanglement Quantistico (Stato di Bell |Φ+⟩)',
      badge: 'Multi-Qubit',
      description: 'Osserva come due qubit si legano in modo che la misura di uno determini istantaneamente l\'altro.',
      steps: [
        {
          title: 'Stato Iniziale Indipendente |00⟩',
          explanation: 'Entrambi i qubit 0 e 1 iniziano in stati indipendenti |00⟩. Non c\'è ancora entanglement quantistico.'
        },
        {
          title: 'Sovrapposizione su Qubit 0 (Porta H)',
          explanation: 'Applichiamo una porta Hadamard al Qubit 0, mettendolo in sovrapposizione mentre il Qubit 1 rimane a zero.'
        },
        {
          title: 'Porta CNOT (Entanglement Attivato!)',
          explanation: 'La porta CNOT inverte il Qubit 1 ogni volta che il Qubit 0 vale uno! I qubit sono ora entangled nello stato di Bell |Φ+⟩.'
        }
      ]
    },
    bitflip: {
      name: '3. Inversione di Bit Quantistico (Porta Pauli-X)',
      badge: 'Singolo Qubit',
      description: 'Comprendi la porta quantistica NOT che inverte lo stato |0⟩ in |1⟩.',
      steps: [
        {
          title: 'Stato |0⟩ (Stato Fondamentale)',
          explanation: 'Il qubit inizia nello stato fondamentale zero, puntando direttamente al Polo Nord.'
        },
        {
          title: 'Esecuzione Porta Pauli-X (Rotazione 180°)',
          explanation: 'La porta Pauli-X ruota il vettore di 180 gradi attorno all\'asse X dal Polo Nord al Polo Sud! Lo stato viene invertito a |1⟩ con probabilità del 100%.'
        }
      ]
    },
    phase: {
      name: '4. Rotazione di Fase (Porte Z, S, T)',
      badge: 'Avanzato',
      description: 'Esplora le variazioni di fase relativa lungo il piano equatoriale della sfera di Bloch.',
      steps: [
        {
          title: 'Sovrapposizione Equatoriale |+⟩',
          explanation: 'Il qubit si trova sull\'equatore della sfera di Bloch con ampiezze di probabilità 50/50.'
        },
        {
          title: 'Porta di Fase S (Rotazione 90° attorno all\'asse Z)',
          explanation: 'L\'applicazione della porta S ruota la fase phi di 90 gradi attorno all\'asse Z. Le probabilità rimangono 50/50, ma la fase complessa è cambiata!'
        },
        {
          title: 'Porta di Fase T (Rotazione 45°)',
          explanation: 'La porta T ruota la fase di ulteriori 45 gradi, orientando il vettore nel secondo quadrante del piano equatoriale.'
        }
      ]
    }
  },

  pt: {
    superposition: {
      name: '1. Superposição Quântica (Porta Hadamard H)',
      badge: 'Fundamental',
      description: 'Aprenda como um qubit existe simultaneamente em múltiplos estados antes da medição.',
      steps: [
        {
          title: 'Estado Inicial |0⟩ (Polo Norte)',
          explanation: 'Começamos com um qubit inicializado no estado fundamental |0⟩. Na esfera de Bloch 3D, este estado aponta diretamente para o Polo Norte com 100% de probabilidade de medir zero.'
        },
        {
          title: 'Aplicação da Porta Hadamard (H)',
          explanation: 'A aplicação da porta Hadamard gira o vetor de estado em 90 graus em direção ao equador! O qubit agora está em superposição simétrica de |0⟩ e |1⟩.'
        },
        {
          title: 'Medição Quântica e Colapso da Função de Onda',
          explanation: 'Quando medimos o qubit, a superposição colapsa instantaneamente em um único estado definido (|0⟩ ou |1⟩) de acordo com as amplitudes de probabilidade.'
        }
      ]
    },
    entanglement: {
      name: '2. Emaranhamento Quântico (Estado de Bell |Φ+⟩)',
      badge: 'Multi-Qubit',
      description: 'Veja como dois qubits tornam-se correlacionados de modo que medir um determina o outro.',
      steps: [
        {
          title: 'Estado Inicial Independente |00⟩',
          explanation: 'Tanto o Qubit 0 quanto o Qubit 1 começam em estados independentes |00⟩. Ainda não há emaranhamento quântico.'
        },
        {
          title: 'Superposição no Qubit 0 (Porta H)',
          explanation: 'Aplicamos uma porta Hadamard ao Qubit 0, colocando-o em superposição enquanto o Qubit 1 permanece em zero.'
        },
        {
          title: 'Porta CNOT (Emaranhamento Ativado!)',
          explanation: 'A porta CNOT inverte o Qubit 1 sempre que o Qubit 0 for um! Os qubits agora estão emaranhados no estado de Bell |Φ+⟩.'
        }
      ]
    },
    bitflip: {
      name: '3. Inversão de Bit Quântico (Porta Pauli-X)',
      badge: 'Qubit Único',
      description: 'Entenda a porta quântica NÃO que inverte o estado |0⟩ para |1⟩.',
      steps: [
        {
          title: 'Estado |0⟩ (Estado Fundamental)',
          explanation: 'O qubit começa no estado fundamental zero, apontando para o Polo Norte.'
        },
        {
          title: 'Execução da Porta Pauli-X (Rotação de 180°)',
          explanation: 'A porta Pauli-X gira o vetor em 180 graus ao redor do eixo X do Polo Norte ao Polo Sul! O estado é invertido para |1⟩ com 100% de certeza.'
        }
      ]
    },
    phase: {
      name: '4. Rotação de Fase (Portas Z, S, T)',
      badge: 'Avançado',
      description: 'Explore as mudanças de fase relativa no plano equatorial da esfera de Bloch.',
      steps: [
        {
          title: 'Superposição Equatorial |+⟩',
          explanation: 'O qubit está posicionado no equador da esfera de Bloch com probabilidades iguais de 50/50.'
        },
        {
          title: 'Porta de Fase S (Rotação de 90° ao redor do eixo Z)',
          explanation: 'A porta S gira o ângulo de fase phi em 90 graus ao redor do eixo Z. As probabilidades permanecem 50/50, mas a fase complexa mudou!'
        },
        {
          title: 'Porta de Fase T (Rotação de 45°)',
          explanation: 'A porta T gira a fase mais 45 graus adicionais, apontando o vetor para o segundo quadrante.'
        }
      ]
    }
  },

  ru: {
    superposition: {
      name: '1. Квантовая суперпозиция (Вентиль Адамара H)',
      badge: 'Фундаментальный',
      description: 'Узнайте, как кубит существует одновременно в нескольких состояниях до момента измерения.',
      steps: [
        {
          title: 'Начальное состояние |0⟩ (Северный полюс)',
          explanation: 'Мы начинаем с кубита, инициализированного в основном состоянии |0⟩. На трехмерной сфере Блоха это состояние направлено строго к Северному полюсу с вероятностью 100% измерения нуля.'
        },
        {
          title: 'Применение вентиля Адамара (H)',
          explanation: 'Применение вентиля Адамара поворачивает вектор состояния на 90 градусов к экватору! Кубит теперь находится в равной суперпозиции |0⟩ и |1⟩.'
        },
        {
          title: 'Квантовое измерение и коллапс волновой функции',
          explanation: 'При измерении кубита суперпозиция мгновенно коллапсирует в единое определенное состояние (|0⟩ или |1⟩) в соответствии с амплитудами вероятностей.'
        }
      ]
    },
    entanglement: {
      name: '2. Квантовая запутанность (Состояние Белла |Φ+⟩)',
      badge: 'Мульти-кубит',
      description: 'Узнайте, как два кубита связываются так, что измерение одного мгновенно определяет другой.',
      steps: [
        {
          title: 'Начальное независимое состояние |00⟩',
          explanation: 'Оба кубита 0 и 1 начинают в независимых нулевых состояниях |00⟩. Квантовое запутывание пока отсутствует.'
        },
        {
          title: 'Суперпозиция на кубите 0 (Вентиль H)',
          explanation: 'Мы применяем вентиль Адамара к кубиту 0, переводя его в суперпозицию, пока кубит 1 остается в нуле.'
        },
        {
          title: 'Вентиль CNOT (Запутанность активирована!)',
          explanation: 'Вентиль CNOT переворачивает кубит 1 каждый раз, когда кубит 0 равен единице! Кубиты теперь запутаны в состоянии Белла |Φ+⟩.'
        }
      ]
    },
    bitflip: {
      name: '3. Квантовый флип бита (Вентиль Паули-X)',
      badge: 'Одиночный кубит',
      description: 'Поймите работу квантового вентиля НЕ, инвертирующего состояние |0⟩ в |1⟩.',
      steps: [
        {
          title: 'Состояние |0⟩ (Основное состояние)',
          explanation: 'Кубит начинается в состоянии ноль, направленном прямо на Северный полюс.'
        },
        {
          title: 'Выполнение вентиля Паули-X (Вращение на 180°)',
          explanation: 'Вентиль Паули-X поворачивает вектор состояния на 180 градусов вокруг оси X от Северного полюса к Южному! Состояние инвертируется в |1⟩ с вероятностью 100%.'
        }
      ]
    },
    phase: {
      name: '4. Фазовое вращение (Вентили Z, S, T)',
      badge: 'Продвинутый',
      description: 'Изучите изменения относительной фазы в экваториальной плоскости сферы Блоха.',
      steps: [
        {
          title: 'Экваториальная суперпозиция |+⟩',
          explanation: 'Кубит находится на экваторе сферы Блоха с равными вероятностями 50 на 50.'
        },
        {
          title: 'Фазовый вентиль S (Вращение на 90° вокруг оси Z)',
          explanation: 'Вентиль S поворачивает фазовый угол phi на 90 градусов вокруг оси Z. Вероятности остаются 50/50, но комплексная фаза изменилась!'
        },
        {
          title: 'Фазовый вентиль T (Вращение на 45°)',
          explanation: 'Вентиль T поворачивает фазу еще на 45 градусов, направляя вектор во второй квадрант экваториальной плоскости.'
        }
      ]
    }
  },

  ko: {
    superposition: {
      name: '1. 양자 중첩 (아다마르 H 게이트)',
      badge: '기본 원리',
      description: '측정하기 전에 큐비트가 여러 상태에 동시에 존재하는 원리를 학습합니다.',
      steps: [
        {
          title: '초기 상태 |0⟩ (북극)',
          explanation: '바닥 상태 |0⟩로 초기화된 큐비트로 시작합니다. 3D 블로흐 구에서 이 상태는 북극을 곧게 가리키며 0을 측정할 확률이 100%입니다.'
        },
        {
          title: '아다마르 게이트 (H) 적용',
          explanation: '아다마르 게이트를 적용하면 상태 벡터가 적도로 90도 회전합니다! 큐비트는 이제 |0⟩과 |1⟩의 균등한 중첩 상태가 됩니다.'
        },
        {
          title: '양자 측정 및 파동함수 붕괴',
          explanation: '큐비트를 측정하면 확률 진폭에 따라 중첩이 단일 확정 상태(|0⟩ 또는 |1⟩)로 즉시 붕괴됩니다.'
        }
      ]
    },
    entanglement: {
      name: '2. 양자 얽힘 (벨 상태 |Φ+⟩)',
      badge: '다중 큐비트',
      description: '두 큐비트가 밀접하게 얽혀 한쪽을 측정하면 다른 쪽이 즉시 결정되는 과정을 관찰합니다.',
      steps: [
        {
          title: '초기 독립 상태 |00⟩',
          explanation: '큐비트 0과 큐비트 1 모두 독립적인 0 상태 |00⟩에서 시작합니다. 아직 얽힘은 없습니다.'
        },
        {
          title: '큐비트 0의 중첩 (H 게이트)',
          explanation: '큐비트 0에 아다마르 게이트를 적용하여 중첩 상태로 만들고, 큐비트 1은 0 상태를 유지합니다.'
        },
        {
          title: 'CNOT 게이트 (양자 얽힘 활성화!)',
          explanation: 'CNOT 게이트는 큐비트 0이 1일 때마다 큐비트 1을 반전시킵니다! 두 큐비트는 이제 벨 상태 |Φ+⟩로 완전히 얽힙니다.'
        }
      ]
    },
    bitflip: {
      name: '3. 양자 비트 반전 (파울리-X 게이트)',
      badge: '단일 큐비트',
      description: '상태 |0⟩을 |1⟩로 반전시키는 양자 NOT 게이트를 이해합니다.',
      steps: [
        {
          title: '상태 |0⟩ (바닥 상태)',
          explanation: '큐비트는 북극을 가리키는 0 상태에서 시작합니다.'
        },
        {
          title: '파울리-X 게이트 실행 (180° 회전)',
          explanation: '파울리-X 게이트를 실행하면 상태 벡터가 X축을 중심으로 북극에서 남극으로 180도 회전합니다! 상태가 100% 확률로 |1⟩로 반전됩니다.'
        }
      ]
    },
    phase: {
      name: '4. 위상 회전 (Z, S, T 게이트)',
      badge: '심화',
      description: '블로흐 구의 적도 평면에서 상대적 위상 변화를 탐구합니다.',
      steps: [
        {
          title: '적도 중첩 상태 |+⟩',
          explanation: '큐비트는 50대 50의 동일한 측정 확률로 블로흐 구의 적도에 위치합니다.'
        },
        {
          title: '위상 S 게이트 (Z축 기준 90° 회전)',
          explanation: 'S 게이트를 적용하면 위상각 phi가 Z축을 중심으로 90도 회전합니다. 측정 확률은 50/50으로 유지되지만 복소 위상이 변경됩니다!'
        },
        {
          title: '위상 T 게이트 (45° 회전)',
          explanation: 'T 게이트는 위상을 45도 추가로 회전시켜 벡터를 적도 평면의 제2사분면으로 향하게 합니다.'
        }
      ]
    }
  },

  ar: {
    superposition: {
      name: '1. التراكب الكمي (بوابة هادامارد H)',
      badge: 'أساسي',
      description: 'تعرف على كيفية وجود الكيوبت في حالات متعددة في وقت واحد قبل إجراء القياس.',
      steps: [
        {
          title: 'الحالة الأولية |0⟩ (القطب الشمالي)',
          explanation: 'نبدأ بكيوبت مهيأ للحالة الأرضية |0⟩. على كرة بلوخ ثلاثية الأبعاد، تشير هذه الحالة عمودياً نحو القطب الشمالي باحتمالية قياس صفر بنسبة 100%.'
        },
        {
          title: 'تطبيق بوابة هادامارد (H)',
          explanation: 'تطبيق بوابة هادامارد يدور متجه الحالة بمقدار 90 درجة نحو خط الاستواء! يصبح الكيوبت الآن في حالة تراكب متساوٍ بين |0⟩ و |1⟩.'
        },
        {
          title: 'القياس الكمي وانهيار الدالة الموجية',
          explanation: 'عند قياس الكيوبت، ينهار التراكب فورياً إلى حالة محددة واحدة (|0⟩ أو |1⟩) بناءً على سعات الاحتمال.'
        }
      ]
    },
    entanglement: {
      name: '2. التشابك الكمي (حالة بيل |Φ+⟩)',
      badge: 'متعدد الكيوبت',
      description: 'شاهد كيف يرتبط كيوبتان جوهرياً بحيث يؤدي قياس أحدهما فوراً إلى تحديد الآخر.',
      steps: [
        {
          title: 'الحالة الأولية المستقلة |00⟩',
          explanation: 'يبدأ كل من الكيوبت 0 والكيوبت 1 في حالات مستقلة |00⟩. لا يوجد تشابك كمي حتى الآن.'
        },
        {
          title: 'التراكب على الكيوبت 0 (بوابة H)',
          explanation: 'نطبق بوابة هادامارد على الكيوبت 0، مما يضعه في حالة تراكب بينما يبقى الكيوبت 1 في حالة الصفر.'
        },
        {
          title: 'بوابة CNOT (تم تفعيل التشابك!)',
          explanation: 'تطبيق بوابة CNOT يعكس الكيوبت 1 كلما كان الكيوبت 0 واحداً! يتشابك الكيوبتان الآن في حالة بيل |Φ+⟩.'
        }
      ]
    },
    bitflip: {
      name: '3. قلب البت الكمي (بوابة باولي-X)',
      badge: 'كيوبت فردي',
      description: 'فهم بوابة النفي الكمي التي تقلب الحالة |0⟩ إلى |1⟩.',
      steps: [
        {
          title: 'الحالة |0⟩ (الحالة الأرضية)',
          explanation: 'يبدأ الكيوبت عند الحالة صفر مشيراً مباشرة نحو القطب الشمالي.'
        },
        {
          title: 'تنفيذ بوابة باولي-X (دوران 180 درجة)',
          explanation: 'تنفيذ بوابة باولي-X يدور المتجه بمقدار 180 درجة حول محور X من القطب الشمالي إلى القطب الجنوبي! تنعكس الحالة إلى |1⟩ باحتمالية 100%.'
        }
      ]
    },
    phase: {
      name: '4. دوران الطور (بوابات Z, S, T)',
      badge: 'متقدم',
      description: 'استكشف تغيرات الطور النسبي على طول المستوى الاستوائي لكرة بلوخ.',
      steps: [
        {
          title: 'التراكب الاستوائي |+⟩',
          explanation: 'يقع الكيوبت على خط استواء كرة بلوخ باحتماليات متساوية 50/50.'
        },
        {
          title: 'بوابة الطور S (دوران 90 درجة حول محور Z)',
          explanation: 'تطبيق بوابة S يدور زاوية الطور phi بمقدار 90 درجة حول محور Z. تظل احتمالات القياس 50/50، لكن الطور المركب قد تغير!'
        },
        {
          title: 'بوابة الطور T (دوران 45 درجة)',
          explanation: 'تدور بوابة T الطور بمقدار 45 درجة إضافية، موجهة المتجه نحو الربع الثاني من المستوى الاستوائي.'
        }
      ]
    }
  }
};

export const InteractiveVoiceAnimationModal: React.FC = () => {
  const { 
    isVoiceAnimationModalOpen, 
    setIsVoiceAnimationModalOpen 
  } = useQuantum();

  const [activeTopicId, setActiveTopicId] = useState<string>('superposition');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [subtitleText, setSubtitleText] = useState<string>('');
  const [highlightedWordIdx, setHighlightedWordIdx] = useState<number>(-1);
  const [manualTheta, setManualTheta] = useState<number>(90);
  const [manualPhi, setManualPhi] = useState<number>(0);
  const [isManualControl, setIsManualControl] = useState<boolean>(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  const vectorArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const currentThetaRef = useRef<number>(0);
  const currentPhiRef = useRef<number>(0);
  const targetThetaRef = useRef<number>(0);
  const targetPhiRef = useRef<number>(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Active topic & step based on language and step index
  const baseTopic = BASE_TOPICS.find(t => t.id === activeTopicId) || BASE_TOPICS[0];
  const baseStep = baseTopic.steps[currentStepIdx] || baseTopic.steps[0];

  const localizedTopics = MULTILINGUAL_DATA[selectedLanguage] || MULTILINGUAL_DATA.en;
  const localizedTopic = localizedTopics[activeTopicId] || MULTILINGUAL_DATA.en[activeTopicId];
  const localizedStep = localizedTopic.steps[currentStepIdx] || localizedTopic.steps[0];

  // Initialize Speech Synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        // Find voice matching selected language
        const matchIdx = voices.findIndex(v => (v.lang || '').toLowerCase().startsWith(selectedLanguage));
        if (matchIdx !== -1) {
          setSelectedVoiceIndex(matchIdx);
          aiVoiceEngine.setVoice(voices[matchIdx]);
        } else if (voices.length > 0) {
          setSelectedVoiceIndex(0);
          aiVoiceEngine.setVoice(voices[0]);
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedLanguage]);

  // Sync selected voice with global aiVoiceEngine
  useEffect(() => {
    if (availableVoices[selectedVoiceIndex]) {
      aiVoiceEngine.setVoice(availableVoices[selectedVoiceIndex]);
    }
  }, [availableVoices, selectedVoiceIndex]);

  // Filter voices that match selected language first
  const matchingVoices = availableVoices.filter(v => (v.lang || '').toLowerCase().startsWith(selectedLanguage));
  const displayVoices = matchingVoices.length > 0 ? matchingVoices : availableVoices;

  // Handle explicit language change
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setSelectedLanguage(newLang);
    aiVoiceEngine.setLanguage(newLang);

    // Find first voice matching this language
    const foundIdx = availableVoices.findIndex(v => (v.lang || '').toLowerCase().startsWith(newLang));
    if (foundIdx !== -1) {
      setSelectedVoiceIndex(foundIdx);
      aiVoiceEngine.setVoice(availableVoices[foundIdx]);
    }
  };

  // Update target angles when step or manual sliders change
  useEffect(() => {
    if (isManualControl) {
      targetThetaRef.current = manualTheta;
      targetPhiRef.current = manualPhi;
    } else if (baseStep) {
      targetThetaRef.current = baseStep.theta;
      targetPhiRef.current = baseStep.phi;
    }
  }, [baseStep, manualTheta, manualPhi, isManualControl]);

  // Voice Narration handler using ACTUAL LANGUAGE
  const speakStepExplanation = useCallback((textToSpeak: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel(); // Stop current speech
    setSubtitleText(textToSpeak);
    setHighlightedWordIdx(-1);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    const chosenVoice = availableVoices[selectedVoiceIndex];
    if (chosenVoice) {
      utterance.voice = chosenVoice;
      utterance.lang = chosenVoice.lang || selectedLanguage;
    } else {
      utterance.lang = selectedLanguage;
    }

    utterance.rate = speechRate;
    utterance.volume = voiceVolume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const words = textToSpeak.slice(0, event.charIndex).trim().split(/\s+/);
        setHighlightedWordIdx(words.length - 1);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setHighlightedWordIdx(-1);

      if (autoAdvance && currentStepIdx < baseTopic.steps.length - 1) {
        setTimeout(() => {
          setCurrentStepIdx(prev => prev + 1);
        }, 1200);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  }, [availableVoices, selectedVoiceIndex, selectedLanguage, speechRate, voiceVolume, autoAdvance, currentStepIdx, baseTopic.steps.length]);

  // Trigger speech when step, topic, or language changes
  useEffect(() => {
    if (isVoiceAnimationModalOpen && localizedStep) {
      speakStepExplanation(localizedStep.explanation);
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [currentStepIdx, activeTopicId, selectedLanguage, isVoiceAnimationModalOpen, speakStepExplanation]);

  // Audio Equalizer Canvas Animation
  useEffect(() => {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let eqFrameId: number;
    const barCount = 24;

    const renderEq = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const barHeight = isSpeaking && !isPaused
          ? Math.random() * (height * 0.8) + (height * 0.15)
          : 4;

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#059669');
        gradient.addColorStop(1, '#10b981');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      eqFrameId = requestAnimationFrame(renderEq);
    };

    renderEq();
    return () => cancelAnimationFrame(eqFrameId);
  }, [isSpeaking, isPaused]);

  // 3D Three.js Bloch Sphere Scene Setup
  useEffect(() => {
    if (!mountRef.current || !isVoiceAnimationModalOpen) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.4, 1.8, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // 1. Transparent Wireframe Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // 2. Equatorial & Meridian Rings
    const ringGeo = new THREE.RingGeometry(0.99, 1.01, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });

    const equator = new THREE.Mesh(ringGeo, ringMat);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    const meridian = new THREE.Mesh(ringGeo, ringMat);
    scene.add(meridian);

    // 3. Axes
    const axesHelper = new THREE.AxesHelper(1.3);
    scene.add(axesHelper);

    // 4. State Vector Arrow
    const dir = new THREE.Vector3(0, 1, 0);
    const origin = new THREE.Vector3(0, 0, 0);
    const arrowHelper = new THREE.ArrowHelper(dir, origin, 1.0, 0x059669, 0.2, 0.1);
    scene.add(arrowHelper);
    vectorArrowRef.current = arrowHelper;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Animation Loop with smooth lerp interpolation
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Lerp theta & phi towards target
      const lerpFactor = 0.08;
      currentThetaRef.current += (targetThetaRef.current - currentThetaRef.current) * lerpFactor;
      currentPhiRef.current += (targetPhiRef.current - currentPhiRef.current) * lerpFactor;

      const thetaRad = (currentThetaRef.current * Math.PI) / 180;
      const phiRad = (currentPhiRef.current * Math.PI) / 180;

      // Spherical coordinates conversion to Cartesian (Bloch convention)
      const x = Math.sin(thetaRad) * Math.cos(phiRad);
      const y = Math.sin(thetaRad) * Math.sin(phiRad);
      const z = Math.cos(thetaRad);

      if (vectorArrowRef.current) {
        const newDir = new THREE.Vector3(x, z, y).normalize();
        vectorArrowRef.current.setDirection(newDir);
      }

      sphereMesh.rotation.y += 0.003;
      renderer.render(scene, camera);
    };

    animate();

    const domElement = mountRef.current;
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (domElement && domElement.contains(renderer.domElement)) {
        domElement.removeChild(renderer.domElement);
      }
    };
  }, [isVoiceAnimationModalOpen]);

  if (!isVoiceAnimationModalOpen) return null;

  const handlePlayPause = () => {
    if (!synthRef.current) return;

    if (isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isSpeaking && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      speakStepExplanation(localizedStep.explanation);
    }
  };

  const handleRestart = () => {
    speakStepExplanation(localizedStep.explanation);
  };

  const wordsList = subtitleText.split(/\s+/);
  const activeLangOption = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 font-sans">
        
        {/* Top Header Bar */}
        <div className="p-4 bg-white border-b border-slate-200 text-slate-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
              <Mic className="w-5 h-5 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base tracking-tight text-slate-900">Multilingual Quantum Voice & 3D Studio</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono flex items-center space-x-1">
                  <span>{activeLangOption.flag}</span>
                  <span>{activeLangOption.nativeName.toUpperCase()} NATIVE SPEECH</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">Authentic Native Language Narration with Real-Time 3D Bloch Sphere Rotations</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              setIsVoiceAnimationModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Grid Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Control & Topic Selector Sidebar */}
          <div className="w-[330px] bg-slate-50 border-r border-slate-200 p-4 flex flex-col space-y-4 overflow-y-auto">
            
            {/* Language Selection Card */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 shadow-xs">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Languages className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Narration Language</span>
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                  Actual Speech
                </span>
              </label>

              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 font-medium">
                Speaks translated quantum physics sentences in the selected native tongue instead of English with an accent.
              </p>
            </div>

            {/* Topic Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Demonstration Topics
              </label>
              <div className="space-y-1.5">
                {BASE_TOPICS.map((topic) => {
                  const loc = localizedTopics[topic.id] || MULTILINGUAL_DATA.en[topic.id];
                  const isSelected = activeTopicId === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => {
                        setActiveTopicId(topic.id);
                        setCurrentStepIdx(0);
                        setIsManualControl(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold truncate">{loc.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          isSelected ? 'bg-white/20 text-white font-bold' : 'bg-slate-100 text-emerald-700'
                        }`}>
                          {loc.badge}
                        </span>
                      </div>
                      <p className={`text-[11px] line-clamp-2 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {loc.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Voice Settings Box */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>TTS Voice & Playback</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {displayVoices.length} Voice{displayVoices.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Voice Selector */}
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Native Voice Engine</label>
                <select
                  value={selectedVoiceIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setSelectedVoiceIndex(idx);
                    const v = availableVoices[idx];
                    if (v) {
                      const detected = mapVoiceToLang(v);
                      if (detected !== selectedLanguage) {
                        setSelectedLanguage(detected);
                      }
                    }
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none focus:border-emerald-500 font-medium cursor-pointer"
                >
                  {displayVoices.map((voice) => {
                    const originalIndex = availableVoices.indexOf(voice);
                    return (
                      <option key={originalIndex} value={originalIndex}>
                        {getVoiceLabel(voice)}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Speech Speed Rate Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                  <span>Narration Speed</span>
                  <span className="text-emerald-700 font-mono font-bold">{speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.4"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Auto Advance Step Toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Auto-Play Next Step</span>
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Manual Vector Manipulation Controls */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-slate-600" />
                  <span>Manual Vector Drag Mode</span>
                </span>
                <input
                  type="checkbox"
                  checked={isManualControl}
                  onChange={(e) => setIsManualControl(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {isManualControl && (
                <div className="space-y-2 text-[11px] text-slate-600 font-mono pt-1">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Theta (θ) Polar:</span>
                      <span className="text-emerald-600">{manualTheta}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={manualTheta}
                      onChange={(e) => setManualTheta(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Phi (φ) Azimuthal:</span>
                      <span className="text-emerald-600">{manualPhi}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={manualPhi}
                      onChange={(e) => setManualPhi(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Main Center Panel: 3D Sphere & Voice Equalizer */}
          <div className="flex-1 flex flex-col bg-slate-900 text-white overflow-hidden relative">
            
            {/* Step Banner Header */}
            <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10 backdrop-blur-md">
              <div>
                <div className="text-[11px] text-emerald-400 font-mono font-bold uppercase tracking-wider">
                  Step {currentStepIdx + 1} of {baseTopic.steps.length}: {baseStep.gate} Gate
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{localizedStep.title}</h3>
              </div>

              {/* Step Navigation Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentStepIdx === 0}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-semibold flex items-center space-x-1 border border-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <button
                  onClick={() => setCurrentStepIdx(prev => Math.min(baseTopic.steps.length - 1, prev + 1))}
                  disabled={currentStepIdx === baseTopic.steps.length - 1}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold flex items-center space-x-1 shadow-sm cursor-pointer"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Bloch Sphere Viewport */}
            <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Live Quantum Physics Math Badge Overlay */}
              <div className="absolute top-4 left-4 bg-slate-900/85 p-3.5 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md font-mono text-xs space-y-1">
                <div className="text-emerald-400 font-bold text-sm">{baseStep.math}</div>
                <div className="text-slate-300 text-[11px]">
                  Bloch Angles: θ = <span className="text-emerald-400 font-bold">{targetThetaRef.current.toFixed(1)}°</span>, φ = <span className="text-teal-300 font-bold">{targetPhiRef.current.toFixed(1)}°</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] pt-1">
                  <span className="text-emerald-400">P(|0⟩): {baseStep.prob0}%</span>
                  <span className="text-amber-400">P(|1⟩): {baseStep.prob1}%</span>
                </div>
              </div>

              {/* Animated Equalizer Visualizer Overlay */}
              <div className="absolute top-4 right-4 bg-slate-900/85 px-3 py-2 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 mb-1 flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>{isSpeaking ? `${activeLangOption.name} Audio Active` : 'Voice Idle'}</span>
                </span>
                <canvas ref={audioCanvasRef} width={100} height={30} className="rounded" />
              </div>
            </div>

            {/* Subtitles & Dynamic Voice Transcript Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Radio className={`w-4 h-4 ${isSpeaking ? 'text-emerald-400 animate-ping' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <span>{activeLangOption.flag}</span>
                    <span>Live {activeLangOption.name} Subtitles</span>
                  </span>
                </div>

                {/* Audio Play/Pause/Restart Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRestart}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                    title="Replay Narration"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 font-bold text-xs flex items-center space-x-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    {isSpeaking && !isPaused ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isSpeaking && !isPaused ? 'Pause Voice' : `Play in ${activeLangOption.name}`}</span>
                  </button>
                </div>
              </div>

              {/* Subtitle Words Box with Real-Time Word Highlighting in the ACTUAL LANGUAGE */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm leading-relaxed min-h-[64px] flex items-center">
                <p className="text-slate-200">
                  {wordsList.map((word, idx) => (
                    <span
                      key={idx}
                      className={`transition-all duration-150 rounded px-1 py-0.5 inline-block ${
                        idx === highlightedWordIdx
                          ? 'bg-emerald-500 text-slate-950 font-bold scale-105 shadow-sm'
                          : idx < highlightedWordIdx
                          ? 'text-white font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
