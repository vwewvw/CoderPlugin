
import * as fs from 'fs';
import * as path from 'path';

// Описываем структуру одного вопроса
export interface Question {
    id: number;
    category: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

export class QuestionManager {
    private questions: Question[];

    constructor(extensionPath: string) {
        // Получаем путь к файлу с вопросами
        const questionsPath = path.join(
            extensionPath,
            'data',
            'questions.json'
        );

        // Читаем JSON и преобразуем его в массив вопросов
        const fileContent = fs.readFileSync(questionsPath, 'utf-8');
        this.questions = JSON.parse(fileContent) as Question[];
    }

    // Перемешиваем вопросы случайным образом
    private shuffle(questions: Question[]): Question[] {
        const shuffled = [...questions];

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    // Возвращаем 10 случайных вопросов
    public getRandomQuestions(count: number = 10): Question[] {
        const shuffled = this.shuffle(this.questions);

        return shuffled.slice(0, Math.min(count, shuffled.length));
    }
}
