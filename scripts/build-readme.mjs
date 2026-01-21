import markdownit from "markdown-it";
import { basename } from "node:path";
import { glob, readFile, writeFile } from "node:fs/promises";

const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    body {
      background: #fafafa;
      color: #333;
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }

    main {
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #fff;
      border: 1px solid #ddd;
    }

    code {
      background-color: #f4f4f4;
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Courier New', Courier, monospace;
    }
  </style>
</head>
<body>
  <main>
    {{content}}
  </main>
</body>
</html>
`.trim();

const md = markdownit();
const files = glob("./template/*.md");
for await (const file of files) {
  const outputFile = file.replace(/\.md$/, ".html");
  const content = await readFile(file, "utf-8");
  const html = md.render(content);
  const finalHtml = htmlTemplate
    .replace("{{content}}", html)
    .replace("{{title}}", basename(file, ".md"))
    .replace(/\.md/g, ".html");

  await writeFile(outputFile, finalHtml, "utf-8");
}
