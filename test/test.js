const assert = require('assert');
const Package = require('../dist/index')
class FakeLoader extends Package.Loader {
  load(file) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve({ file }), Math.random() * 1000 + 1000)
    })
  }
}

const AssetsManager = new Package.Manager([
	{
		test: /\.png/,
		loader: new FakeLoader()
	}
])


const a = AssetsManager.addGroup({
	name: 'test',
	files: ['./test.png'],
	groups: [
		{
			name: "bruh",
			files: [
				'./bruh.png',
				{
					name: 'test',
					path: './test/boulibou.png'
				}
			]
		}
	]
})

const b = AssetsManager.get('test');
console.log("hello", b)