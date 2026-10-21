import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.use(express.json({ limit: '20mb' }));

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper: build fallback tutor response when API key is not configured or network offline
function getFallbackDoubtResponse(question: string, subject: string = 'physics', language: string = 'english'): string {
  const isHinglish = language === 'hinglish';
  return isHinglish
    ? `### 🌟 StudyMate AI Step-by-Step Solution

**Doubt:** "${question}"
**Subject:** ${subject.toUpperCase()}

---

#### 1. Di gayi jankari (Given Information):
- Yahan hum basic principles apply kar rahe hain.
- Pehle given values aur units ko note kar lete hain.

#### 2. Concept & Formula:
- Ye concept NCERT standard curriculum se related hai.
- Formula: $v = u + at$ ya $F = ma$ (depending on scenario).

#### 3. Step-by-Step Solution:
- **Step 1:** Di gayi values ko standard SI units mein likhein.
- **Step 2:** Sahi formula select karein aur values substitute karein.
- **Step 3:** Step-by-step calculate karein bina jaldbazi ke. Calculation clear honi chahiye.

#### 4. Final Answer:
- Sahi calculation ke baad final answer SI units ke sath highlight karein.

#### 💡 Pro Exam Tip (CBSE/Board Special):
- Boards mein step marking hoti hai! Formula likhne ka 0.5 ya 1 mark milta hai, isliye formula aur units kabhi mat bhoolna.`
    : `### 🌟 StudyMate AI Step-by-Step Solution

**Question:** "${question}"
**Subject:** ${subject.toUpperCase()}

---

#### 1. Given Information:
- Review the given variables and identify what needs to be determined.
- Ensure all parameters are in compatible standard SI units.

#### 2. Key Concept & Formula:
- Connect the problem to the fundamental law or definition.
- Always state the governing equation explicitly before substituting numbers.

#### 3. Step-by-Step Derivation & Calculation:
- **Step 1:** State knowns and unknowns clearly.
- **Step 2:** Substitute values with respective units.
- **Step 3:** Simplify algebraically before computing the final arithmetic value.

#### 4. Final Answer:
- State the final numeric or algebraic answer clearly with proper units.

#### 💡 Pro Exam Tip:
- Examiners award partial marks for every structured step. Always box your final answer!`;
}

// 1. Doubt Solver Endpoint
app.post('/api/doubt-solve', async (req: Request, res: Response) => {
  try {
    const { question, image, subject = 'physics', classLevel = 'Class 10 (Board)', language = 'hinglish' } = req.body;

    if (!question && !image) {
      return res.status(400).json({ error: 'Please provide a question text or image.' });
    }

    if (!ai) {
      const fallback = getFallbackDoubtResponse(question || 'Image Doubt', subject, language);
      return res.json({ solutionText: fallback, isOfflineFallback: true });
    }

    const languageInstruction =
      language === 'hinglish'
        ? 'Explain in friendly Hinglish (a warm mix of natural Hindi and English words commonly used by Indian students and teachers, e.g. "Pehle hum given values dekh lete hain...", "Yahan momentum conserve hoga kyunki koi external force nahi hai!").'
        : 'Explain in simple, encouraging, crystal-clear English.';

    const systemInstruction = `You are StudyMate AI, a patient, empathetic, highly skilled personal tutor for Indian students studying CBSE, ICSE, State Boards, JEE, and NEET.
Student Class/Level: ${classLevel}.
Subject: ${subject}.
Language mode: ${languageInstruction}

PEDAGOGICAL RULES:
1. Never shame or criticize the student for asking basic or repetitive questions. Praise their curiosity.
2. If the problem is numerical:
   - Identify Given values and what needs to be found.
   - Mention the Concept and Formula first.
   - Explain WHY each step is done, one step at a time.
   - State the final answer with proper units in bold.
   - Add a "Pro Exam Tip" or "Common Mistake to Avoid".
3. If the problem is conceptual, explain with a simple everyday real-life analogy (e.g. cricket, bicycles, kitchen, Indian daily life).
4. If a question is ambiguous or missing values, politely ask for the missing detail while explaining the general approach.
5. Do NOT hallucinate textbook quotes or claim these are official leaked exam questions.`;

    const contents: any[] = [];

    if (image && image.data && image.mimeType) {
      contents.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    const userPrompt = question
      ? `Student's doubt:\n"${question}"\n\nPlease provide a clear, step-by-step explanation.`
      : 'Please read the textbook problem in this image and provide a comprehensive step-by-step solution.';

    contents.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length === 1 ? contents[0].text : { parts: contents },
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const solutionText = response.text || 'Unable to generate solution. Please try again.';
    return res.json({ solutionText, isOfflineFallback: false });
  } catch (err: any) {
    console.error('Error in /api/doubt-solve:', err);
    const fallback = getFallbackDoubtResponse(req.body.question || 'Doubt', req.body.subject, req.body.language);
    return res.json({ solutionText: fallback, isOfflineFallback: true, errorNotice: err?.message });
  }
});

// 2. AI Tutor Topic Explainer
app.post('/api/tutor-explain', async (req: Request, res: Response) => {
  try {
    const { subject, topic, classLevel = 'Class 10 (Board)', language = 'hinglish', focus = 'concept' } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required.' });
    }

    if (!ai) {
      return res.json({
        explanation: `### 📚 ${topic} (${subject.toUpperCase()})\n\n**Overview:**\nThis is a fundamental chapter in ${classLevel}. It builds the basis for board exams and competitive tests.\n\n**Key Concepts:**\n- Understand definitions and physical/chemical meanings.\n- Learn the core formula and observe how changing variables affects the outcome.\n- Practice 2-3 standard NCERT numericals step by step.`,
        isOfflineFallback: true,
      });
    }

    const langInstruction =
      language === 'hinglish'
        ? 'Use natural, enthusiastic Hinglish (e.g. "Chaliye is topic ko bilkul basic se samajhte hain!").'
        : 'Use lucid, engaging, beginner-friendly English.';

    const systemInstruction = `You are StudyMate AI, the beloved personal tutor for Indian students.
Focus area requested: ${focus} (e.g. concept breakdown, formula & derivation, or numerical application).
Class Level: ${classLevel}.
Subject: ${subject}.
Tone: Warm, encouraging, clear, like a top coaching teacher who makes difficult concepts effortless.
${langInstruction}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Please explain the topic "${topic}" in ${subject} for ${classLevel}. Break it down with clear headings, intuition, key formulas, a real-life analogy, and one sample solved problem.`,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return res.json({ explanation: response.text || '', isOfflineFallback: false });
  } catch (err: any) {
    console.error('Error in /api/tutor-explain:', err);
    return res.json({
      explanation: `### ${req.body.topic}\n\nA key topic in ${req.body.subject}. Practice the fundamental definitions and NCERT exercises to master this concept.`,
      isOfflineFallback: true,
    });
  }
});

// 3. Notes Generator Endpoint
app.post('/api/generate-notes', async (req: Request, res: Response) => {
  try {
    const { subject, topicOrText, classLevel = 'Class 10 (Board)', format = 'high_yield' } = req.body;

    if (!topicOrText) {
      return res.status(400).json({ error: 'Please provide a topic or study material text.' });
    }

    if (!ai) {
      return res.json({
        title: `Revision Notes: ${topicOrText.slice(0, 40)}`,
        summaryBullets: [
          'Core definition: Master the exact terminology for full marks.',
          'Fundamental governing formula with SI units.',
          'High-yield points: Frequently tested in previous year question papers (PYQs).',
          'Common pitfall: Check signs (+/-) and unit conversions (cm to m, grams to kg).',
        ],
        keyFormulas: [
          'Standard Equation: $Y = mX + C$',
          'Conservation Law: Total Initial = Total Final',
        ],
        importantDefinitions: [
          'Key Term: Defined as the rate of change or standard measure under specific conditions.',
        ],
        isOfflineFallback: true,
      });
    }

    const prompt = `Create high-yield revision notes for Indian students for:
Subject: ${subject}
Class: ${classLevel}
Material/Topic: "${topicOrText}"
Format requested: ${format}

Return a valid JSON object with EXACTLY this structure:
{
  "title": "Short descriptive title",
  "summaryBullets": ["bullet 1", "bullet 2", "bullet 3", "bullet 4", "bullet 5"],
  "keyFormulas": ["Formula 1: Description", "Formula 2: Description"],
  "importantDefinitions": ["Term 1: Definition", "Term 2: Definition"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      title: parsed.title || `Revision Notes: ${topicOrText.slice(0, 30)}`,
      summaryBullets: parsed.summaryBullets || [],
      keyFormulas: parsed.keyFormulas || [],
      importantDefinitions: parsed.importantDefinitions || [],
      isOfflineFallback: false,
    });
  } catch (err: any) {
    console.error('Error in /api/generate-notes:', err);
    return res.json({
      title: `Notes: ${req.body.topicOrText?.slice(0, 30) || 'Topic'}`,
      summaryBullets: [
        'Understand the core principles and definitions.',
        'Review standard derivations and formula sheets.',
        'Solve 5 PYQ problems to test retention.',
      ],
      keyFormulas: ['Standard Formula: Review NCERT Chapter Summary'],
      importantDefinitions: ['Core Definition: Defined as per NCERT textbook'],
      isOfflineFallback: true,
    });
  }
});

// 4. Quiz Generator Endpoint
app.post('/api/generate-quiz', async (req: Request, res: Response) => {
  try {
    const { subject, topic, difficulty = 'board', count = 5 } = req.body;

    const safeCount = Math.min(10, Math.max(3, Number(count) || 5));

    if (!ai) {
      // Deterministic realistic CBSE sample quiz
      const fallbackQuestions = [
        {
          id: 1,
          question: `In ${subject.toUpperCase()}, what is the standard SI unit of power?`,
          options: ['Joule (J)', 'Watt (W)', 'Newton (N)', 'Pascal (Pa)'],
          correctAnswerIndex: 1,
          explanation: 'Watt (W) is the SI unit of power, equivalent to 1 Joule per second (J/s).',
          conceptTested: 'SI Units & Dimensions',
        },
        {
          id: 2,
          question: `Which of the following statements about ${topic || subject} is always correct?`,
          options: [
            'Energy can be created from nothing.',
            'In an isolated system, total energy remains conserved.',
            'Friction never opposes relative motion.',
            'Velocity is a scalar quantity without direction.',
          ],
          correctAnswerIndex: 1,
          explanation: 'By the Law of Conservation of Energy, energy can neither be created nor destroyed in an isolated system.',
          conceptTested: 'Conservation Principles',
        },
        {
          id: 3,
          question: 'If the net external force acting on a moving body is zero, what happens to its momentum?',
          options: [
            'It continuously increases',
            'It reduces to zero immediately',
            'It remains constant (conserved)',
            'It fluctuates sinusoidally',
          ],
          correctAnswerIndex: 2,
          explanation: 'Newton\'s First & Second Laws dictate that when net F_ext = 0, dp/dt = 0, so momentum is constant.',
          conceptTested: 'Newton\'s Laws',
        },
      ];
      return res.json({ questions: fallbackQuestions.slice(0, safeCount), isOfflineFallback: true });
    }

    const prompt = `Generate ${safeCount} multiple-choice practice questions for an Indian student studying ${subject}, topic "${topic || subject}".
Difficulty level: ${difficulty} (e.g. school/board exam level or competitive JEE/NEET level).

For each question provide:
1. Clear question text.
2. 4 distinct options (A, B, C, D).
3. The 0-based index of the correct answer (0, 1, 2, or 3).
4. A step-by-step explanation explaining why the correct answer is right and why the other options are wrong.
5. The specific concept tested.

Return a valid JSON array of questions:
[
  {
    "id": 1,
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0,
    "explanation": "Explanation...",
    "conceptTested": "Concept name"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const questions = JSON.parse(response.text || '[]');
    return res.json({ questions, isOfflineFallback: false });
  } catch (err: any) {
    console.error('Error in /api/generate-quiz:', err);
    return res.json({
      questions: [
        {
          id: 1,
          question: `Standard revision question on ${req.body.subject || 'science'}: What is the fundamental unit of measurement?`,
          options: ['Meter', 'Second', 'Kilogram', 'All of the above are fundamental SI units'],
          correctAnswerIndex: 3,
          explanation: 'Meter (length), Second (time), and Kilogram (mass) are all fundamental base SI units.',
          conceptTested: 'Base SI Units',
        },
      ],
      isOfflineFallback: true,
    });
  }
});

// Configure Vite or Static Serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyMate AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
