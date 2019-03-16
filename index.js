const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const Enumerable = require('linq')

// アプリのID
const EXTENSIONID = process.env.EXTENSIONID;
const RAKUTEN_WEB_API_APP_ID = process.env.RAKUTEN_WEB_API_APP_ID;
const LINE_TOKEN = process.env.LINE_TOKEN;

 //Clova Developer Centerで設定したExtension IDを使ってリクエストの検証を行うことができる
 //const clovaMiddleware = clova.Middleware({
    //applicationId: EXTENSIONID
 //});

const BookService = require('./services/BookService')
const Line = require('./services/LineService');
const myLine = new Line();
// LINE Notify トークンセット
myLine.setToken(LINE_TOKEN);

let bookService = new BookService(RAKUTEN_WEB_API_APP_ID)
let books = []

// 発話設定
const clovaSkillHandler = clova.Client
    .configureSkill()

    // 起動時に喋る
    .onLaunchRequest(responseHelper => {
        responseHelper.setSimpleSpeech({
            lang: 'ja',
            type: 'PlainText',
            value: 'かしこまりました。Clovaが本屋さんになりきって、おすすめを紹介します。',
        });
    })

    .onIntentRequest(async responseHelper => {
      const intent = responseHelper.getIntentName();
      console.log('Intent : ' + intent);

      const slots = responseHelper.getSlots();
      console.log(slots);

      const sessionId = responseHelper.getSessionId();

      switch (intent) {
        case 'SearchRequest':
          responseHelper.setSimpleSpeech({                   
            lang: 'ja',
            type: 'PlainText',
            value: '好きなジャンルを教えてください。',
          });
          break;

        case 'GenreSearch':
          
          books = await bookService.getBooks(slots.Genre)

          let titles = bookService.extractTitle(books)
          let speech = {
            lang: 'ja',
            type: 'PlainText',
            value: slots.Genre+ 'で人気なのは'+ titles.join(",") + 'です。' +'\n\n'+'詳細をLINEに送りますか？'
          }
          responseHelper.setSimpleSpeech(speech);
          break;

        case 'Clova.YesIntent':
          let captions = bookService.extractTitleAndCaption(books)
          let message = Enumerable.from(captions)
            .select(x =>
               "タイトル：" + x.title + x.subTitle 
              + "\n著者：" + x.author 
              + "\n出版社：" + x.publisherName
              + "\n発売日：" + x.salesDate 
              + "\nあらすじ：" + x.caption
              + "\n\n" + x.itemUrl
            ).toArray().join("\n\n\n")
          myLine.notify("\n"+message);

          responseHelper.setSimpleSpeech({                   
            lang: 'ja',
            type: 'PlainText',
            value: 'LINEに送信しました。他にお探しのジャンルはありますか？',
          });
          break;

        case 'Clova.NoIntent':
          responseHelper.setSimpleSpeech({                   
            lang: 'ja',
            type: 'PlainText',
            value: 'ご来店ありがとうございました。また呼んでくださいね。',
          });
          break;
        
        case 'Clova.GuideIntent':
          responseHelper.setSimpleSpeech({                   
            lang: 'ja',
            type: 'PlainText',
            value: '本のジャンルを指定してください。Clovaが今売れているタイトルを教えます。',
          });
          break;
      }
    })

    .onSessionEndedRequest(responseHelper => {
      const sessionId = responseHelper.getSessionId();
  })
  .handle();

  const app = new express();
  const port = process.env.PORT || 3000;
 
  //リクエストの検証を行う場合。環境変数APPLICATION_ID(値はClova Developer Center上で入力したExtension ID)が必須
 const clovaMiddleware = clova.Middleware({applicationId: EXTENSIONID});
 app.post('/clova', clovaMiddleware, clovaSkillHandler);
 app.get('/clova', (req, res, next) => {
   res.send('hello')
  })
 
 app.listen(port, () => console.log(`Server running on ${port}`));

 