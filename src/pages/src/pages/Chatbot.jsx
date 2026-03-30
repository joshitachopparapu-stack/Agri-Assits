import { Input } from '@/components/ui/input';
import { useLanguage } from '../components/i18n/LanguageContext';
import { analyzeCropProblem, getGreeting } from '../components/chatbot/chatbotEngine';
import { SPEECH_LANG_MAP } from '../components/i18n/translations';
import { base44 } from '@/api/base44Client';

export default function Chatbot() {
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: 'bot', content: getGreeting(lang) }]);
  }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = SPEECH_LANG_MAP[lang] || 'en-IN';
      utterance.rate = 0.9;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsLoading(true);

    // Try local NLP first
    const localResult = analyzeCropProblem(msg, lang);
    
    if (localResult) {
      const formatted = `**${t('problemDetected')}: ${localResult.problem}**\n\n**${t('possibleCause')}:** ${localResult.cause}\n\n**${t('treatment')}:** ${localResult.treatment}\n\n**${t('prevention')}:** ${localResult.prevention}`;
      setMessages(prev => [...prev, { role: 'bot', content: formatted }]);
      setIsLoading(false);
      return;
    }

    // Fall back to AI
    try {
      const langNames = { en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', kn: 'Kannada' };
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are AgriSage, a smart agriculture assistant for Indian farmers. Answer the following farming question in ${langNames[lang] || 'English'}. Be practical and helpful. If the question is about crop problems, structure your response with: Problem, Cause, Treatment, and Prevention Tips. Keep it concise.\n\nFarmer's question: ${msg}`,
        response_json_schema: {
          type: "object",
          properties: {
            answer: { type: "string" }
          }
        }
      });
      setMessages(prev => [...prev, { role: 'bot', content: response.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', content: t('chatFallback') }]);
    }
    setIsLoading(false);
  };

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = SPEECH_LANG_MAP[lang] || 'en-IN';
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-emerald-600 text-white px-4 py-3 flex items-center gap-3">
        <Link to="/Home"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="font-bold text-sm">{t('featureChatbot')}</h1>
          <p className="text-emerald-200 text-[10px]">{t('featureChatbotDesc')}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'bot' && (
                  <button
                    onClick={() => speakText(msg.content.replace(/\*\*/g, ''))}
                    className="mt-1.5 text-emerald-500 hover:text-emerald-700"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {msg.role === 'bot' && isSpeaking && i === messages.length - 1 && (
              <div className="flex justify-start mt-1 ml-1">
                <button
                  onClick={stopSpeaking}
                  className="flex items-center gap-1.5 bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md hover:bg-red-600 active:scale-95 transition-all"
                >
                  <Square className="w-3 h-3 fill-white" /> ⏹️ Stop Speaking
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: `${i*0.15}s`}} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-white p-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoice}
          className={`shrink-0 ${isListening ? 'text-red-500 bg-red-50' : 'text-gray-500'}`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? t('voiceListening') : t('chatPlaceholder')}
          className="border-gray-200 rounded-xl text-sm"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 rounded-xl"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
