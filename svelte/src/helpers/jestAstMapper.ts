/* This needs to be a class so we could use a factory to determine test technology (Jest, Enzyme, Mocha,...) based on instantiation */
import DeclarationMapper from './declarationAstMapper';
import {
  Argument,
  Framework,
  JestExpressionStatement,
  JestQuery,
  ObjectExpression,
  UserEventResult,
} from "../../types";

export default class Jest {
  private static __testedComponentName: string;

  constructor() {}

  private static __createTestFor(framework: Framework) {
    DeclarationMapper.init(framework);
  }
  private static __identifyTestedComponent(componentName: string) {
    this.__testedComponentName = componentName;
  }
  public static init(framework: Framework, componentName: string) {
    Jest.__createTestFor(framework);
    Jest.__identifyTestedComponent(componentName);
  }

  private static __createArgs(
    accessBy: JestQuery,
    accessAtIndex: number,
    testId?: string | null,
  ): Argument {
    if (accessBy === 'queryByTestId') {
      return `${accessBy}("${testId}")`;
    }
    if (accessBy === 'queryAllByTestId') {
      return `${accessBy}("${testId}")[${accessAtIndex}]`;
    }
    return '';
  }
  public static click(userEvent: UserEventResult['target']): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'userEvent',
        property: 'click',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            userEvent?.element?.getAttribute('data-testid'),
          )
        ],
      },
    };
  };
  public static input(userEvent: UserEventResult['target'], value: string): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'userEvent',
        property: 'type',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            userEvent?.element?.getAttribute('data-testid'),
          ),
          `"${value}"`,
        ],
      },
    };
  };
  public static change(userEvent: UserEventResult['target'], value: string): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'fireEvent',
        property: 'change',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            userEvent?.element?.getAttribute('data-testid'),
          ),
          {
            type: 'object',
            properties: {
              key: 'target',
              value: {
                type: 'object',
                properties: {
                  key: 'value',
                  value: `"${value}"`,
                },
              },
            },
          },
        ],
      },
    };
  };
  public static hover(userEvent: UserEventResult['target']): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'userEvent',
        property: 'hover',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            userEvent?.element?.getAttribute('data-testid'),
          ),
        ],
      },
    };
  }

  public static createDeclaration(accessBy: JestQuery, args: ObjectExpression['properties']) {
    return DeclarationMapper
      .includeNewDeclaration(accessBy, this.__testedComponentName, args)
      ?.getAllDeclarations();
  }
};
