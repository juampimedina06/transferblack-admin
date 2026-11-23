const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { MemoryRouter } = require('react-router-dom');

// Render the existing TSX screens without adding a separate test framework.
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
      },
      fileName: filename,
    });
    module._compile(outputText, filename);
  };
}

test('passenger terms contact section offers the supplied phone instead of an email', () => {
  const Screen = require('../src/presentation/legal/TermsScreen.tsx').default;
  const html = renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(Screen)),
  );
  const section = html.match(/<section><h2[^>]*>13\. Contacto<\/h2>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section, 'contact section must exist');
  assert.ok(section.includes('href="tel:3515901798"'));
  assert.ok(section.includes('3515901798</a>'));
  assert.ok(!section.includes('[EMAIL DE CONTACTO]'));
  assert.ok(!section.includes('mailto:'));
});
test('driver terms contact section offers the supplied phone instead of a pending email', () => {
  const Screen = require('../src/presentation/legal/DriverTermsScreen.tsx').default;
  const html = renderToStaticMarkup(
    React.createElement(MemoryRouter, null, React.createElement(Screen)),
  );
  const section = html.match(/<section><h2[^>]*>9\. Contacto<\/h2>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section, 'driver contact section must exist');
  assert.ok(section.includes('href="tel:3515901798"'));
  assert.ok(section.includes('3515901798</a>'));
  assert.ok(!section.includes('PENDIENTE'));
  assert.ok(!section.includes('mailto:'));
});
require.extensions['.png'] = (module) => { module.exports = 'logo.png'; };

const screens = [
  ['TermsScreen', false],
  ['PrivacyScreen', false],
  ['DriverTermsScreen', false],
  ['DriverPrivacyScreen', true],
  ['DeleteAccountInfoScreen', false],
];

for (const [name, draftExpected] of screens) {
  test(`${name} displays the supplied office address and contact phone`, () => {
    const Screen = require(path.join(__dirname, '../src/presentation/legal', name + '.tsx')).default;
    const html = renderToStaticMarkup(
      React.createElement(MemoryRouter, null, React.createElement(Screen)),
    );
    assert.ok(html.includes('Lázaro Langer 237, barrio Las Flores, Córdoba Capital'));
    assert.ok(html.includes('República Argentina'));
    assert.ok(html.includes('href="tel:3515901798"'));
    assert.ok(html.includes('3515901798</a>'));
    assert.ok(html.includes('<strong>Transferblack SAS</strong>'));
    assert.ok(html.includes('<strong>30-71967194-9</strong>'));
    assert.equal(html.includes('Borrador'), draftExpected);
    assert.ok(!html.includes('[DOMICILIO]'));
    assert.ok(!html.includes('DOMICILIO LEGAL]'));
  });
}
