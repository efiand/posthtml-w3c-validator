const { HtmlValidate } = require('html-validate');
const chalk = require('chalk');
const fetch = require('node-fetch');
const render = require('posthtml-render');
const DEFAULT_OPTIONS = require('./.htmlvalidate.json');

const validateInstance = new HtmlValidate();
const SeverityLevel = {
	error: 2,
	info: 1
};
const Severity = {
	1: {
		logOutput: chalk.yellow.bold,
		title: 'WARNING'
	},
	2: {
		logOutput: chalk.red.bold,
		title: 'ERROR'
	}
};
const W3C_TIMEOUT = 1000;

const validateHtml = async ({
	htmlCode,
	sourceName = '',
	htmlvalidateOptions = DEFAULT_OPTIONS,
	forceOffline = false
}) => {
	let output = '';
	const sourceStr = sourceName ? `${sourceName} ` : '';

	const controller = new AbortController();
	setTimeout(() => {
		controller.abort();
	}, W3C_TIMEOUT);

	// Оффлайн-валидатор HTML
	const validateOffline = () => {
		const report = validateInstance.validateString(htmlCode, htmlvalidateOptions);

		report.results.forEach(({ messages }) => {
			messages.forEach(({ column, line, message, selector, severity }) => {
				if (Severity[severity]) {
					const { logOutput, title } = Severity[severity];
					const prefix = `\n[${chalk.cyan('Validate HTML Offline')}] ${sourceStr}(${line}:${column})`;
					const selectorMsg = selector ? ` ${chalk.cyan(selector)}` : '';

					output += `${prefix}${selectorMsg}:\n${logOutput.underline(title)}: ${logOutput(message)}\n`;
				}
			});
		});
	};

	try {
		// Онлайн-валидатор HTML
		const validRes = await fetch('https://validator.nu/?out=json', {
			body: htmlCode,
			headers: { 'Content-Type': 'text/html' },
			method: 'POST',
			signal: controller.signal
		});
		const { messages = [] } = await validRes.json();

		if (messages.length) {
			messages.forEach(({ extract, firstColumn, lastLine, message, type }) => {
				const { logOutput, title } = Severity[SeverityLevel[type]];
				const prefix = `\n[${chalk.cyan('Validate HTML Online')}] ${sourceStr}(${lastLine}:${firstColumn + 1})`;
				const selectorMsg = ` ${chalk.cyan(extract)}`;

				output += `${prefix}${selectorMsg}:\n${logOutput.underline(title)}: ${logOutput(message)}\n`;
			});
		} else if (forceOffline) {
			validateOffline();
		}
	} catch (err) {
		validateOffline();
	}

	return output;
};

module.exports = {
	validateHtml,
	getPosthtmlW3c: ({
		getSourceName = (filename) => filename,
		log = console.log,
		htmlvalidateOptions = DEFAULT_OPTIONS,
		forceOffline = false,
		exit = false
	} = {}) => async (tree) => {
		const validationMessage = await validateHtml({
			htmlCode: render(tree),
			sourceName: getSourceName(tree.options.from),
			htmlvalidateOptions,
			forceOffline
		});

		if (validationMessage) {
			log(validationMessage);

			if (exit) {
				throw new Error(chalk.red('Invalid HTML!'));
			}
		}

		return tree;
	}
};
