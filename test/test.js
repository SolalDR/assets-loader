const assert = require('assert');
const Package = require('../dist/index')
class FakeLoader extends Package.Loader {
  load(file) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve("Subject loaded"), Math.random() * 1000 + 1000)
    })
  }
}

const AssetsManager = new Package.Manager([
	{
		test: /\.png/,
		loader: new FakeLoader()
	}
])


AssetsManager.loadFile('./test.png').then((file) => {
	console.log(file)
	AssetsManager.loadFile('./test.png').then((file2) => {
		console.log(file2)
	})
})
