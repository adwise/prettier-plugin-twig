# Twig HTML Prettier Plugin

This is a fork of the excellent [Shopify Liquid Prettier Plugin](https://github.com/Shopify/prettier-plugin-liquid).

As Liquid and Twig are quite similar, we were able to make minimal changes to the original plugin to support Twig.

This plugin is intended for HTML Twig templates (e.g. `.html.twig`). Twig can be used to template other file types (`.js.twig`, `.xml.twig`, etc.) but those are not a goal of this plugin. 
It may happen to work for some of them (such as `.xml.twig`), but that is incidental and not officially supported.

[Prettier](https://prettier.io) is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.

## Installation

```bash
# with npm
npm install --save-dev prettier @destination/prettier-plugin-twig

# with pnpm
pnpm add --save-dev prettier @destination/prettier-plugin-twig
```

The plugin must be declared in the [configuration](https://prettier.io/docs/en/configuration.html).

```
{
  "plugins": ["@destination/prettier-plugin-twig"]
}
```

## Configuration

Prettier for Twig supports the following options.

| Name                        | Default | Description                                                                                                                                                    |
|-----------------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `printWidth`                | `120`   | Changed from Prettier's default (`80`) ([see prettier docs](https://prettier.io/docs/en/options.html#print-width))                                             |
| `tabWidth`                  | `2`     | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#tab-width))                                                                  |
| `useTabs`                   | `false` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#tabs))                                                                       |
| `singleQuote`               | `false` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#quotes))                                                                     |
| `bracketSameLine`           | `false` | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#bracket-line))                                                               |
| `twigSingleQuote`           | `true`  | Use single quotes instead of double quotes in Twig tag and objects (since v0.2.0).                                                                             |
| `embeddedSingleQuote`       | `true`  | Use single quotes instead of double quotes in embedded languages (JavaScript, CSS, TypeScript inside `<script>`, `<style>` or Twig equivalent) (since v0.4.0). |
| `htmlWhitespaceSensitivity` | `css`   | Same as in Prettier ([see prettier docs](https://prettier.io/docs/en/options.html#html-whitespace-sensitivity))                                                |
| `singleLineLinkTags`        | `false` | If set to `true`, will print `<link>` tags on a single line to remove clutter                                                                                  |
| `indentSchema`              | `false` | If set to `true`, will indent the contents of the `{% schema %}` tag                                                                                           |

## Craft CMS

Craft's `cache`, `nav`, and `ifchildren` tags are recognized as paired blocks.
`switch` supports `case` branches, an optional `default`, and nested switches.
No `twigMultiTags` configuration is required for these tags.

Adjacent attribute output such as `<div{{ attributes|raw }}>...</div>` is
distinguished from a compound tag name by its static closing tag. Compound
names with matching closing tags, such as `<h{{ level }}>...</h{{ level }}>`,
remain supported. Attribute output immediately after void element names is also supported.

The parser still requires HTML and Twig blocks to form a tree. An HTML tag opened
in one template and closed in another cannot be validated as a complete element.
Whitespace-control markers may be added to preserve meaningful lack of whitespace;
they are not removed just to produce a cleaner diff.

## Ignoring code

We support the following comments (either via HTML or Twig comments):

- `prettier-ignore`
- `prettier-ignore-attribute`
- `prettier-ignore-attributes` (alias)

They target the next node in the tree. Unparseable code can't be ignored and will throw an error.

```twig
{# prettier-ignore #}
<div         class="x"       >hello world</div            >

{# prettier-ignore-attributes #}
<div
  x-data="{
    open: false,
    items: ['one', 'two', 'three']
  }"
  data-action="click->modal#open keydown.escape@window->modal#close"
></div>
```

## Contributing

[Read our contributing guide](CONTRIBUTING.md)

## License

MIT.
