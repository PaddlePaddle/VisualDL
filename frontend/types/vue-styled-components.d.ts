// https://github.com/styled-components/vue-styled-components/issues/49
declare module 'vue-styled-components' {
    import * as CSS from 'csstype';
    import * as Vue from 'vue';

    export type CSSProperties = CSS.Properties<string | number>;

    export type CSSPseudos = {[K in CSS.Pseudos]?: CSSObject};

    export interface CSSObject extends CSSProperties, CSSPseudos {
        [key: string]: CSSObject | string | number | undefined;
    }

    export type CSSKeyframes = object & {[key: string]: CSSObject};

    type VueProps =
        | {
              [propsName: string]: {
                  type: new (...args: any[]) => unknown;
                  default?: unknown;
                  required?: boolean;
                  validator?(value: unknown): boolean;
              };
          }
        | {
              [propsName: string]: new (...args: any[]) => unknown;
          };

    type PropsType<Props extends VueProps> = {
        [K in keyof Props]: Props[K] extends {type: new (...args: any[]) => unknown}
            ? InstanceType<Props[K]['type']>
            : Props[K] extends new (...args: any[]) => unknown
            ? InstanceType<Props[K]>
            : never;
    };

    type Interpolation = string | number;

    export function injectGlobal(strings: TemplateStringsArray, ...interpolations: Interpolation[]): void;

    export type StyledComponent<Props extends VueProps> = Vue.Component &
        Vue.VueConstructor & {
            extend<U extends VueProps>(
                cssRules: TemplateStringsArray,
                ...interpolate: TemplateStringsArray[]
            ): StyledComponent<Props & U>;
            withComponent<V extends VueProps>(target: Vue.VueConstructor): StyledComponent<Props & V>;
        } & {new (props: PropsType<Props>): Vue.Component};

    export type StyledComponentElements<T = JSX.IntrinsicElements> = {
        [k in keyof T]: (strings: TemplateStringsArray, ...interpolations: Interpolation[]) => StyledComponent<{}>;
    };

    export type Component = JSX.IntrinsicElements | keyof JSX.IntrinsicElements | Vue.Component | Vue.VueConstructor;

    export type Styled = StyledComponentElements & {
        <T extends Component, Props extends VueProps>(Component: T, props?: Props): (
            str: TemplateStringsArray,
            ...placeholders: (
                // eslint-disable-next-line
                | ((props: PropsType<Props>) => string | String | {toString: () => string | String})
                | Interpolation
            )[]
        ) => StyledComponent<Props>;
    };

    export interface HTMLElements {
        a: HTMLAnchorElement;
        abbr: HTMLElement;
        address: HTMLElement;
        area: HTMLAreaElement;
        article: HTMLElement;
        aside: HTMLElement;
        audio: HTMLAudioElement;
        b: HTMLElement;
        base: HTMLBaseElement;
        bdi: HTMLElement;
        bdo: HTMLElement;
        big: HTMLElement;
        blockquote: HTMLElement;
        body: HTMLBodyElement;
        br: HTMLBRElement;
        button: HTMLButtonElement;
        canvas: HTMLCanvasElement;
        caption: HTMLElement;
        cite: HTMLElement;
        code: HTMLElement;
        col: HTMLTableColElement;
        colgroup: HTMLTableColElement;
        data: HTMLElement;
        datalist: HTMLDataListElement;
        dd: HTMLElement;
        del: HTMLElement;
        details: HTMLElement;
        dfn: HTMLElement;
        dialog: HTMLDialogElement;
        div: HTMLDivElement;
        dl: HTMLDListElement;
        dt: HTMLElement;
        em: HTMLElement;
        embed: HTMLEmbedElement;
        fieldset: HTMLFieldSetElement;
        figcaption: HTMLElement;
        figure: HTMLElement;
        footer: HTMLElement;
        form: HTMLFormElement;
        h1: HTMLHeadingElement;
        h2: HTMLHeadingElement;
        h3: HTMLHeadingElement;
        h4: HTMLHeadingElement;
        h5: HTMLHeadingElement;
        h6: HTMLHeadingElement;
        head: HTMLElement;
        header: HTMLElement;
        hgroup: HTMLElement;
        hr: HTMLHRElement;
        html: HTMLHtmlElement;
        i: HTMLElement;
        iframe: HTMLIFrameElement;
        img: HTMLImageElement;
        input: HTMLInputElement;
        ins: HTMLModElement;
        kbd: HTMLElement;
        keygen: HTMLElement;
        label: HTMLLabelElement;
        legend: HTMLLegendElement;
        li: HTMLLIElement;
        link: HTMLLinkElement;
        main: HTMLElement;
        map: HTMLMapElement;
        mark: HTMLElement;
        menu: HTMLElement;
        menuitem: HTMLElement;
        meta: HTMLMetaElement;
        meter: HTMLElement;
        nav: HTMLElement;
        noscript: HTMLElement;
        object: HTMLObjectElement;
        ol: HTMLOListElement;
        optgroup: HTMLOptGroupElement;
        option: HTMLOptionElement;
        output: HTMLElement;
        p: HTMLParagraphElement;
        param: HTMLParamElement;
        picture: HTMLElement;
        pre: HTMLPreElement;
        progress: HTMLProgressElement;
        q: HTMLQuoteElement;
        rp: HTMLElement;
        rt: HTMLElement;
        ruby: HTMLElement;
        s: HTMLElement;
        samp: HTMLElement;
        script: HTMLScriptElement;
        section: HTMLElement;
        select: HTMLSelectElement;
        small: HTMLElement;
        source: HTMLSourceElement;
        span: HTMLSpanElement;
        strong: HTMLElement;
        style: HTMLStyleElement;
        sub: HTMLElement;
        summary: HTMLElement;
        sup: HTMLElement;
        table: HTMLTableElement;
        tbody: HTMLTableSectionElement;
        td: HTMLTableDataCellElement;
        textarea: HTMLTextAreaElement;
        tfoot: HTMLTableSectionElement;
        th: HTMLTableHeaderCellElement;
        thead: HTMLTableSectionElement;
        time: HTMLElement;
        title: HTMLTitleElement;
        tr: HTMLTableRowElement;
        track: HTMLTrackElement;
        u: HTMLElement;
        ul: HTMLUListElement;
        var: HTMLElement;
        video: HTMLVideoElement;
        wbr: HTMLElement;
    }

    export let styled: Styled;

    export default styled;
}
