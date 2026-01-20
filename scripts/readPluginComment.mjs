import { parse } from "acorn";

/**
 * プラグインのヘッダー/ヘルプコメントを抽出する
 * @param {string} code
 * @returns string
 */
export async function readPluginComment(code) {
  const comments = [];
  try {
    parse(code, {
      ecmaVersion: "latest",
      sourceType: "script",
      allowHashBang: true,
      allowReturnOutsideFunction: true,
      locations: true,
      onComment: comments,
    });
  } catch (e) {
    console.error("Error parsing code:", e);
  }

  comments.sort((a, b) => a.start - b.start);

  const helpComments = [];
  let foundHelpComment = false;
  for (const comment of comments) {
    if (comment.type === "Block" && comment.value.startsWith(":")) {
      foundHelpComment = true;
      helpComments.push(`/*${comment.value}*/`);
    } else if (foundHelpComment) {
      break;
    } else if (comment.type === "Block") {
      // ヘルプコメント発見以前のブロックコメントはライセンス等とみなして保持
      helpComments.push(`/*${comment.value}*/`);
    }
  }

  return helpComments.join("\n\n");
}
