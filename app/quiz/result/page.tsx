'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiClient } from '@/app/lib/api'
import { ExamineeGetResponse, ExamineeResult } from '@/app/constants/types'
import { RootState, useSelector } from '@/app/store/store'

export default function ResultsPage() {
  const { grade } = useSelector((state: RootState) => state.quiz);

  const [examineeName, setExamineeName] = useState('');
  const [result, setResult] = useState<ExamineeResult | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const getExaminee = async() => {
  try {
    await apiClient.get('/examinee/get').then( async (res) => {
      const data: ExamineeGetResponse = await res.json();

      if(data.success){
        setExamineeName(decodeURIComponent(data.data.name));
        setResult({
          examineeName: grade.data.examineeName,
          points: grade.data.points,
          results: grade.data.results,
          score: grade.data.score,
          timeTaken: grade.data.timeTaken,
          total: grade.data.total,
        })
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

  useEffect(() => {
    // Get data from cookies
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
      const [key, value] = cookie.split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    getExaminee();

    const name = cookies['examineeName']
    const answersData = cookies['quizAnswers']

    if (!name) {
      // router.push('/')
      return
    }

    setLoading(false)
  }, [router])

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 60) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getGrade = (score: number) => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return 'Outstanding! Excellent work!'
    if (score >= 80) return 'Great job! Well done!'
    if (score >= 70) return 'Good effort! Keep it up!'
    if (score >= 60) return 'Fair performance. Room for improvement.'
    return 'Keep studying and try again!'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Calculating your results...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>No results found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
            <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
          <p className="text-gray-600 text-lg">Congratulations, {result.examineeName}</p>
        </div>

        {/* Score Card */}
        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 ${getScoreBackground(result.score)}`}>
          <div className="text-center">
            <div className="mb-4">
              <span className="text-6xl font-bold">{result.score}</span>
              <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>%</span>
            </div>
            <div className={`inline-block px-6 py-2 rounded-full text-2xl font-bold ${getScoreColor(result.score)} ${getScoreBackground(result.score)}`}>
              Grade: {getGrade(result.score)}
            </div>
            <p className="mt-4 text-xl text-gray-700">{getPerformanceMessage(result.score)}</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Correct Answers</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {result.score}/{result.total}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Incorrect Answers</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {result.total - result.score}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Time Taken</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">{result.timeTaken}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Breakdown</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium">Accuracy Rate</span>
                <span className="text-gray-900 font-bold">{result.score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    result.score >= 80 ? 'bg-green-500' : 
                    result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.score}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600">Total Questions</p>
                <p className="text-2xl font-bold text-blue-600">{result.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
            >
              Take Another Quiz
            </Link>
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Print Results
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Your results have been recorded. Thank you for taking the quiz!
          </p>
        </div>
      </div>
    </div>
  )
}