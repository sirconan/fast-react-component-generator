export const templateComponent = `import type { VoidFunctionComponent } from 'react';

{{{styleImport}}}

type {{componentName}}Props = {
  firstProp?: string
};

export const {{componentName}}: VoidFunctionComponent<{{componentName}}Props> = ({firstProp}) => {
  {{{pandaHook}}}
  return <div{{{className}}}>{firstProp}</div>;
};
`;

export const templateIndex = `export * from './{{kebabName}}';`;

export const templateScss = `@import '~@posos-tech/design-system-legacy/assets/styles/base';

.root {
  display: flex;
}
`;

export const templatePanda = `import { sva } from '@posos-tech/styled-system/css';

export const useStyles = sva({
  
});
`;

export const templateStory = `import type { Meta, StoryObj } from "@storybook/react";
import { {{componentName}} } from ".";

const meta: Meta<typeof {{componentName}}> = {
  title: "Components/{{componentName}}",
  component: {{componentName}},
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof {{componentName}}>;

export const Default: Story = {
  args: {
    // Props
  },
};
`;

export const templateHook = `type Use{{componentName}} = {
  firstReturnValue: string;
};

export const use{{componentName}} = (): Use{{componentName}} => {
  const firstReturnValue = 'hello';

  return {
    firstReturnValue,
  };
};
`;

export const templateType = `export type {{componentName}} = {
  first: string;
};
`;

export const templateConstant = `export const {{componentName}} = 'value';
`;

export const templateTest = `import { render, screen } from '@shared/tests/test-utils';

// SUT
import { {{componentName}} } from '../{{kebabName}}';

describe('{{componentName}} Componant', () => {
  it('should return ...', () => {
    render(<{{componentName}} />);

    expect(
      screen.getByRole('button')
    ).toBeInTheDocument();
  });
});
`;
