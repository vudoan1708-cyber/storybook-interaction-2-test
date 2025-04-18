/* This needs to be a class so we could use a factory to determine test technology (Jest, Enzyme, Mocha,...) based on instantiation */
import { Argument, JestExpressionStatement, JestQuery, UserEventResult } from "../../types";

export class Jest {
  constructor() {}
  private static __createArgs(accessBy: JestQuery, accessAtIndex: number, testId?: string | null): Argument {
    if (accessBy === 'queryByTestId') {
      return `${accessBy}("${testId}")`;
    }
    if (accessBy === 'queryAllByTestId') {
      return `${accessBy}("${testId}")[${accessAtIndex}]`;
    }
    return '';
  }
  static click(userEvent: UserEventResult['target']): JestExpressionStatement {
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
  static input(userEvent: UserEventResult['target'], value: string): JestExpressionStatement {
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
          value,
        ],
      },
    };
  };
  static change(userEvent: UserEventResult['target'], value: string): JestExpressionStatement {
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
                  value: value,
                },
              },
            },
          },
        ],
      },
    };
  };

  static hover(userEvent: UserEventResult['target']): JestExpressionStatement {
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
};
