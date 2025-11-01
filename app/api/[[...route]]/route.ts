import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { sampleQuestions } from '@/app/constants/questions'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { CookieOptions } from 'hono/utils/cookie'
import { QUIZ_ITEMS } from '@/app/constants/settings'
import { QuizResult } from '@/app/constants/types'
import moment from 'moment'

const app = new Hono().basePath('/api')

const cookieOptions: CookieOptions = {
  path: '/',
  maxAge: 604800, // 1 week in seconds
  httpOnly: true,
  sameSite: 'strict',
}

// Generate a cryptographically secure random token
const generateToken = () => {
  const array = new Uint8Array(32) // 32 bytes = 256 bits
  crypto.getRandomValues(array)
  // Convert to hex string
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// GET user name and session token cookie
app.get('/examinee/get', (c) => {
  const token = getCookie(c, 'quizToken')
  const name = getCookie(c, 'examineeName')
  const startTime = getCookie(c, 'startTimeStamp');

  if (!token || !name) {
    return c.json({
      success: false,
      error: 'No session found'
    }, 401)
  }

  return c.json({
    success: true,
    data: {
      token,
      name: decodeURIComponent(name),
      startTime,
    }
  })
});


// Set user name and session token cookie
app.post('/examinee/set', async (c) => {
  const data = await c.req.json()
  const body = JSON.parse(data.body);

  setCookie(c, 'quizToken', generateToken(), cookieOptions);
  setCookie(c, 'examineeName', body.value, cookieOptions);
  setCookie(c, 'setSeed', body.seed, cookieOptions);

   return c.json({
    success: true,
    message: 'Cookie set successfully'
  })
})

// DELETE all cookies
app.delete('/examinee/delete', (c) => {
  const cookieHeader = c.req.header('Cookie')

  if (!cookieHeader) {
    return c.json({
      success: true,
      message: 'No cookies to clear'
    })
  }

  const cookies = cookieHeader.split('; ').reduce((acc, cookie) => {
    const [key] = cookie.split('=')
    acc.push(key)
    return acc
  }, [] as string[])

  cookies.forEach(key => {
    deleteCookie(c, key, { path: '/' })
  })

  return c.json({
    success: true,
    message: 'Cookie deleted'
  })
})

// GET all quiz questions
app.get('/quiz', (c) => {
  // Return questions without answers for security
  const questionsWithoutAnswers = sampleQuestions.map(({ correctText, ...q }) => q)
  const setSeed = getCookie(c, 'setSeed');
  const startTime = getCookie(c, 'startTimeStamp');

  return c.json({
    success: true,
    data: {
      question: questionsWithoutAnswers,
      startTime,
      seed: setSeed
    }
  })
})

// POST submit quiz answers
app.post('/grade', async (c) => {
  const data = await c.req.json()
  const { answers } = JSON.parse(data.body)
  const _answers: Record<number, string> = answers;

  const token = getCookie(c, 'quizToken')
  const name = getCookie(c, 'examineeName')
  const startTime = getCookie(c, 'startTimeStamp');
  console.log("startTime: ", startTime);
  if (!token || !name) {
    return c.json({
      success: false,
      error: 'No session found'
    }, 401)
  }

  // Calculate score
  let correctCount = 0
  const results: QuizResult[] = [];

  Object.keys(_answers).forEach((key) => {
    const isCorrect = sampleQuestions[parseInt(key) - 1].correctText === _answers[parseInt(key)];
    if (isCorrect) {
      correctCount++
    }

    results.push({
      id: key,
      correct: isCorrect,
    })
  })

  const points = Math.round((correctCount / QUIZ_ITEMS) * 100)

  // Calculate time taken

  const duration = moment.duration(moment().diff(moment(parseInt(startTime as string))));
  const minutes = Math.floor(duration.asMinutes());
  const seconds = duration.seconds();
  const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const _data = {
    score: correctCount,
    total: QUIZ_ITEMS,
    results: results,
    points: points,
    examineeName: name,
    timeTaken: formatted
  }

  setCookie(c, 'quizResults', JSON.stringify(_data), cookieOptions);

  return c.json({
    success: true,
    data: _data
  })
})


// GET saved exam results
app.get('/quiz/results', (c) => {
  const results = getCookie(c, 'quizResults')

  if (!results) {
    return c.json({
      success: false,
      error: 'No quiz results found'
    }, 401)
  }

  return c.json({
    success: true,
    data: {
      results: results,
    }
  })
});

// SET start quiz timestamp
app.post('/setTimeStamp', async (c) => {
  const startTimeStamp = Date.now();
  console.log("START TIME STAMP: ", startTimeStamp)
  setCookie(c, 'startTimeStamp', `${startTimeStamp}`, cookieOptions);

  return c.json({
    success: true,
    message: 'Timstamp Saved'
  })
})


export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const PATCH = handle(app)
export const DELETE = handle(app)