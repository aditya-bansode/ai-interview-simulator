import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';
import { 
  TrendingUp, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Cpu 
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock performance trends data
const trendData = [
  { name: 'Session 1', score: 62, gaze: 70 },
  { name: 'Session 2', score: 68, gaze: 75 },
  { name: 'Session 3', score: 71, gaze: 82 },
  { name: 'Session 4', score: 79, gaze: 80 },
  { name: 'Session 5', score: 84, gaze: 88 },
  { name: 'Session 6', score: 88, gaze: 92 },
];

// Mock skill improvement data
const skillData = [
  { subject: 'Python Core', initial: 65, recent: 88 },
  { subject: 'DB Sharding', initial: 50, recent: 72 },
  { subject: 'System Design', initial: 55, recent: 80 },
  { subject: 'Algorithms', initial: 60, recent: 82 },
  { subject: 'AI Models', initial: 70, recent: 90 },
];

const strongTopics = [
  { name: "FastAPI Routing", score: 92 },
  { name: "Git Workflow", score: 90 },
  { name: "JWT Cryptography", score: 88 },
  { name: "Web Audio recording", score: 85 }
];

const weakTopics = [
  { name: "Database Sharding", score: 55 },
  { name: "Thread Concurrency", score: 62 },
  { name: "Docker Orchestration", score: 64 },
  { name: "Memory Profiling", score: 68 }
];

export const Analytics: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Block */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Performance Analytics</h2>
        <p className="text-sm text-text-secondary mt-1">
          Review your mock interview historical trends, focus rates, and topic competencies.
        </p>
      </div>

      {/* Grid: Average Score Dashboard & Overall Performance Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Average Score Ring Card */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4"
          variants={cardVariants}
        >
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Average Session Score</h3>
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-36 h-36 transform -rotate-90">
              <circle 
                cx="72" 
                cy="72" 
                r="64" 
                className="stroke-bg-sec" 
                strokeWidth="10" 
                fill="transparent" 
              />
              <circle 
                cx="72" 
                cy="72" 
                r="64" 
                className="stroke-accent-primary" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * 78.6) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-text-primary">78.6%</span>
              <span className="text-[10px] text-accent-success font-semibold flex items-center gap-0.5">
                <TrendingUp size={10} /> +4.2% lift
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-secondary leading-normal max-w-[200px]">
            Your evaluation ratings are computed across your last 6 technical sessions.
          </p>
        </motion.div>

        {/* Categories Ratings Progress */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 lg:col-span-2 space-y-4"
          variants={cardVariants}
        >
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Award size={14} className="text-accent-primary" />
            <span>Category-wise Scoring Competency</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              { label: 'Technical Depth', score: 82, color: 'bg-accent-primary' },
              { label: 'Communication Clarity', score: 75, color: 'bg-accent-success' },
              { label: 'Grammar Accuracy', score: 80, color: 'bg-accent-warning' },
              { label: 'Confidence & Demeanor', score: 76, color: 'bg-accent-secondary' }
            ].map((cat, idx) => (
              <div key={idx} className="space-y-2 bg-bg-sec/30 border border-border-main/50 rounded-lg p-3.5">
                <div className="flex justify-between font-bold">
                  <span className="text-text-primary">{cat.label}</span>
                  <span className="text-accent-primary">{cat.score}%</span>
                </div>
                <div className="w-full bg-bg-sec rounded-full h-1.5 overflow-hidden">
                  <div className={`h-1.5 rounded-full ${cat.color}`} style={{ width: `${cat.score}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Grid: Performance Trend & Radar Skill maps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Trend Area Chart */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 space-y-4"
          variants={cardVariants}
        >
          <div>
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <TrendingUp size={14} className="text-accent-primary" />
              <span>Performance Trend</span>
            </h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Assessment and eye contact ratios over time.</p>
          </div>

          <div className="h-64 w-full text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gazeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }} 
                  labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
                />
                <Area type="monotone" name="Interview Score" dataKey="score" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                <Area type="monotone" name="Eye Contact Rate" dataKey="gaze" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#gazeColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Skill Improvement Radar Chart */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 space-y-4"
          variants={cardVariants}
        >
          <div>
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Cpu size={14} className="text-accent-primary" />
              <span>Skill Improvement Index</span>
            </h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Compares baseline ratings vs recent session outputs.</p>
          </div>

          <div className="h-64 w-full text-[10px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="80%" data={skillData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4B5563" />
                <Radar name="Initial Test" dataKey="initial" stroke="#6B7280" fill="#6B7280" fillOpacity={0.2} />
                <Radar name="Recent Session" dataKey="recent" stroke="#2563EB" fill="#2563EB" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }} 
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Grid: Strong Topics vs Weak Topics Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strong Topics Card */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 space-y-4"
          variants={cardVariants}
        >
          <div className="flex items-center gap-2 border-b border-border-main pb-2">
            <CheckCircle className="text-accent-success" size={16} />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Strong Topics (Score ≥ 80%)</h3>
          </div>
          <div className="space-y-3">
            {strongTopics.map((topic, i) => (
              <div key={i} className="flex justify-between items-center bg-accent-success/5 border border-accent-success/15 rounded-lg p-3 text-xs">
                <span className="font-semibold text-text-primary">{topic.name}</span>
                <span className="font-extrabold text-accent-success bg-accent-success/10 px-2.5 py-0.5 rounded-full">
                  {topic.score}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Weak Topics Card */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 space-y-4"
          variants={cardVariants}
        >
          <div className="flex items-center gap-2 border-b border-border-main pb-2">
            <AlertTriangle className="text-accent-warning" size={16} />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Weak Topics (Score &lt; 70%)</h3>
          </div>
          <div className="space-y-3">
            {weakTopics.map((topic, i) => (
              <div key={i} className="flex justify-between items-center bg-accent-error/5 border border-accent-error/15 rounded-lg p-3 text-xs">
                <span className="font-semibold text-text-primary">{topic.name}</span>
                <span className="font-extrabold text-accent-error bg-accent-error/10 px-2.5 py-0.5 rounded-full">
                  {topic.score}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};
