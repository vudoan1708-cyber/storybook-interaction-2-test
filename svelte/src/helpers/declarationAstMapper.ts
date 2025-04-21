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
  // public static removeDeclaration(
  //   lifeCycleFunction: JestLifeCycleFunction,
  //   eventCounter: number,
  // ) {
  //   const { kind, from } = this.__declarationTemplate[lifeCycleFunction];
  //   if (kind === 'importDeclaration') {
  //     // Only deleting the keyword if it's no longer used in the recorded steps
  //     if (eventCounter === 1) {
  //       this.__importKeywords.delete(lifeCycleFunction as Exclude<JestLifeCycleFunction, JestQuery>);
  //     }
  //     const indexOfItemOfTheSameLifecycle = this.__currentDeclarations[kind].findIndex((item) => item?.keywords.has(lifeCycleFunction));
      
  //     // First timer for the source to be included in the array
  //     if (indexOfItemOfTheSameLifecycle === -1) {
  //       return this;
  //     }
  //     // If there is at least 1 lifecycle function after removal
  //     if (this.__currentDeclarations[kind][indexOfItemOfTheSameLifecycle].keywords.size > 1) {
  //       this.__currentDeclarations[kind][indexOfItemOfTheSameLifecycle] = {
  //         ...this.__currentDeclarations[kind][indexOfItemOfTheSameLifecycle],
  //         keywords: this.__importKeywords,
  //       }
  //       return this;
  //     }
  //     // Otherwise, if nothing is left after removal
  //     this.__currentDeclarations[kind] = this.__currentDeclarations[kind].filter((_, idx) => idx !== indexOfItemOfTheSameLifecycle);
  //     return this;
  //   }
  //   if (kind === 'variableDeclaration') {
  //     // Only deleting the keyword if it's no longer used in the recorded steps
  //     if (eventCounter === 1) {
  //       this.__variableKeywords.delete(lifeCycleFunction as JestQuery);
  //     }
  //     const indexOfItemOfTheSameLifecycle = this.__currentDeclarations[kind].findIndex((item) => item?.keywords.has(lifeCycleFunction as JestQuery));
      
  //     // First timer for the source to be included in the array
  //     if (indexOfItemOfTheSameLifecycle === -1) {
  //       return this;
  //     }
  //     // If there is at least 1 lifecycle function after removal
  //     if (this.__currentDeclarations[kind][indexOfItemOfTheSameLifecycle].keywords.size > 1) {
  //       this.__currentDeclarations[kind][indexOfItemOfTheSameLifecycle] = {
  //         ...this.__currentDeclarations[kind][indexOfItemOfTheSameLifecycle],
  //         keywords: this.__variableKeywords,
  //       }
  //       return this;
  //     }
  //     // Otherwise, if nothing is left after removal
  //     this.__currentDeclarations[kind] = this.__currentDeclarations[kind].filter((_, idx) => idx !== indexOfItemOfTheSameLifecycle);
  //     return this;
  //   }
  // }

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

  public static doesKeywordStillExist(kind: DeclarationTemplate[JestLifeCycleFunction]['kind'], lifeCycleFunction: JestLifeCycleFunction) {
    if (kind === 'importDeclaration') {
      return this.__importKeywords.has(lifeCycleFunction as Exclude<JestLifeCycleFunction, JestQuery>);
    }
    if (kind === 'variableDeclaration') {
      return this.__variableKeywords.has(lifeCycleFunction as JestQuery);
    }
    return false;
  }

  public static getAllDeclarations() {
    return this.__currentDeclarations;
  }
};
