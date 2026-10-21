import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    // 1. Базовая кнопка Hello World
    let helloCmd = vscode.commands.registerCommand('vibecoder.hello', () => {
        vscode.window.showInformationMessage('Hello, World! Руслана'); 
    });

    // 2. Контекстное меню
    let contextCmd = vscode.commands.registerCommand('vibecoder.contextAction', () => {
        const editor = vscode.window.activeTextEditor;
        const name = editor ? editor.document.fileName : 'файл не открыт';
        vscode.window.showInformationMessage(`Вы вызвали меню на файле: ${name}`);
    });

    // 3. Подсчет строк 
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
}

export function deactivate() {}