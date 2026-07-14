import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles,
  User,
  Bot,
  AlertCircle,
  RotateCcw,
  Briefcase,
  Play,
  CheckCircle,
  Award,
  ArrowRight,
  Loader2,
  ChevronDown,
  BookOpen,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Video,
  Camera,
  Activity,
  Smile,
  Heart,
  FileText,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface Message {
  id: string;
  sender: 'ai' | 'candidate';
  text: string;
  timestamp: string;
  evaluation?: {
    technical_score: number;
    communication_score: number;
    grammar_score: number;
    confidence_score: number;
    suggestions: string[];
    correct_answer: string;
    is_fallback: boolean;
  };
}

interface Question {
  id: number;
  text: string;
  category: string;
}

interface EmotionLog {
  time: string;
  emotion: string;
}

const SUPPORTED_ROLES = ["Software Engineer", "Python Developer", "Data Scientist", "AI Engineer", "Full Stack Developer"];
const SUPPORTED_LEVELS = ["Beginner", "Intermediate", "Expert", "Staff"];

export const AIChat: React.FC = () => {
  // Session Configuration State
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [selectedLevel, setSelectedLevel] = useState("Intermediate");
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Chat State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [aiStatus, setAiStatus] = useState<'idle' | 'speaking' | 'thinking'>('idle');
  
  // Follow-up Tracking
  const [isFollowUpActive, setIsFollowUpActive] = useState(false);
  const [activeQuestionText, setActiveQuestionText] = useState('');

  // Adaptive Difficulty State
  const [activeLevel, setActiveLevel] = useState("Intermediate");
  const [askedQuestionTexts, setAskedQuestionTexts] = useState<string[]>([]);
  const [difficultyAlert, setDifficultyAlert] = useState<{ text: string; type: 'up' | 'down' } | null>(null);

  // Audio Recording (Web Audio API)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Video Proctoring (OpenCV Attention Tracker)
  const [enableProctoring, setEnableProctoring] = useState(true);
  const [proctoringStatus, setProctoringStatus] = useState<string>("Initializing...");
  const [proctoringIndicator, setProctoringIndicator] = useState<'success' | 'warning' | 'error'>('success');
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Attention Statistics Counters
  const [statsTotalFrames, setStatsTotalFrames] = useState(0);
  const [statsFaceDetected, setStatsFaceDetected] = useState(0);
  const [statsEyeContact, setStatsEyeContact] = useState(0);
  const [statsLookingAway, setStatsLookingAway] = useState(0);
  const [statsHeadMovements, setStatsHeadMovements] = useState(0);

  // DeepFace Emotion Timeline state
  const [emotionTimeline, setEmotionTimeline] = useState<EmotionLog[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<string>("neutral");

  // Report Generation State
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const lastXRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (sessionStarted) {
      scrollToBottom();
    }
  }, [messages, aiStatus, sessionStarted]);

  // Dismiss difficulty alerts
  useEffect(() => {
    if (!difficultyAlert) return;

    const timer = setTimeout(() => {
        setDifficultyAlert(null);
    }, 4000);

    return () => clearTimeout(timer);
}, [difficultyAlert]);

  // Start webcam feed for CV proctoring
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setWebcamStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setProctoringStatus("Focus Locked");
      setProctoringIndicator("success");
    } catch (err) {
      console.error("Webcam access failed:", err);
      setProctoringStatus("Camera Blocked");
      setProctoringIndicator("error");
    }
  };

  // Stop webcam feed
  const stopWebcam = () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
  };

  // Capture canvas snapshot and POST to OpenCV + DeepFace analysis API
  const captureFrameAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || !webcamStream) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 160;
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.5);
      
      const response = await api.post('/interviews/analyze-frame', {
        image_base64: imageBase64,
        last_x: lastXRef.current,
        last_y: lastYRef.current
      });

      const { 
        face_detected, 
        eye_contact, 
        looking_away, 
        head_movement_detected, 
        current_x, 
        current_y,
        dominant_emotion
      } = response.data;

      // Update position tracking coordinates
      lastXRef.current = current_x;
      lastYRef.current = current_y;

      // Increment stats counters
      setStatsTotalFrames(prev => prev + 1);
      if (face_detected) setStatsFaceDetected(prev => prev + 1);
      if (eye_contact) setStatsEyeContact(prev => prev + 1);
      if (looking_away) setStatsLookingAway(prev => prev + 1);
      if (head_movement_detected) setStatsHeadMovements(prev => prev + 1);

      // Append dominant emotion to timeline log (exclude 'none')
      if (dominant_emotion && dominant_emotion !== "none") {
        setCurrentEmotion(dominant_emotion);
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setEmotionTimeline(prev => {
          const nextTimeline = [...prev, { time: timestamp, emotion: dominant_emotion }];
          return nextTimeline.slice(-8); // Keep last 8 logs visible
        });
      }

      // Render proctoring statuses
      if (!face_detected) {
        setProctoringStatus("No Face Detected");
        setProctoringIndicator("error");
      } else if (looking_away) {
        setProctoringStatus("Attention Lost");
        setProctoringIndicator("warning");
      } else {
        setProctoringStatus("Focus Locked");
        setProctoringIndicator("success");
      }
    } catch (err) {
      // Fail silently
    }
  };

  // Mount periodic capture timer
  useEffect(() => {
    let interval: any = null;
    if (sessionStarted && enableProctoring && webcamStream) {
      interval = setInterval(() => {
        captureFrameAndAnalyze();
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionStarted, enableProctoring, webcamStream]);

  // Start microphone capture
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = '';
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        
        await uploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setErrorMsg(null);
    } catch (err) {
      console.error('Microphone capture error:', err);
      setErrorMsg('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  // Stop microphone capture
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Upload audio blob to transcribe endpoint
  const uploadAudio = async (blob: Blob) => {
    setIsTranscribing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');

    try {
      const response = await api.post('/interviews/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const transcribedText = response.data.text;
      
      if (transcribedText && transcribedText.trim()) {
        await submitCandidateAnswer(transcribedText);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to transcribe voice audio. Please try typing your response.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Initializing mock session from API
  const handleStartSession = async () => {
    setIsLoadingSession(true);
    setErrorMsg(null);

    try {
      const response = await api.post('/interviews/generate', {
        role: selectedRole,
        experience_level: selectedLevel
      });
      
      const generatedQs = response.data.questions;
      setQuestions(generatedQs);
      setCurrentQuestionIdx(0);
      setIsFollowUpActive(false);
      
      const firstQText = generatedQs[0].text;
      setActiveQuestionText(firstQText);
      setActiveLevel(selectedLevel);
      setAskedQuestionTexts([firstQText]);
      setDifficultyAlert(null);

      // Clean attention & emotion timelines
      setStatsTotalFrames(0);
      setStatsFaceDetected(0);
      setStatsEyeContact(0);
      setStatsLookingAway(0);
      setStatsHeadMovements(0);
      setEmotionTimeline([]);
      setCurrentEmotion("neutral");
      setIsSessionComplete(false);
      
      const initialGreeting: Message = {
        id: 'init',
        sender: 'ai',
        text: `Welcome! I am your AI Interviewer. Today we are conducting a mock technical simulation for a ${selectedRole} (${selectedLevel}) position. Let's start with our first question:\n\n${firstQText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([initialGreeting]);
      setSessionStarted(true);

      // Trigger webcam proctoring if enabled
      if (enableProctoring) {
        startWebcam();
      }
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to start interview session. Ensure you are authenticated.';
      setErrorMsg(detail);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const submitCandidateAnswer = async (answerText: string) => {
    if (!answerText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'candidate',
      text: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setAiStatus('thinking');

    try {
      const response = await api.post('/interviews/evaluate', {
        role: selectedRole,
        experience_level: activeLevel,
        question: activeQuestionText,
        answer: answerText
      });

      const { 
        technical_score, 
        communication_score, 
        grammar_score, 
        confidence_score, 
        suggestions, 
        correct_answer, 
        follow_up, 
        is_fallback 
      } = response.data;

      setAiStatus('speaking');

      setTimeout(async () => {
        let aiMessageText = '';
        let nextQuestionText = '';
        let nextFollowUpState = false;
        let nextQIdx = currentQuestionIdx;

        const avgScore = (technical_score + communication_score + grammar_score + confidence_score) / 4;

        if (!isFollowUpActive) {
          aiMessageText = `Thank you for your response. Here is my technical follow-up question:\n\n${follow_up}`;
          nextQuestionText = follow_up;
          nextFollowUpState = true;
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: aiMessageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            evaluation: {
              technical_score,
              communication_score,
              grammar_score,
              confidence_score,
              suggestions,
              correct_answer,
              is_fallback
            }
          };

          setMessages((prev) => [...prev, aiMessage]);
          setIsFollowUpActive(nextFollowUpState);
          setActiveQuestionText(nextQuestionText);
          setAiStatus('idle');
          
        } else {
          const nextIdx = currentQuestionIdx + 1;
          if (nextIdx < questions.length) {
            setAiStatus('thinking');
            try {
              const nextQResponse = await api.post('/interviews/next', {
                role: selectedRole,
                current_level: activeLevel,
                last_score: Math.round(avgScore),
                answered_questions: askedQuestionTexts
              });
              
              const { question: nextQ, new_level } = nextQResponse.data;
              
              if (new_level !== activeLevel) {
                const type = new_level === 'Staff' || (new_level === 'Expert' && activeLevel !== 'Staff') || (new_level === 'Intermediate' && activeLevel === 'Beginner') ? 'up' : 'down';
                setDifficultyAlert({
                  text: `Difficulty shifted to ${new_level} level based on performance.`,
                  type
                });
                setActiveLevel(new_level);
              }
              
              nextQuestionText = nextQ.text;
              aiMessageText = `Understood. Let's move on to the next topic [Question ${nextIdx + 1} - Calibrated to ${new_level}]:\n\n${nextQuestionText}`;
              nextQIdx = nextIdx;
              nextFollowUpState = false;
              
              const updatedQs = [...questions];
              updatedQs[nextIdx] = {
                id: nextIdx + 1,
                text: nextQ.text,
                category: nextQ.category
              };
              setQuestions(updatedQs);
              setAskedQuestionTexts([...askedQuestionTexts, nextQ.text]);

            } catch (nextErr) {
              console.error(nextErr);
              nextQuestionText = questions[nextIdx].text;
              aiMessageText = `Understood. Let's move on to the next topic [Question ${nextIdx + 1}]:\n\n${nextQuestionText}`;
              nextQIdx = nextIdx;
              nextFollowUpState = false;
            }
          } else {
            aiMessageText = "Congratulations! You have completed all 10 questions of this mock interview. I am compiling your final performance metrics. You can return to the dashboard console to view your analytics.";
            nextQuestionText = '';
            nextFollowUpState = false;
            setIsSessionComplete(true);
            stopWebcam();
          }

          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: aiMessageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            evaluation: {
              technical_score,
              communication_score,
              grammar_score,
              confidence_score,
              suggestions,
              correct_answer,
              is_fallback
            }
          };

          setMessages((prev) => [...prev, aiMessage]);
          setCurrentQuestionIdx(nextQIdx);
          setIsFollowUpActive(nextFollowUpState);
          setActiveQuestionText(nextQuestionText);
          setAiStatus('idle');
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setAiStatus('idle');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Sorry, I encountered an error communicating with the evaluation server. Please try submitting your answer again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    submitCandidateAnswer(inputText);
  };

  // Compile QA history and trigger PDF report streaming download
  const handleDownloadReport = async () => {
    setIsGeneratingReport(true);
    setErrorMsg(null);

    try {
      const qaHistory: any[] = [];
      
      // Loop through candidate messages and aggregate their evaluation logs
      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        if (msg.sender === 'candidate') {
          const prevAiMsg = messages[i - 1];
          const nextAiMsg = messages[i + 1];

          if (nextAiMsg && nextAiMsg.evaluation) {
            qaHistory.push({
              question: prevAiMsg ? prevAiMsg.text : "Technical Mock Question",
              answer: msg.text,
              technical_score: nextAiMsg.evaluation.technical_score,
              communication_score: nextAiMsg.evaluation.communication_score,
              grammar_score: nextAiMsg.evaluation.grammar_score,
              confidence_score: nextAiMsg.evaluation.confidence_score,
              suggestions: nextAiMsg.evaluation.suggestions,
              correct_answer: nextAiMsg.evaluation.correct_answer
            });
          }
        }
      }

      const payload = {
        role: selectedRole,
        experience_level: selectedLevel,
        resume_summary: `The candidate completed a 10-question adaptive assessment for the ${selectedRole} role. Initial target difficulty was configured to ${selectedLevel}.`,
        eye_contact_rate: statsTotalFrames > 0 ? Math.round((statsEyeContact / statsTotalFrames) * 100) : 0,
        face_presence_rate: statsTotalFrames > 0 ? Math.round((statsFaceDetected / statsTotalFrames) * 100) : 0,
        head_movements: statsHeadMovements,
        dominant_emotion: currentEmotion,
        qa_history: qaHistory
      };

      // Call API expecting array buffer blob back
      const response = await api.post('/interviews/report', payload, {
        responseType: 'blob'
      });

      // Construct browser blob url and click download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Interview_Report_${selectedRole.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to compile PDF report. Please verify connection to the backend service.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const resetSession = () => {
    stopWebcam();
    setSessionStarted(false);
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setMessages([]);
    setInputText('');
    setAiStatus('idle');
    setIsFollowUpActive(false);
    setActiveQuestionText('');
    setErrorMsg(null);
    setAskedQuestionTexts([]);
    setDifficultyAlert(null);
    setEmotionTimeline([]);
    setCurrentEmotion("neutral");
    setIsSessionComplete(false);
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [webcamStream]);

  // Setup Portal View
  if (!sessionStarted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)] w-full py-8">
        <motion.div 
          className="w-full max-w-2xl bg-bg-card border border-border-main rounded-2xl shadow-2xl p-8 space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary mb-4">
              <Sparkles size={24} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Configure Interview Session</h2>
            <p className="text-sm text-text-secondary mt-1">Select your job role and experience level. AI will personalize 10 questions using your resume details.</p>
          </div>

          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Roles selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Target Job Role
              </label>
              <div className="space-y-2">
                {SUPPORTED_ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer group ${
                      selectedRole === role 
                        ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' 
                        : 'bg-bg-main border-border-main text-text-secondary hover:text-text-primary hover:border-border-main/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} />
                      <span>{role}</span>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${selectedRole === role ? 'bg-accent-primary' : 'bg-transparent'}`}></span>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience level & Proctoring Toggle */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUPPORTED_LEVELS.map((level) => (
                      <button
                        key={level}
                        onClick={() => setSelectedLevel(level)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          selectedLevel === level 
                            ? 'bg-accent-primary border-accent-primary text-white shadow-md' 
                            : 'bg-bg-main border-border-main text-text-secondary hover:text-text-primary hover:border-border-main/80'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* OpenCV Proctoring Toggle */}
                <div className="border-t border-border-main/50 pt-4 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={enableProctoring}
                      onChange={(e) => setEnableProctoring(e.target.checked)}
                      className="w-4 h-4 rounded text-accent-primary bg-bg-main border-border-main focus:ring-accent-primary focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs font-bold text-text-primary">Enable Webcam Eye & Emotion Tracking</span>
                  </label>
                  <p className="text-[10px] text-text-secondary leading-tight pl-6">
                    Runs OpenCV eye-gaze tracking and DeepFace attribute analysis to display attention and emotion timelines.
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartSession}
                disabled={isLoadingSession}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-accent-primary/25 transition-all text-sm disabled:opacity-50 mt-auto"
              >
                {isLoadingSession ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Play size={16} fill="white" />
                    <span>Initialize Session</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active Interview Room
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-10rem)] relative" style={{ animation: 'fadeIn 0.5s ease' }}>
      
      {/* Hidden Canvas used for video snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Toast Alert Notification for Difficulty Shifting */}
      <AnimatePresence>
        {difficultyAlert && (
          <motion.div 
            className={`absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl border shadow-xl text-xs font-bold text-white ${
              difficultyAlert.type === 'up' 
                ? 'bg-accent-primary border-accent-primary/50' 
                : 'bg-accent-warning border-accent-warning/50'
            }`}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {difficultyAlert.type === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{difficultyAlert.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Workspace */}
      <div className="xl:col-span-3 bg-bg-card border border-border-main rounded-xl flex flex-col h-full overflow-hidden">
        
        {/* Workspace Header */}
        <div className="bg-bg-sec/50 border-b border-border-main px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center text-accent-primary">
                <Bot size={22} />
              </div>
              <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-bg-card ${
                aiStatus === 'speaking' 
                  ? 'bg-accent-success' 
                  : aiStatus === 'thinking' 
                    ? 'bg-accent-warning animate-pulse' 
                    : 'bg-accent-primary'
              }`}></span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-text-primary">AI Interviewer ({selectedRole})</h3>
              <p className="text-[10px] text-text-secondary flex items-center gap-1">
                <span>Active Target:</span>
                <span className="font-bold text-accent-primary uppercase">{activeLevel}</span>
                <span className="text-text-muted">•</span>
                <span>{aiStatus === 'speaking' ? 'Speaking...' : aiStatus === 'thinking' ? 'Ollama is evaluating...' : 'Connected'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-lg border border-border-main hover:bg-bg-sec text-text-secondary hover:text-text-primary transition-colors"
              title={isMuted ? 'Unmute voice feedback' : 'Mute voice feedback'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <button 
              onClick={resetSession}
              className="p-2 rounded-lg border border-border-main hover:bg-bg-sec text-text-secondary hover:text-text-primary transition-colors"
              title="Reset and reconfigure session"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="alert alert-error mb-4 py-2.5 text-[10px]">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-4">
                <motion.div
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'candidate' ? 'ml-auto flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.sender === 'ai' 
                      ? 'bg-accent-primary/10 border border-accent-primary/20 text-accent-primary' 
                      : 'bg-accent-success/10 border border-accent-success/20 text-accent-success'
                  }`}>
                    {msg.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
                  </div>

                  <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                    msg.sender === 'ai'
                      ? 'bg-bg-sec/50 border border-border-main/50 text-text-primary rounded-tl-none whitespace-pre-line'
                      : 'bg-accent-primary text-white rounded-tr-none'
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`block text-[9px] mt-1 text-right ${msg.sender === 'ai' ? 'text-text-secondary' : 'text-white/60'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>

                {/* Render Rich Evaluation Card */}
                {msg.evaluation && (
                  <motion.div
                    className="ml-11 max-w-[85%] bg-bg-sec/40 border border-border-main rounded-xl p-5 space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center justify-between border-b border-border-main/40 pb-2">
                      <div className="flex items-center gap-1.5 text-accent-primary font-bold text-xs">
                        <Award size={14} />
                        <span>Evaluation Analytics</span>
                      </div>
                      
                      {msg.evaluation.is_fallback && (
                        <span className="text-[8px] font-bold text-accent-warning bg-accent-warning/10 border border-accent-warning/20 px-2 py-0.5 rounded-full">
                          Offline Simulator
                        </span>
                      )}
                    </div>

                    {/* 4 Score Dashboard */}
                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      {[
                        { label: 'Technical Score', score: msg.evaluation.technical_score, barClass: 'bg-accent-primary' },
                        { label: 'Communication', score: msg.evaluation.communication_score, barClass: 'bg-accent-success' },
                        { label: 'Grammar Accuracy', score: msg.evaluation.grammar_score, barClass: 'bg-accent-warning' },
                        { label: 'Confidence Level', score: msg.evaluation.confidence_score, barClass: 'bg-accent-secondary' }
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1 bg-bg-main/30 border border-border-main/40 rounded-lg p-2.5">
                          <div className="flex justify-between font-semibold">
                            <span className="text-text-secondary">{item.label}</span>
                            <span className="text-text-primary">{item.score}%</span>
                          </div>
                          <div className="w-full bg-bg-sec/50 rounded-full h-1 overflow-hidden">
                            <div className={`h-1 rounded-full ${item.barClass}`} style={{ width: `${item.score}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Suggestions Section */}
                    {msg.evaluation.suggestions && msg.evaluation.suggestions.length > 0 && (
                      <div className="space-y-2 bg-bg-main/20 border border-border-main/30 rounded-lg p-3">
                        <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare size={10} className="text-accent-primary" />
                          <span>Recommendations</span>
                        </h4>
                        <ul className="list-disc pl-4 text-[10px] text-text-secondary space-y-1">
                          {msg.evaluation.suggestions.map((sug, i) => (
                            <li key={i} className="leading-tight">{sug}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Exemplar Correct Answer details */}
                    {msg.evaluation.correct_answer && (
                      <details className="group border border-border-main/50 rounded-lg p-2.5 bg-bg-main/30 cursor-pointer">
                        <summary className="text-[10px] font-bold text-text-primary flex items-center justify-between outline-none list-none select-none">
                          <div className="flex items-center gap-1.5">
                            <BookOpen size={12} className="text-accent-success" />
                            <span>View Exemplar Response</span>
                          </div>
                          <ChevronDown size={12} className="group-open:rotate-180 transition-transform text-text-secondary" />
                        </summary>
                        <p className="text-[10px] text-text-secondary mt-2.5 whitespace-pre-line leading-relaxed border-t border-border-main/20 pt-2 cursor-text select-text">
                          {msg.evaluation.correct_answer}
                        </p>
                      </details>
                    )}

                    <div className="text-[8px] text-text-muted text-right">
                      Processed via Llama 3.1
                    </div>
                  </motion.div>
                )}
              </div>
            ))}

            {/* AI thinking/speaking animations */}
            {aiStatus === 'thinking' && (
              <motion.div
                className="flex gap-3 max-w-[80%]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex-shrink-0 flex items-center justify-center text-accent-primary">
                  <Bot size={14} />
                </div>
                <div className="bg-bg-sec/50 border border-border-main/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 h-10">
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </motion.div>
            )}

            {aiStatus === 'speaking' && !isMuted && (
              <motion.div 
                className="flex gap-3 max-w-[80%]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-8 h-8 rounded-full bg-accent-primary/10 border border-accent-primary/20 flex-shrink-0 flex items-center justify-center text-accent-primary">
                  <Bot size={14} />
                </div>
                <div className="bg-bg-sec/50 border border-border-main/50 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 h-10">
                  <div className="flex items-center gap-0.5 h-5">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div 
                        key={i} 
                        className="w-[3px] bg-accent-primary rounded-full animate-wave"
                        style={{ animationDelay: `${i * 150}ms` }}
                      ></div>
                    ))}
                  </div>
                  <span className="text-[10px] text-text-secondary font-medium ml-1">AI speaking feedback...</span>
                </div>
              </motion.div>
            )}

            {/* Session Complete Call to Action */}
            {isSessionComplete && (
              <motion.div 
                className="bg-bg-sec/40 border border-accent-primary/30 rounded-2xl p-6 text-center space-y-4 max-w-xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="inline-flex p-3 rounded-full bg-accent-primary/10 text-accent-primary">
                  <FileText size={32} />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Technical Mock Session Finished</h3>
                <p className="text-[11px] text-text-secondary max-w-md mx-auto leading-relaxed">
                  Your answers have been evaluated. You can compile and download a professional PDF report containing question logs, scoring matrices, eye contact statistics, and recommendations.
                </p>
                <button
                  onClick={handleDownloadReport}
                  disabled={isGeneratingReport}
                  className="mx-auto flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/95 text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-accent-primary/25 cursor-pointer text-xs disabled:opacity-50"
                >
                  {isGeneratingReport ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Compiling PDF Report...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Download PDF Assessment Report</span>
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-bg-sec/30 border-t border-border-main p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <button
              type="button"
              onClick={toggleRecording}
              disabled={isTranscribing || isSessionComplete}
              className={`p-3.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-accent-error/20 border-accent-error text-accent-error animate-pulse' 
                  : 'bg-bg-sec border-border-main text-text-secondary hover:text-text-primary hover:border-accent-primary/50'
              } disabled:opacity-50`}
              title={isRecording ? 'Stop Recording' : 'Start Speaking'}
            >
              {isTranscribing ? (
                <Loader2 size={18} className="animate-spin text-accent-primary" />
              ) : isRecording ? (
                <MicOff size={18} />
              ) : (
                <Mic size={18} />
              )}
            </button>
            
            <input
              type="text"
              placeholder={
                isSessionComplete
                  ? 'Interview session completed. Download your PDF report above.'
                  : isTranscribing
                    ? 'Transcribing audio speech via Whisper...'
                    : isRecording 
                      ? 'Speak now... press Mic button to stop and submit' 
                      : isFollowUpActive 
                        ? 'Type your answer to the AI follow-up question...'
                        : 'Type your detailed answer to the technical question...'
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isTranscribing || isRecording || isSessionComplete}
              className="flex-1 bg-bg-sec border border-border-main text-xs rounded-xl px-4 outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary text-text-primary placeholder:text-text-muted disabled:opacity-50"
            />
            
            <button
              type="submit"
              disabled={!inputText.trim() || isTranscribing || isRecording || isSessionComplete}
              className="bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-accent-primary/25 transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Submit</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar Roadmap / Proctoring / Emotion Timeline */}
      <div className="space-y-6">
        
        {/* Webcam Proctoring Box */}
        {enableProctoring && (
          <div className="bg-bg-card border border-border-main rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                <Video size={14} className="text-accent-primary" />
                <span>Attention Proctoring</span>
              </h3>
              <span className={`w-2 h-2 rounded-full ${
                proctoringIndicator === 'success' 
                  ? 'bg-accent-success' 
                  : proctoringIndicator === 'warning' 
                    ? 'bg-accent-warning animate-pulse' 
                    : 'bg-accent-error animate-ping'
              }`}></span>
            </div>

            {/* Video viewport */}
            <div className="relative w-full h-28 rounded-lg bg-black overflow-hidden border border-border-main/60">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover scale-x-[-1]" 
              />
              {!webcamStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-sec/90 text-text-muted text-[10px] gap-2">
                  <Camera size={20} />
                  <span>Connecting feed...</span>
                </div>
              )}
              
              {/* Emotion Indicator floating Badge */}
              {webcamStream && currentEmotion && (
                <div className="absolute bottom-2 left-2 z-10 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 bg-black/60 border border-border-main/40">
                  <Smile size={8} className="text-accent-success" />
                  <span className="text-text-primary">{currentEmotion}</span>
                </div>
              )}
            </div>

            {/* Proctor status metrics */}
            <div className="flex justify-between items-center text-[10px] border-b border-border-main/40 pb-2">
              <span className="text-text-secondary">Tracking Status:</span>
              <span className={`font-bold ${
                proctoringIndicator === 'success' 
                  ? 'text-accent-success' 
                  : proctoringIndicator === 'warning' 
                    ? 'text-accent-warning' 
                    : 'text-accent-error'
              }`}>
                {proctoringStatus}
              </span>
            </div>

            {/* Live Emotion Timeline Log */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-text-primary">
                <Heart size={10} className="text-accent-error" />
                <span>Live Emotion Timeline</span>
              </div>

              {emotionTimeline.length > 0 ? (
                <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-[8px] leading-none">
                  {emotionTimeline.map((log, i) => {
                    let badgeClass = 'text-accent-primary bg-accent-primary/10 border-accent-primary/20';
                    if (log.emotion === 'happy') badgeClass = 'text-accent-success bg-accent-success/10 border-accent-success/20';
                    if (log.emotion === 'sad') badgeClass = 'text-text-secondary bg-bg-sec border-border-main/50';
                    if (log.emotion === 'angry') badgeClass = 'text-accent-error bg-accent-error/10 border-accent-error/20';
                    if (log.emotion === 'fear') badgeClass = 'text-accent-warning bg-accent-warning/10 border-accent-warning/20';

                    return (
                      <div key={i} className="flex justify-between items-center p-1 rounded bg-bg-main/30 border border-border-main/20">
                        <span className="text-text-muted">{log.time}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${badgeClass}`}>
                          {log.emotion}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[8px] text-text-muted italic">Waiting for feed coordinates...</p>
              )}
            </div>
          </div>
        )}

        {/* Session Progress Timeline */}
        <div className="bg-bg-card border border-border-main rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-text-primary">Session Progress</h3>
            <span className="text-[10px] text-accent-primary font-semibold">{currentQuestionIdx + 1} / {questions.length}</span>
          </div>
          
          <div className="w-full bg-bg-main rounded-full h-1.5 mb-4 overflow-hidden">
            <div 
              className="bg-accent-primary h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div 
                key={q.id}
                className={`p-2 rounded-lg border text-[10px] flex gap-2 items-start transition-all ${
                  idx === currentQuestionIdx 
                    ? 'border-accent-primary/50 bg-accent-primary/5 font-semibold text-text-primary' 
                    : idx < currentQuestionIdx
                      ? 'border-border-main/30 opacity-50 bg-bg-sec/10 text-text-secondary'
                      : 'border-border-main/10 opacity-30 text-text-muted'
                }`}
              >
                {idx < currentQuestionIdx ? (
                  <CheckCircle size={12} className="text-accent-success mt-0.5 flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-bg-main border border-border-main/80 flex items-center justify-center text-[8px] flex-shrink-0 mt-0.5">
                    {q.id}
                  </span>
                )}
                <div>
                  <p className="truncate max-w-[140px]">{q.category}</p>
                  {idx === currentQuestionIdx && isFollowUpActive && (
                    <span className="text-[8px] text-accent-secondary bg-accent-secondary/10 px-1 py-0.5 rounded font-bold mt-1 flex items-center gap-0.5 w-fit">
                      <ArrowRight size={8} />
                      <span>Follow-up</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attention & Emotion Statistics */}
        {statsTotalFrames > 0 && (
          <div className="bg-bg-card border border-border-main rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1">
              <Activity size={14} className="text-accent-success" />
              <span>Attention Statistics</span>
            </h3>

            <div className="space-y-2 text-[10px]">
              <div className="flex justify-between py-1 border-b border-border-main/40">
                <span className="text-text-secondary">Eye Contact Rate</span>
                <span className="font-bold text-text-primary">
                  {Math.round((statsEyeContact / statsTotalFrames) * 100)}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-main/40">
                <span className="text-text-secondary">Face Presence Rate</span>
                <span className="font-bold text-text-primary">
                  {Math.round((statsFaceDetected / statsTotalFrames) * 100)}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-main/40">
                <span className="text-text-secondary">Looking Away Rate</span>
                <span className="font-bold text-accent-warning">
                  {Math.round((statsLookingAway / statsTotalFrames) * 100)}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border-main/40">
                <span className="text-text-secondary">Primary Emotion</span>
                <span className="font-bold text-accent-primary uppercase">
                  {currentEmotion}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary">Head Movements</span>
                <span className="font-bold text-accent-warning">
                  {statsHeadMovements} detected
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Exit notice */}
        <button
          onClick={resetSession}
          className="w-full bg-bg-sec border border-border-main hover:bg-bg-sec/80 text-text-secondary hover:text-text-primary font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs"
        >
          <RotateCcw size={14} />
          <span>Exit Simulation</span>
        </button>
      </div>
      
    </div>
  );
};
