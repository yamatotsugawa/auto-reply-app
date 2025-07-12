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

  const isEmail = medium === 'メール';

  const displayName =
    companyName === "ホラー映画団長"
      ? "ホラー映画団長こと津川と申します"
      : `${companyName}の津川大和です`;

  const signature =
    companyName === "ホラー映画団長"
      ? "ホラー映画団長\n津川"
      : `${companyName}\n津川大和`;

  const systemPrompt = `あなたは日本のビジネス文書作成の専門家です。
以下のルールを必ず守って返信文を作成してください：

${isEmail ? `
【メール返信の場合】
1. 文字数は400文字以内に収める
2. 相手のメッセージから相手の会社名・部署名を抽出して宛先として使用する
3. 「お世話になっております。」から始める（「いつも」は付けない）
4. 自分の会社名・名前を明記する（今回の依頼者: ${displayName}）
5. 相手のメッセージ内容を必ず反映する
6. 指定された文体・トーンを守る
7. 自然で丁寧な日本語を使用する
8. 段落構成を意識する（宛先→挨拶→本文→結び）
` : `
【LINE・チャット返信の場合】
1. 文字数は200文字以内に収める
2. 「お世話になっています。」から始める（ただし「フランク」「ラフ」の場合は不要）
3. 宛先や会社名は不要
4. 簡潔で親しみやすい文体
5. 相手のメッセージ内容を必ず反映する
6. 指定された文体・トーンを守る
7. 自然で丁寧な日本語を使用する
8. 改行は2〜3行程度で視認性を意識する
`}\n`;

  const userPrompt = `以下の条件で返信文を作成してください：

【基本情報】
- 送信モード: ${mode === 'reply' ? '返信' : '新規作成'}
- 媒体: ${medium}
- 相手の属性: ${recipientRole}
- 文体の硬さ: ${tone}
- 自分の署名: ${displayName}

【内容】
- 目的: ${purpose || '一般的な返信'}
- 伝えたい内容: ${content || '相手のメッセージに対する適切な返信'}
- 状況: ${situation || '通常のビジネス連絡'}
- 背景情報: ${[background1, background2].filter(Boolean).join(' / ') || '特になし'}

【相手からのメッセージ】
"""
${incomingMessage?.trim() || 'メッセージが提供されていません'}
"""

${isEmail ? `
【メール返信の重要な指示】
・相手の会社名・部署名・名前を1行目に記載
・署名として「${signature}」を使用
・メール本文では相手の内容に対応しつつ、「${content}」の内容も自然に組み込む
・トーン別に表現を調整（丁寧・親しみ・ラフさのバランス）
・文末には丁寧な結びの挨拶を含める
・文末に署名「${signature}」を必ず記載する
` : `
【LINE・チャット返信の重要な指示】
・冒頭に「お世話になっています。」を使う。ただし「フランク」「ラフ」の場合は不要
・全体は200文字以内を目安にし、改行2〜3回はOK
・「${content}」の要素を自然に組み込み、親しみある言い回しにする
・最後は媒体・トーンに合った結び（例：「よろしくです！」「ありがとうございます！」など）
・文末に署名「${signature}」を必ず記載する
`}\n`;

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
      throw new Error(`OpenAI API Error: ${errorData.error?.message || res.statusText}`);
    }

    const data = await res.json();

    if (!data.choices?.[0]?.message?.content) {
      throw new Error("APIから有効な返信文が取得できませんでした");
    }

    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error("返信文生成エラー:", error);
    if (error instanceof Error) {
      return `返信文の生成に失敗しました: ${error.message}`;
    }
    return "返信文の生成に失敗しました。しばらく時間をおいて再度お試しください。";
  }
}
