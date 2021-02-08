# assets-loader

## Description
A library to handle assets loading.

## Installation

```
npm i @solaldr/loader
```

## How to use 

### Basic use

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

### Add Group

With array definition
``` javascript
const g = assetsLoader.addGroup([
  "./object.gltf", 
  { name: 'test', path: './test.gltf' }
])
```

With object definition
``` javascript
const g = assetsLoader.addGroup({
  name: 'global',
  baseUrl: './public/',
  files: [ "object.gltf", "object2.gltf" ]
})
```

Inside another group
``` javascript
group.addGroup({
  name: 'subGroup',
  baseUrl: './public/',
  files: [ "object3.gltf", "object4.gltf" ]
})
```

### Load a group

From an existent group
``` javascript
group.load();
```

Directly during création
``` javascript
const results = await assetsLoader.loadGroup({
  name: 'global',
  baseUrl: './public/',
  files: [ "object.gltf", "object2.gltf" ]
})
```

### Add File

From string definition
``` javascript
const file = assetsLoader.addFile("test.png")
```

From object definition 
``` javascript
const file = assetsLoader.addFile({
  name: "test",
  path: "./test.png"
})
```

### Load a file
``` javascript
const result = await file.load()
```

### Fetch a file or a group

``` javascript
const group = assetsManager.get('global')
```

### Events

| event       | description                                    | compat                     |
|-------------|------------------------------------------------|----------------------------|
| `load`      | Triggered when the ressource is fully loaded   | `File`\|`Group`\|`Manager` |
| `progress`  | Wrapper for the `ProgressEvent`                | `File`\|`Group`\|`Manager` |
| `file:load` | Triggered when a file is loaded inside a group | `Group`                    |


## License

[MIT](LICENSE).
