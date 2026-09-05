import { env } from '../config/env';
import { specialistRepository } from '../repositories/specialist.repository';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAnalysisResult {
  reply: string;
  recommendedSpecialist: {
    id: string;
    name: string;
    description: string;
  } | null;
  identifiedSymptoms: string[];
  doctors: any[];
  disclaimer: string;
}

// ─── Health-intent guard ───────────────────────────────────────────────────
const MEDICAL_KEYWORDS = [
  'pain', 'ache', 'aching', 'aches', 'fever', 'temperature', 'cough',
  'cold', 'headache', 'head', 'dizzy', 'dizziness', 'nausea', 'vomit',
  'stomach', 'abdomen', 'chest', 'heart', 'blood', 'skin', 'rash', 'itch',
  'itching', 'throat', 'sore throat', 'ear', 'nose', 'breathing', 'breath',
  'breathless', 'tired', 'fatigue', 'weak', 'weakness', 'swelling', 'swollen',
  'joint', 'back', 'knee', 'shoulder', 'muscle', 'pressure', 'hypertension',
  'infection', 'virus', 'bacteria', 'symptom', 'condition', 'disease', 'illness',
  'sick', 'ill', 'hurt', 'burning', 'bleeding', 'injury', 'allergy', 'asthma',
  'diabetes', 'migraine', 'anxiety', 'depression', 'insomnia', 'weight',
  'appetite', 'diarrhea', 'constipation', 'pregnant', 'pregnancy', 'menstrual',
  'period', 'urine', 'kidney', 'liver', 'cancer', 'tumor', 'wound', 'fracture',
  'sprain', 'tingling', 'numbness', 'seizure', 'vertigo', 'fainting',
  'palpitation', 'shortness', 'fluttering', 'angina', 'dermatitis', 'acne',
  'lesion', 'hive', 'tonsil', 'sinus', 'hearing', 'hoarseness', 'nasal',
  'ringing', 'arthritis', 'spine', 'hip', 'child', 'baby', 'toddler',
  'flu', 'malaise', 'body ache', 'running nose', 'doctor', 'hospital',
  'medical', 'medicine', 'prescription', 'specialist', 'channel', 'consult',
  'checkup', 'check up', 'treatment', 'diagnosis', 'feeling', 'feel bad',
  'feel sick', 'unwell', 'not well', 'health', 'pain in',
];

function isHealthRelated(message: string): boolean {
  const text = message.toLowerCase();
  return MEDICAL_KEYWORDS.some((kw) => text.includes(kw));
}

function getConversationalReply(message: string): string {
  const text = message.toLowerCase().trim();

  if (/^(hi+|hello+|hey+|good morning|good afternoon|good evening|howdy|greetings|helo|hii|hiii)[\s!.]*$/.test(text)) {
    return "Hello! 👋 I'm your **MediCare AI Health Assistant**. I'm here to help you identify your symptoms and find the right specialist to channel.\n\nPlease describe any medical symptoms or health concerns you're experiencing — for example, *\"I have a high fever and sore throat\"* or *\"I'm having chest pain and shortness of breath\"* — and I'll recommend the right doctor for you.";
  }

  if (/^(how are you|how do you do|what'?s up|hows it going)/.test(text)) {
    return "I'm doing great, thanks for asking! 😊 I'm your **MediCare AI Health Assistant**. I'm here to analyze your symptoms and recommend the right medical specialist.\n\nPlease share any health concerns or symptoms you're experiencing, and I'll guide you.";
  }

  if (/^(thank|thanks|thank you|ty|thx)/.test(text)) {
    return "You're most welcome! 😊 If you have any health concerns or symptoms you'd like to discuss, feel free to describe them and I'll help connect you with the right specialist.";
  }

  if (/^(bye|goodbye|see you|take care|ok|okay|yes|no|sure|yep|nope|hmm|ok+)[\s!.]*$/.test(text)) {
    return "Take care! If you experience any health symptoms or need medical guidance anytime, I'm here to help. Stay healthy! 💙";
  }

  // Generic non-medical input
  return "I'm your **MediCare AI Health Assistant**, specialized in analyzing medical symptoms and recommending the right specialist to channel.\n\nI'm not able to assist with that request, but I'm fully equipped to help with health-related concerns! Please describe any symptoms you're experiencing — such as pain, fever, skin issues, breathing difficulties, etc. — and I'll recommend the appropriate specialist for you.";
}

// ──────────────────────────────────────────────────────────────────────────

export const aiService = {
  async analyzeCondition(message: string, history: ChatMessage[] = []): Promise<AIAnalysisResult> {
    // Guard: If the message is not health-related, return a conversational response
    if (!isHealthRelated(message)) {
      return {
        reply: getConversationalReply(message),
        recommendedSpecialist: null,
        identifiedSymptoms: [],
        doctors: [],
        disclaimer: '',
      };
    }

    const allSpecialists = await specialistRepository.findAll();
    const allSymptoms = await specialistRepository.getSymptoms();

    let analysis: {
      reply: string;
      specialistName: string | null;
      symptoms: string[];
    } | null = null;

    if (env.GEMINI_API_KEY) {
      try {
        analysis = await callGeminiAPI(message, history, allSpecialists, allSymptoms);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local clinical triage reasoner:', err);
        analysis = null;
      }
    }

    // Fallback if Gemini key is not configured or failed
    if (!analysis) {
      analysis = localClinicalReasoner(message, allSpecialists, allSymptoms);
    }

    // If no specialist matched (score = 0 in local reasoner)
    if (!analysis.specialistName) {
      return {
        reply: analysis.reply,
        recommendedSpecialist: null,
        identifiedSymptoms: analysis.symptoms,
        doctors: [],
        disclaimer: '',
      };
    }

    // Match recommended specialist
    let matchedSpecialist = allSpecialists.find(
      (s: any) => s.name.toLowerCase() === analysis!.specialistName!.toLowerCase()
    );

    if (!matchedSpecialist && allSpecialists.length > 0) {
      // Default to General Physician or first specialist
      matchedSpecialist = allSpecialists.find((s: any) => s.name.toLowerCase().includes('physician')) || allSpecialists[0];
    }

    let doctors: any[] = [];
    if (matchedSpecialist) {
      doctors = await specialistRepository.getDoctorsBySpecialistId(matchedSpecialist.id);
      if (doctors.length === 0) {
        // Provide General Physicians as available primary channeling doctors
        const generalPhysician = allSpecialists.find((s: any) => s.name.toLowerCase().includes('physician'));
        if (generalPhysician) {
          doctors = await specialistRepository.getDoctorsBySpecialistId(generalPhysician.id);
        }
      }
    }

    return {
      reply: analysis.reply,
      recommendedSpecialist: matchedSpecialist
        ? {
            id: matchedSpecialist.id,
            name: matchedSpecialist.name,
            description: matchedSpecialist.description,
          }
        : null,
      identifiedSymptoms: analysis.symptoms,
      doctors,
      disclaimer:
        '⚠️ This AI recommendation is for guidance and channeling purposes only. If experiencing severe emergency symptoms (such as intense chest pain, paralysis, or breathing collapse), call emergency services immediately.',
    };
  },
};

async function callGeminiAPI(
  message: string,
  history: ChatMessage[],
  specialists: any[],
  symptoms: any[]
): Promise<{ reply: string; specialistName: string | null; symptoms: string[] }> {
  const specialistNames = specialists.map((s: any) => s.name).join(', ');
  const symptomNames = symptoms.map((s: any) => s.name).join(', ');

  const systemInstruction = `
You are MediCare's intelligent medical channeling assistant.
Your ONLY job is to analyze medical symptoms and health complaints, and recommend the appropriate specialist.

Available Specialists in our channeling center:
${specialistNames}

Available Registered Symptoms:
${symptomNames}

Rules:
1. ONLY respond to messages that describe medical symptoms, health conditions, or health-related questions.
2. If the message is a greeting, casual conversation, or completely unrelated to health/medicine, respond conversationally WITHOUT recommending any specialist. In that case set specialistName to null and symptoms to [].
3. For genuine health/symptom descriptions: be empathetic, professional, and clear. Recommend exactly ONE primary specialist from the list.
4. Identify which registered symptoms match what they described.
5. Output your response in STRICT JSON format with no markdown wrappers:
{
  "reply": "Your response. For non-medical messages: friendly conversational reply asking them to share symptoms. For medical messages: empathetic explanation of why this specialist is appropriate.",
  "specialistName": "Exact specialist name from the list above, or null if not a medical query",
  "symptoms": ["Symptom1", "Symptom2"]
}
`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }],
    },
    ...history.slice(-4).map((h) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.content }],
    })),
    {
      role: 'user',
      parts: [{ text: `Patient message: "${message}"` }],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned HTTP ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = JSON.parse(text);
  return {
    reply: parsed.reply,
    specialistName: parsed.specialistName || null,
    symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
  };
}

function localClinicalReasoner(
  message: string,
  specialists: any[],
  symptoms: any[]
): { reply: string; specialistName: string | null; symptoms: string[] } {
  const text = message.toLowerCase();

  // Keyword rules
  const rules = [
    {
      specialist: 'Cardiologist',
      keywords: ['chest', 'heart', 'palpitation', 'shortness of breath', 'breathless', 'blood pressure', 'hypertension', 'angina', 'fluttering'],
      matchedSymptoms: ['Chest Pain', 'Shortness of Breath', 'Dizziness'],
      explanation: 'Your description indicates potential cardiovascular or respiratory involvement. A Cardiologist specializes in diagnosing and treating heart, arterial, and blood pressure conditions.',
    },
    {
      specialist: 'Neurologist',
      keywords: ['headache', 'migraine', 'dizzy', 'dizziness', 'numbness', 'tingling', 'seizure', 'vertigo', 'fainting', 'neuralgia', 'nerve'],
      matchedSymptoms: ['Headache', 'Dizziness'],
      explanation: 'Your symptoms suggest neurological factors such as migraines, tension, or vestibular balance issues. A Neurologist is best equipped to examine the nervous system and brain.',
    },
    {
      specialist: 'Dermatologist',
      keywords: ['skin', 'rash', 'itching', 'itchy', 'eczema', 'allergy', 'acne', 'lesion', 'hive', 'red spots', 'dermatitis'],
      matchedSymptoms: ['Skin Rash'],
      explanation: 'Your condition reflects cutaneous (skin) irritation, an allergic response, or a dermatological infection. A Dermatologist specializes in dermatological diagnostics and topical therapies.',
    },
    {
      specialist: 'ENT Specialist',
      keywords: ['ear', 'throat', 'tonsil', 'sinus', 'hearing', 'swallowing', 'sore throat', 'cough', 'hoarseness', 'runny nose', 'nasal', 'ringing'],
      matchedSymptoms: ['Sore Throat', 'Ear Pain', 'Cough'],
      explanation: 'These symptoms point toward an ear, nose, or throat irritation or upper respiratory infection. An ENT Specialist (Otolaryngologist) is the ideal consultant for this.',
    },
    {
      specialist: 'Orthopedic Specialist',
      keywords: ['joint', 'knee', 'bone', 'back', 'spine', 'fracture', 'sprain', 'shoulder', 'hip', 'swollen joint', 'arthritis', 'joint pain', 'back pain'],
      matchedSymptoms: ['Joint Pain', 'Back Pain'],
      explanation: 'Your pain pattern suggests musculoskeletal or joint stress. An Orthopedic Specialist focuses on joints, tendons, bones, and spine health.',
    },
    {
      specialist: 'Pediatrician',
      keywords: ['child', 'baby', 'toddler', 'infant', 'kid', 'son', 'daughter', 'pediatric'],
      matchedSymptoms: ['Fever', 'Cough'],
      explanation: 'For children and young adolescents, a Pediatrician ensures targeted pediatric dosages and age-specific clinical evaluation.',
    },
    {
      specialist: 'General Physician',
      keywords: ['fever', 'temperature', 'body ache', 'stomach', 'belly', 'abdomen', 'nausea', 'vomit', 'weak', 'fatigue', 'malaise', 'cold', 'flu'],
      matchedSymptoms: ['Fever', 'Stomach Pain', 'Cough', 'Headache'],
      explanation: 'Based on your overall presentation of systemic symptoms, consulting a General Physician is the best first step for a comprehensive evaluation and initial treatment plan.',
    },
  ];

  let bestMatch: typeof rules[0] | null = null;
  let maxScore = 0;
  let identifiedSymptoms: string[] = [];

  for (const rule of rules) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  }

  // If no keywords matched at all, don't recommend any specialist
  if (maxScore === 0 || !bestMatch) {
    return {
      reply: "I understand you're reaching out, but I need a bit more detail to help you properly. Could you describe any physical symptoms you're experiencing? For example, you might mention pain location, fever, skin changes, breathing issues, or any other discomfort — and I'll match you with the right specialist.",
      specialistName: null,
      symptoms: [],
    };
  }

  // Identify specific symptoms mentioned
  for (const sym of symptoms) {
    if (text.includes(sym.name.toLowerCase())) {
      if (!identifiedSymptoms.includes(sym.name)) {
        identifiedSymptoms.push(sym.name);
      }
    }
  }

  if (identifiedSymptoms.length === 0) {
    identifiedSymptoms = bestMatch.matchedSymptoms;
  }

  const reply = `I have analyzed the symptoms you described. ${bestMatch.explanation} I recommend channeling a **${bestMatch.specialist}** to receive targeted clinical care. Below are the registered specialists and available channeling slots ready for booking.`;

  return {
    reply,
    specialistName: bestMatch.specialist,
    symptoms: identifiedSymptoms,
  };
}
