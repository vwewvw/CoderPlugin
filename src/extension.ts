import * as vscode from 'vscode';
import { QuestionManager } from './quiz/QuestionManager';
import { QuizManager } from './quiz/QuizManager';
import { getWebviewContent } from './webview/getWebviewContent';

// API для шуток
const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Programming?blacklistFlags=nsfw,racist,sexist&safe-mode';

interface JokeResponse {
    error?: boolean;
    message?: string;
    type?: 'single' | 'twopart';
    joke?: string;
    setup?: string;
    delivery?: string;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('VibeCoderPlugin is now active!');

    // ==========================================
    // 1. ВАШИ КОМАНДЫ (Руслана)
    // ==========================================
    let helloCmd = vscode.commands.registerCommand('vibecoder.hello', () => {
        vscode.window.showInformationMessage('Hello, World! Руслана'); 
    });

    let contextCmd = vscode.commands.registerCommand('vibecoder.contextAction', () => {
        const editor = vscode.window.activeTextEditor;
        const name = editor ? editor.document.fileName : 'файл не открыт';
        vscode.window.showInformationMessage(`Вы вызвали меню на файле: ${name}`);
    });

    let countLinesCmd = vscode.commands.registerCommand('vibecoder.countLines', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Откройте файл для подсчета!');
            return;
        }
        const lines = editor.document.getText().split('\n');
        let empty = 0, comments = 0, code = 0;

        lines.forEach(line => {
            const t = line.trim();
            if (t === '') empty++;
            else if (t.startsWith('//') || t.startsWith('#') || t.startsWith('/*')) comments++;
            else code++;
        });
        vscode.window.showInformationMessage(`Код: ${code} | Комментарии: ${comments} | Пустые: ${empty}`, { modal: true });
    });

    context.subscriptions.push(helloCmd, contextCmd, countLinesCmd);


    // ==========================================
    // 2. КОМАНДЫ НАПАРНИЦЫ (Шутки и Викторина)
    // ==========================================
    const jokeCommand = vscode.commands.registerCommand('jokeGenerator.getJoke', async () => {
        try {
            const response = await fetch(JOKE_API_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json() as JokeResponse;
            
            if (data.error) throw new Error(data.message || 'API вернуло ошибку');

            let joke: string;
            if (data.type === 'single' && data.joke) {
                joke = data.joke;
            } else if (data.type === 'twopart' && data.setup && data.delivery) {
                joke = `${data.setup}\n\n${data.delivery}`;
            } else {
                throw new Error('Не удалось распознать формат шутки');
            }
            vscode.window.showInformationMessage(`😄 ${joke}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
            vscode.window.showErrorMessage(`Не удалось получить шутку: ${message}`);
        }
    });
    context.subscriptions.push(jokeCommand);

    // Кнопка для шуток в статус-баре
    const button = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    button.text = '$(smiley) Joke';
    button.tooltip = 'Получить шутку о программировании';
    button.command = 'jokeGenerator.getJoke';
    button.show();
    context.subscriptions.push(button);

    // Викторина по Git
    const quizCommand = vscode.commands.registerCommand('gitMaster.startQuiz', () => {
        let quizManager: QuizManager;
        try {
            const questionManager = new QuestionManager(context.extensionPath);
            quizManager = new QuizManager(questionManager);
        } catch (error) {
            vscode.window.showErrorMessage(`Не удалось загрузить вопросы: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'gitMasterQuiz',
            'Git Master',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'src', 'webview')]
            }
        );

        panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);

        const sendQuestion = () => {
            const question = quizManager.getCurrentQuestion();
            if (!question) {
                panel.webview.postMessage({ command: 'showResult', score: quizManager.getScore() });
                return;
            }
            panel.webview.postMessage({
                command: 'showQuestion',
                question: {
                    id: question.id,
                    category: question.category,
                    question: question.question,
                    options: question.options
                },
                questionNumber: quizManager.getCurrentQuestionNumber(),
                totalQuestions: quizManager.getTotalQuestions()
            });
        };

        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'ready':
                    sendQuestion();
                    break;
                case 'answer': {
                    const result = quizManager.checkAnswer(message.answerIndex);
                    if (result) {
                        panel.webview.postMessage({
                            command: 'showFeedback',
                            result: { ...result, selectedAnswer: message.answerIndex }
                        });
                    }
                    break;
                }
                case 'next':
                    if (quizManager.getCurrentQuestionNumber() < quizManager.getTotalQuestions()) {
                        quizManager.nextQuestion();
                        sendQuestion();
                    } else {
                        panel.webview.postMessage({ command: 'showResult', score: quizManager.getScore() });
                    }
                    break;
                case 'restart':
                    quizManager = new QuizManager(new QuestionManager(context.extensionPath));
                    sendQuestion();
                    break;
            }
        });
    });
    context.subscriptions.push(quizCommand);
}

export function deactivate() {}
