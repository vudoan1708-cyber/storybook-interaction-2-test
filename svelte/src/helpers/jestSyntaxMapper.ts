export const Jest = () => {
  Jest.prototype.click = (element: HTMLElement) => {
    `await userEvent.click(${element});`
  };
  Jest.prototype.input = (element: HTMLElement, value: string) => {
    `await userEvent.type(${element}, ${value});`
  };
  Jest.prototype.change = (element: HTMLElement, value: string) => {
    `await fireEvent.change(${element}, {
      target: { value: ${value} },
    });`
  };
};
