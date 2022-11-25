# posthtml-w3c-validator [![npm version](https://img.shields.io/npm/v/posthtml-w3c-validator.svg)](https://www.npmjs.com/package/posthtml-w3c-validator)

Онлайн-валидатор W3C с резервным оффлайн-валидатором.


## Установка

`npm i -E posthtml-w3c-validator`


## Использование в произвольном коде

```js
const { validateHtml } = require('posthtml-w3c-validator');

// Где-то внутри middleware, получившей HTML-код:
if (process.env.NODE_ENV === 'development') {
  const validationMessage = await validateHtml({ htmlCode });
  console.log(validationMessage);
}

```

`validateHtml` принимает объект с параметрами:
1. `htmlCode` – проверяемый HTML-код.
2. `sourceName` – источник кода, отображаемый перед выводом номеров строки и символа. По умолчанию – пустая строка.
3. `htmlvalidateOptions` – опции [резервного валидатора](https://www.npmjs.com/package/html-validate). По умолчанию – содержимое `.htmlvalidate.json` данного пакета.

## Использование в posthtml.config.js


```js
const { getPosthtmlW3cValidator } = require('posthtml-w3c-validator');

module.exports = () => ({
  plugins: [
    // other plugins
    getPosthtmlW3cValidator()
  ]
});

```

`getPosthtmlW3cValidator` может принимать объект с необязательными параметрами:

1. `getSourceName` – коллбэк для генерации имени источника на основе posthtml-дерева. По умолчанию – `(tree) => tree.options.from` .
2. `log` – коллбэк-логгер. По умолчанию – `console.log`.
3. `htmlvalidateOptions` – Опции [резервного валидатора](https://www.npmjs.com/package/html-validate). По умолчанию – содержимое `.htmlvalidate.json` данного пакета.
4. `forceOffline` – запускает резервный валидатор не только при недоступности основного, но и при ненахождении им ошибок (чтобы задействовать некоторые проверки доступности, отсутствующие в основном валидаторе). По умолчанию – `false`.
5. `exit` – осуществляет принудительный выход из приложения (например, при тестировании в сборочной линии или в прекоммит-хуке). По умолчанию – `false`.
