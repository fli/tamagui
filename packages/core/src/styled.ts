import React from 'react'

import { createComponent } from './createComponent'
import { extendStaticConfig } from './helpers/extendStaticConfig'
import { MediaProps, StaticComponent, StaticConfig, TamaguiConfig, Themes, Tokens } from './types'

export function styled<
  ParentComponent extends StaticComponent | React.Component<any>,
  Variants extends GetVariants<ParentComponent>
>(
  Component: ParentComponent,
  options?: GetProps<ParentComponent> & {
    variants?: Variants
  },
  staticExtractionOptions?: StaticConfig
) {
  const staticConfigProps: StaticConfig = (() => {
    if (options) {
      const { variants, ...defaultProps } = options
      return { ...staticExtractionOptions, variants, defaultProps }
    }
    return {}
  })()
  const config = extendStaticConfig(Component, staticConfigProps)
  const component = createComponent(config!) // error is good here its on init
  type VariantProps = GetVariantProps<Variants>
  return component as StaticComponent<
    // if not options/variants passed just styled(Text):
    keyof VariantProps extends never
      ? GetProps<ParentComponent>
      : // if options passed: styled(Text, { ... })
        Omit<GetProps<ParentComponent>, keyof VariantProps> &
          VariantProps &
          MediaProps<VariantProps>,
    void
  >
}

// type ParentVariants = A extends StaticComponent<any, infer Variants> ? Variants : {}

export type GetProps<A> = A extends StaticComponent<infer Props>
  ? Props
  : A extends React.Component<infer Props>
  ? Props
  : {}

export type GetVariants<ParentComponent extends StaticComponent | React.Component<any>> = void | {
  [key: string]: {
    [key: string]:
      | Partial<GetProps<ParentComponent>>
      | ((
          val: any,
          config: {
            tokens: TamaguiConfig['tokens']
            theme: Themes extends { [key: string]: infer B } ? B : unknown
            props: GetProps<ParentComponent>
          }
        ) => Partial<GetProps<ParentComponent>>)
  }
}

export type GetVariantProps<Variants> = Variants extends void
  ? {}
  : {
      // ensure variants actually defined
      [Key in keyof Variants]?: keyof Variants[Key] extends `...${infer VariantSpread}`
        ? VariantSpread extends keyof Tokens
          ? keyof Tokens[VariantSpread] extends string | number
            ? `$${keyof Tokens[VariantSpread]}` | null
            : unknown
          : unknown
        : keyof Variants[Key] extends 'true'
        ? boolean | null
        : keyof Exclude<Variants[Key], undefined>
    }

// type X = { ok: 1 }
// type Y = { okk: 2; ok: 3 }
// type Z = X & Y
// type Z2 = Z

// TODO get name
// const displayName = `styled(Component)`
// Object.defineProperty(component, 'name', {
//   value: displayName,
//   writable: false,
// })
