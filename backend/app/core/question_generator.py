import random
from typing import List, Dict, Any, Optional

# Curated Technical Question Bank by Role & Experience Level
TECH_QUESTION_BANK: Dict[str, Dict[str, List[str]]] = {
    "Software Engineer": {
        "Beginner": [
            "Can you explain the difference between a stack and a queue, and give a real-world example of each?",
            "What is the time complexity of searching in a binary search tree in the worst case, and how does it compare to an AVL tree?",
            "How does recursion work, and what is a stack overflow error?",
            "What is the difference between SQL and NoSQL databases, and when would you choose one over the other?"
        ],
        "Intermediate": [
            "How do indexes speed up search queries in relational databases, and what are the overhead costs of indexing?",
            "Can you explain the difference between process and thread? How do they communicate, and what is a race condition?",
            "How would you design a thread-safe singleton pattern in a multithreaded application?",
            "What are the SOLID principles of object-oriented design? Can you give an example of the Dependency Inversion Principle?"
        ],
        "Expert": [
            "Describe how garbage collection works in modern runtimes (like Java JVM or Python V8). What are generational garbage collection strategies?",
            "How would you design a distributed cache system? Explain cache invalidation strategies (write-through, write-behind, eviction policies like LRU).",
            "What is the CAP theorem? How does it influence the architecture of databases like Cassandra vs PostgreSQL in a distributed setting?",
            "Explain how message brokers (like Kafka or RabbitMQ) handle backpressure and guarantee message delivery ordering."
        ],
        "Staff": [
            "How would you architect a globally distributed real-world messaging system with sub-second latency, dealing with split-brain scenarios and data replication limits?",
            "Explain the design trade-offs between monolithic database sharding vs a microservices architecture with distributed transactions (Saga pattern, 2-Phase Commit).",
            "How do you establish system-wide reliability, chaos engineering guidelines, and failover architectures across multiple cloud regions?",
            "Walk through the process of auditing a legacy software architecture, identifying bottlenecks, and executing a zero-downtime migration strategy."
        ]
    },
    "Python Developer": {
        "Beginner": [
            "What is the difference between list and tuple in Python? When would you use one over the other?",
            "How does memory management work in Python? What is reference counting and the garbage collector?",
            "What are Python decorators, and how would you write a simple decorator to log execution times?",
            "What is the difference between deepcopy and shallowcopy in Python?"
        ],
        "Intermediate": [
            "Explain Python's Global Interpreter Lock (GIL). How does it affect CPU-bound and I/O-bound multi-threading tasks?",
            "What are generators and iterators in Python? What is the difference between yield and return?",
            "How does Python's async syntax (asyncio) operate under the hood compared to multi-threading?",
            "What are metaclasses in Python? Can you describe a case where you would need to use one?"
        ],
        "Expert": [
            "How does Python manage object allocations using PyMalloc? How would you profile and fix a memory leak in a large daemon process?",
            "Explain the internals of FastAPI's dependency injection system and how it integrates with async databases.",
            "How do you design a high-throughput async worker pool in Python using asyncio and multiprocessing libraries?",
            "What is the difference between static typing (using Mypy/typing) and runtime duck-typing? How do you scale type safety in a large Python repo?"
        ],
        "Staff": [
            "How would you design a distributed Python microservice chassis (including custom loggers, auth interceptors, and database connections) to be shared across 50 development teams?",
            "Walk through the architectural trade-offs of using Python for high-performance API gateways. When does Python become the bottleneck and how do you mitigate it?",
            "How would you execute python application profiling, C-extension optimization (Cython/Pybind), and async event loop tuning under load?",
            "Describe the architecture of a custom async framework built on top of uvloop, explaining transaction boundaries and connection pool lifespans."
        ]
    },
    "Data Scientist": {
        "Beginner": [
            "What is the difference between supervised and unsupervised learning? Can you give examples of each?",
            "How do you handle missing values or outliers in a dataset before feeding it to a model?",
            "Can you explain the difference between overfitting and underfitting, and how to detect them?",
            "What is the difference between precision and recall? What is the F1-Score?"
        ],
        "Intermediate": [
            "Explain the mathematical difference between Ridge (L2) and Lasso (L1) regularization. How do they affect model weights?",
            "What is the bias-variance trade-off? How does ensemble learning (like Random Forest or Gradient Boosting) mitigate bias and variance?",
            "How does the K-Means clustering algorithm work? How do you choose the optimal number of clusters (Elbow method, Silhouette score)?",
            "What is cross-validation? Why is stratified K-fold cross-validation preferred for imbalanced datasets?"
        ],
        "Expert": [
            "How does Gradient Boosting (e.g. XGBoost or LightGBM) calculate tree splits mathematically? What is the role of the loss function Hessian?",
            "Describe feature engineering techniques for high-cardinality categorical variables (Target encoding, Hash trick, Embeddings).",
            "How would you design a recommendation engine for a streaming platform? Explain collaborative filtering vs content-based approaches and vector indexing.",
            "Explain the difference between bagging, boosting, and stacking. When would you use stacking, and how do you prevent data leakage during training?"
        ],
        "Staff": [
            "How would you design a corporate ML platform that automates feature stores, data drift detection, model retraining, and real-time model serving at scale?",
            "Walk through the mathematical formulation and optimization challenges of training models with millions of samples under severe label imbalance (e.g. fraud detection).",
            "How do you establish A/B testing frameworks for ML features, accounting for network effects, user interference, and sample size calculations?",
            "How would you lead a team to research, formulate, and deploy a custom neural model that replaces a complex rule-based system, justifying business ROI?"
        ]
    },
    "AI Engineer": {
        "Beginner": [
            "What is a neural network activation function, and why is ReLU preferred over Sigmoid in deep networks?",
            "Can you explain the process of backpropagation and gradient descent in neural networks?",
            "What is a convolutional neural network (CNN), and how do pooling layers work?",
            "What is a Vector Database (like Pinecone or Milvus), and what is it used for in AI applications?"
        ],
        "Intermediate": [
            "How does the self-attention mechanism work in Transformer models? What are query, key, and value vectors?",
            "Explain Retrieval-Augmented Generation (RAG). How does it improve LLM accuracy, and what are the main components of a RAG pipeline?",
            "What is the vanishing gradient problem? How do architectures like ResNet (skip connections) or LSTM mitigate it?",
            "What is fine-tuning (e.g. LoRA/QLoRA) vs prompting? When would you choose one over the other?"
        ],
        "Expert": [
            "Explain RLHF (Reinforcement Learning from Human Feedback) and how PPO (Proximal Policy Optimization) updates language model weights.",
            "How would you optimize LLM inference speed? Describe techniques like quantization (INT8/FP4), KV caching, and FlashAttention.",
            "How do you build a multi-agent AI system where agents orchestrate tool usage and reason sequentially? Explain the ReAct framework.",
            "Describe the architecture of a custom vector search pipeline, including sparse-dense hybrid retrieval and cross-encoder re-ranking."
        ],
        "Staff": [
            "How would you design a scalable infrastructure to train and serve a 70B parameter LLM, distributing weights across multiple GPU nodes (tensor vs pipeline parallelism)?",
            "Walk through the design of an enterprise AI assistant dealing with prompt injection attacks, PI filtering, dynamic tool schema mapping, and hallucination guardrails.",
            "How would you architect a low-latency real-time video or audio processing pipeline integrating diffusion models or speech-to-text models on edge devices?",
            "How do you design validation frameworks to evaluate LLM output quality, alignment, and truthfulness for high-risk applications (medical/financial)?"
        ]
    },
    "Full Stack Developer": {
        "Beginner": [
            "What is the DOM in web browsers? How does it differ from React's Virtual DOM?",
            "What is the difference between client-side rendering (CSR) and server-side rendering (SSR)?",
            "What are REST APIs? What are the key HTTP methods (GET, POST, PUT, DELETE) and status codes (200, 201, 400, 401, 500)?",
            "How does CSS Flexbox differ from Grid? When would you use one over the other?"
        ],
        "Intermediate": [
            "Explain browser CORS (Cross-Origin Resource Sharing). How does the preflight request work, and how do you resolve CORS errors on the backend?",
            "What are web sockets? How do they establish a real-time connection, and how do they compare to Server-Sent Events (SSE)?",
            "How does React manage state rendering? What is the role of hooks (useEffect dependency arrays, useMemo, useCallback)?",
            "How would you optimize the load time of a heavy web application? Describe bundling, code splitting, lazy loading, and CDN caching."
        ],
        "Expert": [
            "Explain React's reconciliation algorithm and concurrent rendering (Suspense, transitions) introduced in React 18.",
            "How do you handle state synchronization between the frontend cache (like React Query or Redux RTK) and database records?",
            "Explain session-based auth vs JWT auth. How do you securely store tokens in browsers to prevent XSS and CSRF attacks?",
            "How would you design a real-time collaborative document editor (like Google Docs) using CRDTs or Operational Transformation (OT) over WebSockets?"
        ],
        "Staff": [
            "How would you architect a monorepo system supporting multiple frontend web apps and backend services shared across 10 teams, ensuring fast CI/CD pipelines?",
            "Walk through the design of a globally distributed SaaS platform, covering CDN edge routing, SSR server deployment, database replication, and geo-load balancing.",
            "How do you establish standard security guidelines (WAF, rate limiting, encryption at rest, secure browser storage) for a high-risk checkout frontend?",
            "Describe the architecture of a micro-frontend setup, explaining how compile-time vs run-time integration affects package sizing and deployment orchestration."
        ]
    }
}

# Curated Behavioral Questions by Experience Level
BEHAVIORAL_QUESTION_BANK: Dict[str, List[str]] = {
    "Beginner": [
        "Tell me about a time you had a disagreement with a peer on a project. How did you handle it and what was the outcome?",
        "Can you describe a time you made a mistake on a school or work project? What did you do to fix it, and what did you learn?",
        "How do you manage your time when you have multiple deadlines or assignments due at once?"
    ],
    "Intermediate": [
        "Tell me about a time you had to adapt to a major change in project scope or requirements. How did you pivot?",
        "Describe a situation where you had to work with a team member who was not contributing effectively. How did you address the issue?",
        "Can you share an experience where you had to explain a complex technical concept to a non-technical stakeholder?"
    ],
    "Expert": [
        "Tell me about a time you had to make a critical technical decision with limited information or tight deadlines. What was your process?",
        "Describe a time you proposed a major architectural change or tool migration to your team. How did you gain alignment and manage the risk?",
        "Tell me about a situation where a production system failed under your watch. How did you troubleshoot, communicate, and prevent it from recurring?"
    ],
    "Staff": [
        "Describe a time you mentored a junior engineer who was struggling, helping them grow into a high performer. What was your strategy?",
        "Tell me about a time you had to align three different engineering teams with conflicting priorities on a single technical vision. How did you resolve the deadlock?",
        "Walk through a situation where you had to decline a critical feature request from product management due to engineering constraints. How did you negotiate?"
    ]
}

# Templates for Personalized Questions
TECH_PERSONALIZED_TEMPLATES = [
    "Your resume highlights experience with **{tech}**. Can you explain how you utilized it in your work, and what technical challenges you had to overcome?",
    "You listed **{tech}** in your skillset. From a performance and scalability standpoint, what are the primary trade-offs of using {tech}?",
    "Given your background in **{tech}**, how would you design an optimization plan for a service relying heavily on it?"
]

PROJECT_PERSONALIZED_TEMPLATES = [
    "In your resume, you mention working on the project '**{project}**'. Can you walk me through the architecture and your specific contributions?",
    "Regarding your project '**{project}**', if you had to rewrite it today to support 100x the traffic, what changes would you make to the design?",
    "I see you completed the project '**{project}**'. What was the most complex technical bug or design bottleneck you encountered, and how did you resolve it?"
]

def generate_questions(role: str, experience_level: str, resume_data: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Generates 10 personalized mock interview questions based on:
    - Target Role (Software Engineer, Python Developer, Data Scientist, AI Engineer, Full Stack Developer)
    - Experience Level (Beginner, Intermediate, Expert, Staff)
    - Resume details (technologies, projects, experience list)
    """
    questions: List[Dict[str, Any]] = []
    q_id = 1
    
    # Extract details from resume
    technologies = resume_data.get("technologies", []) if resume_data else []
    projects = resume_data.get("projects", []) if resume_data else []
    experience = resume_data.get("experience", []) if resume_data else []
    
    # 1. Generate Personalized Technology Questions (Max 3)
    used_tech = []
    if technologies:
        # Sample up to 3 technologies
        sampled_tech = random.sample(technologies, min(3, len(technologies)))
        for tech in sampled_tech:
            template = random.choice(TECH_PERSONALIZED_TEMPLATES)
            questions.append({
                "id": q_id,
                "text": template.format(tech=tech),
                "category": "Personalized Technology"
            })
            q_id += 1
            used_tech.append(tech)
            
    # 2. Generate Personalized Project/Experience Questions (Max 3)
    used_projects = []
    if projects:
        # Sample up to 2 projects
        sampled_proj = random.sample(projects, min(2, len(projects)))
        for proj in sampled_proj:
            # Clean project name if it contains bullets
            proj_name = proj.split("-")[0].split(":")[0].strip()
            # If name is too long, truncate it
            if len(proj_name) > 60:
                proj_name = proj_name[:60] + "..."
            template = random.choice(PROJECT_PERSONALIZED_TEMPLATES)
            questions.append({
                "id": q_id,
                "text": template.format(project=proj_name),
                "category": "Personalized Project"
            })
            q_id += 1
            used_projects.append(proj)
            
    if len(questions) < 5 and experience:
        # If we didn't have enough projects, sample experience description
        sampled_exp = random.choice(experience)
        exp_clean = sampled_exp.split("-")[0].strip()
        if len(exp_clean) > 80:
            exp_clean = exp_clean[:80] + "..."
        questions.append({
            "id": q_id,
            "text": f"Your work experience mentions: '{exp_clean}'. Can you explain the engineering challenges you faced in this role?",
            "category": "Personalized Experience"
        })
        q_id += 1

    # 3. Pull Core Role-Specific Technical Questions
    role_db = TECH_QUESTION_BANK.get(role, TECH_QUESTION_BANK["Software Engineer"])
    role_questions = role_db.get(experience_level, role_db["Intermediate"])
    
    # Determine how many more tech questions we need to hit a solid balance
    # Typically we want at least 3-4 core technical questions
    needed_core_tech = max(2, 6 - len(questions))
    sampled_core_tech = random.sample(role_questions, min(needed_core_tech, len(role_questions)))
    for q_text in sampled_core_tech:
        questions.append({
            "id": q_id,
            "text": q_text,
            "category": "Core Technical"
        })
        q_id += 1
        
    # 4. Pull Behavioral Questions
    behavioral_db = BEHAVIORAL_QUESTION_BANK.get(experience_level, BEHAVIORAL_QUESTION_BANK["Intermediate"])
    needed_behavioral = 10 - len(questions)  # Pad to exactly 10 questions
    sampled_behavioral = random.sample(behavioral_db, min(needed_behavioral, len(behavioral_db)))
    for q_text in sampled_behavioral:
        questions.append({
            "id": q_id,
            "text": q_text,
            "category": "Behavioral (STAR Method)"
        })
        q_id += 1
        
    # 5. Fallback Padding if still under 10 (highly unlikely, but safe guard)
    while len(questions) < 10:
        questions.append({
            "id": q_id,
            "text": f"Describe a technical problem you solved recently and the system design principles you applied.",
            "category": "General Technical"
        })
        q_id += 1
        
    # Sort by ID and return exactly 10 questions
    return questions[:10]
