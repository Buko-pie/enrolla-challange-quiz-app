export interface Question {
  id: number;
  question: string;
  choices: string[];
  type: 'radio' | 'checkbox' | 'text';
  correctText: string;
}

interface ResponseBase {
    success: boolean;
}

export interface ExamineeGetResponse extends ResponseBase {
    data: {
        name: string,
        token: string,
        startTime?: string,
    };
}

export interface QuestionsGetResponse extends ResponseBase {
    data: {
        question: Question[],
        startTime: string,
        seed: number,
    };
}

export interface GradeResponse extends ResponseBase {
    data: GradeObject;
}

export interface GradeSavedResultsResponse extends ResponseBase {
    data: {
        results: string;
    }
}

export interface ExamineeResult {
    score: number;
    total: number;
    results: QuizResult[],
    points: number,
    examineeName: string
    timeTaken: string
}

export interface QuizResult {
    id: string | number;
    correct: boolean;
}

export interface GradeObject {
    score: number,
    total: number,
    results: QuizResult[],
    points: number,
    examineeName: string,
    timeTaken: string,
}
