//このファイルをいじれば最低限クイズは作れる
//後はがんばれ

const { Question } = require("./question-class");

//-----------------
//  問題１
//-----------------
class Q1 extends Question {
  constructor() {
    super();
    this.answers = ["フライパン", "ふらいぱん", "🍳"];
  }

  questionMessage() {
    return {
      type: "text",
      text: `問題1: パンはパンでも食べられないパンは何？`,
    };
  }

  hintMessage() {
    return {
      type: "text",
      text: `フライパン以外の言葉は許容するはずがないだろう。`,
    };
  }

  solveMessage() {
    return {
      type: "text",
      text: `正解！ 次の問題いってみよう！`,
    };
  }
}

//-----------------
//  問題２
//-----------------
class Q2 extends Question {
  constructor() {
    super();
    this.answers = ["イルカ", "いるか", "海豚", "🐬"];
  }

  questionMessage() {
    return {
      type: "text",
      text: `第二問：ひっくり返ると軽くなる動物ってなーんだ？`,
    };
  }

  hintMessage() {
    return {
      type: "text",
      text: `ひっくり返ると「かるい」動物だよ！`,
    };
  }

  solveMessage() {
    //複数のメッセージで返答したい場合、こんな感じで配列で返せる
    return [
      {
        type: "text",
        text: `正解！`,
      },
      {
        type: "text",
        text: `全問クリア！おめでとう！`,
      },
    ];
  }
}

//-----------------
//  全問正解後
//-----------------
class QuestionEnd extends Question {
  constructor() {
    super();
    //これがtrueだとこれ以上進まない状態になる
    this.isLastStage = true;
    this.answers = [];
    this.hintKeywords = [];
  }

  elseMessage() {
    return [
      {
        type: "text",
        text: `挑戦してくれてありがとう！\n開発者向け： /reset と入力すると初期状態に戻れます`,
      },
      //↓画像表示の例↓　originalは10MBまで、previewは1MBまで
      {
        type: "image",
        originalContentUrl:
          "https://res.cloudinary.com/dsrxsmoqv/image/upload/v1655024487/TanaFes/UJIOf9FKP5U_ydcp1u.jpg",
        previewImageUrl:
          "https://res.cloudinary.com/dsrxsmoqv/image/upload/c_fit,w_400,h_400/v1655024487/TanaFes/UJIOf9FKP5U_ydcp1u.jpg",
      },
      {
        type: "text",
        text: `画像送信テスト：おいしそうなイチゴの画像`,
      },
    ];
  }
}

//-----------------
//  クイズ分岐
//-----------------
exports.getQuestion = (stage) => {
  //ここに作成した問題の一覧を記載
  //左からstage=0, 1, 2...に該当する
  const questions = [Q1, Q2, QuestionEnd];

  if (questions.length >= stage) {
    const QuestionClass = questions[stage];
    return new QuestionClass();
  } else {
    console.error(`stageの値が不正です: ${stage}`);
    const QuestionClass = questions[questions.length - 1];
    return new QuestionClass();
  }
};
