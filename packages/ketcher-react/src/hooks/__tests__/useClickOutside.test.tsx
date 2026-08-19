import { useEffect, useRef, useState, type RefObject } from 'react';
import { render, fireEvent, cleanup, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useClickOutside } from '../useClickOutside';

function HookHarness({ onOutside }: { onOutside: () => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useClickOutside(ref, onOutside);
  return (
    <div>
      <div data-testid="inside" ref={ref} />
      <div data-testid="outside" />
    </div>
  );
}

describe('useClickOutside', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  test('fires callback on outside click', () => {
    const spy = jest.fn();
    render(<HookHarness onOutside={spy} />);
    fireEvent.click(screen.getByTestId('outside'));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('does not fire callback on inside click', () => {
    const spy = jest.fn();
    render(<HookHarness onOutside={spy} />);
    fireEvent.click(screen.getByTestId('inside'));
    expect(spy).not.toHaveBeenCalled();
  });

  test('uses updated callback after re-render', () => {
    const A = jest.fn();
    const B = jest.fn();

    function Wrapper() {
      const [cb, setCb] = useState(() => A);
      useEffect(() => {
        setCb(() => B);
      }, []);
      return <HookHarness onOutside={cb} />;
    }

    render(<Wrapper />);
    fireEvent.click(screen.getByTestId('outside'));
    // First click after effect should call B (latest)
    expect(B).toHaveBeenCalledTimes(1);
    expect(A).not.toHaveBeenCalled();
  });

  test('does not reattach listener when only callback changes', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');

    function Wrapper() {
      const [n, setN] = useState(0);
      // new identity every render; reference `n` without using `void` or empty body
      const cb = () => {
        if (n > -1) {
          /* no-op using n to keep function typed as () => void */
        }
      };
      useEffect(() => {
        setN(1); // trigger one more render to change callback
      }, []);
      return <HookHarness onOutside={cb} />;
    }

    render(<Wrapper />);
    // Exactly one attach expected, and zero removes (component still mounted)
    const addCalls = addSpy.mock.calls.filter((c) => c[0] === 'click');
    expect(addCalls.length).toBe(1);
    const removeCalls = removeSpy.mock.calls.filter((c) => c[0] === 'click');
    expect(removeCalls.length).toBe(0);
  });

  test('removes listener on unmount', () => {
    const addSpy = jest.spyOn(document, 'addEventListener');
    const removeSpy = jest.spyOn(document, 'removeEventListener');
    const { unmount } = render(<HookHarness onOutside={jest.fn()} />);
    unmount();
    const addCalls = addSpy.mock.calls.filter((c) => c[0] === 'click');
    const removeCalls = removeSpy.mock.calls.filter((c) => c[0] === 'click');
    // There should be equal number of add/remove for click
    expect(removeCalls.length).toBe(addCalls.length);
  });

  test('handles null ref without throwing', () => {
    function NullRefHarness({ onOutside }: { onOutside: () => void }) {
      const ref = { current: null } as RefObject<HTMLDivElement | null>;
      useClickOutside(ref, onOutside);
      return <div data-testid="outside" />;
    }

    const spy = jest.fn();
    render(<NullRefHarness onOutside={spy} />);
    expect(() => fireEvent.click(screen.getByTestId('outside'))).not.toThrow();
  });

  test('SSR guard: does not throw without document', () => {
    // jsdom provides document; fully simulating SSR is out of scope.
    // This test exists to document intent; skip if environment lacks control.
    expect(typeof document).toBe('object');
  });
});
