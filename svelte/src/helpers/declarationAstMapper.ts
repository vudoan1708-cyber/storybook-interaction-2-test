/* This needs to be a class so we could use a factory to determine test technology (Jest, Enzyme, Mocha,...) based on instantiation */
import {
  DeclarationTemplate,
  Framework,
  JestDeclarationExpression,
  JestLifeCycleFunction,
  JestQuery,
  ObjectExpression,
} from "../../types";

export default class DeclarationMapper {
  private static __declarationTemplate: DeclarationTemplate;
  private static __currentDeclarations: JestDeclarationExpression = {
    importDeclaration: [],
    variableDeclaration: [],
  };
  private static __importKeywords = new Set<Exclude<JestLifeCycleFunction, JestQuery>>;
  private static __variableKeywords = new Set<JestQuery>;
  constructor() {}

  public static init(framework: Framework) {
    this.__declarationTemplate = {
      beforeAll: { kind: 'importDeclaration', from: '@jest/global', declarationSyntax: 'named' },
      beforeEach: { kind: 'importDeclaration', from: '@jest/global', declarationSyntax: 'named' },
      afterAll: { kind: 'importDeclaration', from: '@jest/global', declarationSyntax: 'named' },
      afterEach: { kind: 'importDeclaration', from: '@jest/global', declarationSyntax: 'named' },
      render: { kind: 'importDeclaration', from: `@testing-library/${framework}`, declarationSyntax: 'named' },
      waitFor: { kind: 'importDeclaration', from: `@testing-library/${framework}`, declarationSyntax: 'named' },
      waitForElementToBeRemoved: { kind: 'importDeclaration', from: `@testing-library/${framework}`, declarationSyntax: 'named' },
      fireEvent: { kind: 'importDeclaration', from: `@testing-library/${framework}`, declarationSyntax: 'named' },
      userEvent: { kind: 'importDeclaration', from: '@testing-library/user-event', declarationSyntax: 'default' },
      queryByTestId: { kind: 'variableDeclaration', from: 'render', declarationSyntax: 'named' },
      queryAllByTestId: { kind: 'variableDeclaration', from: 'render', declarationSyntax: 'named' },
    };
  }

  public static includeNewDeclaration(
    lifeCycleFunction: JestLifeCycleFunction,
    componentName: string,
    args: ObjectExpression['properties'],
  ) {
    // Use object here to make sure we don't duplicate things
    const { kind, from, declarationSyntax } = this.__declarationTemplate[lifeCycleFunction];
    if (kind === 'importDeclaration') {
      this.__importKeywords.add(lifeCycleFunction as Exclude<JestLifeCycleFunction, JestQuery>);

      const indexOfItemOfTheSameSource = this.__currentDeclarations[kind].findIndex((item) => item?.source === from);

      // First timer for the source to be included in the array
      if (indexOfItemOfTheSameSource === -1) {
        this.__currentDeclarations[kind] = [
          ...this.__currentDeclarations[kind],
          {
            declarationSyntax,
            keywords: this.__importKeywords,
            source: from,
          }
        ] as JestDeclarationExpression['importDeclaration'];
        return this;
      }
      // If found
      this.__currentDeclarations[kind][indexOfItemOfTheSameSource] = {
        ...this.__currentDeclarations[kind][indexOfItemOfTheSameSource],
        keywords: this.__importKeywords,
      }
      return this;
    }
    if (kind === 'variableDeclaration') {
      this.__variableKeywords.add(lifeCycleFunction as JestQuery);

      const indexOfItemOfTheSameSource = this.__currentDeclarations[kind].findIndex((item) => item?.callee?.object === from);

      // First timer for the source to be included in the array
      if (indexOfItemOfTheSameSource === -1) {
        this.__currentDeclarations[kind] = [
          ...this.__currentDeclarations[kind],
          {
            declarationSyntax,
            keywords: this.__variableKeywords,
            callee: {
              object: from,
              arguments: [
                componentName,
                {
                  type: 'object',
                  properties: args,
                }
              ],
            },
          }
        ] as JestDeclarationExpression['variableDeclaration'];
        return this;
      }
      // If found
      this.__currentDeclarations[kind][indexOfItemOfTheSameSource] = {
        ...this.__currentDeclarations[kind][indexOfItemOfTheSameSource],
        keywords: this.__variableKeywords,
      }
      return this;
    }
  }

  public static getAllDeclarations() {
    return this.__currentDeclarations;
  }
};
