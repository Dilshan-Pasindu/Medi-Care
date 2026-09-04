import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { LoadingState } from '../../components/shared/LoadingState';
import { specialistService } from '../../services/specialist.service';
import { Symptom, SpecialistRecommendation, Doctor, ChatMessage } from '../../types';
import { 
  Check, 
  ChevronRight, 
  Stethoscope, 
  Users, 
  AlertCircle, 
  Sparkles, 
  Send, 
  Bot, 
  User as UserIcon, 
  ListFilter,
  Calendar,
  ShieldAlert,
  CornerDownLeft,
  RefreshCw
} from 'lucide-react';

type Step = 'symptoms' | 'recommendation' | 'doctors' | 'book';
type FinderMode = 'ai-chat' | 'manual';

const PROMPT_SUGGESTIONS = [
  'Chest pressure and shortness of breath when climbing stairs',
  'Severe throbbing migraine with nausea and light sensitivity',
  'Itchy red skin rash and skin irritation on arms',
  'High fever, chills, and persistent dry cough',
  'Sharp ear pain, muffled hearing, and sore throat',
  'Lower back pain and knee joint stiffness in the morning',
];

export default function SpecialistFinder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'manual' ? 'manual' : 'ai-chat';
  const initialQuery = searchParams.get('q') || '';

  const [finderMode, setFinderMode] = useState<FinderMode>(initialMode);
  
  // Manual Selector State
  const [step, setStep] = useState<Step>('symptoms');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<SpecialistRecommendation[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<SpecialistRecommendation | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);

  // AI Chat State
  const [inputMessage, setInputMessage] = useState(initialQuery);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: 'Hello! I am your **MediCare AI Health Assistant** (powered by Gemini). Describe how you are feeling, your condition, or any symptoms in your own words. I will analyze your symptoms and suggest the ideal medical specialist to channel, along with available doctors.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSymptoms() {
      try {
        const data = await specialistService.getSymptoms();
        setSymptoms(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSymptoms();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  // Auto-trigger initial query if passed via URL
  useEffect(() => {
    if (initialQuery && initialMode === 'ai-chat') {
      handleSendMessage(initialQuery);
    }
  }, []);

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleRecommend = async () => {
    if (selectedSymptoms.length === 0) return;
    setRecommending(true);
    try {
      const recs = await specialistService.recommend(selectedSymptoms);
      setRecommendations(recs);
      setStep('recommendation');
    } catch (err) {
      console.error(err);
    } finally {
      setRecommending(false);
    }
  };

  const handleSelectSpecialist = async (specialist: SpecialistRecommendation) => {
    setSelectedSpecialist(specialist);
    try {
      const docs = await specialistService.getDoctors(specialist.id);
      setDoctors(docs);
      setStep('doctors');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectDoctor = (doctor: Doctor, symptomList?: string[]) => {
    const symptomNames = symptomList && symptomList.length > 0
      ? symptomList
      : symptoms.filter(s => selectedSymptoms.includes(s.id)).map(s => s.name);

    navigate('/patient/appointments', {
      state: { 
        doctorId: doctor.id, 
        doctorName: doctor.name, 
        specialistName: doctor.specialist_name, 
        symptoms: symptomNames 
      },
    });
  };

  // AI Chat Handler
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const history = chatMessages
        .filter(m => m.id !== 'welcome-1')
        .map(m => ({ role: m.role, content: m.content }));

      const analysis = await specialistService.chatAnalyze(text, history);

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: analysis.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        analysis,
      };

      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: 'I encountered an issue analyzing your condition. Please try again or switch to the manual symptom selector above.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Find a Specialist & Channel Doctors"
        description="Describe your symptoms to our Gemini AI health assistant or select from standard medical criteria"
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-3 p-1.5 bg-gray-100 rounded-xl max-w-md mb-6">
        <button
          onClick={() => setFinderMode('ai-chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            finderMode === 'ai-chat'
              ? 'bg-white text-primary shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4 text-primary" />
          AI Doctor Finder
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-50 text-primary font-bold">
            Gemini
          </span>
        </button>

        <button
          onClick={() => setFinderMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            finderMode === 'manual'
              ? 'bg-white text-primary shadow-sm font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ListFilter className="h-4 w-4" />
          Symptom Checklist
        </button>
      </div>

      {/* MODE 1: GEMINI AI CHAT FINDER */}
      {finderMode === 'ai-chat' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[640px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-sm shadow-primary/30">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">MediCare AI Health Assistant</h3>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Powered by Google Gemini • Real-time specialist matching</p>
              </div>
            </div>

            <button
              onClick={() => {
                setChatMessages([
                  {
                    id: 'welcome-reset',
                    role: 'assistant',
                    content: 'Hello! I am ready to help you again. What symptoms or condition are you experiencing?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }}
              className="p-2 text-gray-400 hover:text-foreground rounded-lg hover:bg-white/80 transition-colors"
              title="Reset conversation"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Condition Prompts */}
          <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100">
            <p className="text-xs font-medium text-muted-foreground mb-2">Example conditions you can tap:</p>
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={chatLoading}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary-50/40 transition-colors text-left"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-xs'
                      : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-bl-xs'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>

                  {/* AI Structured Analysis Attachment */}
                  {msg.analysis && (
                    <div className="mt-4 pt-4 border-t border-gray-200/60 space-y-4">
                      {/* Identified Symptoms */}
                      {msg.analysis.identifiedSymptoms && msg.analysis.identifiedSymptoms.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Identified Symptoms:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.analysis.identifiedSymptoms.map((sym, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-0.5 text-xs rounded-md bg-white border border-gray-200 text-gray-700 font-medium"
                              >
                                {sym}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specialist Card */}
                      {msg.analysis.recommendedSpecialist && (
                        <div className="bg-white rounded-xl border-2 border-primary/40 p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Stethoscope className="h-5 w-5" />
                              </div>
                              <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                  Recommended Specialist
                                </span>
                                <h4 className="text-base font-bold text-foreground">
                                  {msg.analysis.recommendedSpecialist.name}
                                </h4>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Direct Match
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground mb-4">
                            {msg.analysis.recommendedSpecialist.description}
                          </p>

                          {/* Doctors List for this specialist */}
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-600 mb-2.5 flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-primary" />
                              Available Doctors for Channeling:
                            </p>

                            {msg.analysis.doctors && msg.analysis.doctors.length > 0 ? (
                              <div className="space-y-2">
                                {msg.analysis.doctors.map((doc: Doctor) => (
                                  <div
                                    key={doc.id}
                                    className="p-3 bg-gray-50/80 hover:bg-primary-50/40 rounded-lg border border-gray-100 flex items-center justify-between transition-colors"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-foreground">{doc.name}</p>
                                      <p className="text-xs text-muted-foreground">{doc.specialist_name}</p>
                                    </div>
                                    <button
                                      onClick={() => handleSelectDoctor(doc, msg.analysis?.identifiedSymptoms)}
                                      className="px-3.5 py-1.5 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-600 transition-colors shadow-sm flex items-center gap-1.5"
                                    >
                                      <Calendar className="h-3.5 w-3.5" />
                                      Book Slot
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground italic py-1">
                                No specific doctor rostered right now. Our medical desk will assign an available physician.
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Medical Disclaimer */}
                      {msg.analysis.disclaimer && (
                        <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                          <span>{msg.analysis.disclaimer}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-2 text-right ${
                      msg.role === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-1">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex gap-3.5 items-center">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  <span>Gemini AI is analyzing your symptoms and matching specialists...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Describe your symptoms (e.g. 'I have had a high fever and chest tightness since yesterday')..."
                  disabled={chatLoading}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || chatLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-primary hover:bg-primary-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                >
                  <CornerDownLeft className="h-4 w-4" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!inputMessage.trim() || chatLoading}
                className="px-5 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-600 disabled:opacity-40 transition-all flex items-center gap-2 shadow-sm"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODE 2: MANUAL SYMPTOM CHECKLIST */}
      {finderMode === 'manual' && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            {['symptoms', 'recommendation', 'doctors'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${
                  step === s ? 'bg-primary text-white' : 
                  ['symptoms', 'recommendation', 'doctors'].indexOf(step) > i ? 'bg-success text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {['symptoms', 'recommendation', 'doctors'].indexOf(step) > i ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </div>
                <span className={`text-sm ${step === s ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                  {s === 'symptoms' ? 'Symptoms' : s === 'recommendation' ? 'Recommendation' : 'Select Doctor'}
                </span>
                {i < 2 && <ChevronRight className="h-4 w-4 text-gray-300" />}
              </div>
            ))}
          </div>

          {step === 'symptoms' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-medium mb-1">What symptoms are you experiencing?</h2>
              <p className="text-sm text-muted-foreground mb-5">Select all symptoms that apply</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-3 rounded-md border text-sm font-medium text-left transition-colors ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'border-primary bg-primary-50 text-primary'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                        selectedSymptoms.includes(symptom.id) ? 'bg-primary border-primary' : 'border-gray-300'
                      }`}>
                        {selectedSymptoms.includes(symptom.id) && <Check className="h-3 w-3 text-white" />}
                      </div>
                      {symptom.name}
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleRecommend}
                disabled={selectedSymptoms.length === 0 || recommending}
                className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {recommending ? 'Analyzing...' : `Get Recommendation (${selectedSymptoms.length} selected)`}
              </button>
            </div>
          )}

          {step === 'recommendation' && (
            <div className="space-y-4">
              <div className="bg-info-light border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-info mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-info">Specialist Recommendation</p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Based on your selected symptoms, the following specialists are commonly associated with these conditions. 
                    This is not a medical diagnosis.
                  </p>
                </div>
              </div>

              {recommendations.map((rec, index) => (
                <div
                  key={rec.id}
                  className={`bg-white rounded-lg border p-5 cursor-pointer transition-all hover:shadow-sm ${
                    index === 0 ? 'border-primary border-2' : 'border-gray-200'
                  }`}
                  onClick={() => handleSelectSpecialist(rec)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${index === 0 ? 'bg-primary-50' : 'bg-gray-100'}`}>
                        <Stethoscope className={`h-5 w-5 ${index === 0 ? 'text-primary' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium">{rec.name}</h3>
                          {index === 0 && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-muted-foreground">
                        Match Score: {rec.score}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setStep('symptoms')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to symptoms
              </button>
            </div>
          )}

          {step === 'doctors' && selectedSpecialist && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
                <p className="text-sm text-muted-foreground">
                  Showing doctors for: <span className="font-medium text-foreground">{selectedSpecialist.name}</span>
                </p>
              </div>

              {doctors.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <p className="text-sm text-muted-foreground text-center">No doctors available for this specialty</p>
                </div>
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-lg border border-gray-200 p-5 flex items-center justify-between hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary-50 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.specialist_name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSelectDoctor(doctor)}
                      className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-600 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                ))
              )}

              <button
                onClick={() => setStep('recommendation')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to recommendations
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
