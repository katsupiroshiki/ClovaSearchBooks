const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');

// アプリのID
const EXTENSIONID = process.env.EXTENSIONID;
const RAKUTEN_WEB_API_APP_ID = process.env.RAKUTEN_WEB_API_APP_ID;

// Clova Developer Centerで設定したExtension IDを使ってリクエストの検証を行うことができる
//const clovaMiddleware = clova.Middleware({
//    applicationId: EXTENSIONID
//});

const BookService = require('./services/BookService')

// 発話設定
const clovaSkillHandler = clova.Client
    .configureSkill()

    // 起動時に喋る
    .onLaunchRequest(responseHelper => {
        responseHelper.setSimpleSpeech({
            lang: 'ja',
            type: 'PlainText',
            value: '起動しました。',
        });
    })

    .onIntentRequest(async responseHelper => {
      const intent = responseHelper.getIntentName();
      

      const sessionId = responseHelper.getSessionId();
      console.log('Intent : ' + intent);

      const slots = responseHelper.getSlots();
      console.log(slots);

      switch (intent) {
        case 'SearchRequest':
          responseHelper.setSimpleSpeech({                   
            lang: 'ja',
            type: 'PlainText',
            value: '好きなジャンルを教えてください',
          });
          break;
        case 'GenreSearch':
          let bookService = new BookService(RAKUTEN_WEB_API_APP_ID)
          let bookTitles = await bookService.getBookTitle()

          speech.value = bookTitles.join(",")

          responseHelper.setSimpleSpeechh(
            clova.SpeechBuilder.createSpeechText(speech)
          );
          
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
const clovaMiddleware = clova.Middleware({applicationId: 'EXTENSIONID'});
app.post('/clova', clovaMiddleware, clovaSkillHandler);

app.listen(port, () => console.log(`Server running on ${port}`));