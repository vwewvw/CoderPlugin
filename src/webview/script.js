
const vscode = acquireVsCodeApi();

let currentQuestion = 0;
let totalQuestions = 10;
let answered = false;

const questionElement = document.getElementById('question');
const optionsElement = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const questionNumberElement = document.getElementById('question-number');
const totalQuestionsElement = document.getElementById('total-questions');
const nextButton = document.getElementById('next-button');

const quizElement = document.getElementById('quiz');
const resultElement = document.getElementById('result');
const scoreElement = document.getElementById('score');

function showQuestion(question) {
    answered = false;

    questionNumberElement.textContent = currentQuestion + 1;
    totalQuestionsElement.textContent = totalQuestions;
    questionElement.textContent = question.question;

    feedbackElement.textContent = '';
    optionsElement.innerHTML = '';
    nextButton.disabled = true;

    question.options.forEach((option, index) => {
        const button = document.createElement('button');

        button.className = 'option';
        button.textContent = option;

        button.addEventListener('click', () => {
            if (answered) {
                return;
            }

            answered = true;

            vscode.postMessage({
                command: 'answer',
                answerIndex: index
            });
        });

        optionsElement.appendChild(button);
    });
}

function showFeedback(result) {
    const buttons = optionsElement.querySelectorAll('.option');

    buttons.forEach((button, index) => {
        button.disabled = true;

        if (index === result.correctAnswer) {
            button.classList.add('correct');
        } else if (index === result.selectedAnswer) {
            button.classList.add('incorrect');
        }
    });

    feedbackElement.textContent =
        (result.isCorrect ? 'Правильно! ' : 'Неправильно. ') +
        result.explanation;

    nextButton.disabled = false;
}

function showResult(score) {
    quizElement.classList.add('hidden');
    resultElement.classList.remove('hidden');

    scoreElement.textContent = `${score} / ${totalQuestions}`;
}

nextButton.addEventListener('click', () => {
    vscode.postMessage({
        command: 'next'
    });
});

document.getElementById('restart-button').addEventListener('click', () => {
    vscode.postMessage({
        command: 'restart'
    });
});

window.addEventListener('message', event => {
    const message = event.data;

    switch (message.command) {
        case 'showQuestion':
            currentQuestion = message.questionNumber - 1;
            totalQuestions = message.totalQuestions;
            quizElement.classList.remove('hidden');
            resultElement.classList.add('hidden');
            showQuestion(message.question);
            break;

        case 'showFeedback':
            showFeedback(message.result);
            break;

        case 'showResult':
            showResult(message.score);
            break;
    }
});

vscode.postMessage({
    command: 'ready'
});
