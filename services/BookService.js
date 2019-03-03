const request = require("request");
const xml2json = require('xmljson').to_json

module.exports = class BookService {
	constructor(appId) {
		this.appId = appId
	}

	getBookTitle() {
		let appId = this.appId
	
		return new Promise((resolve, reject) => {
			request.get({
				url: "https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404?format=json&booksGenreId=001&applicationId=1075279617970362502",
				qs: {
					applicationId: appId,
					format: "xml",
					booksGenreId: "001",
					sort:"sales"
				}
			}, function (error, res, body) {
				if (!error && res.statusCode == 200) {
					xml2json(body, (error, data) => {
						let Items = data.root.Items.Item;

						let bookTitles = [];
						
						bookTitles = Enumerable.from(Items).select(x => x.value.Item.title).toArray()
						resolve(bookTitles)
					});
				} else {
					reject(error)
					return;
				}
			})
		})
	}
}