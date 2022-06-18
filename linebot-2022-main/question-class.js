const { db } = require("./db");

//開発者用コマンド(/から始まるやつ)が利用可能になります　本番環境ではfalseにしよう。
//今使えるコマンド：
//  /reset
//    初期状態に戻る
//  /getstage
//    現在のstageを表示する。
//  /setstage [number]
//    自分のstageを[number]に設定する。
const ALLOW_DEV_COMMAND = true;

//適当に作った
class Question {
  constructor() {
    this.answers = [];
    this.hintKeywords = ["ヒント", "ひんと", "hint"];
    this.questionAskKeywords = ["問題", "もんだい"];

    //trueだとこれ以上stageが上昇しない
    //answersを空にすれば同じことができるけど、これ以上回答を受け付けたくない場合は一応設定してね
    this.isLastStage = false;
  }

  //正誤判定
  isCorrect(message) {
    return !this.isLastStage && this.answers.includes(message);
  }

  questionMessage() {
    return {
      type: "text",
      text: `問題メッセージが設定されていません`,
    };
  }

  hintMessage() {
    return {
      type: "text",
      text: `ヒントメッセージが設定されていません`,
    };
  }

  solveMessage() {
    return [
      {
        type: "text",
        text: `正解時メッセージが設定されていません`,
      },
    ];
  }

  elseMessage({ message }) {
    return {
      type: "text",
      text: `答えは「${message}」ではないようです…\n💡「ヒント」と入力するとヒントを見られます！\n💡「問題」と入力すると問題をもう一度確認できます！`,
    };
  }

  async getReply({ user, message }) {
    if (typeof message != "string") return;

    //正解
    if (this.isCorrect(message)) {
      return this.solveMessage({ user, message });

      //問題再表示
    } else if (this.questionAskKeywords.includes(message)) {
      return this.questionMessage({ user, message });

      //ヒント
    } else if (this.hintKeywords.some((keyword) => message.includes(keyword))) {
      return this.hintMessage({ user, message });

      //開発用コマンド。詳細は上部のコメントを参照
    } else if (ALLOW_DEV_COMMAND && message[0] === "/") {
      return await this.devCommand({ user, message });

      //それ以外
    } else {
      return this.elseMessage({ user, message });
    }
  }

  //開発用コマンド。本番で使用することは想定していないのでかなり雑実装(特にユーザーの存在確認とか)
  async devCommand({ user, message }) {
    const commandBody = message.split("/")[1];
    const [type, val] = commandBody.split(" ");

    //現在のstageを取得するやつ
    if (type === "getstage") {
      const currentUser = await db.findUser(user.userid);
      return {
        type: "text",
        text: `getstage: 現在のステージは${currentUser.stage}です。`,
      };

      //stageを変更するやつ
    } else if (type === "setstage") {
      if (Number.isInteger(Number(val))) {
        await db.setUserStage(user.userid, val);
        return {
          type: "text",
          text: `setstage: stageを${val}に設定しました。`,
        };
      } else {
        return {
          type: "text",
          text: `setstage: 入力"${val}"が不正です。整数を入力してください。`,
        };
      }
    } else if (type === "reset") {
      await db.setUserStage(user.userid, 0);
      const { getQuestion } = require("./questions");

      return [
        {
          type: "text",
          text: `reset: 各種データをリセットしました。`,
        },
        getQuestion(0).questionMessage(),
      ];
    } else {
      return {
        type: "text",
        text: `コマンド"${type}"は存在しません。`,
      };
    }
  }
}
exports.Question = Question;
