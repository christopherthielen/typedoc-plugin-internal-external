/** @internal */
import './dir1/nest1';
import './external_module';
import './internal_module';
import './notspecified';

// export anything so typedoc >=0.16 will generate a module doc
export const str = 'string literal';
