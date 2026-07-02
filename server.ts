import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import pptxgen from "pptxgenjs";
import { jsPDF } from "jspdf";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Ensure DB file exists
const DB_PATH = process.env.VERCEL
  ? path.join('/tmp', 'db.json')
  : path.join(process.cwd(), 'db.json');
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], presentations: [] }, null, 2));
}

// DB Helpers
function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { users: [], presentations: [] };
  }
}

function writeDB(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Initialize Gemini API
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    if (!geminiApiKey) {
      console.warn("GEMINI_API_KEY is not defined. AI features will fail or fall back.");
    }
    aiClient = new GoogleGenAI({
      apiKey: geminiApiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Retry policy with Exponential Backoff
async function callGeminiWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 1000): Promise<T> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini SDK] Attempt ${attempt} failed: ${errMsg}`);
      if (attempt < retries) {
        const sleepTime = delayMs * Math.pow(2, attempt - 1);
        console.log(`[Gemini SDK] Retrying in ${sleepTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
      }
    }
  }
  throw lastError;
}

// Local High-Fidelity Programmatic Fallbacks for absolute robustness under 503/Quota issues
function generateFallbackOutline(topic: string, count: number) {
  const slides = [];
  const words = topic.split(/\s+/).filter(Boolean);
  const titleTopic = words.map(w => w[0].toUpperCase() + w.substring(1)).join(' ');

  const templateTitles = [
    `Introduction to ${titleTopic}`,
    `Critical Challenges & Market Gaps`,
    `Our Visionary Solution`,
    `Core Architectural Elements`,
    `Strategic Implementation Path`,
    `Financial Outlook & Projected Growth`,
    `Real-world Use Cases & Applications`,
    `Risk Mitigation & Security Framework`,
    `Future Horizons & Scaling Strategy`,
    `Project Timeline & Operational Milestones`,
    `Marketing Strategy & Global Reach`,
    `Regulatory Compliance & Governance`,
    `Expected Impact & Performance Metrics`,
    `Research, Patents, & Scientific Context`,
    `Summary & Next Actions`
  ];

  const templateDescriptions = [
    `Set the stage for ${topic}, introducing the background history, relevance, and overall presentation agenda.`,
    `Analyze the primary problems, technical pain points, and current industry limitations regarding ${topic}.`,
    `Describe the conceptual framework, unique value propositions, and revolutionary advantages of our proposed system.`,
    `Provide a detailed blueprint, technical layouts, and procedural workflows of our ${topic} infrastructure.`,
    `Review the implementation roadmap, resource allocation strategies, and key milestones for successful deployment.`,
    `Analyze capital expenditures, estimated ROI, revenue generation plans, and future financial forecasts.`,
    `Demonstrate active case studies, integration vectors, and prototype validation testing in live settings.`,
    `Formulate risk control variables, industry guidelines, emergency backup scenarios, and audit frameworks.`,
    `Evaluate upcoming innovations, system optimization tracks, and long-term positioning maps.`,
    `Detail project scheduling, departmental ownership guidelines, and critical task sequences.`,
    `Discuss target audience acquisition, competitive advantages, and branding methodologies.`,
    `Synthesize regulatory frameworks, quality assurance guidelines, and legal prerequisites.`,
    `Establish analytical metrics, tracking protocols, and performance-based feedback loops.`,
    `Summarize research papers, patent references, empirical studies, and academic backing.`,
    `Wrap up key takeaways, answer pending stakeholder questions, and specify immediate next steps.`
  ];

  for (let i = 0; i < count; i++) {
    const title = templateTitles[i % templateTitles.length];
    const description = templateDescriptions[i % templateDescriptions.length];
    slides.push({ title, description });
  }

  return { slides };
}

function generateFallbackSlides(topic: string, theme: string, outline: any[]) {
  const slides = outline.map((item: any, idx: number) => {
    const title = item.title;
    const desc = item.description || "";

    const bulletPools = [
      [
        `Establishing a strong foundational baseline for the target system architecture.`,
        `Analyzing historic paradigms and current technological progress within the domain.`,
        `Identifying key strategic stakeholders and cross-functional team roles.`,
        `Defining clear objectives, boundaries, and critical success factors.`
      ],
      [
        `Identifying significant performance bottlenecks and system vulnerabilities.`,
        `Evaluating competitive alternatives and their associated operational limits.`,
        `Quantifying the economic and technical impacts of unresolved issues.`,
        `Formulating clear priority matrices to address urgent pain points.`
      ],
      [
        `Implementing a clean modular design tailored specifically to address core requirements.`,
        `Leveraging next-generation technologies to enhance throughput and reliability.`,
        `Ensuring backwards compatibility and smooth integration with legacy systems.`,
        `Highlighting our unique value proposition and scalability benefits.`
      ],
      [
        `Detailed engineering schematic of processing nodes and real-time synchronization channels.`,
        `Utilizing modern protocol standards to minimize overall latency.`,
        `Redundant backup arrays to secure core data integrity under peak stress.`,
        `Adopting best-practice guidelines for robust system architecture.`
      ],
      [
        `Executing the multi-phase deployment roadmap over the coming quarters.`,
        `Allocating specialized operational cohorts to execute target milestones.`,
        `Setting up rigorous staging and sandbox environments for testing.`,
        `Phased migration plans to eliminate runtime friction and user disruption.`
      ],
      [
        `Projecting strong revenue margins based on high-value premium modules.`,
        `Evaluating break-even timelines and capitalization requirements.`,
        `Optimizing resource utilization to achieve a lean, efficient cost structure.`,
        `Assessing long-term market size and scalable unit economics.`
      ]
    ];

    const selectedPool = bulletPools[idx % bulletPools.length];
    const bullets = [
      ...selectedPool,
      `Ensuring continuous performance tuning based on empirical validation.`
    ].slice(0, 3 + (idx % 2));

    const speakerNotes = `For this part of the presentation on "${topic}", we turn our attention directly to "${title}". As outlined, we must address the core concept that ${desc.toLowerCase().replace(/\.$/, '')}. This represents a key operational phase. We need to maintain strict quality metrics, coordinate with major integration partners, and closely monitor the performance indicators established in our baseline framework.`;

    const imagePrompt = `Detailed graphic visualizing ${title} for ${topic}, abstract sleek flat vector style, dark high contrast background, indigo and cyan accents`;

    let layout = "bullets";
    if (idx === 0) layout = "title";
    else if (idx === outline.length - 1) layout = "hero";
    else if (idx % 3 === 1) layout = "split";
    else if (idx % 3 === 2) layout = "quote";

    return {
      title,
      bullets,
      speakerNotes,
      imagePrompt,
      layout
    };
  });

  return { slides };
}

// API Routes

// Authentication Endpoints (Simulated Cookie/Session using custom headers & Local Storage verification)
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = readDB();
    const existingUser = db.users.find((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const newUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password, // Stored directly for demo/development simplicity
      name,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ user: userWithoutPassword, token: newUser.id });
  } catch (err: any) {
    console.error("Auth registration error:", err);
    return res.status(500).json({ error: "Internal registration error: " + (err.message || String(err)) });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = readDB();
    const user = db.users.find(
      (u: any) => u.email && u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, token: user.id });
  } catch (err: any) {
    console.error("Auth login error:", err);
    return res.status(500).json({ error: "Internal login error: " + (err.message || String(err)) });
  }
});

app.post("/api/auth/google", (req, res) => {
  try {
    const { email, name, googleId } = req.body || {};
    if (!email || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = readDB();
    let user = db.users.find((u: any) => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      user = {
        id: 'user_' + (googleId || Math.random().toString(36).substr(2, 9)),
        email: email.toLowerCase(),
        name,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      writeDB(db);
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, token: user.id });
  } catch (err: any) {
    console.error("Auth google error:", err);
    return res.status(500).json({ error: "Internal google sign-in error: " + (err.message || String(err)) });
  }
});

// Better Auth [...all] routes wildcards
app.post("/api/auth/*", (req, res) => {
  const fullPath = req.path;
  const action = fullPath.replace(/^\/api\/auth\//, "");
  const db = readDB();

  if (action === "sign-up" || action === "register") {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    const newUser = {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase(),
      password,
      name,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    writeDB(db);
    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({ user: userWithoutPassword, token: newUser.id, session: { user: userWithoutPassword } });
  }

  if (action === "sign-in" || action === "login") {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = db.users.find(
      (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, token: user.id, session: { user: userWithoutPassword } });
  }

  if (action === "sign-out" || action === "logout") {
    return res.json({ success: true, message: "Logged out successfully" });
  }

  if (action === "google") {
    const { email, name, googleId } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    let user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: 'user_' + (googleId || Math.random().toString(36).substr(2, 9)),
        email: email.toLowerCase(),
        name,
        createdAt: new Date().toISOString()
      };
      db.users.push(user);
      writeDB(db);
    }
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword, token: user.id, session: { user: userWithoutPassword } });
  }

  res.status(404).json({ error: `Auth action '${action}' not supported` });
});

app.get("/api/auth/*", (req, res) => {
  const fullPath = req.path;
  const action = fullPath.replace(/^\/api\/auth\//, "");

  if (action === "session" || action === "get-session") {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ session: null });
    }
    const userId = authHeader.replace("Bearer ", "");
    const db = readDB();
    const user = db.users.find((u: any) => u.id === userId);
    if (!user) {
      return res.status(401).json({ session: null });
    }
    const { password: _, ...userWithoutPassword } = user;
    return res.json({ session: { user: userWithoutPassword } });
  }

  res.status(404).json({ error: `Auth action '${action}' not supported` });
});

// Presentations Endpoints
app.get("/api/presentations", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(412).json({ error: "Unauthorized" });
  }

  const userId = authHeader.replace("Bearer ", "");
  const db = readDB();
  const userPresentations = db.presentations.filter((p: any) => p.userId === userId);
  res.json(userPresentations);
});

app.post("/api/presentations", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = authHeader.replace("Bearer ", "");
  const { topic, slideCount, theme, slides, status } = req.body;

  const db = readDB();
  const newPresentation = {
    id: 'pres_' + Math.random().toString(36).substr(2, 9),
    userId,
    topic: topic || "Untitled Presentation",
    slideCount: slideCount || 5,
    theme: theme || "modern",
    slides: slides || [],
    status: status || "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.presentations.push(newPresentation);
  writeDB(db);

  res.status(201).json(newPresentation);
});

app.get("/api/presentations/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const presentation = db.presentations.find((p: any) => p.id === id);

  if (!presentation) {
    return res.status(404).json({ error: "Presentation not found" });
  }

  res.json(presentation);
});

app.put("/api/presentations/:id", (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = authHeader.replace("Bearer ", "");
  const db = readDB();
  const index = db.presentations.findIndex((p: any) => p.id === id && p.userId === userId);

  if (index === -1) {
    return res.status(404).json({ error: "Presentation not found or unauthorized" });
  }

  const current = db.presentations[index];
  const updated = {
    ...current,
    ...req.body,
    id: current.id, // Keep original ID
    userId: current.userId, // Keep original owner
    updatedAt: new Date().toISOString()
  };

  db.presentations[index] = updated;
  writeDB(db);

  res.json(updated);
});

app.delete("/api/presentations/:id", (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = authHeader.replace("Bearer ", "");
  const db = readDB();
  const initialLength = db.presentations.length;
  db.presentations = db.presentations.filter((p: any) => !(p.id === id && p.userId === userId));

  if (db.presentations.length === initialLength) {
    return res.status(404).json({ error: "Presentation not found or unauthorized" });
  }

  writeDB(db);
  res.json({ success: true, message: "Presentation deleted" });
});

// AI endpoints proxying Gemini

app.post(["/api/generate-outline", "/api/generate/outline"], async (req, res) => {
  const { topic, context, slideCount } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const count = parseInt(slideCount) || 5;

  try {
    const ai = getAiClient();
    
    const prompt = `Generate a slide-by-slide structure/outline for a presentation about: "${topic}".
Additional details/instructions/context from the user: "${context || 'None'}".
The presentation MUST have exactly ${count} slides.
For each slide, produce:
- A clear, catchy, short title (string)
- A detailed description explaining the specific focus and main ideas of this slide (string)

Format the response strictly as a JSON object matching this schema:
{
  "slides": [
    { "title": "Slide Title", "description": "Slide Focus description" }
  ]
}`;

    const parsed = await callGeminiWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  },
                  required: ["title", "description"]
                }
              }
            },
            required: ["slides"]
          }
        }
      });

      const text = response.text || "";
      return JSON.parse(text);
    });

    res.json(parsed);

  } catch (err: any) {
    console.error("Outline generation error (Gemini failed, falling back gracefully):", err);
    try {
      const fallbackOutline = generateFallbackOutline(topic, count);
      console.log("[Outline Generator] Successfully generated high-fidelity fallback outline.");
      res.json(fallbackOutline);
    } catch (fallbackErr) {
      console.error("Fallback outline generation failed:", fallbackErr);
      res.status(500).json({ error: "Failed to compile presentation outline." });
    }
  }
});

app.post(["/api/generate-slides", "/api/generate/slides"], async (req, res) => {
  const { topic, theme, outline } = req.body;
  if (!topic || !outline || !Array.isArray(outline)) {
    return res.status(400).json({ error: "Missing topic or outline" });
  }

  try {
    const ai = getAiClient();
    const prompt = `Convert the following presentation outline about "${topic}" into a full set of polished slides.
Theme style selected: "${theme || 'modern'}".
Outline:
${JSON.stringify(outline)}

For each slide, expand the content into:
1. "title": A professional, catchy slide title.
2. "bullets": An array of 3 to 5 clear, informative, high-impact bullet points.
3. "speakerNotes": A robust paragraph of spoken script (speaker notes) matching the topic of this slide.
4. "imagePrompt": A highly detailed, descriptive text prompt for an AI image generator (describing the subject, composition, mood, and visual style matching the presentation theme).
5. "layout": Suggest an appropriate slide layout from this list: 'title' (for slide 1), 'split' (2-column content), 'bullets' (simple listed items), 'quote' (prominent single statement/insight), 'hero' (single massive emphasis point).

Ensure the response strictly complies with this JSON schema:
{
  "slides": [
    {
      "title": "Title here",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Script paragraph...",
      "imagePrompt": "A futuristic blueprint of a quantum computer with glowing emerald lines, minimalist tech layout, isometric 3D render, dark background",
      "layout": "split"
    }
  ]
}`;

    const parsed = await callGeminiWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    bullets: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    speakerNotes: { type: Type.STRING },
                    imagePrompt: { type: Type.STRING },
                    layout: {
                      type: Type.STRING,
                      enum: ["title", "split", "bullets", "quote", "hero"]
                    }
                  },
                  required: ["title", "bullets", "speakerNotes", "imagePrompt", "layout"]
                }
              }
            },
            required: ["slides"]
          }
        }
      });

      const text = response.text || "";
      return JSON.parse(text);
    });

    res.json(parsed);

  } catch (err: any) {
    console.error("Slides generation error (Gemini failed, falling back gracefully):", err);
    try {
      const fallbackSlides = generateFallbackSlides(topic, theme || 'modern', outline);
      console.log("[Slides Generator] Successfully generated high-fidelity fallback slides.");
      res.json(fallbackSlides);
    } catch (fallbackErr) {
      console.error("Fallback slides generation failed:", fallbackErr);
      res.status(500).json({ error: "Failed to compile final slides content." });
    }
  }
});

// Premium Curated Unsplash Image Pools for lightning-fast, guaranteed visual placeholders
const IMAGE_POOLS = {
  tech: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // circuit board
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", // digital code grid
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // abstract tech planet
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80", // tech dashboard
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", // cyber security
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80", // abstract sleek tech
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"  // workstation
  ],
  business: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80", // business charts
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", // office planning
    "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80", // meeting board
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80", // team working
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80", // modern glass skyscraper
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"  // corporate presenters
  ],
  science: [
    "https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=800&q=80", // science lab glassware
    "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80", // scientist equipment
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80", // healthcare medicine
    "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80", // dna model
    "https://images.unsplash.com/photo-1517817748493-49ec54a32465?auto=format&fit=crop&w=800&q=80"  // laboratory experiment
  ],
  education: [
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80", // studying books
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80", // books stack
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80", // digital reading
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80", // agenda planning
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80"  // writing study
  ],
  nature: [
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80", // misty landscape
    "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=800&q=80", // green trees pathway
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80", // mountains peaks
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // tropical beach
    "https://images.unsplash.com/photo-1472214222541-d510753a49fa?auto=format&fit=crop&w=800&q=80"  // serene landscape
  ],
  abstract: [
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80", // modern liquid art
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80", // fluid pastel colors
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80", // luxury dark gradient
    "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=800&q=80", // minimalist art backdrop
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80"  // clean abstract backdrop
  ]
};

function getCuratedImageUrl(prompt: string): string {
  const norm = prompt.toLowerCase();
  
  let category: keyof typeof IMAGE_POOLS = 'abstract';
  if (norm.match(/\b(tech|comput|ai|algorithm|artificial|neural|quantum|digital|server|software|internet|cyber|mobile|web|program|developer|code|coding)\b/)) {
    category = 'tech';
  } else if (norm.match(/\b(business|finance|money|startup|market|sale|deal|team|strategy|presentation|office|workplace|corporate|economy|chart|analysis|analytics|metric)\b/)) {
    category = 'business';
  } else if (norm.match(/\b(science|doctor|medical|medicine|laboratory|chemistry|physics|biology|dna|health|stethoscope|vaccine|clinical|hospital)\b/)) {
    category = 'science';
  } else if (norm.match(/\b(education|book|study|school|class|learn|calendar|plan|note|library|student|university|academic)\b/)) {
    category = 'education';
  } else if (norm.match(/\b(nature|space|forest|earth|green|eco|travel|mountain|ocean|weather|climate|environment|solar|energy|star|galaxy|astronomy)\b/)) {
    category = 'nature';
  }

  const pool = IMAGE_POOLS[category];
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

app.post(["/api/generate-image", "/api/generate/image"], async (req, res) => {
  const { prompt, aspectRatio } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const fallbackUrl = getCuratedImageUrl(prompt);

  try {
    const ai = getAiClient();
    if (!geminiApiKey || geminiApiKey === "MOCK_KEY") {
      // Prompt has no real API key, return the beautiful curated image instantly
      return res.json({ 
        imageUrl: fallbackUrl,
        isFallback: true
      });
    }

    // Try Gemini image generator (requires a paid API key)
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio || "16:9"
          }
        }
      });

      let base64Image = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          base64Image = part.inlineData.data;
          break;
        }
      }

      if (base64Image) {
        return res.json({
          imageUrl: `data:image/png;base64,${base64Image}`,
          isFallback: false
        });
      }
    } catch (imageGenError: any) {
      // Elegant, silent handling for expected free-tier quota exceptions
      console.log(`[Image Generator] Gemini API image gen quota/tier exceeded or model unsupported. Falling back gracefully to curated premium visuals.`);
    }

    // Fall back to the highly contextual premium curated image
    res.json({
      imageUrl: fallbackUrl,
      isFallback: true
    });

  } catch (err: any) {
    console.error("Image api error:", err);
    res.json({ imageUrl: fallbackUrl, isFallback: true });
  }
});

app.post("/api/generate/images/batch", async (req, res) => {
  const { slides, prompts } = req.body;
  
  let targetPrompts: { id: string; prompt: string }[] = [];
  
  if (Array.isArray(prompts)) {
    targetPrompts = prompts.map((p: string, idx: number) => ({ id: String(idx), prompt: p }));
  } else if (Array.isArray(slides)) {
    targetPrompts = slides.map((s: any) => ({ id: s.id || s.title || Math.random().toString(36).substr(2, 9), prompt: s.imagePrompt || s.title || "" }));
  } else {
    return res.status(400).json({ error: "Missing slides or prompts array" });
  }

  const results = [];
  
  for (const item of targetPrompts) {
    if (!item.prompt.trim()) {
      results.push({ id: item.id, imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80", isFallback: true });
      continue;
    }
    const fallbackUrl = getCuratedImageUrl(item.prompt);
    try {
      const ai = getAiClient();
      if (!geminiApiKey || geminiApiKey === "MOCK_KEY") {
        results.push({ id: item.id, imageUrl: fallbackUrl, isFallback: true });
        continue;
      }

      // Try Gemini image generator (requires a paid API key)
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: item.prompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        });

        let base64Image = null;
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            base64Image = part.inlineData.data;
            break;
          }
        }

        if (base64Image) {
          results.push({
            id: item.id,
            imageUrl: `data:image/png;base64,${base64Image}`,
            isFallback: false
          });
        } else {
          results.push({ id: item.id, imageUrl: fallbackUrl, isFallback: true });
        }
      } catch (imageGenError) {
        results.push({ id: item.id, imageUrl: fallbackUrl, isFallback: true });
      }
    } catch (err) {
      results.push({ id: item.id, imageUrl: fallbackUrl, isFallback: true });
    }
  }

  res.json({ images: results });
});

app.post("/api/export/pptx", async (req, res) => {
  const { presentation } = req.body;
  if (!presentation || !Array.isArray(presentation.slides)) {
    return res.status(400).json({ error: "Invalid presentation data" });
  }

  try {
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_16x9";
    
    const getThemeHexesLocal = (themeId: string) => {
      switch (themeId) {
        case 'professional':
          return { bg: "F8FAFC", text: "0F172A", accent: "475569", accentText: "0F172A" };
        case 'creative':
          return { bg: "FFF1F2", text: "1C1917", accent: "F43F5E", accentText: "F43F5E" };
        case 'elegant':
          return { bg: "022C22", text: "F5F5F4", accent: "F59E0B", accentText: "F59E0B" };
        case 'tech':
          return { bg: "09090B", text: "10B981", accent: "10B981", accentText: "10B981" };
        case 'modern':
        default:
          return { bg: "F8FAFC", text: "0F172A", accent: "4F46E5", accentText: "4F46E5" };
      }
    };

    const styles = getThemeHexesLocal(presentation.theme);
    pptx.title = presentation.topic;

    presentation.slides.forEach((slide: any, index: number) => {
      const pptxSlide = pptx.addSlide();
      pptxSlide.background = { fill: styles.bg };

      // Draw Slide Number
      pptxSlide.addText(`Slide ${index + 1} of ${presentation.slides.length}`, {
        x: 11.5,
        y: 0.3,
        w: 1.5,
        fontSize: 10,
        color: styles.accent,
        align: "right"
      });

      // Branding
      pptxSlide.addText("AuraSlides AI", {
        x: 0.5,
        y: 0.3,
        w: 4.0,
        fontSize: 12,
        bold: true,
        color: styles.accent
      });

      if (slide.layout === 'title' || index === 0) {
        pptxSlide.addText(slide.title, {
          x: 1.0,
          y: 2.0,
          w: 11.3,
          fontSize: 36,
          bold: true,
          color: styles.text,
          align: "center"
        });

        if (slide.bullets && slide.bullets.length > 0) {
          pptxSlide.addText(slide.bullets.join("\n\n"), {
            x: 1.5,
            y: 3.8,
            w: 10.3,
            fontSize: 16,
            color: styles.accentText,
            align: "center"
          });
        }
      } else if (slide.layout === 'split' && slide.imageUrl) {
        pptxSlide.addText(slide.title, {
          x: 0.5,
          y: 1.0,
          w: 12.3,
          fontSize: 28,
          bold: true,
          color: styles.text
        });

        try {
          if (slide.imageUrl.startsWith("data:")) {
            pptxSlide.addImage({
              data: slide.imageUrl,
              x: 0.5,
              y: 1.8,
              w: 5.5,
              h: 4.5
            });
          } else {
            pptxSlide.addImage({
              path: slide.imageUrl,
              x: 0.5,
              y: 1.8,
              w: 5.5,
              h: 4.5
            });
          }
        } catch (e) {
          pptxSlide.addShape(pptx.ShapeType.rect, {
            fill: { color: "E2E8F0" },
            x: 0.5,
            y: 1.8,
            w: 5.5,
            h: 4.5
          });
          pptxSlide.addText("[ Presentation Visual Image ]", {
            x: 0.5,
            y: 3.5,
            w: 5.5,
            fontSize: 14,
            align: "center",
            color: "64748B"
          });
        }

        const bulletsText = slide.bullets.map((b: string) => "• " + b).join("\n\n");
        pptxSlide.addText(bulletsText, {
          x: 6.5,
          y: 1.8,
          w: 6.3,
          fontSize: 14,
          color: styles.text
        });
      } else if (slide.layout === 'quote') {
        pptxSlide.addText(`“${slide.title}”`, {
          x: 1.0,
          y: 2.2,
          w: 11.3,
          fontSize: 26,
          italic: true,
          bold: true,
          color: styles.accentText,
          align: "center"
        });

        if (slide.bullets && slide.bullets.length > 0) {
          pptxSlide.addText(slide.bullets.join(" — "), {
            x: 1.5,
            y: 4.5,
            w: 10.3,
            fontSize: 14,
            color: styles.text,
            align: "center"
          });
        }
      } else {
        pptxSlide.addText(slide.title, {
          x: 0.5,
          y: 1.0,
          w: 12.3,
          fontSize: 28,
          bold: true,
          color: styles.text
        });

        const bulletsText = slide.bullets.map((b: string) => "• " + b).join("\n\n");
        pptxSlide.addText(bulletsText, {
          x: 0.5,
          y: 1.8,
          w: 12.3,
          fontSize: 16,
          color: styles.text
        });
      }

      if (slide.speakerNotes) {
        pptxSlide.addNotes(slide.speakerNotes);
      }
    });

    const buffer = await pptx.write("nodebuffer" as any);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(presentation.topic.replace(/\s+/g, '_'))}.pptx"`);
    res.send(buffer);
  } catch (err: any) {
    console.error("PPTX Server Export error:", err);
    res.status(500).json({ error: "Failed to export PPTX file on server." });
  }
});

app.post("/api/export/pdf", async (req, res) => {
  const { presentation } = req.body;
  if (!presentation || !Array.isArray(presentation.slides)) {
    return res.status(400).json({ error: "Invalid presentation data" });
  }

  try {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const isElegant = presentation.theme === 'elegant';
    const isTech = presentation.theme === 'tech';

    const rgbBg = isElegant ? [2, 44, 34] : isTech ? [9, 9, 11] : [248, 250, 252];
    const rgbText = isElegant || isTech ? [245, 245, 244] : [15, 23, 42];
    const rgbAccent = isElegant ? [245, 158, 11] : isTech ? [16, 185, 129] : [79, 70, 229];

    presentation.slides.forEach((slide: any, index: number) => {
      if (index > 0) {
        doc.addPage();
      }

      // Slide Background
      doc.setFillColor(rgbBg[0], rgbBg[1], rgbBg[2]);
      doc.rect(0, 0, 297, 210, "F");

      // Header branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
      doc.text("AuraSlides AI", 15, 15);

      // Slide tracker
      doc.text(`Slide ${index + 1} of ${presentation.slides.length}`, 282, 15, { align: "right" });

      // Dividers or subtle accent
      doc.setDrawColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
      doc.setLineWidth(0.3);
      doc.line(15, 18, 282, 18);

      if (slide.layout === 'title' || index === 0) {
        doc.setFontSize(28);
        doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
        const titleLines = doc.splitTextToSize(slide.title, 240);
        doc.text(titleLines, 148.5, 90, { align: "center" });

        if (slide.bullets && slide.bullets.length > 0) {
          doc.setFontSize(14);
          doc.setTextColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
          doc.text(slide.bullets.join("   •   "), 148.5, 130, { align: "center" });
        }
      } else if (slide.layout === 'split' && slide.imageUrl) {
        doc.setFontSize(22);
        doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
        doc.text(slide.title, 15, 30);

        doc.setFillColor(226, 232, 240);
        doc.rect(15, 38, 120, 145, "F");
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text("[ Visual Slide Image Included ]", 75, 110, { align: "center" });

        doc.setFontSize(13);
        doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
        let currentY = 45;
        slide.bullets.forEach((bullet: string) => {
          const bulletLines = doc.splitTextToSize("• " + bullet, 130);
          doc.text(bulletLines, 145, currentY);
          currentY += bulletLines.length * 7 + 5;
        });
      } else if (slide.layout === 'quote') {
        doc.setFont("helvetica", "oblique");
        doc.setFontSize(20);
        doc.setTextColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
        const quoteLines = doc.splitTextToSize(`“${slide.title}”`, 220);
        doc.text(quoteLines, 148.5, 95, { align: "center" });

        if (slide.bullets && slide.bullets.length > 0) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(13);
          doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
          doc.text(slide.bullets.join("  |  "), 148.5, 140, { align: "center" });
        }
      } else {
        doc.setFontSize(22);
        doc.setTextColor(rgbText[0], rgbText[1], rgbText[2]);
        doc.text(slide.title, 15, 30);

        doc.setFontSize(13);
        let currentY = 45;
        slide.bullets.forEach((bullet: string) => {
          const bulletLines = doc.splitTextToSize("• " + bullet, 250);
          doc.text(bulletLines, 15, currentY);
          currentY += bulletLines.length * 8 + 4;
        });
      }

      doc.setDrawColor(rgbAccent[0], rgbAccent[1], rgbAccent[2]);
      doc.line(15, 195, 282, 195);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("Generated by AuraSlides Presentation Suite", 15, 202);
    });

    const pdfOutput = doc.output("arraybuffer");
    const buffer = Buffer.from(pdfOutput);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(presentation.topic.replace(/\s+/g, '_'))}.pdf"`);
    res.send(buffer);
  } catch (err: any) {
    console.error("PDF Server Export error:", err);
    res.status(500).json({ error: "Failed to export PDF file on server." });
  }
});

app.post("/api/export/share", (req, res) => {
  const { id, presentationId } = req.body;
  const targetId = presentationId || id;
  if (!targetId) {
    return res.status(400).json({ error: "Presentation ID is required" });
  }

  const db = readDB();
  const index = db.presentations.findIndex((p: any) => p.id === targetId);
  if (index === -1) {
    return res.status(404).json({ error: "Presentation not found" });
  }

  db.presentations[index].status = "public";
  db.presentations[index].updatedAt = new Date().toISOString();
  writeDB(db);

  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.get('host');
  const shareUrl = `${protocol}://${host}/share/view/${targetId}`;

  res.json({ shareUrl, success: true });
});

// Catch-all route for any undefined /api/* endpoints to ensure they always return JSON instead of falling through to HTML index.html
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API endpoint '${req.method} ${req.path}' not found.` });
});

// Global JSON Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Global Error Handler]", err);
  res.status(err?.status || 500).json({
    error: err?.message || "A severe internal server-side error occurred."
  });
});


// Serve static assets and Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AuraSlides] Server running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;
