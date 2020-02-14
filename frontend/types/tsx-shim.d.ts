import {VNode} from 'vue'; // eslint-disable-line @typescript-eslint/no-unused-vars
import {ComponentRenderProxy} from '@vue/composition-api'; // eslint-disable-line @typescript-eslint/no-unused-vars

declare global {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface Element extends VNode {}
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface ElementClass extends ComponentRenderProxy {}
        interface ElementAttributesProperty {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            $props: any; // specify the property name to use
        }
        interface IntrinsicElements {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [elem: string]: any;
        }
    }
}
