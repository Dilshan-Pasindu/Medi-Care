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

export const aiService = {
  async analyzeCondition(message: string, history: ChatMessage[] = []): Promise<AIAnalysisResult> {
    const allSpecialists = await specialistRepository.findAll();
    const allSymptoms = await specialistRepository.getSymptoms();

    let analysis: {
      reply: string;
      specialistName: string;
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

    // Match recommended specialist
    let matchedSpecialist = allSpecialists.find(
      (s: any) => s.name.toLowerCase() === analysis!.specialistName.toLowerCase()
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
): Promise<{ reply: string; specialistName: string; symptoms: string[] }> {
  const specialistNames = specialists.map((s: any) => s.name).join(', ');
  const symptomNames = symptoms.map((s: any) => s.name).join(', ');

  const systemInstruction = `
You are MediCare's intelligent medical channeling assistant.
Your job is to analyze the patient's description of their condition and symptoms, provide empathetic and clear medical insights, and recommend the exact medical specialist they should channel.

Available Specialists in our channeling center:
${specialistNames}

Available Registered Symptoms:
${symptomNames}

Rules:
1. Always be empathetic, professional, and clear.
2. Recommend exactly ONE primary specialist from the available specialists list that best addresses their situation.
3. Identify which registered symptoms match what they described.
4. Output your response in STRICT JSON format with no markdown wrappers:
{
  "reply": "Your empathetic explanation to the patient, explaining why this specialist is appropriate and what they should monitor...",
  "specialistName": "Exact specialist name from the list above",
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
    specialistName: parsed.specialistName || 'General Physician',
    symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
  };
}

function localClinicalReasoner(
  message: string,
  specialists: any[],
  symptoms: any[]
): { reply: string; specialistName: string; symptoms: string[] } {
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

  let bestMatch = rules[rules.length - 1]; // default General Physician
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
