import * as vscode from 'vscode';

// API, которое возвращает шутки о программировании
const JOKE_API_URL =
	'https://v2.jokeapi.dev/joke/Programming' +
	'?blacklistFlags=nsfw,racist,sexist,explicit' +
	'&safe-mode';

// Описываем структуру ответа API
interface JokeResponse {
	error?: boolean;
	message?: string;
	type?: 'single' | 'twopart';
	joke?: string;
	setup?: string;
	delivery?: string;
}

// Вызывается при активации расширения
export function activate(context: vscode.ExtensionContext) {
	console.log('VibeCoderPlugin is now active!');

	// Существующая команда Hello World
	const helloCommand = vscode.commands.registerCommand(
		'vibecoderplugin.helloWorld',
		() => {
			vscode.window.showInformationMessage(
				'Hello World from VibeCoderPlugin!'
			);
		}
	);

	context.subscriptions.push(helloCommand);

	// Команда генератора шуток
	const jokeCommand = vscode.commands.registerCommand(
		'jokeGenerator.getJoke',
		async () => {
			try {
				// Отправляем GET-запрос к открытому API
				const response = await fetch(JOKE_API_URL);

				// Проверяем HTTP-статус
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				// Разбираем JSON
				const data = await response.json() as JokeResponse;

				// Проверяем, не вернуло ли API ошибку
				if (data.error) {
					throw new Error(
						data.message || 'API вернуло ошибку'
					);
				}

				let joke: string;

				// Обрабатываем шутку из одной части
				if (data.type === 'single' && data.joke) {
					joke = data.joke;
				}
				// Обрабатываем шутку из двух частей
				else if (
					data.type === 'twopart' &&
					data.setup &&
					data.delivery
				) {
					joke = `${data.setup}\n\n${data.delivery}`;
				} else {
					throw new Error(
						'Не удалось распознать формат шутки'
					);
				}

				// Показываем шутку пользователю
				vscode.window.showInformationMessage(
					`😄 ${joke}`
				);
			} catch (error) {
				const message = error instanceof Error
					? error.message
					: 'Неизвестная ошибка';

				vscode.window.showErrorMessage(
					`Не удалось получить шутку: ${message}`
				);
			}
		}
	);

	context.subscriptions.push(jokeCommand);

	// Создаём кнопку в строке состояния VS Code
	const button = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100
	);

	button.text = '$(smiley) Joke';
	button.tooltip = 'Получить шутку о программировании';
	button.command = 'jokeGenerator.getJoke';
	button.show();

	context.subscriptions.push(button);
}

// Вызывается при отключении расширения
export function deactivate() {}