const express = require("express");
const line = require("@line/bot-sdk");
const { db } = require("./db");
const { getQuestion } = require("./questions");

//開発環境で.envファイルがあるなら読み込む
//デプロイ先では環境変数に CHANNEL_ACCESS_TOKEN, CHANNEL_SECRETを登録してね
require("dotenv").config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();

// URLには .../webhookを指定する必要があるので注意
app.post("/webhook", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

const handleEvent = async (event) => {
  //友達追加時の処理
  if (event.type === "follow" && event.source.type === "user") {
    //1問目の問題文を入手
    const reply = getQuestion(0).questionMessage();
    return client.replyMessage(event.replyToken, reply);

    //画像やスタンプなどの例外的なメッセージ。これに対して沈黙で返してます(雑)
  } else if (
    event.source.type != "user" ||
    event.type !== "message" ||
    event.message.type !== "text"
  ) {
    return Promise.resolve(null);
  }

  const userID = event.source.userId;

  const user = await db.findOrCreateUser(userID);
  console.log(user);
  const question = getQuestion(user.stage);
  console.log(question);

  //replyを強引に配列にする
  const reply = [].concat(
    await question.getReply({
      user,
      message: event.message.text,
    })
  );

  //非全クリ状態で正解した場合は次の問題文をreplyに追加し、stageを次に進める
  if (!question.isLastStage && question.isCorrect(event.message.text)) {
    const nextQuestion = getQuestion(user.stage + 1);
    if (!nextQuestion.isLastStage) {
      reply.push(
        nextQuestion.questionMessage({ user, message: event.message.text })
      );
    }
    await db.advanceUserStage(userID);
  }

  console.log(reply);

  return client.replyMessage(event.replyToken, reply);
};

//herokuデプロイ時にはprocess.env.PORTの方が使われる
const port = process.env.PORT || 3000;
app.listen(port);
