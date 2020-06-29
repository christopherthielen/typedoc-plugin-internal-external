import { Component, ConverterComponent } from 'typedoc/dist/lib/converter/components';
import { Context } from 'typedoc/dist/lib/converter/context';
import { Converter } from 'typedoc/dist/lib/converter/converter';
import { getRawComment } from 'typedoc/dist/lib/converter/factories/comment';
import { CommentPlugin } from 'typedoc/dist/lib/converter/plugins/CommentPlugin';
import { ReflectionKind } from 'typedoc/dist/lib/models/reflections';
import { Reflection, ReflectionFlag, ReflectionFlags } from 'typedoc/dist/lib/models/reflections/abstract';

function setExternal(flags: ReflectionFlags, isExternal: boolean) {
  if (typeof flags.setFlag === 'function') {
    flags.setFlag(ReflectionFlag.External, isExternal);
  } else {
    // probably not needed, but won't hurt
    (flags as any).isExternal = isExternal;
  }
}

/**
 * This plugin allows you to specify if a symbol is internal or external.
 *
 * Add @internal or @external to the docs for a symbol.
 *
 * #### Example:
 * ```
 * &#47;**
 *  * @internal
 *  *&#47;
 * let foo = "123
 *
 * &#47;**
 *  * @external
 *  *&#47;
 * let bar = "123
 * ```
 */
@Component({ name: 'internal-external' })
export class InternalExternalPlugin extends ConverterComponent {
  externals: string[];
  internals: string[];

  externalRegex: RegExp;
  internalRegex: RegExp;

  initialize() {
    this.listenTo(this.owner, {
      [Converter.EVENT_BEGIN]: this.readOptions,
      [Converter.EVENT_CREATE_SIGNATURE]: this.onSignature,
      [Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
      [Converter.EVENT_FILE_BEGIN]: this.onFileBegin,
    });
  }

  private static markSignatureAndMethod(reflection: Reflection, external: boolean) {
    setExternal(reflection.flags, external);
    // if (reflection.parent && (reflection.parent.kind === ReflectionKind.Method || reflection.parent.kind === ReflectionKind.Function) {
    if (reflection.parent && reflection.parent.kind & ReflectionKind.FunctionOrMethod) {
      setExternal(reflection.parent.flags, external);
    }
  }

  private readOptions() {
    const { options } = this.application;

    this.externals = ((options.getValue('external-aliases') as string) || 'external').split(',');
    this.internals = ((options.getValue('internal-aliases') as string) || 'internal').split(',');

    this.externalRegex = new RegExp(`@(${this.externals.join('|')})\\b`);
    this.internalRegex = new RegExp(`@(${this.internals.join('|')})\\b`);
  }

  /**
   * Triggered when the converter has created a declaration reflection.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private onSignature(context: Context, reflection: Reflection, node?) {
    if (!reflection.comment) return;

    // Look for @internal or @external
    let comment = reflection.comment;

    if (this.internals.some(tag => comment.hasTag(tag))) {
      InternalExternalPlugin.markSignatureAndMethod(reflection, false);
    } else if (this.externals.some(tag => comment.hasTag(tag))) {
      InternalExternalPlugin.markSignatureAndMethod(reflection, true);
    }

    this.internals.forEach(tag => comment.removeTags(tag));
    this.externals.forEach(tag => comment.removeTags(tag));
  }

  /**
   * Triggered when the converter has created a declaration reflection.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private onDeclaration(context: Context, reflection: Reflection, node?) {
    if (!reflection.comment) return;

    // Look for @internal or @external
    let comment = reflection.comment;

    if (this.internals.some(tag => comment.hasTag(tag))) {
      setExternal(reflection.flags, false);
    } else if (this.externals.some(tag => comment.hasTag(tag))) {
      setExternal(reflection.flags, true);
    }

    this.internals.forEach(tag => comment.removeTags(tag));
    this.externals.forEach(tag => comment.removeTags(tag));
  }

  /**
   * Triggered when the converter has started loading a file.
   *
   * This sets the file's context `isExternal` value if an annotation is found.
   * All symbols inside the file default to the file's `isExternal` value.
   *
   * The onFileBegin event is used because once the Declaration (which represents
   * the file) has been created, it's too late to update the context.
   * The declaration will also be processed during `onDeclaration` where the tags
   * will be removed from the comment.
   *
   * @param context  The context object describing the current state the converter is in.
   * @param reflection  The reflection that is currently processed.
   * @param node  The node that is currently processed if available.
   */
  private onFileBegin(context: Context, reflection: Reflection, node?) {
    if (!node) return;

    // Look for @internal or @external
    let comment = getRawComment(node);
    let internalMatch = this.internalRegex.exec(comment);
    let externalMatch = this.externalRegex.exec(comment);

    if (internalMatch) {
      context.isExternal = false;
    } else if (externalMatch) {
      context.isExternal = true;
    }
  }
}
