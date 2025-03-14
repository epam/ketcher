import { useEffect, useState } from 'react';
import { ButtonsConfig, Editor, InfoModal } from 'ketcher-react';
import { Ketcher, StructServiceProvider } from 'ketcher-core';

import 'ketcher-react/dist/index.css';

import { getStructServiceProvider } from './utils';

const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search);
  const hiddenButtons = searchParams.get('hiddenControls');

  if (!hiddenButtons) return {};

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true };

    return acc;
  }, {} as { [val: string]: { hidden: boolean } });
};

const App = () => {
  const hiddenButtonsConfig = getHiddenButtonsConfig();
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [monomersList, setMonomersList] = useState([]);
  const [monomersListOld, setMonomersListOld] = useState([]);
  const [activeLibraryItemLabel, _setActiveLibraryItemLabel] = useState('');
  const [isOldMode, setIsOldMode] = useState(false);

  const [structServiceProvider, setStructServiceProvider] =
    useState<StructServiceProvider | null>(null);
  useEffect(() => {
    getStructServiceProvider().then(setStructServiceProvider);
  }, []);

  if (!structServiceProvider) {
    return <div>Loading...</div>;
  }

  const appendLines = () => {
    const canvas = document.querySelector('[data-testid="canvas"]');
    const line1 = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line',
    );
    line1.setAttribute('x1', '0');
    line1.setAttribute('x2', '0');
    line1.setAttribute('y1', '-1000');
    line1.setAttribute('y2', '1000');
    line1.setAttribute('stroke', 'black');
    line1.setAttribute('stroke-width', '1');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    canvas.appendChild(line1);

    const line2 = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line',
    );
    line2.setAttribute('x1', '-1000');
    line2.setAttribute('x2', '1000');
    line2.setAttribute('y1', '0');
    line2.setAttribute('y2', '0');
    line2.setAttribute('stroke', 'black');
    line2.setAttribute('stroke-width', '1');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    canvas.appendChild(line2);
  };

  const setActiveLibraryItemLabel = (monomer: never) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const label = monomer.props ? monomer.props.MonomerFullName : monomer.label;
    _setActiveLibraryItemLabel(label);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.ketcher?.editor.struct(monomer.struct, false);
    appendLines();
    setIsOldMode(false);
  };

  const scrollToActiveItem = () => {
    const activeItem = document.querySelector(
      `[data-monomer-name="${activeLibraryItemLabel}"]`,
    );
    activeItem?.scrollIntoView({ block: 'center' });
  };

  document.onkeydown = function (e) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const currentActiveLabelIndex = monomersList.findIndex(
      (monomer) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (monomer.props ? monomer.props.MonomerFullName : monomer.label) ===
        activeLibraryItemLabel,
    );

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      if (currentActiveLabelIndex < monomersList.length - 1) {
        setActiveLibraryItemLabel(monomersList[currentActiveLabelIndex + 1]);
      } else {
        setActiveLibraryItemLabel(monomersList[monomersList.length - 1]);
      }
      scrollToActiveItem();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      if (currentActiveLabelIndex > 0) {
        setActiveLibraryItemLabel(monomersList[currentActiveLabelIndex - 1]);
      } else {
        setActiveLibraryItemLabel(monomersList[0]);
      }
      scrollToActiveItem();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      const newIsOldMode = !isOldMode;
      const oldMonomer = monomersListOld.find(
        (monomer) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (monomer.props ? monomer.props.MonomerFullName : monomer.label) ===
          activeLibraryItemLabel,
      );
      const newMonomer = monomersList.find(
        (monomer) =>
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          (monomer.props ? monomer.props.MonomerFullName : monomer.label) ===
          activeLibraryItemLabel,
      );

      setIsOldMode(newIsOldMode);

      if (newIsOldMode) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ketcher.editor.struct(oldMonomer.struct, false);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.ketcher.editor.struct(newMonomer.struct, false);
      }
      appendLines();
      scrollToActiveItem();
    }
  };

  // @ts-ignore
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        width: '100%',
        background: isOldMode
          ? 'radial-gradient(rgba(255, 255, 255, 0.4) 30%, rgba(0, 0, 0, 1)) 100%'
          : 'white',
        backdropFilter: isOldMode ? 'blur(100px)' : 'none',
      }}
    >
      <div style={{ flex: 1, height: '100%', overflow: 'scroll' }}>
        {monomersList.map((monomer) => (
          <div
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            key={monomer.props ? monomer.props.id : monomer.label}
            data-monomer-name={
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              monomer.props ? monomer.props.MonomerFullName : monomer.label
            }
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              border: '1px solid black',
              padding: '2px 10px',
              height: '30px',
              margin: '0',
              background:
                activeLibraryItemLabel ===
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                (monomer.props ? monomer.props.MonomerFullName : monomer.label)
                  ? 'lightblue'
                  : 'white',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            onClick={() => {
              setActiveLibraryItemLabel(monomer);
            }}
          >
            <p>
              {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                monomer.label +
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  ` (${monomer.props ? monomer.props.MonomerFullName : ''})`
              }
            </p>
          </div>
        ))}
      </div>
      <div style={{ flex: 5, filter: isOldMode ? 'opacity(0.8)' : 'none' }}>
        <Editor
          errorHandler={(message: string) => {
            setHasError(true);
            setErrorMessage(message.toString());
          }}
          buttons={hiddenButtonsConfig}
          staticResourcesUrl={process.env.PUBLIC_URL}
          structServiceProvider={structServiceProvider}
          onInit={(ketcher: Ketcher) => {
            window.ketcher = ketcher;
            setTimeout(() => {
              setMonomersList(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                ketcher.coreEditor.monomersLibrary.sort((a, b) =>
                  a.label.localeCompare(b.label),
                ),
              );
              setMonomersListOld(
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                ketcher.coreEditor.monomersLibraryOld.sort((a, b) =>
                  a.label.localeCompare(b.label),
                ),
              );
            }, 1000);

            window.parent.postMessage(
              {
                eventType: 'init',
              },
              '*',
            );
            window.scrollTo(0, 0);
          }}
        />
        {hasError && (
          <InfoModal
            message={errorMessage}
            close={() => {
              setHasError(false);

              // Focus on editor after modal is closed
              const cliparea: HTMLElement | null =
                document.querySelector('.cliparea');
              cliparea?.focus();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;
