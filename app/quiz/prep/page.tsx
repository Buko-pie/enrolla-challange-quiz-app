'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExamineeGetResponse } from '@/app/constants/types'
import { apiClient } from '@/app/lib/api'

export default function PrepPage() {
  const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [examineeName, setExamineeName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  const getExaminee = async() => {
    try {
      await apiClient.get('/examinee/get').then( async (res) => {
        const data: ExamineeGetResponse = await res.json();
        if(data.success) {
          setExamineeName(data.data.name ? decodeURIComponent(data.data.name) : '');
          setToken(data.data.token);
        }
      }).catch(error => {
        // router.push('/');
        throw new Error(error);
      });
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBeginQuiz = async() => {
    if (!agreed) {
      alert('Please read and agree to the instructions before proceeding')
      return
    }

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
    } finally {
      router.push('/quiz')
    }
  }

  useEffect(() => {
    getExaminee();
  }, [])

  if (!examineeName) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Before You Begin</h1>
            <p className="text-gray-600">Hello, <span className="font-semibold text-indigo-600">{examineeName}</span></p>
          </div>

          {/* Instructions */}
          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quiz is Timed
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Once you start the quiz, a timer will begin counting down. You will have a specific amount of time to complete all questions.
                The quiz will automatically submit when time runs out, so manage your time wisely.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Auto-Save Feature
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your answers are automatically saved every time you select or change an answer. You doesn&#39;t need to manually save your progress.
                Even if you accidentally close the browser, your answers will be preserved.
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Important Reminders
              </h2>
              <ul className="text-gray-700 space-y-2 list-disc list-inside">
                <li>Ensure you have a stable internet connection</li>
                <li>Do not refresh or close the browser during the quiz</li>
                <li>Answer all questions to the best of your ability</li>
                <li>You can navigate between questions freely before submitting</li>
                <li>Once submitted, you cannot change your answers</li>
              </ul>
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="mb-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-gray-700">
                I have read and understood the instructions above. I am ready to begin the quiz.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
            >
              Go Back
            </Link>
            <button
              onClick={handleBeginQuiz}
              disabled={!agreed}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors text-white ${
                agreed
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Begin Quiz
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact your instructor before starting the quiz.
          </p>
        </div>
      </div>
    </div>
  )
}