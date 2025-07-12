export default async function generateReply({
  mode,
  recipientRole,
  tone,
  purpose,
  content,
  situation,
  background1,
  background2,
  medium,
  incomingMessage,
  companyName,
}: {
  mode: string;
  recipientRole: string;
  tone: string;
  purpose: string;
  content: string;
  situation: string;
  background1: string;
  background2: string;
  medium: string;
  incomingMessage: string;
  companyName: string;
}) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key is not configured");

  const isEmail = medium === "メール";

  // ✅ 肩書きが空欄だったら署名も表示しない
  const displayName =
    companyName === ""
      ? "津川大和"
      : companyName === "ホラー映画団長"
      ? "ホラー映画団長こと津川と申します"
      : `${companyName}の津川大和です`;

  const signature =
    companyName === ""
      ? "津川大和"
      : companyName === "ホラー映画団長"
      ? "ホラー映画団長\n津川"
      : `${companyName}\n津川大和`;

  const systemPrompt = `あなたは日本のビジネス文書作成の専門家です。
以下のルールを必ず守って返信文を作成してください：

${isEmail ? `
【メール返信の場合】
1. 文字数は400文字以内に収める
2. 相手のメッセージから会社名・部署名・個人名を抽出して宛先とする
3. 「お世話になっております。」から始める（「いつも」は避ける）
4. 自分の署名を記載する（今回の依頼者: ${displayName}）
5. 相手のメッセージ内容を必ず反映する
6. 指定された文体・トーンを守る
7. 自然で丁寧な日本語を使う
8. 段落構成を意識する（宛名→挨拶→本文→結び）
` : `
【LINE・チャット返信の場合】
1. 文字数は200文字以内に収める
2. 「お世話になっています。」から始める（※トーンが「フランク」「ラフ」の場合は省略）
3. 簡潔で親しみやすい文体にする
4. 相手のメッセージに必ず触れる
5. トーンに応じた語調にする
6. 改行は適度に使い、2〜3行構成でOK
`}`;

  const userPrompt = `以下の条件で返信文を作成してください：

【基本情報】
- モード: ${mode === "reply" ? "返信" : "新規作成"}
- 媒体: ${medium}
- 相手の属性: ${recipientRole}
- 文章の硬さ: ${tone}
- 自分の署名: ${signature}

【内容】
- 目的: ${purpose}
- 伝えたい内容: ${content}
- 状況: ${situation || "通常のやりとり"}
- 背景情報: ${[background1, background2].filter(Boolean).join(" / ") || "特になし"}

【相手からのメッセージ】
"""
${incomingMessage?.trim() || "メッセージが提供されていません"}
"""

${isEmail ? `
【メール用の構成ルール】
・1行目に相手の会社名・部署名・名前（推測でOK）
・挨拶「お世話になっております。」
・${displayName} の行を必ず挿入
・本文では相手メッセージと${content}の要素を自然に反映
・末尾は丁寧に締めくくる（署名：${signature}）

※ companyName が空白の場合は、津川大和の名前のみ署名として使ってください
` : `
【LINE・チャット返信構成】
・冒頭に「お世話になっています。」（ただし「フランク」「ラフ」は省略）
・本文では相手メッセージと ${content} を反映
・最後は自然な結びで締める（例：「ありがとうございます！」など）
`}
`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.9,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        `OpenAI API Error: ${errorData.error?.message || res.statusText}`
      );
    }

    const data = await res.json();
    const message = data.choices?.[0]?.message?.content;

    if (!message) {
      throw new Error("APIから有効な返信文が取得できませんでした");
    }

    return message.trim();
  } catch (error) {
    console.error("返信文生成エラー:", error);
    if (error instanceof Error) {
      return `返信文の生成に失敗しました: ${error.message}`;
    }
    return "返信文の生成に失敗しました。しばらく時間をおいて再度お試しください。";
  }
}
