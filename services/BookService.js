const request = require("request");
const xml2json = require('xmljson').to_json
const Enumerable = require('linq')
const GenreData = require('../datas/Genre')

module.exports = class BookService {
	constructor(appId) {
		this.appId = appId
		//this.genreId = genreId
	}

	getBooks(genre) {
		let appId = this.appId

		return new Promise((resolve, reject) => {
			request.get({
				url: "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&booksGenreId=001&applicationId=1075279617970362502",
				qs: {
					applicationId: appId,
					format: "xml",
					booksGenreId: GenreData[genre],
					sort:"sales",
					hits:10
				}
			}, function (error, res, body) {
				if (!error && res.statusCode == 200) {
					xml2json(body, (error, data) => {
						let Items = data.root.Items.Item;

						// let 	 = [];
						
						// bookTitles = Enumerable.from(Items).select(x => x.value.title).toArray()
						resolve(Items)
					});
				} else {
					reject(error)
					return;
				}
			})
		})
	}

	extractTitle(books){					
		return Enumerable.from(books)
			.select(x => x.value.title).toArray();
	}

	extractTitleAndCaption(books){
		return Enumerable.from(books)
			.select(x => ({
				title : x.value.title,
				caption : x.value.itemCaption,
				largeImageUrl : x.value.largeImageUrl
			})).toArray(); 
	}
}