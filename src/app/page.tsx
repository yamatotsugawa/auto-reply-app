"use client";

import React, { useState } from "react";
import generateReply from "@/utils/generateReply";

export default function AutoReplyForm() {
  const [mode, setMode] = useState("reply");
  const [media, setMedia] = useState("メール");
  const [attribute, setAttribute] = useState("取引先");
  const [tone, setTone] = useState("ノーマル");
  const [replyType, setReplyType] = useState("返信");
  const [incomingMessage, setIncomingMessage] = useState("");
  const [keywords, setKeywords] = useState("");
  const [companyName, setCompanyName] = useState("津川ヒカリ治療院");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateReply({
        mode,
        recipientRole: attribute,
        tone,
        purpose: replyType,
        content: keywords,
        situation: "",
        background1: "",
        background2: "",
        medium: media,
        incomingMessage,
        companyName,
      });
      setReply(result);
    } catch (error) {
      console.error("生成エラー:", error);
      setReply("返信文の生成に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-orange-600 text-center">
          自動返信文作成アプリ
        </h1>

        {/* 相手からのメッセージ */}
        <label className="block font-semibold mb-1">相手からのメッセージ：</label>
        <textarea
          value={incomingMessage}
          onChange={(e) => setIncomingMessage(e.target.value)}
          placeholder="相手から来たメールやメッセージをここに貼り付けてください"
          className="w-full border p-2 rounded mb-6"
          rows={4}
        />

        {/* モード */}
        <div className="mb-4">
          <label className="font-semibold block mb-1">モード：</label>
          <label className="mr-4">
            <input
              type="radio"
              checked={mode === "new"}
              onChange={() => setMode("new")}
              className="mr-1"
            />
            新規作成
          </label>
          <label>
            <input
              type="radio"
              checked={mode === "reply"}
              onChange={() => setMode("reply")}
              className="mr-1"
            />
            返信作成
          </label>
        </div>

        {/* プルダウン4つ横並び */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block font-semibold mb-1">やり取りの媒体：</label>
            <select value={media} onChange={(e) => setMedia(e.target.value)} className="w-full border p-2 rounded">
              <option>メール</option>
              <option>LINE</option>
              <option>チャットワーク/スラック</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">相手の属性：</label>
            <select value={attribute} onChange={(e) => setAttribute(e.target.value)} className="w-full border p-2 rounded">
              <option>取引先</option>
              <option>社内</option>
              <option>顧客</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">文章の硬さ：</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full border p-2 rounded">
              <option>超硬く</option>
              <option>しっかり硬く</option>
              <option>ノーマル</option>
              <option>フランク</option>
              <option>ラフ</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">返信種別：</label>
            <select value={replyType} onChange={(e) => setReplyType(e.target.value)} className="w-full border p-2 rounded">
              <option>返信</option>
              <option>感謝</option>
              <option>謝罪</option>
            </select>
          </div>
        </div>

        {/* 肩書き */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">肩書き（会社名）：</label>
          <select
            className="w-full border p-2 rounded"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          >
            <option value="">（肩書きなし）</option>
            <option value="津川ヒカリ治療院">津川ヒカリ治療院</option>
            <option value="株式会社やまと">株式会社やまと</option>
            <option value="ホラー映画団長">ホラー映画団長</option>
          </select>
        </div>

        {/* キーワード入力 */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">返信したい内容：</label>
          <textarea
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="伝えたい内容やキーワードを入力…"
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>

        {/* 生成ボタン */}
        <button
          onClick={handleGenerate}
          className="w-full bg-orange-500 text-white py-3 rounded hover:bg-orange-600 transition"
        >
          {loading ? "生成中..." : "✨ 文章を生成する"}
        </button>

        {/* 結果表示 */}
        {reply && (
          <div className="mt-6 p-4 bg-gray-100 rounded border whitespace-pre-wrap">
            {reply}
          </div>
        )}
      </div>
    </main>
  );
}
