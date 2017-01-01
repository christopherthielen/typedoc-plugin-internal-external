import { Reflection, IReflectionFlags } from "typedoc/dist/lib/models/reflections/abstract";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter } from "typedoc/dist/lib/converter/converter";
import { Context } from "typedoc/dist/lib/converter/context";
import { Comment } from "typedoc/dist/lib/models/comments/comment";
import { CommentPlugin } from "typedoc/dist/lib/converter/plugins/CommentPlugin";
import { getRawComment } from "typedoc/dist/lib/converter/factories/comment";
import { Options, OptionsReadMode } from "typedoc/dist/lib/utils/options";
/**
 * This plugin allows you to specify if a symbol is internal or external.
 *
 * Add @internal or @external to the docs for a symbol.
 *
 * @example
 * ```
 *
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
@Component({name:'internal-external'})
export class InternalExternalPlugin extends ConverterComponent
{
  externals: string[];
  internals: string[];

  externalRegex: RegExp;
  internalRegex: RegExp;

  initialize() {
    var options: Options = this.application.options;
    options.read({}, OptionsReadMode.Prefetch);

    this.externals = (options.getValue('external-aliases') || "external").split(",");
    this.internals = (options.getValue('internal-aliases') || "internal").split(",");

    this.externalRegex = new RegExp(`@(${this.externals.join('|')})\\b`);
    this.internalRegex = new RegExp(`@(${this.internals.join('|')})\\b`);

    this.listenTo(this.owner, {
      [Converter.EVENT_CREATE_DECLARATION]:   this.onDeclaration,
      [Converter.EVENT_FILE_BEGIN]:           this.onFileBegin,
    });
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
      reflection.flags.isExternal = false;
    } else if (this.externals.some(tag => comment.hasTag(tag))) {
      reflection.flags.isExternal = true;
    }

    this.internals.forEach(tag => CommentPlugin.removeTags(comment, tag));
    this.externals.forEach(tag => CommentPlugin.removeTags(comment, tag));
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
