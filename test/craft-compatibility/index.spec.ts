import { expect } from 'chai';
import { format } from '../test-helpers';
import { toLiquidHtmlAST } from '../../src/parser/stage-2-ast';

const options = { tabWidth: 4, printWidth: 120, singleQuote: false };

async function stable(source: string) {
  const result = await format(source, options);
  expect(await format(result, options)).to.equal(result);
  return result;
}

describe('Craft compatibility', () => {
  it('preserves adjacent attribute output without confusing it with a dynamic tag name', async () => {
    const source = '<div{{ attributes|raw }}>Hello</div>';
    const ast = toLiquidHtmlAST(source);
    const element = ast.children[0] as any;
    expect(element.name.map((part: any) => part.value)).to.eql(['div']);
    expect(element.attributes).to.have.length(1);
    expect(await stable(source)).to.equal('<div{{ attributes | raw }}>Hello</div>\n');
  });

  it('preserves multiple adjacent attribute expressions and nested elements', async () => {
    const source = '<div{{ first|raw }}{{ second|raw }}><div{{ third|raw }}>Hello</div></div>';
    const result = await stable(source);
    expect(result).to.include('<div{{ first | raw }}{{ second | raw }}>');
    expect(result).to.include('<div{{ third | raw }}>Hello</div>');
  });

  it('keeps compound tag names when the closing tag matches', async () => {
    const source = '<h{{ level }}>Hello</h{{ level }}>';
    expect(await stable(source)).to.equal(source + '\n');
  });

  it('supports adjacent attribute output on void elements', async () => {
    expect(await stable('<input{{ attributes|raw }}>')).to.equal('<input{{ attributes | raw }}>\n');
  });

  it('supports conditional attributes without discarding either branch', async () => {
    const result = await stable(
      '<select {% if required %}required{% else %}disabled{% endif %}></select>',
    );
    expect(result).to.include('{% if required %}');
    expect(result).to.include('required\n');
    expect(result).to.include('disabled\n');
    expect(result).to.include('{% endif %}');
  });

  for (const suffix of ['', '{% default %}<p>Other</p>']) {
    it(`supports switch branches ${suffix ? 'with' : 'without'} a default`, async () => {
      const source = `{% switch site %}{% case 'nl' %}<p>NL</p>{% case 'be' %}<p>BE</p>${suffix}{% endswitch %}`;
      const result = await stable(source);
      expect(result).to.match(/    {%[-~]? case 'nl' %}/);
      expect(result).to.include('        <p>NL</p>');
      expect(result).to.include("    {% case 'be' %}");
      expect(result).to.include('        <p>BE</p>');
      expect(result).to.include('{% endswitch %}');
    });
  }

  it('supports complex case expressions and nested switches', async () => {
    const source =
      "{% switch outer %}{% case 'a' or 'b' %}{% switch inner %}{% case 'c' %}<p>C</p>{% endswitch %}{% default %}<p>D</p>{% endswitch %}";
    const result = await stable(source);
    expect(result).to.match(/{%[-~]? case 'a' or 'b' [-~]?%}/);
    expect(result).to.include('<p>C</p>');
    expect(result).to.include('<p>D</p>');
  });

  it('treats cache, nav and ifchildren as nested blocks', async () => {
    const source =
      '{% cache %}\n{% nav entry in entries %}\n<li>\n{{ entry.title }}\n{% ifchildren %}\n<ul>{% children %}</ul>\n{% endifchildren %}\n</li>\n{% endnav %}\n{% endcache %}';
    const result = await stable(source);
    expect(result).to.include('    {% nav entry in entries %}');
    expect(result).to.include('        <li>');
    expect(result).to.include('            {% ifchildren %}');
    expect(result).to.include('                <ul>');
    expect(result).to.include('    {% endnav %}');
    expect(result).to.include('{% endcache %}');
  });

  it('does not hide invalid HTML or unclosed Craft blocks', () => {
    expect(() => toLiquidHtmlAST('<div></div></div>')).to.throw();
    expect(() => toLiquidHtmlAST('{% cache %}<div></div>')).to.throw();
    expect(() => toLiquidHtmlAST('{% nav entry in entries %}{% endcache %}')).to.throw();
  });
});
