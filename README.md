# proofOfConcept
Proof of Concept for FilePress basic idea.

## Approach

We handle all files in a given directory using streams and transforms defined on this stream. From each file found in a directory (recursively) we generate an object to be passed through a stream.

```javascript
{
  sourcePath,   //Where this file originally came from
  path,         //The path to save this file to (at first where it came from)
  extension,    //The extension of the current content
  content,      //Content of the file
  written       //If the file was already saved
}
```

Any transform defined on the stream of files should look for the extension and using that decide weather to act or not. Any transform should be defined as a function taking arguments to configure it's behaviour and return a function. A simple logger would look like this:

```javascript
const logger = (level) => (item) => {
  console.[level](item)
  
  //Make sure to return the item so that the stream continues
  return item
}

//Usage
filepress('./source')
  .use(logger('log'))
  .end()
```

We will expose functions to:

- register a transform
- collect all files into an array
- spread the array out again
- write files 

We will also require to pass a source folder to the initial function and call `.end()` to start the handling.

Internally we will define a stream and concatenate it with operations, creating one big transform that will be executed as files pass through it.
