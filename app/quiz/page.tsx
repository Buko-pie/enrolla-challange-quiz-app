'use client'

import React, { useState, useEffect  } from 'react'
import { useRouter } from 'next/navigation'
import { ExamineeGetResponse, GradeResponse, Question } from '../constants/types'
import { apiClient } from '../lib/api'
import { dispatch, RootState, useSelector } from '../store/store'
import { quizGet, setGrade } from '../store/slices/quiz'
import moment from 'moment'
import { QUIZ_ALLOTED_TIME } from '../constants/settings'


const QuizPage: React.FC = () => {
  const { collection: sampleQuestions, seedRandom, startTime, seed } = useSelector((state: RootState) => state.quiz);

  const [examineeName, setExamineeName] = useState('')
  const [question, setQuestion] = useState<Question>();
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(1800)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const getExaminee = async() => {
    try {
      await apiClient.get('/examinee/get').then( async (res) => {
        const data: ExamineeGetResponse = await res.json();

        if(data.success){
          setExamineeName(decodeURIComponent(data.data.name));
        }
      }).catch(error => {
        throw new Error(error);
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (questionId?: number) => {
    // setIsSubmitting(true)

    if(questionId){
      handleBlanks(questionId);
    }

    await apiClient.post('/grade',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers: answers })
    }).then( async (res) => {
      const data: GradeResponse = await res.json();
      console.log("GRADE DATA: ", data);
      dispatch(setGrade(data));

      setTimeout(() => {
        // Clear quiz data
        document.cookie = 'quizAnswers=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        router.push('/quiz/result')
      }, 1000);
    }).catch((error) => {
      console.error("Error submiting answers", error);
    });
  }


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleTextInput = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleTrueFalseToggle = (questionId: number) => {
    setAnswers(prev => {
      const currentAnswer = prev[questionId]
      const newAnswer = currentAnswer === 'True' ? 'False' : 'True'
      return {
        ...prev,
        [questionId]: newAnswer
      }
    })
  }

  //Handle blank answers
  const handleBlanks = (questionId: number) => {
    if(!answers[questionId]){
      console.log("QUESTION LEFT BLANK");

      setAnswers(prev => {
        const newAnswer = sampleQuestions[currentQuestion].type === 'checkbox' ? 'False' : ' '
        return {
          ...prev,
          [questionId]: newAnswer
        }
      });
    }
  }

  const handleNext = (questionId: number) => {
    if (currentQuestion < sampleQuestions.length - 1) {
      handleBlanks(questionId);
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const setTimeStamp = async () => {
    try {
      await apiClient.post('/setTimeStamp',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
    } catch (error) {
      console.error("Failed to set time stamp: ", error);
    }
  }

  //Initialize Data
  useEffect(() => {
    dispatch(quizGet());
    getExaminee();
  }, [])

  //Calculate Time Remaining
  useEffect(() => {
    //Reset Time if seed is only set
    console.log("START TIME: ", startTime)
    if( seed ){
      const allotedTime = moment(parseInt(startTime)).add(QUIZ_ALLOTED_TIME, 'minutes');
      setTimeLeft(allotedTime.diff(moment(), 'second'));
    } else {
      setTimeStamp();
    }
  }, [startTime, seed])


  useEffect(() => {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    // Load saved answers from cookie if exists
    const savedAnswers = cookies['quizAnswers']
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(decodeURIComponent(savedAnswers)))
      } catch (e) {
        console.error('Error loading saved answers:', e)
      }
    }
  }, [router])

  // Auto-save answers to cookie
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 1)
      document.cookie = `quizAnswers=${encodeURIComponent(JSON.stringify(answers))}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`
    }
  }, [answers])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, router])

  useEffect(() => {
    setQuestion(sampleQuestions[currentQuestion]);
    console.log(question);
  }, [sampleQuestions, currentQuestion, question])

  const progress = (((currentQuestion + 1) / sampleQuestions.length) * 100)
  const answeredCount = Object.keys(answers).length

  return (<>{
    examineeName && sampleQuestions && sampleQuestions.length > 0 && question
    ?
     <>
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4 h-full">
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Header */}
          <div className="bg-white rounded-t-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Quiz Test</h1>
                <p className="text-sm text-gray-600">Examinee: {examineeName}</p>
                <p className="text-sm text-gray-600">Seed: {seedRandom}</p>
              </div>
              <div className={`text-right ${timeLeft <= 300 ? 'text-red-600' : 'text-gray-700'}`}>
                <div className="text-sm font-medium">Time Remaining</div>
                <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{answeredCount} of {sampleQuestions.length} answered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white shadow-lg p-8 mb-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Question {currentQuestion + 1} of {sampleQuestions.length}
              </span>
              {answers[question.id] && (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Answered
                </span>
              )}
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{question.question}</h2>
          </div>

          {/* Multiple Choice Options */}
          {question.type === 'radio' && question.choices && (
            <div className="space-y-3">
              {question.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(question.id, choice)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[question.id] === choice
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      answers[question.id] === choice
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {answers[question.id] === choice && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <span className="text-lg">{choice}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* True/False Checkboxes */}
          {question.type === 'checkbox' && (
            <div className="flex items-center justify-center py-8">
              <label className="flex items-center p-6 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 bg-white shadow-md">
                <input
                  type="checkbox"
                  checked={answers[question.id] === 'True'}
                  onChange={() => handleTrueFalseToggle(question.id)}
                  className="w-7 h-7 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <span className={`ml-4 text-2xl font-semibold transition-colors ${
                  answers[question.id] === 'True' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {answers[question.id] === 'True' ? 'True' : 'False'}
                </span>
              </label>
            </div>
          )}

          {/* Text Input */}
          {question.type === 'text' && (
            <div>
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleTextInput(question.id, e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-gray-600"
                rows={4}
              />
              <p className="mt-2 text-sm text-gray-500">
                {answers[question.id]?.length || 0} characters
              </p>
            </div>
          )}
          </div>

          <div className='justify-self-end'>
            {/* Navigation */}
            <div className="bg-white rounded-b-2xl shadow-lg p-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    currentQuestion === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {sampleQuestions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        index === currentQuestion
                          ? 'bg-indigo-600 text-white'
                          : answers[sampleQuestions[index].id]
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {currentQuestion === sampleQuestions.length - 1 ? (
                  <button
                    onClick={() => {handleSubmit(sampleQuestions[currentQuestion].id)}}
                    disabled={isSubmitting}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleNext(sampleQuestions[currentQuestion].id)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>

            {/* Auto-save indicator */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                ✓ Your answers are automatically saved
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
    :
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    </>
  }</>)
}

export default QuizPage;