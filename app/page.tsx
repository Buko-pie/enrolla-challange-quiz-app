'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ExamineeGetResponse, GradeSavedResultsResponse, GradeObject } from './constants/types'
import { apiClient } from './lib/api';
import { dispatch } from './store/store';
import { setGrade, setSeed } from './store/slices/quiz';

export default function QuizHome() {
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [quizTaken, setQuizTaken] = useState(false);
  const [url, setUrl] = useState('/quiz/prep')
  const [_seed, _setSeed] = useState('');
  const [existingSession, setExistingSession] = useState<{ name: string; token: string } | null>()

  const router = useRouter()


  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!existingSession && !name.trim()) {
      setError('Please enter your name')
      return
    }

    try {
      await apiClient.post('/examinee/set',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: name, seed: _seed })
      }).then( async (res) => {
        const data: ExamineeGetResponse = await res.json();
        if(data.success) {
          setError('')
          if(_seed) {
            dispatch(setSeed(parseInt(_seed)));
          }
          router.push(url);
        }
      }).catch(error => {
        throw new Error(error);
      });
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getExaminee = async() => {
    try {
      await apiClient.get('/examinee/get').then( async (res) => {
        const data: ExamineeGetResponse = await res.json();
        if(data.success) {
          setName(data.data.name);
          setToken(data.data.token);
          setExistingSession({
            name: data.data.name,
            token: data.data.token
          })

          if(data.data.startTime){
            setUrl("/quiz")
          }

          checkSavedResults();
        }
      }).catch(error => {
        throw new Error(error);
      });
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkSavedResults = async() => {
    try {
      await apiClient.get('/quiz/results').then( async (res) => {
        const data: GradeSavedResultsResponse = await res.json();

        if(data.success){
          setQuizTaken(true);
          const results: GradeObject = JSON.parse(data.data.results);
          dispatch(setGrade({
            data: results,
            success: true
          }));

          setUrl('/quiz/result');
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

  const handleStartNewSession = async () => {
    // Clear existing cookies
    try {
      await apiClient.delete('/examinee/delete').then( async (res) => {
        const data: ExamineeGetResponse = await res.json();
        if(data.success) {
          setExistingSession(null)
          setQuizTaken(false);
          setUrl('/quiz/prep')
          setName('')
        }
      }).catch(error => {
        throw new Error(error);
      });
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getExaminee()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-indigo-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Test</h1>
          {existingSession ? (
            <p className="text-gray-600">Welcome back, <span className="font-semibold text-indigo-600">{existingSession.name}</span>!</p>
          ) : (
            <p className="text-gray-600">Enter your name to begin</p>
          )}
        </div>

        <form onSubmit={handleEnter} className="space-y-6">
          {!existingSession && (<>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Seed?
              </label>
              <input
                type="text"
                id="seed"
                value={_seed}
                onChange={(e) => _setSeed(e.target.value)}
                className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                placeholder="ex. 4445556"
              />
            </div>
          </>)}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {quizTaken ?
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              View Results
            </button>
            :
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
            >
              {existingSession ? 'Continue Quiz' : 'Enter'}
            </button>
          }

          {existingSession && (
            <button
              type="button"
              onClick={handleStartNewSession}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Start New Session
            </button>
          )}
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            {existingSession
              ? 'Your session is still active'
              : 'A secure session token will be automatically generated for you'
            }
          </p>
        </div>
      </div>
    </div>
  )
}