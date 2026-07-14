import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Award, 
  Clock, 
  Activity, 
  UploadCloud, 
  Calendar,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  FileCheck,
  ChevronRight,
  ArrowUpRight,
  AlertCircle,
  Briefcase,
  GraduationCap,
  FolderCog,
  ListTodo
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const analyticsData = [
  { name: 'Session 1', Score: 68, Benchmark: 70 },
  { name: 'Session 2', Score: 74, Benchmark: 70 },
  { name: 'Session 3', Score: 71, Benchmark: 70 },
  { name: 'Session 4', Score: 82, Benchmark: 72 },
  { name: 'Session 5', Score: 79, Benchmark: 72 },
  { name: 'Session 6', Score: 88, Benchmark: 75 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Structured Resume Fields
  const [skills, setSkills] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [education, setEducation] = useState<string[]>([]);
  const [experience, setExperience] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [, setCertifications] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'tech' | 'exp' | 'proj' | 'edu'>('tech');

  const populateStructuredResume = (data: any) => {
    setResumeName(data.filename);
    setSkills(data.skills || []);
    setProjects(data.projects || []);
    setEducation(data.education || []);
    setExperience(data.experience || []);
    setTechnologies(data.technologies || []);
    setCertifications(data.certifications || []);
  };

  // Check if user has already uploaded a resume on mount
  useEffect(() => {
    const fetchExistingResume = async () => {
      try {
        const response = await api.get('/users/resume');
        populateStructuredResume(response.data);
        setUploadSuccess(true);
      } catch (err) {
        // Ignore 404s since it just means they haven't uploaded one yet
      }
    };
    fetchExistingResume();
  }, []);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadSuccess(false);
    setErrorMsg(null);
    setResumeName(file.name);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/users/resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      populateStructuredResume(response.data);
      setUploadSuccess(true);
    } catch (err: any) {
      console.error(err);
      const detail = err.response?.data?.detail || 'Failed to upload and parse resume.';
      setErrorMsg(detail);
      setResumeName(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearResume = () => {
    setUploadSuccess(false);
    setResumeName(null);
    setSkills([]);
    setProjects([]);
    setEducation([]);
    setExperience([]);
    setTechnologies([]);
    setCertifications([]);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">System Console</h1>
          <p className="text-text-secondary text-sm mt-1">Practice mock interviews, upload resumes, and review performance analytics.</p>
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-accent-primary/25 cursor-pointer text-sm w-fit"
        >
          <Play size={14} fill="white" />
          <span>Launch AI Simulator</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Total Interviews', value: '18 Completed', trend: '+4 this week', icon: Activity, color: 'text-accent-primary', bg: 'bg-accent-primary/10' },
          { title: 'Average Evaluation Score', value: '81.4%', trend: '+3.2% vs benchmark', icon: Award, color: 'text-accent-success', bg: 'bg-accent-success/10' },
          { title: 'Practice Duration', value: '8.5 Hours', trend: '5 active days', icon: Clock, color: 'text-accent-warning', bg: 'bg-accent-warning/10' }
        ].map((metric, i) => (
          <motion.div 
            key={i} 
            className="bg-bg-card border border-border-main rounded-xl p-6 flex flex-col justify-between hover:border-border-main/80 transition-colors"
            variants={itemVariants}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{metric.title}</span>
              <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                <metric.icon size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-2xl font-bold text-text-primary">{metric.value}</h3>
              <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                <TrendingUp size={12} className="text-accent-success" />
                <span className="text-accent-success font-medium">{metric.trend.split(' ')[0]}</span>
                <span>{metric.trend.substring(metric.trend.indexOf(' ') + 1)}</span>
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Graph & Resume Upload Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Performance Graph */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 lg:col-span-2 flex flex-col justify-between"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-text-primary">Performance Trend</h3>
              <p className="text-xs text-text-secondary mt-0.5">Mock evaluation results over the last 6 simulations.</p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2.5 py-1 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} />
                <YAxis stroke="#9CA3AF" domain={[0, 100]} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Area type="monotone" dataKey="Score" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                <Area type="monotone" dataKey="Benchmark" stroke="#9CA3AF" strokeWidth={1} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Resume Manager Card */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 flex flex-col justify-between"
          variants={itemVariants}
        >
          <div>
            <h3 className="text-base font-bold text-text-primary">Resume Parsing</h3>
            <p className="text-xs text-text-secondary mt-0.5">Upload your PDF resume. AI will tailor questions to your experiences.</p>
          </div>

          {/* Upload widget */}
          <div className="my-6 flex-1 flex flex-col justify-center">
            {errorMsg && (
              <div className="alert alert-error mb-3 py-2 px-3 text-[10px] gap-1.5">
                <AlertCircle size={12} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {!uploadSuccess ? (
              <label className="border-2 border-dashed border-border-main hover:border-accent-primary/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-bg-sec/30 min-h-[180px]">
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={handleResumeUpload}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
                    <span className="text-xs text-text-secondary">Extracting structured fields...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center gap-2">
                    <UploadCloud className="text-text-secondary mb-2" size={32} />
                    <span className="text-xs font-semibold text-text-primary">Click to upload resume</span>
                    <span className="text-[10px] text-text-muted">PDF files only (Max 5MB)</span>
                  </div>
                )}
              </label>
            ) : (
              <motion.div 
                className="bg-bg-sec/50 border border-border-main/50 rounded-xl p-4 flex flex-col min-h-[220px]"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="flex items-center justify-between border-b border-border-main/40 pb-2 mb-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck size={16} className="text-accent-success flex-shrink-0" />
                    <span className="text-[11px] font-bold text-text-primary truncate max-w-[120px]">{resumeName}</span>
                  </div>
                  <button 
                    onClick={clearResume}
                    className="text-[9px] text-accent-error hover:underline"
                  >
                    Clear File
                  </button>
                </div>

                {/* Sub tabs for structured content */}
                <div className="flex justify-between border-b border-border-main/40 mb-3 text-[9px] font-semibold text-text-secondary">
                  {[
                    { key: 'tech', label: 'Tech' },
                    { key: 'exp', label: 'Experience' },
                    { key: 'proj', label: 'Projects' },
                    { key: 'edu', label: 'Education' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`pb-1 px-1 transition-all ${
                        activeTab === tab.key 
                          ? 'text-accent-primary border-b border-accent-primary font-bold' 
                          : 'hover:text-text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab contents */}
                <div className="flex-1 overflow-y-auto max-h-28 text-[10px] text-text-secondary leading-relaxed pr-1">
                  {activeTab === 'tech' && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {technologies.length > 0 ? (
                          technologies.map((t, i) => (
                            <span key={i} className="text-[8px] bg-accent-primary/10 text-accent-primary border border-accent-primary/20 px-2 py-0.5 rounded-full font-bold">
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="text-text-muted italic">No parsed technologies found.</span>
                        )}
                      </div>
                      
                      {skills.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[8px] uppercase tracking-wider font-bold text-text-primary mb-1 flex items-center gap-1">
                            <ListTodo size={8} />
                            <span>Skills parsed</span>
                          </p>
                          <ul className="list-disc pl-3 text-[9px] space-y-1">
                            {skills.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'exp' && (
                    <ul className="space-y-2">
                      {experience.length > 0 ? (
                        experience.map((e, i) => (
                          <li key={i} className="flex gap-2 items-start border-l border-accent-primary/30 pl-2">
                            <Briefcase size={10} className="text-accent-primary flex-shrink-0 mt-0.5" />
                            <span>{e}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-text-muted italic">No work experience blocks found.</li>
                      )}
                    </ul>
                  )}

                  {activeTab === 'proj' && (
                    <ul className="space-y-2">
                      {projects.length > 0 ? (
                        projects.map((p, i) => (
                          <li key={i} className="flex gap-2 items-start border-l border-accent-secondary/30 pl-2">
                            <FolderCog size={10} className="text-accent-secondary flex-shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-text-muted italic">No structured projects detected.</li>
                      )}
                    </ul>
                  )}

                  {activeTab === 'edu' && (
                    <ul className="space-y-2">
                      {education.length > 0 ? (
                        education.map((edu, i) => (
                          <li key={i} className="flex gap-2 items-start border-l border-accent-success/30 pl-2">
                            <GraduationCap size={10} className="text-accent-success flex-shrink-0 mt-0.5" />
                            <span>{edu}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-text-muted italic">No educational records parsed.</li>
                      )}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-text-secondary bg-bg-sec p-3 rounded-lg border border-border-main/50">
            <BrainCircuit size={14} className="text-accent-primary flex-shrink-0" />
            <span>AI automatically parses credentials, skills, and projects for mock scenarios.</span>
          </div>
        </motion.div>
      </div>

      {/* Recent Interviews & Upcoming Practice Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Interviews list */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 lg:col-span-2"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-text-primary">Recent Interviews</h3>
              <p className="text-xs text-text-secondary mt-0.5">Logs of your completed mock sessions.</p>
            </div>
            <button className="text-xs text-accent-primary hover:underline flex items-center gap-1">
              <span>View all logs</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-main/60 text-text-secondary pb-3">
                  <th className="font-semibold pb-3">Role / Topic</th>
                  <th className="font-semibold pb-3">Evaluation Score</th>
                  <th className="font-semibold pb-3">Status</th>
                  <th className="font-semibold pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main/30">
                {[
                  { role: 'Backend Engineer', topic: 'Redis Sharding & PostgreSQL optimization', score: '88%', status: 'Proficient', date: 'Yesterday', statusColor: 'text-accent-success bg-accent-success/10' },
                  { role: 'System Design Mock', topic: 'Rate Limiter & CDN Architecture', score: '79%', status: 'Intermediate', date: 'July 12, 2026', statusColor: 'text-accent-primary bg-accent-primary/10' },
                  { role: 'Frontend Architect', topic: 'React Fiber & Custom Hooks state', score: '82%', status: 'Proficient', date: 'July 10, 2026', statusColor: 'text-accent-success bg-accent-success/10' },
                  { role: 'Behavioral Round', topic: 'STAR Method & Conflict Management', score: '74%', status: 'Needs Review', date: 'July 07, 2026', statusColor: 'text-accent-warning bg-accent-warning/10' }
                ].map((item, idx) => (
                  <tr key={idx} className="group hover:bg-bg-sec/20 transition-all">
                    <td className="py-4 font-bold text-text-primary">
                      <div>
                        <p>{item.role}</p>
                        <p className="text-[10px] text-text-secondary font-normal mt-0.5">{item.topic}</p>
                      </div>
                    </td>
                    <td className="py-4 text-text-primary font-bold text-sm">{item.score}</td>
                    <td className="py-4">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 text-text-secondary text-right">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Upcoming Practice Sessions */}
        <motion.div 
          className="bg-bg-card border border-border-main rounded-xl p-6 flex flex-col justify-between"
          variants={itemVariants}
        >
          <div>
            <h3 className="text-base font-bold text-text-primary">Upcoming Practice</h3>
            <p className="text-xs text-text-secondary mt-0.5">Your scheduled preparations and curriculums.</p>
          </div>

          <div className="my-6 space-y-4">
            {[
              { topic: 'System Design: Redis Rate Limiting', type: 'Technical coding workspace', date: 'Today, 2:00 PM', timeBadge: 'Today' },
              { topic: 'Data Structures: Tree Traversals', type: 'Live whiteboard simulation', date: 'July 16, 2:00 PM', timeBadge: 'July 16' }
            ].map((practice, idx) => (
              <div 
                key={idx}
                className="flex items-start justify-between p-3.5 rounded-xl border border-border-main/60 bg-bg-sec/30 hover:border-accent-primary/40 transition-all"
              >
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                    {practice.type}
                  </span>
                  <h4 className="text-xs font-bold text-text-primary pt-1">{practice.topic}</h4>
                  <p className="text-[10px] text-text-secondary flex items-center gap-1 mt-1.5">
                    <Calendar size={12} className="text-accent-warning" />
                    <span>{practice.date}</span>
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/chat')}
                  className="p-1.5 rounded-lg bg-bg-sec hover:bg-accent-primary hover:text-white text-text-secondary transition-all cursor-pointer"
                  title="Start Practice Now"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-bg-sec p-3.5 rounded-lg border border-border-main/50 flex gap-2 text-[10px] text-text-secondary">
            <Sparkles size={14} className="text-accent-warning flex-shrink-0 mt-0.5" />
            <span>Select customizable topics, parameters, and difficulty scales inside Configuration Settings.</span>
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};
