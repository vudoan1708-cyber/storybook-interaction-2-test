/* This needs to be a class so we could use a factory to determine test technology (Jest, Enzyme, Mocha,...) based on instantiation */
import DeclarationMapper from './declarationAstMapper';
import type {
  Argument,
  ExpectStatement,
  Framework,
  JestExpressionStatement,
  JestLifeCycleFunction,
  JestMemberExpression,
  JestQuery,
  ObjectExpression,
  UserEventResult,
} from '../../types';

export default class Jest {
  private static __testedComponentName: string;
  /** @description To keep track of the events so that they can be completele removed as user removing the recorded steps */
  private static __eventCounter: {
    [x in JestLifeCycleFunction]: number;
  };

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
    target?: string | null,
  ): Argument {
    if (accessBy === 'queryByTestId') {
      return `${accessBy}('${target}')`;
    }
    if (accessBy === 'queryAllByTestId') {
      return `${accessBy}('${target}')[${accessAtIndex}]`;
    }
    return `'${target ?? ''}'`;
  }
  public static click({ userEvent }: { userEvent: UserEventResult['target'] }): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'userEvent',
        property: 'click',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            (userEvent?.element as HTMLElement | Element)?.getAttribute('data-testid'),
          )
        ],
      },
    };
  };
  public static input({ userEvent, value }: { userEvent: UserEventResult['target'], value: string }): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'userEvent',
        property: 'type',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            (userEvent?.element as HTMLElement | Element)?.getAttribute('data-testid'),
          ),
          `'${value}'`,
        ],
      },
    };
  };
  public static change({ userEvent, value }: { userEvent: UserEventResult['target'], value: string }): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'fireEvent',
        property: 'change',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            (userEvent?.element as HTMLElement | Element)?.getAttribute('data-testid'),
          ),
          {
            type: 'object',
            properties: {
              key: 'target',
              value: {
                type: 'object',
                properties: {
                  key: 'value',
                  value: `'${value}'`,
                },
              },
            },
          },
        ],
      },
    };
  };
  public static hover({ userEvent }: { userEvent: UserEventResult['target'] }): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'userEvent',
        property: 'hover',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            (userEvent?.element as HTMLElement | Element)?.getAttribute('data-testid'),
          ),
        ],
      },
    };
  }
  public static waitForElementToBeRemoved({ userEvent }: { userEvent: UserEventResult['target'] }): JestExpressionStatement {
    return {
      keyword: 'await',
      callee: {
        object: 'waitForElementToBeRemoved',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            (userEvent?.element as HTMLElement | Element)?.getAttribute('data-testid'),
          ),
        ],
      }
    }
  }
  public static expect({
    userEvent,
    chainingOperations,
  }: {
    userEvent: UserEventResult['target'],
    chainingOperations: Record<string, string | ExpectStatement>,
  }): JestExpressionStatement {
    const values = Object.values(chainingOperations).filter((value) => value);
    const createChainingOperations = (values: Array<string | ExpectStatement>, idx: number): JestExpressionStatement => {
      const processValue = (value: string | ExpectStatement) => {
        if (typeof value === 'object') {
          return value.keyword;
        }
        return value;
      };
      const processArgs = (value: string | ExpectStatement) => {
        if (typeof value === 'object') {
          return value.arguments;
        }
        return [];
      };
      return {
        callee: {
          object: processValue(values[idx]) as JestLifeCycleFunction,
          arguments: processArgs(values[idx]),
          chained: idx === values.length - 1 ? undefined : createChainingOperations(values, idx + 1),
          noParen: values[idx] === 'not',
        }
      };
    }
    return {
      callee: {
        object: 'expect',
        arguments: [
          this.__createArgs(
            userEvent?.accessBy as JestQuery,
            userEvent?.accessAtIndex ?? 0,
            typeof userEvent?.element === 'string' ? userEvent?.element : userEvent?.element?.getAttribute('data-testid'),
          ),
        ],
        chained: createChainingOperations(values, 0),
      }
    }
  }

  public static createDeclaration(accessBy: JestLifeCycleFunction, args: ObjectExpression['properties']) {
    return DeclarationMapper
      .includeNewDeclaration(accessBy, this.__testedComponentName, args)
      ?.getAllDeclarations();
  }

  // public static removeDeclaration(accessBy: JestLifeCycleFunction) {
  //   return DeclarationMapper
  //     .removeDeclaration(accessBy)
  //     ?.getAllDeclarations();
  // }
};
