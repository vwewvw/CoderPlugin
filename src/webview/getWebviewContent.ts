
import * as vscode from 'vscode';

export function getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
): string {
    const styleUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'src', 'webview', 'style.css')
    );

    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'src', 'webview', 'script.js')
    );

    return `
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <link rel="stylesheet" href="${styleUri}">

            <title>Git Master</title>
        </head>
        <body>
            <main class="container">
                <header>
                    <h1>Git Master</h1>
                    <p>Проверь свои знания Git</p>
                </header>

                <section id="quiz">
                    <div class="progress">
                        Вопрос <span id="question-number">1</span>
                        из <span id="total-questions">10</span>
                    </div>

                    <h2 id="question">Загрузка вопроса...</h2>

                    <div id="options" class="options"></div>

                    <div id="feedback" class="feedback"></div>

                    <button id="next-button" disabled>
                        Следующий вопрос
                    </button>
                </section>

                <section id="result" class="hidden">
                    <h2>Викторина завершена!</h2>
                    <p>Твой результат:</p>
                    <div id="score"></div>
                    <button id="restart-button">Играть снова</button>
                </section>
            </main>

            <script src="${scriptUri}"></script>
        </body>
        </html>
    `;
}
