import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { GradeResponse, Question, QuestionsGetResponse } from '@/app/constants/types';
import { apiClient } from '@/app/lib/api';

export interface quizState {
	selected: Question | null; //Can be used to store new SOAP then save
	loading: boolean;
  collection: Question[];
  startTime: string;
  seed?: number;
  seedRandom?: number;
  grade: GradeResponse;
}

export interface PostShuffleState {
    questions: Question[];
    startTime: string;
    seed: number;
}

const initialState: quizState = {
	selected: null,
	loading: false,
  collection: [],
  startTime: '',
  grade: {
    data:{
      examineeName: '',
      points: 0,
      results: [],
      score: 0,
      timeTaken: '',
      total: 0,
    },
    success: false
  }
}

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

//Fisher-Yates Deterministic Shuffle
function deterministicShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = seededRandom(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor( random() * (i + 1) );
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}


export function shuffleQuestionsDeterministically(
  questions: Question[],
  seed: number
): Question[] {
  // First, shuffle the question order
  const shuffledQuestions = deterministicShuffle(questions, seed);

  // Then shuffle the options of each question using a derived seed
  return shuffledQuestions.map((q, index) => ({
    ...q,
    options: deterministicShuffle(q.choices, seed + index),
  }));
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


export const quizGet = createAsyncThunk<PostShuffleState, void>('quiz/getAsync', async(): Promise<PostShuffleState> => {
  try {
    const res = await apiClient.get('/quiz');
    const data: QuestionsGetResponse = await res.json();

    if (!data || !data.data) {
      throw new Error("Failed to get Quiz data");
    }

    const seed = parseInt(`${data.data.seed}`) || getRandomInt(1000000, 9999999);

    return {
        questions: shuffleQuestionsDeterministically(data.data.question, seed).slice(0, 10),
        startTime: data.data.startTime,
        seed: seed,
    };
  } catch (error) {
    console.log("Failed to fetch Quiz Data", error);
    throw error;
  }
});


const quizSlice = createSlice({
	name: 'quiz',
	initialState,
    reducers:{
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSelected: (state, action: PayloadAction<Question>) => {
      state.selected = action.payload;
    },
    setCollection: (state, action: PayloadAction<Question[]>) => {
      state.collection = action.payload
    },
    setSeed: (state, action: PayloadAction<number>) => {
      state.seed = action.payload;
    },
    setGrade: (state, action: PayloadAction<GradeResponse>) => {
      state.grade = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
    //GET Questions
    .addCase(quizGet.fulfilled, (state, action: PayloadAction<PostShuffleState>) => {
      state.loading = false;
      state.collection = action.payload.questions
      state.seedRandom = action.payload.seed;
      state.seed = action.payload.seed;
      state.startTime = action.payload.startTime;
    })
    .addCase(quizGet.pending, (state) => {
      state.loading = true;
    })
    .addCase(quizGet.rejected, (state) => {
      state.loading = false;
    })
  }
});


export const { setSelected, setLoading, setCollection, setSeed, setGrade } = quizSlice.actions;
export default quizSlice.reducer;