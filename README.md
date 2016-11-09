## typedoc-plugin-internal-external

### What

A plugin for [Typedoc](http://typedoc.org)

Use an annotation (in a comment) to set code to "Internal" or "External".

### Examples

```
/** make this function @internal */
function internalFunction() {

}
```

```
/** make this class @external */
class ExternalClass {

}
```

```
/** @external Make all the code in this file (Dynamic Module) external */
/** A function in the dynamic module */
function func1() {
}
/** Another function in the dynamic module */
function func2() {
}
```


# Why

Typedoc categorizes your code into "Internal" and "External".
Essentially:

- Internal: Your own code
- External: Everything else

When using the default theme, typedoc provides a checkbox to show/hide the generated "External" documentation.

Typedoc uses the `files: []` array (in `tsconfig.json`) to determine if code is "Internal".
If a file being parsed is in the `files: []` array, then the code in that file is "Internal".

These annotations allow you to force code to be internal or external.

### Installing

Typedoc 0.4 has the ability to discover and load typedoc plugins found in node_modules.
Simply install the plugin and run typedoc.

```
npm install --save typedoc-plugin-internal-external
typedoc
```

### Using

Add `@internal` or `@external` to a comment.
That code's typedoc `Reflection` will have the `isExternal` boolean set accordingly.


```js
/**
 * @internal
 * This should always appear in the generated documentation
 */
class MyInternalClass {

}

/**
 * @external
 * This should only appear in the generated documentation when "Externals" is checked
 */
class MyExternalClass {

}
```


#### Annotation Aliases

Although the original purpose behind `Externals` was to hide documentation generated for external code,
you can use the show/hide feature of the default theme to hide whatever code you choose, by marking it as `@external`.
For example, you may have an internal API that you don't want shown in your docs by default.

Because marking "internal API" with "External" is counter-intuitive, you can choose an alias for the `@external`  annotation.

On the typedoc command line, define the aliases:

```
typedoc ....... --internal-aliases internal,publicapi --external-aliases external,internalapi
```

Then you can use those aliases in your comments:

```
/**
 * This should always appear in the generated documentation
 */
class PublicClass {

}

/**
 * @internalapi
 * This internal api's `Refletion` has `isExternal === true`, and should
 * only appear in the generated documentation when "Externals" is checked
 */
class InternalClass {

}
```
