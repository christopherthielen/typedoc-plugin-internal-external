import {Reflection, ReflectionKind} from "typedoc/lib/models/reflections/abstract";
import {Component, ConverterComponent} from "typedoc/lib/converter/components";
import {Converter} from "typedoc/lib/converter/converter";
import {Context} from "typedoc/lib/converter/context";
import {CommentPlugin} from "typedoc/lib/converter/plugins/CommentPlugin";
import {ContainerReflection} from "typedoc/lib/models/reflections/container";
import {getRawComment} from "typedoc/lib/converter/factories/comment";
import {Options, OptionsReadMode} from "typedoc/lib/utils/options";


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

    var externals = (options.getValue('external-aliases') || "external").split(",");
    var internals = (options.getValue('internal-aliases') || "internal").split(",");

    this.externalRegex = new RegExp(`@(${externals.join('|')})\\b`);
    this.internalRegex = new RegExp(`@(${internals.join('|')})\\b`);

    this.listenTo(this.owner, {
      [Converter.EVENT_CREATE_DECLARATION]:   this.onDeclaration,
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
    if (!node) return;

    // Look for @internal or @external
    let comment = getRawComment(node);
    let internalMatch = this.internalRegex.exec(comment);
    let externalMatch = this.externalRegex.exec(comment);

    if (internalMatch) {
      reflection.flags.isExternal = false;
    } else if (externalMatch) {
      reflection.flags.isExternal = true;
    }
  }
}
