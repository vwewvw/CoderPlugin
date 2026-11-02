
import { Question, QuestionManager } from './QuestionManager';

export class QuizManager {
    private questions: Question[];
    private currentQuestionIndex: number = 0;
    private score: number = 0;

    constructor(questionManager: QuestionManager) {
        this.questions = questionManager.getRandomQuestions(10);
    }

    // Получаем текущий вопрос
    public getCurrentQuestion(): Question | undefined {
        return this.questions[this.currentQuestionIndex];
    }

    // Проверяем ответ
    public checkAnswer(answerIndex: number) {
        const question = this.getCurrentQuestion();

        if (!question) {
            return undefined;
        }

        const isCorrect = answerIndex === question.correctAnswer;

        if (isCorrect) {
            this.score++;
        }

        return {
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation
        };
    }

    // Переходим к следующему вопросу
    public nextQuestion(): Question | undefined {
        this.currentQuestionIndex++;
        return this.getCurrentQuestion();
    }

    // Получаем текущий счёт
    public getScore(): number {
        return this.score;
    }

    // Получаем общее количество вопросов
    public getTotalQuestions(): number {
        return this.questions.length;
    }

    // Получаем номер текущего вопроса
    public getCurrentQuestionNumber(): number {
        return this.currentQuestionIndex + 1;
    }
}
