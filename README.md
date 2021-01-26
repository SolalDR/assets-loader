# assets-loader

## Description
A library to handle assets loading.

## How to use 

``` javascript
import AssetsLoader from '@solaldr/loader'
import { ThreeLoader } from '@solaldr/loader/examples/ThreeLoader'

const assetsLoader = new AssetsLoader([
  {
    test: /\/.(?:png|jpe?g)/,
    loader:  new ThreeLoader(new THREE.TextureLoader())
  },
  {
    test: /\/.(?:gltf|glb)/,
    loader:  new ThreeLoader(new THREE.GLTFLoader())
  }
])

assetsLoader.load('/test.glb').then((gltfScene) => {
  console.log(gltfScene);
})
```

## License

[MIT](LICENSE).
